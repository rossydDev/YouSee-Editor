import { StyleSheet } from '@react-pdf/renderer';

// Cores do YouSee
const COLORS = {
  white: '#ffffff',
  black: '#000000',
  darkBg: '#09090b',      // zinc-950
  darkText: '#e4e4e7',    // zinc-200
  amber: '#f97316',       // orange-500
  darkBorder: '#27272a',  // zinc-800
};

export const styles = StyleSheet.create({
  // --- LAYOUT BASE ---
  page: {
    paddingTop: 50,
    paddingBottom: 50,
    paddingLeft: 72,
    paddingRight: 72,
    fontFamily: 'Courier Prime',
    fontSize: 11,
    lineHeight: 1.2,
    backgroundColor: COLORS.white, // Padrão
    color: COLORS.black,           // Padrão
  },

  // --- VARIAÇÃO DARK MODE ---
  pageDark: {
    backgroundColor: COLORS.darkBg,
    color: COLORS.darkText,
  },

  // --- CABEÇALHO ---
  pageHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 20,
    textTransform: 'uppercase',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingBottom: 5,
  },
  pageHeaderDark: {
    color: COLORS.amber, // Destaque no Dark Mode
    borderBottomColor: COLORS.amber,
  },

  // --- PAINÉIS (Cenas) ---
  panelHeader: {
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 8,
    textTransform: 'uppercase',
    textDecoration: 'underline',
  },
  panelHeaderDark: {
    color: COLORS.amber, // Sluglines em Ambar
    textDecorationColor: COLORS.amber,
  },

  // --- TEXTOS ---
  description: {
    marginBottom: 10,
    textAlign: 'left',
    fontSize: 11,
  },
  
  // Personagem
  characterBlock: {
    marginTop: 10,
    marginBottom: 8,
    keepWithNext: true, 
  },
  characterName: {
    marginLeft: 180,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },

  // Diálogo
  dialogue: {
    marginLeft: 110,
    marginRight: 110,
    marginBottom: 10,
  },

  // Parenteses
  parenthetical: {
    marginLeft: 140,
    fontSize: 10,
    fontStyle: 'italic',
    marginBottom: 2,
  },

  // --- CAPA ---
  titlePage: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    textAlign: 'center',
  },
  titleMain: {
    fontSize: 28,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 30,
    textDecoration: 'underline',
  },
  titleMainDark: {
    color: COLORS.amber,
    textDecorationColor: COLORS.amber,
  },
  titleCredits: {
    fontSize: 14,
    marginBottom: 8,
  },
  
  // --- SFX ---
  sfxLabel: {
    fontWeight: 'bold',
    marginRight: 5,
  },
  sfxLabelDark: {
    color: COLORS.amber,
  }
});