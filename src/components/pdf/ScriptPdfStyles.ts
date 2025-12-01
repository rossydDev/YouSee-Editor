import { StyleSheet } from '@react-pdf/renderer';

const COLORS = {
  white: '#ffffff',
  black: '#000000',
  darkBg: '#09090b',      
  darkText: '#e4e4e7',    
  amber: '#f97316',       
  darkBorder: '#27272a',  
};

export const styles = StyleSheet.create({
  // --- LAYOUT BASE ---
  page: {
    // Margens A4 Padrão (Top/Bottom reduzidos levemente para caber o header)
    paddingTop: 40,
    paddingBottom: 40,
    paddingLeft: 72, // 1 polegada (padrão roteiro)
    paddingRight: 72,
    fontFamily: 'Courier Prime',
    
    // AJUSTE CRÍTICO DE ESCALA:
    // 12pt é o padrão da indústria (Courier 12).
    // lineHeight 1.2 é muito apertado. 
    // 1.5 aproxima-se mais do visual "double space" de roteiros e do Tailwind 'leading-relaxed'.
    fontSize: 12, 
    lineHeight: 1.5, 
    
    backgroundColor: COLORS.white, 
    color: COLORS.black,           
  },

  pageDark: {
    backgroundColor: COLORS.darkBg,
    color: COLORS.darkText,
  },

  // --- CABEÇALHO ---
  pageHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 20, // Espaço maior após o header
    textTransform: 'uppercase',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingBottom: 5,
    // Garante que o header fique fixo no topo
    position: 'relative',
  },
  
  pageHeaderDark: {
    color: COLORS.amber, 
    borderBottomColor: COLORS.amber,
  },

  // --- CONTINUAÇÃO ---
  continuationHeader: {
    fontSize: 10,
    color: '#666',
    marginBottom: 20,
    fontStyle: 'italic',
    textAlign: 'right', // Alinhado à direita para diferenciar
  },

  // --- PAINÉIS (Cenas) ---
  panelHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 20, // Mais respiro antes de um novo painel
    marginBottom: 10,
    textTransform: 'uppercase',
    textDecoration: 'underline',
  },
  panelHeaderDark: {
    color: COLORS.amber, 
    textDecorationColor: COLORS.amber,
  },

  // --- TEXTOS ---
  description: {
    marginBottom: 12, // Espaçamento entre parágrafos de ação
    textAlign: 'left',
    fontSize: 12,
  },
  
  // Personagem
  characterBlock: {
    marginTop: 12,
    marginBottom: 0, // O nome deve colar no diálogo
    keepWithNext: true, 
  },
  characterName: {
    marginLeft: 180, // Margem padrão de roteiro (~2.5 polegadas)
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },

  // Diálogo
  dialogue: {
    marginLeft: 110, // Margem padrão de roteiro (~1.5 polegadas)
    marginRight: 110,
    marginBottom: 12,
  },

  // Parenteses
  parenthetical: {
    marginLeft: 140,
    fontSize: 11, // Levemente menor
    fontStyle: 'italic',
    marginBottom: 0,
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
  
  // --- SFX ---
  sfxLabel: {
    fontWeight: 'bold',
    marginRight: 5,
  },
  sfxLabelDark: {
    color: COLORS.amber,
  }
});