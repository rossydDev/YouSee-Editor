# 👁️ YouSee - HQ Script Editor

> **Status:** ✅ MVP 1.0 (Local-First)

O **YouSee** é um editor de roteiros de histórias em quadrinhos profissional, Open Source, focado em alta performance e uma experiência visual imersiva "Dark Mode".

Desenvolvido para resolver o problema de formatação de roteiros de HQ, oferecendo uma interface limpa que separa a **Página da História** da **Folha de Impressão**.

![YouSee Editor Screenshot](https://via.placeholder.com/800x400?text=Screenshot+do+Editor+Aqui)
*(Sugestão: Substitua este link por um print real do seu editor depois!)*

## ✨ Funcionalidades Principais

- **📚 Organização de Séries:**
  - Dashboard visual para gerenciar múltiplos roteiros.
  - Agrupamento automático por **Série** e ordenação por **Capítulo**.
  - Identidade visual "Dark & Amber" consistente.
- **🧠 Autocomplete Inteligente:**
  - Sugestão automática de nomes de **Personagens** recorrentes (`@` ou digitação).
  - Autocomplete para nomes de **Séries** já existentes.
- **📝 Formatação de Roteiro:** Blocos semânticos para Cenas, Personagens, Diálogos e SFX.
- **📄 Engine de Paginação Automática:**
  - Detecta quando o conteúdo excede o tamanho A4 e cria novas páginas.
  - Suporte a "Páginas de História" vs "Folhas de Impressão".
- **💾 Persistência Local-First:**
  - Salvamento automático no `localStorage`.
- **🖨️ Exportação PDF Profissional:**
  - Formatação **Standard Industry** (Courier 12pt, Margens de Cinema).
  - Remove a interface escura para impressão limpa em preto e branco.

## 🛠️ Stack Tecnológica

- **Core:** Next.js 14 (App Router)
- **Linguagem:** TypeScript
- **Estilo:** Tailwind CSS v4
- **Editor Engine:** Tiptap (Headless ProseMirror)
- **State Management:** React Hooks + LocalStorage
- **Icons:** Lucide React

## 🚀 Como Rodar Localmente

1. Clone o repositório:
```bash
git clone [https://github.com/rossydDev/YouSee-Editor.git](https://github.com/rossydDev/YouSee-Editor.git)

## 🚀 Como Rodar

```bash
# Clone o repositório
git clone https://github.com/rossydDev/YouSee-Editor.git
# Instale as dependências
npm install

# Rode o servidor de desenvolvimento
npm run dev