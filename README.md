# K-Sample - Angular Signals & RxJS Training

Interactive slides + live demos used to train the team on modern Angular.
Each page covers one topic: a clickable live demo, matching code samples, and an in-depth markdown article.

- **Angular 21** - standalone components, OnPush, running **Zoneless** (switchable to Zone.js for the CD demo)
- **SSR + Prerender** for all routes
- Teaching content is written in Vietnamese, short sentences optimized for presenting
- **Bilingual content**: the "English content" toggle in the menu switches markdown articles and code samples to their `.en` siblings (`explain-x.en.md`, `sample.en.ts`); missing translations fall back to the original file

---

## 🚀 Getting started

```bash
npm install
npm start          # ng serve -> http://localhost:4200
```

Other commands:

| Command                      | Purpose                                                       |
| :--------------------------- | :------------------------------------------------------------ |
| `npm start`                  | Dev server at `http://localhost:4200`                         |
| `npm run build`              | Production build (SSR + prerender) into `dist/k-sample`       |
| `npm run build:static`       | Static build for GitHub Pages (baseHref `/k-sample/`)         |
| `npm run serve:ssr:k-sample` | Run the SSR server from the build output                      |
| `npm test`                   | Unit tests with Vitest                                        |

---

## 📚 Pages

The left menu is grouped by **topic block** (Basic / Signal / RxJS / Summary).
Each item's background color shows its **level**: 🟢 basic (juniors start here) - 🟣 advanced (read after the related basic page) - 🔵 wrap-up.

### Basic block (foundation)

| Page | Route | Content |
| :--- | :---- | :------ |
| Demo Change Detection | `/demo-change-detection` | Default vs OnPush vs Signals, render counts, NgZone experiment with `window.setInterval` |
| Imperative vs Reactive | `/explain-reactive-vs-imperative` | Same `login()` event, two state-management styles; push vs pull |

### Signal block

| Page | Route | Content |
| :--- | :---- | :------ |
| Signal Core Primitives | `/core-primitives` | `signal` - `computed` - `effect`, effect pitfalls, `untracked` |
| Signal-based Components | `/signal-components` | `input()` / `output()` / `model()` / `viewChild()` vs the old decorators |
| RxJS Interoperability | `/rxjs-interop` | `toSignal` / `toObservable`, search-debounce pattern, pitfalls |
| Resource APIs | `/resource-api` | `resource` - `rxResource` - `httpResource`, status lifecycle |
| Signal Advanced | `/signal-advanced` | `linkedSignal` (Betslip demo), custom `equal`, `withComponentInputBinding` |

### RxJS block

| Page | Route | Content |
| :--- | :---- | :------ |
| SwitchMap | `/demo-switch-map` | Subscribe Hell (pyramid of doom) → `switchMap` |
| CatchError Operator | `/demo-catch-error` | Where to place `catchError` so the main stream survives |
| Demo Polling | `/demo-polling` | Polling with `timer(0, n)` + `switchMap` + a Signal on/off switch |
| Demo Polling By List | `/demo-polling-by-list` | Polling by ID list, nested switchMap, `of([])` vs `EMPTY` |
| Unicast vs Multicast | `/demo-multicast` | Cold vs Hot, `share()`, side-effect counters |
| Multicast Advanced | `/demo-multicast-advanced` | `shareReplay` refCount true/false, `ReplaySubject`, the Subject behind each operator |

### Summary block

| Page | Route | Content |
| :--- | :---- | :------ |
| Service Best Practices | `/best-practice-service` | What belongs in a Service, `fromDTO`/`toDTO` mappers, who should subscribe |
| Key Takeaways | `/summary` | Recap of everything - quick review before presenting |

---

## 📁 Project structure

```
k-sample/
├── public/                            # copied straight into the build output
│   ├── favicon.ico
│   └── images/                        # illustrations (pyramid-of-doom.jpg...)
├── src/
│   ├── app/
│   │   ├── common/
│   │   │   ├── components/
│   │   │   │   ├── code-presenter/            # renders code samples + markdown (Signal version)
│   │   │   │   ├── code-presenter-observable/ # Observable version (for the CD demo)
│   │   │   │   ├── code-presenter-old/        # Imperative version (for the CD demo)
│   │   │   │   └── loading-skeleton/
│   │   │   ├── mock-data/
│   │   │   │   └── menu-list.ts       # menu items: group (topic block) + level (color)
│   │   │   ├── models/
│   │   │   │   └── menu-item.ts       # MenuItem, MenuLevel, MenuGroup
│   │   │   └── services/              # common.service (dark mode)...
│   │   ├── templates/
│   │   │   ├── layout/menu/           # left menu: topic block labels + level tooltips
│   │   │   └── pages/<page-name>/     # one folder per page: .ts + .html + .scss
│   │   ├── app.config.ts              # providers (CD mode, router, markdown...)
│   │   └── app.routes.ts              # route declarations
│   └── assets/content/                # TEACHING CONTENT (copied to assets/content at build)
│       ├── code-samples/<page-name>/  # .ts files for DISPLAY ONLY - never compiled
│       └── markdown/                  # explain-*.md articles
├── angular.json                       # asset mappings, SSR/prerender, "static" config
└── package.json
```

Path aliases (declared in `tsconfig.app.json`):
`@components/*` - `@mock-data/*` - `@models/*` - `@services/*` - `@layout/*` - `@pages/*` - `@assets/*`

---

## ➕ Adding a new page

1. Create `src/app/templates/pages/<page-name>/` with a standalone, OnPush component.
2. Add the route to `src/app/app.routes.ts`.
3. Add a name to `MenuItemEnum` (`models/menu-item.ts`) and an entry to `DEFAULT_MENU_LIST` (`mock-data/menu-list.ts`) - pick a `group` (topic block) and `level` (basic/advanced).
4. Create code samples under `src/assets/content/code-samples/<page-name>/` and the article at `src/assets/content/markdown/explain-<page-name>.md`.
5. Render them in the template with CodePresenter:

```html
<app-code-presenter-signal fileName="<page-name>/sample.ts"></app-code-presenter-signal>
<app-code-presenter-signal fileName="explain-<page-name>.md"></app-code-presenter-signal>
```

---

## 🔄 Switching Zoneless ↔ Zone.js (for the Change Detection demo)

The app runs **Zoneless** by default. To show the team what NgZone does during a presentation,
swap the commented lines in `src/app/app.config.ts` (zone.js is already in the polyfills):

```typescript
provideZonelessChangeDetection(),
// provideZoneChangeDetection({eventCoalescing: true}),
```

The Demo Change Detection page auto-detects and displays the current mode.

---

## ✍️ Content conventions

- **Displayed content** (markdown, card notes, comments inside code samples): Vietnamese, short sentences, one sentence per line - these are presentation slides, not docs.
- **English versions**: every markdown article and code sample has an `.en` sibling. When you edit content, update both files (or delete the `.en` file - the app falls back to the original until it is re-translated).
- **Infrastructure code** (components, services, config): English comments.
- Code samples must **mirror the live demo** on their page: same variable names, same buttons - learners map demo to code instantly.
- Demos use modern Angular idioms: standalone, OnPush, signals, `inject()`, `takeUntilDestroyed`.
