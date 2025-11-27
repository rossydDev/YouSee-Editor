import { NodeViewWrapper, NodeViewContent, NodeViewProps } from '@tiptap/react'
import React, { useMemo } from 'react'

export const PageNodeView: React.FC<NodeViewProps> = ({ node }) => {
  // Logic: Counts how many direct children are of type 'panel'
  const panelCount = useMemo(() => {
    let count = 0
    node.content.forEach((child) => {
      if (child.type.name === 'panel') {
        count++
      }
    })
    return count
  }, [node.content]) // Recalculates whenever content changes

  return (
    <NodeViewWrapper 
      className="page-node relative bg-zinc-900 border border-zinc-800 shadow-xl p-[25mm] min-h-[297mm] w-[210mm] mx-auto my-8"
    >
      {/* Hybrid Header: CSS handles Page #, React handles Panel count */}
      <div className="absolute top-8 right-[25mm] text-xs text-gray-500 font-bold uppercase tracking-widest border-b border-zinc-800 pb-2 mb-8 select-none">
        <span className="page-number-slot"></span> - PANELS: {panelCount}
      </div>

      <NodeViewContent className="outline-none" />
    </NodeViewWrapper>
  )
}