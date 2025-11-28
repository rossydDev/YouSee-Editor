import { Node, mergeAttributes } from '@tiptap/core'

export const StoryPageHeader = Node.create({
  name: 'storyPageHeader',
  group: 'block',
  content: 'text*', // Pode ter texto (ex: "PAGE 1")

  parseHTML() {
    return [{ tag: 'story-page-header' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'story-page-header', 
      mergeAttributes(HTMLAttributes, {
        // Classe específica para o CSS encontrar e contar
        class: 'story-page-header block text-center font-bold underline text-gray-400 mt-8 mb-6 tracking-widest uppercase select-none',
      }),
      0
    ]
  },
})