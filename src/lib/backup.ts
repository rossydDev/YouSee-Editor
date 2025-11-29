import { getAllScripts, saveScript, Script } from "./storage";

/**
 * Gera um arquivo JSON com todos os roteiros e força o download.
 */
export function exportBackup() {
  const scripts = getAllScripts();
  
  if (scripts.length === 0) {
    alert("Não há roteiros para exportar.");
    return;
  }

  // Cria o Blob (o arquivo na memória)
  const dataStr = JSON.stringify(scripts, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  // Cria um nome de arquivo com data: "backup-yousee-2025-11-29.json"
  const date = new Date().toISOString().split('T')[0];
  const exportFileDefaultName = `backup-yousee-${date}.json`;

  // Cria um link invisível e clica nele
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
}

/**
 * Lê um arquivo JSON e restaura os roteiros.
 * Estratégia: MERGE (Adiciona/Atualiza, não apaga o que já existe).
 */
export async function importBackup(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const json = event.target?.result as string;
        const importedScripts = JSON.parse(json) as Script[];

        if (!Array.isArray(importedScripts)) {
          throw new Error("Formato de arquivo inválido.");
        }

        let count = 0;
        importedScripts.forEach(script => {
          // Validação básica
          if (script.id && script.content) {
            saveScript(
              script.id, 
              script.content, 
              script.title, 
              script.seriesTitle, 
              script.chapterNumber
            );
            count++;
          }
        });

        resolve(count);
      } catch (e) {
        reject(e);
      }
    };

    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
}