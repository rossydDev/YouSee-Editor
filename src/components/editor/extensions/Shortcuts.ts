import { Extension } from "@tiptap/core";

export const ScreenplayShortcuts = Extension.create({
  name: "screenplayShortcuts",

  addKeyboardShortcuts() {
    return {
      // 1. TAB (Autocomplete de Personagem) - Mantido
      Tab: () => {
        if (this.editor.isActive("paragraph")) {
          return this.editor.chain().setNode("character").focus().run();
        }
        return false;
      },

      // 2. BACKSPACE (Gerenciamento de Páginas) - Mantido
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
        const isEmpty = cleanText.length === 0;

        if (pagePos <= 1) return false;

        if (isEmpty) {
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

      // 3. CTRL + SHIFT + ENTER (Nova Página Forçada) - Mantido
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

      // 4. CTRL + ENTER (Novo Painel) - CORRIGIDO
      "Mod-Enter": () => {
        console.log("🎬 Novo Painel Inteligente...");

        const { state, commands } = this.editor;
        const { $from } = state.selection;
        const parent = $from.parent;

        // CENÁRIO A: O usuário está num parágrafo vazio.
        // Ação: Transforma esse parágrafo em Painel (não cria duplicata).
        if (parent.content.size === 0 && parent.type.name !== "panel") {
          return commands.setNode("panel");
        }

        // CENÁRIO B: O usuário está digitando num painel ou parágrafo com texto.
        // Ação: Cria um novo painel ABAIXO do atual.
        // Nota: Removemos o 'splitBlock' que causava o bug da página duplicada.
        return (
          this.editor
            .chain()
            .insertContent({
              type: "panel",
              content: [{ type: "text", text: " " }],
            })
            // Opcional: Se quiser que já venha um parágrafo de ação depois do painel, descomente abaixo:
            // .insertContent({ type: 'paragraph' })
            .scrollIntoView()
            .run()
        );
      },
    };
  },
});
