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
  chapterNumber?: string; // <--- NOVO CAMPO
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
      <Document>
        <Page size="A4" style={styles.page}>
          <Text>Erro: Conteúdo não encontrado.</Text>
        </Page>
      </Document>
    );
  }

  const isDark = theme === 'dark';
  const pages = editorContent.content.filter((node: TiptapNode) => node.type === 'page') || [];

  return (
    <Document title={title} author="YouSee Writer">
      {/* CAPA (TITLE PAGE) */}
      <Page size="A4" style={[styles.page, isDark ? styles.pageDark : {}]}>
        <View style={styles.titlePage}>
          
          {/* SÉRIE */}
          {seriesTitle && (
            <Text style={{ 
              fontSize: 16, 
              marginBottom: 5, 
              textTransform: 'uppercase', 
              color: isDark ? '#a1a1aa' : '#000' 
            }}>
              {seriesTitle}
            </Text>
          )}

          {/* CAPÍTULO (NOVO) */}
          {chapterNumber && (
            <Text style={{ 
              fontSize: 14, 
              marginBottom: 10, 
              fontWeight: 'bold', 
              color: isDark ? '#f97316' : '#000' // Laranja no Dark Mode para destaque
            }}>
              #{chapterNumber}
            </Text>
          )}
          
          {/* TÍTULO DO EPISÓDIO */}
          <Text style={[styles.titleMain, isDark ? styles.titleMainDark : {}]}>
            {title}
          </Text>
          
          <Text style={{ 
            position: 'absolute', 
            bottom: 50, 
            fontSize: 10, 
            color: isDark ? '#52525b' : '#666' 
          }}>
            Desenvolvido com o YouSee {isDark ? '(Dark Mode)' : ''}
          </Text>
        </View>
      </Page>

      {/* PÁGINAS DO ROTEIRO */}
      {pages.map((pageNode: TiptapNode, pageIndex: number) => {
        let panelCount = 0;
        const pageContent = pageNode.content || [];
        const totalPanelsInPage = pageContent.filter(n => n.type === 'panel').length;

        // Construção do Cabeçalho: "SÉRIE #1 - PAGE 1 - PANELS: 5"
        const headerParts = [];
        if (seriesTitle) headerParts.push(seriesTitle.toUpperCase());
        if (chapterNumber) headerParts.push(`#${chapterNumber}`);
        headerParts.push(`PAGE ${pageIndex + 1}`);
        if (totalPanelsInPage > 0) headerParts.push(`- PANELS: ${totalPanelsInPage}`);

        return (
          <Page key={pageIndex} size="A4" style={[styles.page, isDark ? styles.pageDark : {}]}>
            {/* Cabeçalho Rico com Informações de Contexto */}
            <Text style={[styles.pageHeader, isDark ? styles.pageHeaderDark : {}]}>
              {headerParts.join(' ')}
            </Text>

            <View>
              {pageContent.map((node, nodeIndex) => {
                const text = getText(node);
                if (!text.trim() && node.type !== 'panel') return null;

                switch (node.type) {
                  case 'panel':
                    panelCount++;
                    const panelText = text.trim() ? ` - ${text.toUpperCase()}` : '';
                    return (
                      <Text key={nodeIndex} style={[styles.panelHeader, isDark ? styles.panelHeaderDark : {}]}>
                        PANEL {panelCount}{panelText}
                      </Text>
                    );

                  case 'paragraph':
                    return <Text key={nodeIndex} style={styles.description}>{text}</Text>;

                  case 'character':
                    return (
                      <View key={nodeIndex} style={styles.characterBlock} wrap={false}>
                        <Text style={styles.characterName}>{text.toUpperCase()}</Text>
                      </View>
                    );

                  case 'parenthetical':
                    return (
                      <Text key={nodeIndex} style={styles.parenthetical}>
                        ({text.replace(/[()]/g, '')})
                      </Text>
                    );

                  case 'dialogue':
                    return <Text key={nodeIndex} style={styles.dialogue}>{text}</Text>;
                  
                  case 'sfx':
                    return (
                      <View key={nodeIndex} style={{ flexDirection: 'row', marginTop: 10, marginBottom: 10 }}>
                        <Text style={[styles.sfxLabel, isDark ? styles.sfxLabelDark : {}]}>SFX:</Text>
                        <Text style={{ fontStyle: 'italic' }}>{text.toUpperCase()}</Text>
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