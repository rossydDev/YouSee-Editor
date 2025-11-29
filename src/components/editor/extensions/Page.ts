import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { PageNodeView } from './PageNodeView'

export const Page = Node.create({
  name: 'page',
  
  content: '(storyPageHeader?|panel|paragraph|character|dialogue|sfx)+',

  parseHTML() {
    return [{ tag: 'div[data-type="page"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'page' }), 0]
  },

  addNodeView() {
    return ReactNodeViewRenderer(PageNodeView)
  },

  addKeyboardShortcuts() {
    return {
      Backspace: () => {
        const { state, dispatch } = this.editor.view
        const { selection } = state
        const { $anchor, empty } = selection

        if (!empty) return false

        // 1. Verifica se estamos dentro de uma Página (Nível 1 de profundidade)
        // Doc (0) -> Page (1) -> Bloco (2)
        const pageNode = $anchor.node(1)
        if (!pageNode || pageNode.type.name !== 'page') return false

        // 2. Verifica se estamos no INÍCIO ABSOLUTO do conteúdo da página
        // $anchor.start(1) retorna a posição onde começa o conteúdo da página atual
        const isAtStartOfPage = $anchor.pos === $anchor.start(1)

        if (!isAtStartOfPage) return false

        // 3. Verifica se existe uma página anterior para juntar
        // $anchor.before(1) é a posição da borda esquerda da página atual
        const prevPageEnd = $anchor.before(1)
        if (prevPageEnd <= 0) return false // Estamos na primeira página, nada a fazer

        if (dispatch) {
          // A "Marreta": tr.join força a união dos dois nós ao redor da posição
          // Isso funde a Página Anterior com a Página Atual.
          state.tr.join(prevPageEnd)
          
          // Aplica a transação e foca
          dispatch(state.tr.scrollIntoView())
        }
        
        return true
      },
    }
  },
})