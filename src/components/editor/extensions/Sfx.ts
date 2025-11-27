import { Node, mergeAttributes } from '@tiptap/core'

export const Sfx = Node.create({
  name: 'sfx',
  group: 'block',
  content: 'inline*', // Aceita negrito/itálico

  parseHTML() {
    return [{ tag: 'sfx-node' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        // Amarelo, negrito, alinhado à direita (comum para SFX em scripts) ou esquerda?
        // Vamos manter à esquerda, mas indentado diferente do diálogo.
        class: 'sfx-node text-yellow-500 font-bold uppercase tracking-widest mt-4 mb-4 ml-12 border-l-4 border-yellow-500/50 pl-4',
      }),
      0,
    ]
  },

  addKeyboardShortcuts() {
    return {
        'Mod-Shift-s': () => {
            return this.editor.chain()
                .insertContent({type: 'sfx'})
                .focus()
                .run()
        }
    }
  },
})