import { Node, mergeAttributes } from '@tiptap/core'

export const Panel = Node.create({
  name: 'panel', // Nome interno do node

  group: 'block', // Se comporta como um bloco (ocupa a largura toda)

  content: 'inline*', // Pode conter texto dentro

  // Define como o HTML é lido para carregar o conteúdo salvo
  parseHTML() {
    return [
      { tag: 'panel-block' },
    ]
  },

  // Define como o HTML é renderizado na tela (Design System aqui!)
  renderHTML({ HTMLAttributes }) {
    return [
      'panel-block', 
      mergeAttributes(HTMLAttributes, {
        class: 'block bg-zinc-800 border-2 border-transparent rounded-md p-4 mb-4 text-gray-100 font-bold uppercase transition-all duration-200',
      }), 
      0 // O '0' indica onde o conteúdo do texto será renderizado dentro da div
    ]
  },


  // Adicione logo após renderHTML
  addKeyboardShortcuts() {
    return {
      'Mod-Enter': () => {
        return this.editor.chain()
          // 1. Garante que saímos do bloco atual
          .splitBlock() 
          
          // 2. Insere o NODE do Painel (o cabeçalho cinza)
          .insertContent({ 
            type: 'panel', 
            content: [{ type: 'text', text: ' ' }] 
          })
          
          // 3. Pula uma linha e cria um parágrafo de Ação limpo logo abaixo
          .insertContentAt(this.editor.state.selection.to + 2, { type: 'paragraph' })
          
          // 4. Foca no Painel para você poder renomear (Ex: PAINEL 2) ou navegar
          .focus()
          .run()
      },
    }
  },
// ...
})