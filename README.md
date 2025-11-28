# 👁️ YouSee - HQ Script Editor

> **Status:** ✅ MVP 1.0 (Local-First)

O **YouSee** é um editor de roteiros de histórias em quadrinhos profissional, Open Source, focado em alta performance e uma experiência visual imersiva "Dark Mode".

Desenvolvido para resolver o problema de formatação de roteiros de HQ, oferecendo uma interface limpa que separa a **Página da História** da **Folha de Impressão**.

![YouSee Editor Screenshot](https://via.placeholder.com/800x400?text=Screenshot+do+Editor+Aqui)
*(Sugestão: Substitua este link por um print real do seu editor depois!)*

## ✨ Funcionalidades Principais (MVP)

- **📝 Formatação de Roteiro:** Blocos semânticos para Cenas, Personagens, Diálogos e SFX.
- **📄 Engine de Paginação Automática:**
  - Detecta automaticamente quando o conteúdo excede o tamanho A4.
  - Move o conteúdo para uma nova folha sem quebrar o fluxo.
- **🔢 Numeração Inteligente:**
  - Separação entre **Folha Física** (Impressão) e **Página da História** (Narrativa).
  - Contagem automática de painéis por página.
- **💾 Persistência Local-First:**
  - Salvamento automático no `localStorage`.
  - Seus dados sobrevivem a um *refresh* ou fechamento de aba.
- **🖨️ Exportação PDF Limpa:**
  - Transforma o tema "Dark & Amber" em "Preto no Branco" automaticamente para impressão.
  - Respeita as quebras de página A4 perfeitamente.

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