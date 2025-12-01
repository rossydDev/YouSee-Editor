import { Extension } from '@tiptap/core';
import { Plugin, PluginKey, TextSelection } from '@tiptap/pm/state';

export const PaginationExtension = Extension.create({
  name: 'pagination',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('pagination'),
        view(editorView) {
          return {
            update(view, prevState) {
              const docChanged = !view.state.doc.eq(prevState.doc);
              const selectionChanged = !view.state.selection.eq(prevState.selection);

              if (docChanged || selectionChanged) {
                // 1. Limpeza de páginas vazias
                const cleaned = cleanupEmptyPages(view);
                // 2. Verifica overflow
                if (!cleaned) {
                   checkPageOverflow(view);
                }
              }
            },
          };
        },
      }),
    ];
  },
});

function cleanupEmptyPages(view: any) {
  const { state, dispatch } = view;
  const { doc, selection } = state;
  let tr = state.tr;
  let hasChanges = false;

  for (let i = doc.childCount - 1; i > 0; i--) {
    const pageNode = doc.child(i);
    if (pageNode.type.name !== 'page') continue;

    const hasHeader = pageNode.firstChild?.type.name === 'storyPageHeader';
    const isEmpty = pageNode.childCount === 0 || 
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

  if (hasChanges && !view.isDestroyed) {
      dispatch(tr.setMeta('addToHistory', false)); 
      return true;
  }
  return false;
}

function checkPageOverflow(view: any) {
  const MAX_HEIGHT = 1200; 

  const { state, dispatch } = view;
  const { doc, selection } = state;
  
  if (view.isDestroyed) return;

  let tr = state.tr;
  let hasChanges = false;
  let modifiedPageFound = false;

  doc.forEach((pageNode: any, offset: number, index: number) => {
    if (modifiedPageFound) return;
    if (pageNode.type.name !== 'page') return;

    const dom = view.nodeDOM(offset);
    if (!dom || !dom.scrollHeight) return;

    if (dom.scrollHeight > MAX_HEIGHT) {
      
      // Travas de segurança
      if (pageNode.childCount <= 2 && pageNode.firstChild?.type.name === 'storyPageHeader') return;
      if (pageNode.childCount <= 1) return;

      const lastChild = pageNode.lastChild;
      if (!lastChild) return;
      if (lastChild.type.name === 'storyPageHeader') return;

      // --- LOGICA DE GRUPO (Personagem + Diálogo) ---
      let nodesToMoveCount = 1;
      let nodesToMoveSize = lastChild.nodeSize;

      if (lastChild.type.name === 'dialogue' && pageNode.childCount >= 2) {
          const secondLastChild = pageNode.child(pageNode.childCount - 2);
          if (secondLastChild && secondLastChild.type.name === 'character') {
              nodesToMoveCount = 2;
              nodesToMoveSize += secondLastChild.nodeSize;
          }
      }

      // --- 1. CÁLCULOS DO QUE SERÁ MOVIDO ---
      const fromPos = offset + pageNode.nodeSize - nodesToMoveSize - 1; 
      const toPos = fromPos + nodesToMoveSize;

      // Preservação de Cursor
      const isCursorInMovedNode = selection.from >= fromPos && selection.to <= toPos;
      const cursorOffset = selection.from - fromPos;

      const sliceToMove = state.doc.slice(fromPos, toPos);

      // --- 2. VERIFICAÇÃO DA PRÓXIMA PÁGINA ---
      const nextPageIndex = index + 1;
      let nextPagePos = -1;
      let nextPageNode: any = null;
      
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

      // --- 3. DECISÃO: MESCLAR OU INSERIR? ---
      
      const doesNextPageHaveHeader = nextPageNode?.firstChild?.type.name === 'storyPageHeader';

      // CENÁRIO A: Existe próxima página E ela é uma continuação (Sem Header)
      // Ação: Podemos mesclar o conteúdo no topo dela
      if (nextPagePos !== -1 && !doesNextPageHaveHeader) {
        
        tr.delete(fromPos, toPos);
        
        // Como deletamos antes, a próxima página recuou
        const shiftedNextPagePos = nextPagePos - nodesToMoveSize;
        // Inserimos logo após a tag de abertura da página (pos + 1)
        insertPos = shiftedNextPagePos + 1;
        
        tr.insert(insertPos, sliceToMove.content);
      
      } 
      // CENÁRIO B: Existe próxima página, MAS ela tem Header (É uma nova cena/página)
      // OU não existe próxima página.
      // Ação: Temos que CRIAR uma nova folha de continuação e INSERIR no meio.
      else {
        
        tr.delete(fromPos, toPos);

        // Cria nova página de continuação (SEM HEADER)
        const newPage = state.schema.nodes.page.create(null, sliceToMove.content);
        
        if (nextPagePos !== -1) {
            // INSERÇÃO NO MEIO (Empurra a Page 2 para baixo)
            // Calculamos a posição onde a Page 2 estaria agora (recuada pelo delete)
            const targetInsertPos = nextPagePos - nodesToMoveSize;
            
            // Inserimos a NOVA página ANTES da Page 2
            tr.insert(targetInsertPos, newPage);
            
            // O conteúdo foi inserido dentro da nova página. 
            // insertPos para o cursor = inicio da nova pagina + 1
            insertPos = targetInsertPos + 1;

        } else {
            // INSERÇÃO NO FINAL
            const targetInsertPos = tr.mapping.map(doc.content.size);
            tr.insert(targetInsertPos, newPage);
            insertPos = targetInsertPos + 1;
        }
      }

      // --- 4. RESTAURAR CURSOR ---
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

  if (hasChanges) {
    setTimeout(() => {
        if (!view.isDestroyed) {
             dispatch(tr);
        }
    }, 10);
  }
}