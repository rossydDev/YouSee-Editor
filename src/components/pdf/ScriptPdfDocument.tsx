/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import { Document, Page, Text, View } from '@react-pdf/renderer';
import { styles } from './ScriptPdfStyles';
import { registerScriptFonts } from '@/lib/fonts';

registerScriptFonts();

interface TiptapNode {
  type: string;
  content?: TiptapNode[];
  text?: string;
  attrs?: Record<string, any>;
}

export interface ScriptPdfProps {
  title: string;
  seriesTitle?: string;
  chapterNumber?: string;
  editorContent: any;
  theme?: 'standard' | 'dark';
}

const getText = (node: TiptapNode): string => {
  if (node.text) return node.text;
  if (node.content && node.content.length > 0) {
    return node.content.map(child => getText(child)).join('');
  }
  return '';
};

export const ScriptPdfDocument: React.FC<ScriptPdfProps> = ({ 
  title, 
  seriesTitle, 
  chapterNumber,
  editorContent,
  theme = 'standard'
}) => {
  if (!editorContent || !editorContent.content) {
    return (
      <Document><Page size="A4" style={styles.page}><Text>Erro: Conteúdo vazio.</Text></Page></Document>
    );
  }

  const isDark = theme === 'dark';
  // Filtra apenas os nós de página
  const pages = editorContent.content.filter((node: TiptapNode) => node.type === 'page') || [];

  // Contador lógico para número da página do roteiro (ex: Page 1, Page 1 Cont...)
  let logicalPageCounter = 0;

  return (
    <Document title={title} author="YouSee Writer">
      {/* CAPA (TITLE PAGE) */}
      <Page size="A4" style={[styles.page, isDark ? styles.pageDark : {}]}>
        <View style={styles.titlePage}>
          {seriesTitle && (
            <Text style={{ fontSize: 16, marginBottom: 5, textTransform: 'uppercase', color: isDark ? '#a1a1aa' : '#000' }}>
              {seriesTitle}
            </Text>
          )}
          {chapterNumber && (
            <Text style={{ fontSize: 14, marginBottom: 10, fontWeight: 'bold', color: isDark ? '#f97316' : '#000' }}>
              #{chapterNumber}
            </Text>
          )}
          <Text style={[styles.titleMain, isDark ? styles.titleMainDark : {}]}>{title}</Text>
          <Text style={{ position: 'absolute', bottom: 50, fontSize: 10, color: isDark ? '#52525b' : '#666' }}>
            Desenvolvido com o YouSee {isDark ? '(Dark Mode)' : ''}
          </Text>
        </View>
      </Page>

      {/* RENDERIZAÇÃO DAS PÁGINAS */}
      {pages.map((pageNode: TiptapNode, pageIndex: number) => {
        const pageContent = pageNode.content || [];
        
        // Lógica de numeração de página (Storyboard logic)
        const hasStoryHeader = pageContent.some(n => n.type === 'storyPageHeader');
        if (hasStoryHeader) logicalPageCounter++;

        // --- CORREÇÃO DO CONTADOR DE PAINÉIS ---
        // Reinicia a contagem a cada página física, igual ao seu CSS (counter-reset: panel-counter)
        let panelCount = 0; 
        
        // Mas precisamos contar quantos painéis existem TOTAL nesta página para o cabeçalho
        const totalPanelsInPage = pageContent.filter(n => n.type === 'panel').length;

        // Construção do Cabeçalho
        const headerParts = [];
        if (seriesTitle) headerParts.push(seriesTitle.toUpperCase());
        if (chapterNumber) headerParts.push(`#${chapterNumber}`);
        
        const pageLabel = hasStoryHeader 
            ? `PAGE ${logicalPageCounter}` 
            : `PAGE ${logicalPageCounter} (CONT.)`;

        headerParts.push(pageLabel);
        if (totalPanelsInPage > 0) headerParts.push(`- PANELS: ${totalPanelsInPage}`);

        return (
          <Page key={pageIndex} size="A4" style={[styles.page, isDark ? styles.pageDark : {}]}>
            
            {/* Header da Página */}
            <Text style={hasStoryHeader ? [styles.pageHeader, isDark ? styles.pageHeaderDark : {}] : [styles.continuationHeader, isDark ? { color: '#a1a1aa' } : {}]}>
               {headerParts.join(' ')}
            </Text>

            <View>
              {pageContent.map((node, nodeIndex) => {
                // Pega o texto bruto
                const rawText = getText(node);
                const cleanText = rawText.trim();

                // Ignora headers na renderização do corpo
                if (node.type === 'storyPageHeader') return null;
                
                // Se for um parágrafo vazio e não for painel, pula
                if (!cleanText && node.type !== 'panel') return null;

                // --- RENDERIZAÇÃO DO PAINEL (CORRIGIDO) ---
                if (node.type === 'panel') {
                    panelCount++;
                    
                    // Se o usuário digitou algo (ex: "FLASHBACK"), adiciona hífen.
                    // Se não digitou nada, fica apenas "PANEL 1"
                    const panelLabel = cleanText 
                        ? `PANEL ${panelCount} - ${cleanText.toUpperCase()}`
                        : `PANEL ${panelCount}`;

                    return (
                      <Text key={nodeIndex} style={[styles.panelHeader, isDark ? styles.panelHeaderDark : {}]}>
                        {panelLabel}
                      </Text>
                    );
                }

                // Renderização dos outros tipos
                switch (node.type) {
                  case 'paragraph':
                    return <Text key={nodeIndex} style={styles.description}>{cleanText}</Text>;

                  case 'character':
                    return (
                      <View key={nodeIndex} style={styles.characterBlock} wrap={false}>
                        <Text style={styles.characterName}>{cleanText.toUpperCase()}</Text>
                      </View>
                    );

                  case 'parenthetical':
                    return (
                      <Text key={nodeIndex} style={styles.parenthetical}>
                        ({cleanText.replace(/[()]/g, '')})
                      </Text>
                    );

                  case 'dialogue':
                    return <Text key={nodeIndex} style={styles.dialogue}>{cleanText}</Text>;
                  
                  case 'sfx':
                    return (
                      <View key={nodeIndex} style={{ flexDirection: 'row', marginTop: 10, marginBottom: 10 }}>
                        <Text style={[styles.sfxLabel, isDark ? styles.sfxLabelDark : {}]}>SFX:</Text>
                        <Text style={{ fontStyle: 'italic' }}>{cleanText.toUpperCase()}</Text>
                      </View>
                    );

                  default: return null;
                }
              })}
            </View>
          </Page>
        );
      })}
    </Document>
  );
};