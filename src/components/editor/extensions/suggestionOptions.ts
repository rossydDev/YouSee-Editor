import { ReactRenderer } from '@tiptap/react'
import tippy, { Instance, Props } from 'tippy.js'
import { CharacterList } from './CharacterList'

export default {
  // 1. MUDANÇA: Gatilho vazio (dispara sempre)
  char: '',
  
  // 2. MUDANÇA: Permite nomes compostos (ex: "LUKE CAGE")
  allowSpaces: true,

  // 3. MUDANÇA: Regex inteligente
  // Diz ao editor: "Considere qualquer texto digitado dentro do nó como uma busca"
  // Isso substitui o comportamento padrão de procurar um símbolo.
  findSuggestionMatch: (config: any) => {
    const { $position } = config
    
    // Pega o conteúdo do nó atual (Personagem) antes do cursor
    const parent = $position.parent
    const textBefore = parent.textBetween(0, $position.parentOffset, '\n', '\0')

    // Se não tiver texto, não busca
    if (!textBefore) return null

    return {
      range: {
        from: $position.pos - textBefore.length,
        to: $position.pos,
      },
      query: textBefore,
      text: textBefore,
    }
  },

  items: ({ query, editor }: { query: string, editor: any }) => {
    // console.log("🔍 Buscando:", query); 

    const characters = new Set<string>()

    editor.state.doc.descendants((node: any) => {
      if (node.type.name === 'character') {
        const name = node.textContent.trim().toUpperCase()
        if (name) {
          characters.add(name)
        }
      }
    })

    // Filtra removendo o próprio termo que estamos digitando para não duplicar visualmente
    return Array.from(characters)
      .filter(name => name.startsWith(query.toUpperCase()) && name !== query.toUpperCase())
      .sort()
      .slice(0, 5)
  },

  render: () => {
    let component: ReactRenderer | null = null
    let popup: Instance<Props>[] | null = null

    return {
      onStart: (props: any) => {
        component = new ReactRenderer(CharacterList, {
          props,
          editor: props.editor,
        })

        if (!props.clientRect) return

        popup = tippy('body', {
          getReferenceClientRect: props.clientRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: 'manual',
          placement: 'bottom-start',
          zIndex: 9999,
        })
      },

      onUpdate(props: any) {
        component?.updateProps(props)

        if (!props.clientRect) return

        popup?.[0].setProps({
          getReferenceClientRect: props.clientRect,
        })
      },

      onKeyDown(props: any) {
        if (props.event.key === 'Escape') {
          popup?.[0].hide()
          return true
        }
        return (component?.ref as any)?.onKeyDown(props)
      },

      onExit() {
        popup?.[0].destroy()
        component?.destroy()
      },
    }
  },
}