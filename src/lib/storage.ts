import { Content } from '@tiptap/react'

// Definição atualizada do que é um "Roteiro"
export interface Script {
  id: string
  title: string
  lastModified: number
  content: Content
  
  // NOVOS CAMPOS PARA ESTRUTURA DE SÉRIE
  seriesTitle: string | null // Ex: "Bardo e Capangas"
  chapterNumber: number | null // Ex: 1
}

const STORAGE_KEY = 'yousee-scripts-v1'

// --- FUNÇÕES DO BANCO DE DADOS ---

export function getAllScripts(): Script[] {
  if (typeof window === 'undefined') return []
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw) as Script[] // Adicionamos 'as Script[]' para tipagem mais segura
  } catch (e) {
    return []
  }
}

export function getScriptById(id: string): Script | undefined {
  const scripts = getAllScripts()
  return scripts.find(s => s.id === id)
}

// 3. Salvar (Criar ou Atualizar) - Lógica atualizada para salvar os campos de série
export function saveScript(
  id: string, 
  content: Content, 
  title?: string,
  seriesTitle?: string | null, // Recebe o título da série
  chapterNumber?: number | null // Recebe o número do capítulo
) {
  const scripts = getAllScripts()
  const now = Date.now()
  const existingIndex = scripts.findIndex(s => s.id === id)

  const defaultTitle = title || 'Sem Título'

  if (existingIndex >= 0) {
    // Atualizar existente
    scripts[existingIndex] = {
      ...scripts[existingIndex],
      content,
      lastModified: now,
      title: defaultTitle,
      // Atualiza os novos campos
      seriesTitle: seriesTitle !== undefined ? seriesTitle : scripts[existingIndex].seriesTitle,
      chapterNumber: chapterNumber !== undefined ? chapterNumber : scripts[existingIndex].chapterNumber,
    }
  } else {
    // Criar novo
    const newScript: Script = {
      id,
      title: defaultTitle,
      content,
      lastModified: now,
      // Define os novos campos
      seriesTitle: seriesTitle || null,
      chapterNumber: chapterNumber || null,
    }
    scripts.push(newScript)
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(scripts))
}

export function deleteScript(id: string) {
  const scripts = getAllScripts().filter(s => s.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scripts))
}

export function generateId(): string {
  return crypto.randomUUID()
}