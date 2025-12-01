import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';

export const AutoNumberingExtension = Extension.create({
  name: 'autoNumbering',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('autoNumbering'),
        view(editorView) {
          return {
            update(view, prevState) {
              const docChanged = !view.state.doc.eq(prevState.doc);
              
              if (docChanged) {
                updatePanelNumbers(view);
              }
            },
          };
        },
      }),
    ];
  },
});

function updatePanelNumbers(view: any) {
  const { state, dispatch } = view;
  const { doc } = state;
  let tr = state.tr;
  let hasChanges = false;
  
  let panelCounter = 0;

  // Percorre todo o documento para atualizar os números
  doc.descendants((node: any, pos: number) => {
    
    // Se encontrar um Header de Página, zera o contador (Nova Cena/Página)
    if (node.type.name === 'storyPageHeader') {
        panelCounter = 0;
    }

    // Se encontrar um Painel, incrementa e verifica se precisa atualizar
    if (node.type.name === 'panel') {
        panelCounter++;
        
        if (node.attrs.number !== panelCounter) {
            tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                number: panelCounter
            });
            hasChanges = true;
        }
    }
  });

  if (hasChanges && dispatch) {
    // addToHistory: false para não poluir o Ctrl+Z com atualizações de número
    dispatch(tr.setMeta('addToHistory', false));
  }
}