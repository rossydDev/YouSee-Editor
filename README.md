# 👁️ YouSee - HQ Script Editor

![YouSee Banner](/public/banner.png)

> **O YouSee é um editor de roteiros de histórias em quadrinhos profissional, Open Source, focado em alta performance e uma experiência visual imersiva "Dark Mode".**

Desenvolvido para resolver o problema de formatação de roteiros de HQ, oferecendo uma interface limpa que separa a **Página da História** da **Folha de Impressão**.

![Preview do App](/public/screenshot.png)

---

## ✨ Funcionalidades Principais

### 📚 Organização de Projetos (Novo!)
- **Gestão de Séries:** Crie séries e organize seus capítulos dentro delas automaticamente.
- **Hierarquia Visual:** Identifique rapidamente a qual projeto um roteiro pertence direto no Explorador.
- **Badges de Contagem:** Saiba quantos capítulos cada série possui num piscar de olhos.

### 📝 Formatação de Roteiro (Comic Script)
- **Blocos Semânticos:** Atalhos rápidos para Painéis, Personagens, Diálogos e SFX.
- **Numeração Inteligente:** O sistema gerencia `PAGE X` e `PANEL Y` automaticamente.
- **Corretor Ortográfico Nativo:** Sublinhado de erros e Menu de Contexto customizado (Dark Mode) com sugestões em Português (PT-BR).

### 📄 Engine de Paginação Automática
- **Visualização WYSIWYG:** O editor simula folhas A4 reais.
- **Quebra Automática:** Detecta quando o conteúdo excede o tamanho da página e cria novas folhas automaticamente.

### 💾 Persistência & Segurança
- **Local-First:** Seus arquivos (`.yousee`) são salvos diretamente no seu HD.
- **Atalhos de Salvamento:** `Ctrl + S` para garantir segurança imediata, além do Autosave.
- **Lixeira Segura:** Modal de confirmação estilizado para evitar deleções acidentais.

### 🖨️ Exportação PDF Profissional
- **Modo Padrão (Industry Standard):** Fonte Courier Prime 12pt, fundo branco (pronto para editoras).
- **Modo YouSee (Dark Mode):** PDF otimizado para leitura digital em tablets/celulares.

---

## 🛠️ Stack Tecnológica

- **Core:** Next.js 14 (App Router)
- **Desktop Engine:** Electron + TypeScript
- **Editor Engine:** Tiptap (Headless ProseMirror)
- **Estilo:** Tailwind CSS + Lucide Icons
- **PDF Engine:** @react-pdf/renderer
- **State:** React Hooks + Local Storage

---

## 🚀 Como Rodar Localmente

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/rossydDev/YouSee-Editor.git
   ```

2. **Instale as dependências:**
   ```bash
   npm run dev
   ```

2. **Rode o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

4. Abra http://localhost:3000 no seu navegador.

🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir Issues relatando bugs ou enviar Pull Requests com melhorias.

<p align="center"> Desenvolvido com 🧡 e café. </p>