import { Extension } from "@tiptap/core";

export const ScreenplayShortcuts = Extension.create({
  name: "screenplayShortcuts",

  addKeyboardShortcuts() {
    return {
      // 1. TAB (Inteligente)
      Tab: () => {
        const { state, commands } = this.editor;
        const { $from } = state.selection;
        const parent = $from.parent;

        // Regra 1: Só funciona se estiver num parágrafo (Ação)
        if (parent.type.name !== "paragraph") return false;

        const isEmpty = parent.textContent.trim().length === 0;

        // CENÁRIO A: Parágrafo Vazio -> Transforma o bloco atual
        // Útil para quando você dá Enter e decide que agora vai ser uma fala
        if (isEmpty) {
          return commands.setNode("character");
        }

        // CENÁRIO B: Parágrafo com Texto -> Cria Character em baixo
        // Útil para fluxo rápido de escrita: Ação -> Tab -> Personagem
        return (
          this.editor
            .chain()
            // Insere o Character LOGO APÓS o parágrafo atual ($from.after())
            .insertContentAt($from.after(), { type: "character" })
            // Move o cursor para dentro do novo Character (+1 entra no nó)
            .setTextSelection($from.after() + 1)
            .scrollIntoView()
            .run()
        );
      },

      // 2. BACKSPACE (Gerenciamento de Páginas) - Mantido igual
      Backspace: () => {
        const { state, commands } = this.editor;
        const { selection } = state;
        const { $from, empty } = selection;

        if (!empty) return false;

        const pageNode = $from.node(1);
        const pagePos = $from.start(1);

        if (!pageNode || pageNode.type.name !== "page") return false;

        const isAtStartOfPage = $from.pos === pagePos + 1;

        if (!isAtStartOfPage) return false;

        const cleanText = pageNode.textContent.replace(/PAGE \d+/, "").trim();
        const isEmptyPage = cleanText.length === 0;

        if (pagePos <= 1) return false;

        if (isEmptyPage) {
          console.log("🗑️ Deletando página vazia...");
          return commands.deleteRange({
            from: pagePos - 1,
            to: pagePos + pageNode.nodeSize - 1,
          });
        } else {
          console.log("⬆️ Voltando para página anterior...");
          return commands.focus(pagePos - 2);
        }
      },

      // 3. CTRL + SHIFT + ENTER (Nova Página Forçada) - Mantido igual
      "Mod-Shift-Enter": () => {
        console.log("📄 Criando nova página via atalho...");
        const { state } = this.editor;
        const content = [
          { type: "storyPageHeader" },
          { type: "panel", content: [{ type: "text", text: " " }] },
          { type: "paragraph" },
        ];
        return this.editor
          .chain()
          .focus()
          .insertContentAt(state.doc.content.size, {
            type: "page",
            content: content,
          })
          .scrollIntoView()
          .run();
      },

      // 4. CTRL + ENTER (Novo Painel Inteligente) - Mantido igual
      "Mod-Enter": () => {
        console.log("🎬 Novo Painel Inteligente...");
        const { state, commands } = this.editor;
        const { $from } = state.selection;
        const parent = $from.parent;

        if (parent.content.size === 0 && parent.type.name !== "panel") {
          return commands.setNode("panel");
        }

        return this.editor
          .chain()
          .insertContent({
            type: "panel",
            content: [{ type: "text", text: " " }],
          })
          .scrollIntoView()
          .run();
      },
    };
  },
});
