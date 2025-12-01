import { Node, mergeAttributes } from "@tiptap/core";

export const Dialogue = Node.create({
  name: "dialogue",
  group: "block",
  content: "inline*", // Permite negrito, itálico, etc.

  parseHTML() {
    return [{ tag: "dialogue-node" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        class:
          "dialogue-node mb-6 ml-[20%] mr-[20%] text-gray-200 leading-relaxed text-justify", // Texto claro e recuado
      }),
      0,
    ];
  },

  addKeyboardShortcuts() {
    return {
      'Enter': () => {
        const {state, dispatch} = this.editor.view
        const {$to } = state.selection;

        const endPos = $to.after()
        
        return this.editor.chain()
          .insertContentAt(endPos, {type: 'paragraph'})
          .setTextSelection(endPos + 1)
          .run()
      }
    }
  }
});