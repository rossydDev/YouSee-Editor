import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react' // <--- Importante
import { PageNodeView } from './PageNodeView'         // <--- Importante

export const Page = Node.create({
  name: 'page',
  content: '(storyPageHeader?|panel|paragraph|character|dialogue|sfx)+',

  parseHTML() {
    return [{ tag: 'div[data-type="page"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'page' }), 0]
  },

  // AQUI acontece a mágica:
  addNodeView() {
    return ReactNodeViewRenderer(PageNodeView)
  },
})