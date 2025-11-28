import { NodeViewWrapper, NodeViewContent, NodeViewProps } from '@tiptap/react'
import React, { useMemo } from 'react'

export const PageNodeView: React.FC<NodeViewProps> = ({ node }) => {
  
  // 1. Lógica: Conta os Painéis
  const panelCount = useMemo(() => {
    let count = 0
    node.content.forEach((child) => {
      if (child.type.name === 'panel') count++
    })
    return count
  }, [node.content])

  // 2. Lógica Nova: Verifica se existe um Story Header nesta página
  const hasHeader = useMemo(() => {
    let has = false
    node.content.forEach((child) => {
      if (child.type.name === 'storyPageHeader') has = true
    })
    return has
  }, [node.content])

  return (
    <NodeViewWrapper 
      className="page-node relative bg-zinc-900 border border-zinc-800 shadow-xl p-[25mm] min-h-[297mm] w-[210mm] mx-auto my-8"
    >
      {/* O Slot do Canto Superior Direito */}
      <div className="absolute top-8 right-[25mm] text-xs text-gray-500 font-bold uppercase tracking-widest border-b border-zinc-800 pb-2 mb-8 select-none flex gap-2">
        
        {/* CONDICIONAL: Só mostra o número da página aqui se NÃO tiver cabeçalho (Continuação) */}
        {!hasHeader && (
           <span className="page-number-slot after:content-['_(CONT\'D)']"></span>
        )}

        {/* Sempre mostra a contagem de painéis */}
        <span>PANELS: {panelCount}</span>
      </div>

      <NodeViewContent className="outline-none" />
    </NodeViewWrapper>
  )
}