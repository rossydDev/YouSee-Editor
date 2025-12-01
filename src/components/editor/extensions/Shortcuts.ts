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
      'Backspace': () => {
        const { state, commands } = this.editor
        const { selection, doc } = state
        const { $from, empty } = selection

        if (!empty) return false // Se tiver texto selecionado, deixa o padrão apagar

        // 1. Descobre onde estamos
        // Profundidade 0 = Doc, 1 = Page, 2 = Panel/Block, 3 = Text
        // Queremos saber se estamos no início de uma PÁGINA (Depth 1)
        const pageNode = $from.node(1)
        const pagePos = $from.start(1) // Posição absoluta onde a página começa
        
        if (!pageNode || pageNode.type.name !== 'page') return false

        // Estamos no início absoluto da página (cursor na posição 0 do primeiro bloco)?
        const isAtStartOfPage = $from.pos === pagePos + 1 // +1 pois entramos no node Page

        // Se não estiver no início da página, deixa o backspace normal apagar letras
        if (!isAtStartOfPage) return false 

        // 2. Lógica de PÁGINA VAZIA
        // Removemos "PAGE X" e espaços para ver se tem conteúdo real
        const cleanText = pageNode.textContent.replace(/PAGE \d+/, '').trim()
        const isEmpty = cleanText.length === 0

        // Se for a primeira página do documento, não faz nada (não pode apagar a capa/pag 1)
        if (pagePos <= 1) return false

        if (isEmpty) {
          console.log("🗑️ Deletando página vazia...")
          // Deleta a página inteira (do start ao end)
          return commands.deleteRange({ 
            from: pagePos - 1, // Pega a borda de abertura
            to: pagePos + pageNode.nodeSize - 1 // Pega a borda de fechamento
          })
        } else {
          // 3. Lógica de NAVEGAÇÃO (Página com conteúdo)
          // Se a página tem texto, não deletamos ela ao dar backspace no início.
          // Em vez disso, jogamos o cursor para o final da página anterior.
          console.log("⬆️ Voltando para página anterior...")
          return commands.focus(pagePos - 2)
        }
      },
      'Mod-Shift-Enter': () => {
        console.log("📄 Criando nova página via atalho...");
        
        const { state, chain } = this.editor;
        
        // Cria a estrutura padrão de uma nova página
        // 1. Header (Obrigatório para página nova)
        // 2. Painel (Geralmente começa com cena nova)
        // 3. Ação (Cursor vai pra cá)
        
        // Nota: Dependendo do seu schema, você pode precisar ajustar os types
        const content = [
            { type: 'storyPageHeader' },
            { type: 'panel', content: [{ type: 'text', text: ' ' }] },
            { type: 'paragraph' }
        ];

        return this.editor.chain()
            .focus()
            // Insere a página no final do documento ou após a seleção atual?
            // Padrão de editores: Insere APÓS o bloco atual, quebrando o fluxo
            // Mas para simplificar a V1, vamos inserir no final do documento para evitar quebrar cenas no meio
            .insertContentAt(state.doc.content.size, { 
                type: 'page', 
                content: content 
            })
            .scrollIntoView()
            .run();
      }
    }
  },
  
})