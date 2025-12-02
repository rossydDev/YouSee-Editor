import { Extension } from "@tiptap/core";
import { Plugin, PluginKey, TextSelection } from "@tiptap/pm/state";

export const PaginationExtension = Extension.create({
  name: "pagination",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("pagination"),
        view(editorView) {
          return {
            update(view, prevState) {
              const docChanged = !view.state.doc.eq(prevState.doc);
              const selectionChanged = !view.state.selection.eq(
                prevState.selection
              );

              if (docChanged || selectionChanged) {
                // CORREÇÃO DO BUG:
                // Movemos o setTimeout para AQUI.
                // Isso garante que a lógica de verificação rode no "próximo frame"
                // mas calcule tudo baseando-se no estado FRESCO do editor.
                setTimeout(() => {
                  if (view.isDestroyed) return;

                  // Tenta limpar páginas vazias primeiro
                  const cleaned = cleanupEmptyPages(view);

                  // Se não limpou nada, verifica overflow
                  if (!cleaned) {
                    checkPageOverflow(view);
                  }
                }, 0);
              }
            },
          };
        },
      }),
    ];
  },
});

/**
 * Remove páginas de continuação que ficaram vazias
 */
function cleanupEmptyPages(view: any) {
  const { state, dispatch } = view;
  const { doc, selection } = state;
  let tr = state.tr;
  let hasChanges = false;

  for (let i = doc.childCount - 1; i > 0; i--) {
    const pageNode = doc.child(i);
    if (pageNode.type.name !== "page") continue;

    const hasHeader = pageNode.firstChild?.type.name === "storyPageHeader";
    const isEmpty =
      pageNode.childCount === 0 ||
      (pageNode.childCount === 1 && pageNode.firstChild?.content.size === 0);

    if (!hasHeader && isEmpty) {
      let pos = 0;
      doc.forEach((node: any, offset: number, index: number) => {
        if (index === i) pos = offset;
      });

      const pageEnd = pos + pageNode.nodeSize;
      const isCursorInside = selection.from >= pos && selection.to <= pageEnd;

      if (!isCursorInside) {
        tr.delete(pos, pageEnd);
        hasChanges = true;
      }
    }
  }

  if (hasChanges) {
    if (!view.isDestroyed) {
      dispatch(tr.setMeta("addToHistory", false));
    }
    return true;
  }
  return false;
}

/**
 * Verifica overflow e move conteúdo
 */
function checkPageOverflow(view: any) {
  const MAX_HEIGHT = 1200;

  const { state, dispatch } = view;
  const { doc, selection } = state;

  if (view.isDestroyed) return;

  // IMPORTANTE: Criamos a transação baseada no estado ATUAL (dentro do timeout)
  let tr = state.tr;
  let hasChanges = false;
  let modifiedPageFound = false;

  doc.forEach((pageNode: any, offset: number, index: number) => {
    if (modifiedPageFound) return;
    if (pageNode.type.name !== "page") return;

    const dom = view.nodeDOM(offset);
    if (!dom || !dom.scrollHeight) return;

    if (dom.scrollHeight > MAX_HEIGHT) {
      if (
        pageNode.childCount <= 2 &&
        pageNode.firstChild?.type.name === "storyPageHeader"
      )
        return;
      if (pageNode.childCount <= 1) return;

      const lastChild = pageNode.lastChild;
      if (!lastChild) return;
      if (lastChild.type.name === "storyPageHeader") return;

      // --- LOGICA DE GRUPO ---
      let nodesToMoveCount = 1;
      let nodesToMoveSize = lastChild.nodeSize;

      if (lastChild.type.name === "dialogue" && pageNode.childCount >= 2) {
        const secondLastChild = pageNode.child(pageNode.childCount - 2);
        if (secondLastChild && secondLastChild.type.name === "character") {
          nodesToMoveCount = 2;
          nodesToMoveSize += secondLastChild.nodeSize;
        }
      }

      // --- CÁLCULOS ---
      const fromPos = offset + pageNode.nodeSize - nodesToMoveSize - 1;
      const toPos = fromPos + nodesToMoveSize;

      const isCursorInMovedNode =
        selection.from >= fromPos && selection.to <= toPos;
      const cursorOffset = selection.from - fromPos;

      const sliceToMove = state.doc.slice(fromPos, toPos);

      // --- VERIFICAÇÃO PRÓXIMA PÁGINA ---
      const nextPageIndex = index + 1;
      let nextPagePos = -1;
      let nextPageNode: any = null; // Tipagem 'any' para evitar erro do TS

      if (nextPageIndex < doc.childCount) {
        doc.forEach((n: any, o: number, i: number) => {
          if (i === nextPageIndex) {
            nextPagePos = o;
            nextPageNode = n;
          }
        });
      }

      console.log(`🚨 Quebra na Pág ${index + 1}. Movendo para destino...`);

      let insertPos = -1;

      // --- DECISÃO: MESCLAR OU INSERIR? ---
      const doesNextPageHaveHeader =
        nextPageNode?.firstChild?.type.name === "storyPageHeader";

      // CENÁRIO A: Mesclar na próxima (se for continuação)
      if (nextPagePos !== -1 && !doesNextPageHaveHeader) {
        tr.delete(fromPos, toPos);
        const shiftedNextPagePos = nextPagePos - nodesToMoveSize;
        insertPos = shiftedNextPagePos + 1;
        tr.insert(insertPos, sliceToMove.content);
      }
      // CENÁRIO B: Criar nova página intermediária
      else {
        tr.delete(fromPos, toPos);
        const newPage = state.schema.nodes.page.create(
          null,
          sliceToMove.content
        );

        if (nextPagePos !== -1) {
          // Inserir NO MEIO (empurrando a próxima)
          const targetInsertPos = nextPagePos - nodesToMoveSize;
          tr.insert(targetInsertPos, newPage);
          insertPos = targetInsertPos + 1;
        } else {
          // Inserir NO FINAL
          const targetInsertPos = tr.mapping.map(doc.content.size);
          tr.insert(targetInsertPos, newPage);
          insertPos = targetInsertPos + 1;
        }
      }

      // --- RESTAURAR CURSOR ---
      if (isCursorInMovedNode && insertPos !== -1) {
        const newCursorPos = insertPos + cursorOffset;
        try {
          tr.setSelection(TextSelection.create(tr.doc, newCursorPos));
          tr.scrollIntoView();
        } catch (e) {
          console.warn("Erro cursor", e);
        }
      }

      hasChanges = true;
      modifiedPageFound = true;
    }
  });

  // APLICAÇÃO IMEDIATA (Pois já estamos dentro do timeout do update)
  if (hasChanges && !view.isDestroyed) {
    dispatch(tr);
  }
}
