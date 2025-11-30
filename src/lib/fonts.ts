import { Font } from '@react-pdf/renderer';

// Registra a fonte oficial de roteiros
// Usamos o CDN do Google Fonts para garantir disponibilidade
export const registerScriptFonts = () => {
  Font.register({
    family: 'Courier Prime',
    fonts: [
      {
        src: 'https://cdn.jsdelivr.net/fontsource/fonts/courier-prime@latest/latin-400-normal.ttf',
        fontWeight: 'normal',
      },
      {
        src: 'https://cdn.jsdelivr.net/fontsource/fonts/courier-prime@latest/latin-700-normal.ttf',
        fontWeight: 'bold',
      },
      {
        src: 'https://cdn.jsdelivr.net/fontsource/fonts/courier-prime@latest/latin-400-italic.ttf',
        fontStyle: 'italic',
      },
      {
        src: 'https://cdn.jsdelivr.net/fontsource/fonts/courier-prime@latest/latin-700-italic.ttf',
        fontWeight: 'bold',
        fontStyle: 'italic',
      },
    ],
  });
};