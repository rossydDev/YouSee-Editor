import { Node, mergeAttributes } from "@tiptap/core";

export const Character = Node.create({
  name: "character",
  group: "block",
  content: "text*", // Apenas texto puro, sem formatação (bold/italic)

  parseHTML() {
    return [{ tag: "character-node" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        class:
          "character-node mt-6 mb-0 ml-[40%] text-orange-500 font-bold uppercase tracking-widest", // Margem esquerda para indentação de roteiro
      }),
      0,
    ];
  },

  addKeyboardShortcuts() {
    return {
      Tab: () => {
        // <--- Mudamos aqui de Enter para Tab
        // A lógica permanece a mesma:
        // Se estiver no Personagem e der Tab, cria um Diálogo embaixo
        return this.editor
          .chain()
          .insertContentAt(this.editor.state.selection.to, { type: "dialogue" })
          .focus()
          .run();
      },
    };
  },
});
