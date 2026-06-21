# 🏷️ stack-links

<!--
  ============================================================
  BADGES — UM POR LINHA
  Gerar em: https://shields.io
  Cores (hex) em: https://simpleicons.org
  ============================================================
  Ordem obrigatória:

    1. Linguagens de Programação
    2. Gerenciadores de Pacotes
    3. Frameworks
    4. Principais pacotes/bibliotecas
    5. Testes
    6. Ambiente (Docker, devcontainer, etc)
    7. Pipeline (GitHub Actions, etc)
    8. Deploy (GitHub Pages, etc)

  Regras:
    - style=for-the-badge
    - Versão = apenas **major** (ex: 3.4.6 → 3). Se não houver versão
      semântica, omitir o traço `-{{version}}` do label.
    - logoColor = `white` (fundo escuro) ou `black` (fundo claro),
      adequar por badge.
    - Seções dispensáveis que não se aplicam ao projeto devem ser
      **removidas do arquivo**, nunca mantidas como comentário.
  ============================================================
-->

<!-- 1.LINGUAGENS | 2.PACKAGE_MANAGERS | 3.FRAMEWORKS | 4.BIBLIOTECAS | 5.TESTES | 6.AMBIENTE | 7.PIPELINE | 8.DEPLOY -->

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![npm](https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-22-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Alpine.js](https://img.shields.io/badge/Alpine.js-3-8BC0D0?style=for-the-badge&logo=alpine.js&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![SortableJS](https://img.shields.io/badge/SortableJS-1-000000?style=for-the-badge&logo=javascript&logoColor=white)
![Lucide](https://img.shields.io/badge/Lucide-F56565?style=for-the-badge&logo=lucide&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)
![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-222222?style=for-the-badge&logo=githubpages&logoColor=white)

> Uma startpage (página inicial) personalizável para navegador com grid de links em abas, relógio, clima, dark mode e suporte a arrastar e soltar.

## 🎯 Sobre o Projeto

StackLinks é uma página inicial (startpage) para navegador que organiza seus links favoritos em abas com seções agrupadas. O projeto permite adicionar, editar, excluir e reordenar links e seções via interface drag-and-drop. Conta com relógio ao vivo com formatos personalizáveis, widget de clima com geolocalização automática (Open-Meteo), modo escuro, alternância de estilo de ícones (Simple Icons / Google Favicons) e suporte a importação/exportação das configurações. Os dados de customização são persistidos no localStorage e os links fixos são carregados de um arquivo JSON estático.

---

## 📦 Pré-requisitos

- **Node.js 22+** — verifique com `node --version`
- **Docker 24+** (opcional) — verifique com `docker --version`

---

## 🚀 Instalação

### Instale as dependências

```bash
npm install
```

### Execute a aplicação

```bash
npm run dev
```

Acesse em: `http://localhost:5173`
