import { Content } from '@tiptap/react'

export interface Script {
  id: string
  title: string
  lastModified: number
  content: Content
}

const STORAGE_KEY = 'yousee-scripts-v1'

// --- FUNÇÕES DO BANCO DE DADOS ---

export function getAllScripts(): Script[] {
  if (typeof window === 'undefined') return []
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw)
  } catch (e) {
    return []
  }
}

export function getScriptById(id: string): Script | undefined {
  const scripts = getAllScripts()
  return scripts.find(s => s.id === id)
}

export function saveScript(id: string, content: Content, title?: string) {
  const scripts = getAllScripts()
  const now = Date.now()
  const existingIndex = scripts.findIndex(s => s.id === id)

  if (existingIndex >= 0) {
    scripts[existingIndex] = {
      ...scripts[existingIndex],
      content,
      lastModified: now,
      title: title || scripts[existingIndex].title
    }
  } else {
    scripts.push({
      id,
      title: title || 'Sem Título',
      content,
      lastModified: now
    })
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