import { Extension } from '@tiptap/core'

export const ScreenplayShortcuts = Extension.create({
  name: 'screenplayShortcuts',

  addKeyboardShortcuts() {
    return {
      'Tab': () => {
        // Se eu estiver num parágrafo e ele estiver vazio (ou no começo), vira Personagem
        if (this.editor.isActive('paragraph')) {
          return this.editor.chain().setNode('character').focus().run()
        }
        return false // Se não for parágrafo, deixa o Tab fazer outra coisa
      },
    }
  },
})