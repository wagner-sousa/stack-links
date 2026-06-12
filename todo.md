# StackLinks — Todo

## Alta prioridade

- [ ] **DnD não reinicia ao trocar de aba** — `selectTab()` não chama `afterRender()`/`refreshDnD()`, então SortableJS fica preso na aba anterior.
- [ ] **18 assets órfãos em `dist/`** — Builds anteriores acumulam JS/CSS não referenciados. Service worker pré-cacheia tudo. Configurar `emptyOutDir: true` no `vite.config.js`.
- [ ] **Validação de `dateFormat` muito restrita** — Regex `!/[Hms]/.test()` rejeita formatos válidos tipo `DD/MM/YYYY HH:mm` e aceita lixo tipo `ABC`. Trocar para validação positiva de tokens.
- [ ] **Duplicatas no `popularIcons`** — `icons.js` tem dezenas de entradas repetidas (`codeberg`, `kotlin`, `swift`, `tailwindcss`, `stripe`, etc.). Deduplicar.
- [ ] **Modais sem foco/trap** — Nenhum modal gerencia foco, `Escape` não fecha, `Tab` vaza para o fundo. Adicionar `@keydown.escape`, `aria-modal`, `role="dialog"`, foco inicial.
- [ ] **`<title>` vazio antes do Alpine hidratar** — `<title x-text="...">` renderiza vazio. Colocar fallback estático.
- [ ] **Cores quebram se `colors` é undefined** — `applyTheme()` faz `setProperty("--color-bg", colors.bg)` podendo setar `"undefined"`. Validar cada valor.
- [ ] **`importData` não restaura `activeTab`** — Export inclui `customizations`/`theme`/etc mas não salva a aba ativa.
- [ ] **URL de link sem protocolo vira caminho relativo** — `"google.com"` → `<a href="google.com">` resolve como relativo. Auto-prepend `https://`.
- [ ] **`prefetchDynamicIcons` só roda no `init()`** — Adicionar link com ícone novo não busca o SVG. Chamar após `saveLinkModal()`.

## Média prioridade

- [ ] **Classes CSS mortas** — `.section-card`, `.link-card`, `.grid-auto`, `--grid-cols` não são usadas em lugar nenhum.
- [ ] **Logo da empresa não implementado** — `company.logo` carregado mas nunca renderizado no template.
- [ ] **`clock.js` com locale `"en"` hardcoded** — Nomes de mês/dia sempre em inglês. Usar `undefined` (locale do navegador) ou adicionar config.
- [ ] **CRUD sem feedback de validação** — Salvar modal com campo vazio silenciosamente falha. Adicionar mensagem ou highlight.
- [ ] **Sem estado de loading/error para APIs** — Weather e ícones dinâmicos não mostram placeholder enquanto carregam.
- [ ] **Temperatura sempre em Celsius** — Adicionar opção `temperatureUnit` com conversão para Fahrenheit.
- [ ] **`localStorage.removeItem("weather_cache")** a cada fetch** — Desnecessário após migrar para `weather_cache_v2`. Mover para `init()`.
- [ ] **Sem suporte a `prefers-reduced-motion`** — Animações/transitions não respeitam a preferência do usuário.
- [ ] **Modais sem atributos ARIA** — `aria-hidden`, `aria-labelledby`, `aria-controls` ausentes.
- [ ] **Google Favicons envia domínios ao Google** — Privacidade. Considerar fallback self-hosted ou ocultar imagem com `@error`.

## Baixa prioridade

- [ ] **`JSON.parse(JSON.stringify(...))` para deep clone** — Funciona para objetos simples, mas `structuredClone()` é mais adequado.
- [ ] **`mergeData()` recalcula tudo a cada CRUD** — Aceitável no tamanho atual. Adicionar TODO para virtualização futura.
- [ ] **Modal Debug sem validação de input** — `x-model` ignora `min`/`max` do HTML. Coagir tipos em `saveDebug()`.
- [ ] **Códigos WMO 1-3 agrupados como "Partly cloudy"** — Perde granularidade (overcast ≠ partly cloudy).
- [ ] **`sectionOrder` não persiste para seções fixas** — Ordem original do JSON é usada sempre que localStorage é limpo.
- [ ] **Sem ESLint/Prettier** — Nenhuma ferramenta de qualidade de código.
- [ ] **Ícone PWA SVG com `sizes` fixo** — `sizes: "192x192"` para SVG é incomum. Adicionar PNG fallback.
- [ ] **`<script>` antes do `<link>` CSS no HTML de build** — Vite põe JS antes do CSS. Ordem ideal é CSS primeiro.
- [ ] **Weather nunca atualiza com página aberta** — Cache de 10 min, mas sem `setInterval` para re-fetch.
- [ ] **Nominatim rate limiting (1 req/s)** — Cidade é cacheada junto com weather, mas múltiplos refreshes podem tomar 429.
- [ ] **`detectIconFromUrl` heuristico fraco** — `console.cloud.google.com` → `"console"`, não `"googlecloud"`. Expandir ou remover.
- [ ] **`filteredPopularIcons()` roda em todo keystroke** — 700+ entradas filtradas sem memoização.
- [ ] **`loading="lazy"` em ícones pequenos e visíveis** — Lazy loading em favicons de 32px não agrega. Remover.
- [ ] **`[data-lucide]` CSS sizing conflita com classes Tailwind** — `width: 1em; height: 1em;` redundante se classes Tailwind sempre vencem.
- [ ] **`saveToStorage` salva `settings` inteiro** — Aceitável, mas só overrides poderiam ser salvos.
- [ ] **Slugs de ícone inválidos em `links.json`** — `heart`, `clock`, `currency` não existem no Simple Icons.
- [ ] **Guarda redundante em `toggleTheme`** — Botão já está oculto via `x-show`, `if` é defensivo desnecessário.
- [ ] **`originalDefaults` pode ser mutado** — Cópia congelada (`Object.freeze`) evitaria corrupção acidental.
- [ ] **`afterRender()` chama `createIcons` em toda mutação** — Idempotente (Lucide remove `data-lucide` após processar), mas vale monitorar.
- [ ] **Sem sanitização de URL contra `javascript:`** — `link.url` poderia conter `javascript:alert(1)`. Bloquear no input.
