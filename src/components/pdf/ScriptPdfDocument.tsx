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
      {/* CAPA */}
      {/* CORREÇÃO: Trocamos 'undefined' por '{}' em todas as condicionais */}
      <Page size="A4" style={[styles.page, isDark ? styles.pageDark : {}]}>
        <View style={styles.titlePage}>
          {seriesTitle && (
            <Text style={{ 
              fontSize: 16, 
              marginBottom: 10, 
              textTransform: 'uppercase', 
              color: isDark ? '#a1a1aa' : '#000' 
            }}>
              {seriesTitle}
            </Text>
          )}
          
          <Text style={[styles.titleMain, isDark ? styles.titleMainDark : {}]}>
            {title}
          </Text>
          
          <Text style={[styles.titleCredits, isDark ? { color: '#e4e4e7' } : {}]}>
            Written by
          </Text>
          <Text style={[
            styles.titleCredits, 
            { fontWeight: 'bold' }, 
            isDark ? { color: '#fff' } : {}
          ]}>
            [AUTOR]
          </Text>
          
          <Text style={{ 
            position: 'absolute', 
            bottom: 50, 
            fontSize: 10, 
            color: isDark ? '#52525b' : '#666' 
          }}>
            Gerado via YouSee {isDark ? '(Dark Mode)' : ''}
          </Text>
        </View>
      </Page>

      {/* PÁGINAS DO ROTEIRO */}
      {pages.map((pageNode: TiptapNode, pageIndex: number) => {
        let panelCount = 0;
        const pageContent = pageNode.content || [];
        const totalPanelsInPage = pageContent.filter(n => n.type === 'panel').length;

        return (
          <Page key={pageIndex} size="A4" style={[styles.page, isDark ? styles.pageDark : {}]}>
            <Text style={[styles.pageHeader, isDark ? styles.pageHeaderDark : {}]}>
              PAGE {pageIndex + 1} {totalPanelsInPage > 0 ? `- PANELS: ${totalPanelsInPage}` : ''}
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
                      // CORREÇÃO: Usando estilo inline para o container do SFX para evitar erro de tipagem
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