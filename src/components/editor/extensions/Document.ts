import Document from '@tiptap/extension-document'

export const ScreenplayDocument = Document.extend({
  // O Documento só pode conter Páginas
  content: 'page+', 
})