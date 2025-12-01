import { Node, mergeAttributes } from '@tiptap/core'

export const Panel = Node.create({
  name: 'panel', 
  group: 'block', 
  content: 'inline*', 

  // 1. Adicionamos o atributo 'number'
  addAttributes() {
    return {
      number: {
        default: 1,
        // Garante que o número seja salvo no HTML e lido de volta
        parseHTML: element => parseInt(element.getAttribute('data-panel-number') || '1'),
        renderHTML: attributes => ({
          'data-panel-number': attributes.number,
        }),
      },
    }
  },

  parseHTML() {
    return [
      { tag: 'panel-block' },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'panel-block', 
      mergeAttributes(HTMLAttributes, {
        class: 'block bg-zinc-800 border-2 border-transparent rounded-md p-4 mt-8 mb-2 text-gray-100 font-bold uppercase transition-all duration-200',
      }), 
      0 
    ]
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Enter': () => {
        return this.editor.chain()
          .splitBlock() 
          .insertContent({ 
            type: 'panel', 
            content: [{ type: 'text', text: ' ' }] 
          })
          .insertContentAt(this.editor.state.selection.to + 2, { type: 'paragraph' })
          .focus()
          .run()
      },
    }
  },
})