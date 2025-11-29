import { Extension } from '@tiptap/core'
import Suggestion from '@tiptap/suggestion'
import suggestionOptions from './suggestionOptions'

export const AutocompleteExtension = Extension.create({
  name: 'autocomplete',

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...suggestionOptions,
        
        // AQUI ESTÁ A CORREÇÃO DE SEGURANÇA 👇
        allow: ({ editor, range }) => {
          // 1. Verificação de Limites (Bounds Check)
          // Se a posição que o plugin quer ler for maior que o tamanho do documento, pare.
          const docSize = editor.state.doc.content.size
          if (range.from > docSize || range.to > docSize) {
            return false
          }

          // 2. Agora é seguro resolver a posição
          try {
            const $from = editor.state.doc.resolve(range.from)
            return $from.parent.type.name === 'character'
          } catch (e) {
            return false
          }
        },
        
        command: ({ editor, range, props }) => {
          editor
            .chain()
            .focus()
            .insertContentAt(range, props.id + " ")
            .run()
        },
      }),
    ]
  },
})