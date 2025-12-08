import { StyleSheet } from "@react-pdf/renderer";

const COLORS = {
  white: "#ffffff",
  black: "#000000",
  darkBg: "#09090b",
  darkText: "#e4e4e7",
  amber: "#f97316",
  darkBorder: "#27272a",
};

export const styles = StyleSheet.create({
  // --- LAYOUT BASE ---
  page: {
    paddingTop: 40,
    paddingBottom: 40,
    paddingLeft: 72,
    paddingRight: 72,
    fontFamily: "Courier Prime",
    fontSize: 12,
    lineHeight: 1.7, // Calibrado para preencher a folha visualmente igual ao editor
    backgroundColor: COLORS.white,
    color: COLORS.black,
  },

  pageDark: {
    backgroundColor: COLORS.darkBg,
    color: COLORS.darkText,
  },

  // --- NOVO CABEÇALHO (Layout Absoluto para Centralização Perfeita) ---
  headerContainer: {
    flexDirection: "row",
    marginBottom: 25,
    borderBottomWidth: 0,
    position: "relative", // Importante para os filhos absolutos
    height: 20, // Altura fixa para alinhar os elementos
    width: "100%",
  },

  // Título da Página (CENTRALIZADO ABSOLUTO)
  // Isso garante que ele fique no meio exato, independente do texto da esquerda/direita
  headerPageTitle: {
    fontSize: 14,
    fontWeight: "bold",
    textDecoration: "underline",
    textAlign: "center",

    position: "absolute",
    left: 0,
    right: 0,
    top: -2,
    zIndex: 1,

    textTransform: "uppercase",
  },

  headerPageTitleDark: {
    color: COLORS.amber,
    textDecorationColor: COLORS.amber,
  },

  // Metadados (Série/Capítulo) - Esquerda
  headerMetaLeft: {
    fontSize: 9,
    color: "#888",
    textAlign: "left",

    position: "absolute",
    left: 0,
    bottom: 2, // Alinhado com a base do texto maior
    width: "35%",
    zIndex: 2,
  },

  // Metadados (Painéis) - Direita
  headerMetaRight: {
    fontSize: 9,
    color: "#888",
    textAlign: "right",

    position: "absolute",
    right: 0,
    bottom: 2,
    width: "20%",
    zIndex: 2,
  },

  // --- CONTINUAÇÃO (Discreto) ---
  continuationLabel: {
    fontSize: 10,
    fontStyle: "italic",
    color: "#666",
    textAlign: "center",
    marginTop: 0,
    marginBottom: 20,
  },

  // --- PAINÉIS (Cenas) ---
  panelHeader: {
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 35,
    marginBottom: 15,
    textTransform: "uppercase",
    textDecoration: "underline",
  },
  panelHeaderDark: {
    color: COLORS.amber,
    textDecorationColor: COLORS.amber,
  },

  // --- TEXTOS ---
  description: {
    marginBottom: 18,
    textAlign: "left",
    fontSize: 12,
  },

  characterBlock: {
    marginTop: 20,
    marginBottom: 0,
    keepWithNext: true,
  },
  characterName: {
    marginLeft: 180,
    fontWeight: "bold",
    textTransform: "uppercase",
  },

  dialogue: {
    marginLeft: 110,
    marginRight: 110,
    marginBottom: 18,
  },

  parenthetical: {
    marginLeft: 140,
    fontSize: 11,
    fontStyle: "italic",
    marginBottom: 0,
  },

  // --- CAPA ---
  titlePage: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    textAlign: "center",
  },
  titleMain: {
    fontSize: 28,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginBottom: 30,
    textDecoration: "underline",
  },
  titleMainDark: {
    color: COLORS.amber,
    textDecorationColor: COLORS.amber,
  },

  sfxLabel: {
    fontWeight: "bold",
    marginRight: 5,
  },
  sfxLabelDark: {
    color: COLORS.amber,
  },
});
