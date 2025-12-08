/* eslint-disable jsx-a11y/alt-text */
import { registerScriptFonts } from "@/lib/fonts";
import { Document, Page, Text, View } from "@react-pdf/renderer";
import React from "react";
import { styles } from "./ScriptPdfStyles";

try {
  registerScriptFonts();
} catch (e) {
  console.warn("Fonts already registered or failed:", e);
}

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
  theme?: "standard" | "dark";
}

const getText = (node: TiptapNode): string => {
  if (node.text) return node.text;
  if (node.content && node.content.length > 0) {
    return node.content.map((child) => getText(child)).join("");
  }
  return "";
};

export const ScriptPdfDocument: React.FC<ScriptPdfProps> = ({
  title,
  seriesTitle,
  chapterNumber,
  editorContent,
  theme = "standard",
}) => {
  if (!editorContent || !editorContent.content) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text>Erro: Conteúdo vazio.</Text>
        </Page>
      </Document>
    );
  }

  const isDark = theme === "dark";
  const pages =
    editorContent.content.filter((node: TiptapNode) => node.type === "page") ||
    [];

  let logicalPageCounter = 0;
  let panelCounter = 0;

  return (
    <Document title={title} author="YouSee Writer">
      {/* CAPA */}
      <Page size="A4" style={[styles.page, isDark ? styles.pageDark : {}]}>
        <View style={styles.titlePage}>
          {seriesTitle && (
            <Text
              style={{
                fontSize: 16,
                marginBottom: 5,
                textTransform: "uppercase",
                color: isDark ? "#a1a1aa" : "#000",
              }}
            >
              {seriesTitle}
            </Text>
          )}
          {chapterNumber && (
            <Text
              style={{
                fontSize: 14,
                marginBottom: 10,
                fontWeight: "bold",
                color: isDark ? "#f97316" : "#000",
              }}
            >
              #{chapterNumber}
            </Text>
          )}
          <Text style={[styles.titleMain, isDark ? styles.titleMainDark : {}]}>
            {title}
          </Text>
          <Text
            style={{
              position: "absolute",
              bottom: 50,
              fontSize: 10,
              color: isDark ? "#52525b" : "#666",
            }}
          >
            Desenvolvido com o YouSee {isDark ? "(Dark Mode)" : ""}
          </Text>
        </View>
      </Page>

      {/* PÁGINAS DO ROTEIRO */}
      {pages.map((pageNode: TiptapNode, pageIndex: number) => {
        const pageContent = pageNode.content || [];
        const hasStoryHeader = pageContent.some(
          (n) => n.type === "storyPageHeader"
        );

        if (hasStoryHeader) {
          logicalPageCounter++;
          panelCounter = 0;
        }

        const totalPanelsInPage = pageContent.filter(
          (n) => n.type === "panel"
        ).length;
        const isContinuation = !hasStoryHeader;

        // --- MONTAGEM DO HEADER ---

        // 1. Meta Esquerda
        const metaLeftText = seriesTitle
          ? `${seriesTitle.toUpperCase()} ${
              chapterNumber ? "#" + chapterNumber : ""
            }`
          : title;

        // 2. Título Central (AGORA COM O CONT. JUNTO)
        // Isso garante que o texto inteiro "PAGE X (CONT.)" fique centralizado.
        const pageTitleText = isContinuation
          ? `PAGE ${logicalPageCounter} (CONT.)`
          : `PAGE ${logicalPageCounter}`;

        // 3. Meta Direita
        const metaRightText =
          totalPanelsInPage > 0 ? `PNLS: ${totalPanelsInPage}` : "";

        return (
          <Page
            key={pageIndex}
            size="A4"
            style={[styles.page, isDark ? styles.pageDark : {}]}
          >
            {/* CABEÇALHO */}
            <View style={styles.headerContainer}>
              {/* Esquerda */}
              <Text style={styles.headerMetaLeft}>{metaLeftText}</Text>

              {/* Centro (PAGE X + CONT.) */}
              <Text
                style={[
                  styles.headerPageTitle,
                  isDark ? styles.headerPageTitleDark : {},
                ]}
              >
                {pageTitleText}
              </Text>

              {/* Direita */}
              <Text style={styles.headerMetaRight}>{metaRightText}</Text>
            </View>

            {/* REMOVIDO: O bloco <Text> solto de (CONTINUED) foi apagado daqui */}

            <View>
              {pageContent.map((node, nodeIndex) => {
                const rawText = getText(node);
                const cleanText = rawText.trim();

                if (node.type === "storyPageHeader") return null;
                if (!cleanText && node.type !== "panel") return null;

                if (node.type === "panel") {
                  const displayNum = node.attrs?.number || ++panelCounter;
                  const panelLabel = cleanText
                    ? `PANEL ${displayNum} - ${cleanText.toUpperCase()}`
                    : `PANEL ${displayNum}`;

                  return (
                    <Text
                      key={nodeIndex}
                      style={[
                        styles.panelHeader,
                        isDark ? styles.panelHeaderDark : {},
                      ]}
                    >
                      {panelLabel}
                    </Text>
                  );
                }

                switch (node.type) {
                  case "paragraph":
                    return (
                      <Text key={nodeIndex} style={styles.description}>
                        {cleanText}
                      </Text>
                    );
                  case "character":
                    return (
                      <View
                        key={nodeIndex}
                        style={styles.characterBlock}
                        wrap={false}
                      >
                        <Text style={styles.characterName}>
                          {cleanText.toUpperCase()}
                        </Text>
                      </View>
                    );
                  case "parenthetical":
                    return (
                      <Text key={nodeIndex} style={styles.parenthetical}>
                        ({cleanText.replace(/[()]/g, "")})
                      </Text>
                    );
                  case "dialogue":
                    return (
                      <Text key={nodeIndex} style={styles.dialogue}>
                        {cleanText}
                      </Text>
                    );
                  case "sfx":
                    return (
                      <View
                        key={nodeIndex}
                        style={{
                          flexDirection: "row",
                          marginTop: 10,
                          marginBottom: 10,
                        }}
                      >
                        <Text
                          style={[
                            styles.sfxLabel,
                            isDark ? styles.sfxLabelDark : {},
                          ]}
                        >
                          SFX:
                        </Text>
                        <Text style={{ fontStyle: "italic" }}>
                          {cleanText.toUpperCase()}
                        </Text>
                      </View>
                    );
                  default:
                    return null;
                }
              })}
            </View>
          </Page>
        );
      })}
    </Document>
  );
};
