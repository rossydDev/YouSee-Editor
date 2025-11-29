import { Node, mergeAttributes } from '@tiptap/core'

export const Character = Node.create({
  name: 'character',
  group: 'block',
  content: 'text*',

  parseHTML() {
    return [{ tag: 'character-node' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        class: 'character-node mt-6 mb-0 ml-[40%] text-orange-500 font-bold uppercase tracking-widest',
      }),
      0,
    ]
  },

  addKeyboardShortcuts() {
    return {
      'Tab': () => {
        return this.editor.chain()
          .insertContentAt(this.editor.state.selection.to, { type: 'dialogue' })
          .focus()
          .run()
      },
    }
  },
})