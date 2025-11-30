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

 
})