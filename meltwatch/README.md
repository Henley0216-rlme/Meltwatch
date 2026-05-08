# Meltwatch

Marketing website for **Meltwatch** — a context-aware consumer intelligence platform inspired by Brandwatch. Built with **Vite + React + TypeScript + Tailwind CSS + shadcn/ui patterns + Framer Motion**, with full **English / 中文** bilingual support.

## Design system

- **Display**: Fraunces (variable serif, italics for emphasis)
- **Body**: DM Sans
- **Mono**: JetBrains Mono (technical labels, data tags)
- **CJK**: Noto Sans SC
- **Palette**: cream `#F7F3EC` · ink `#0E0E0C` · molten `#E64A19` · moss `#2F4D3A`

The aesthetic is **editorial-publication style** — generous negative space, dominant ink-on-cream typography, with the molten accent reserved for moments of focus (CTAs, alerts, the "your brand" highlight in benchmarks). Avoids the generic SaaS look of purple gradients on white.

## Getting started

```bash
# 1. install dependencies
npm install

# 2. start the dev server
npm run dev

# 3. build for production
npm run build

# 4. preview the production build
npm run preview
```

Dev server runs at <http://localhost:5173>.

## Project structure

```
meltwatch/
├── index.html              # Loads Google Fonts (Fraunces, DM Sans, JetBrains Mono, Noto SC)
├── package.json
├── vite.config.ts          # @/ alias → ./src
├── tailwind.config.js      # Custom theme (palette, fonts, marquee animation)
├── postcss.config.js
├── tsconfig.json
└── src/
    ├── main.tsx            # Wraps App in LanguageProvider
    ├── App.tsx             # Section composition
    ├── index.css           # Tailwind layers + base styles + grain texture
    ├── components/
    │   ├── Navbar.tsx
    │   ├── Hero.tsx               (+ inline HeroVisual: orbital ring around "your business")
    │   ├── LogoBar.tsx            (CSS marquee of fictional client wordmarks)
    │   ├── Stats.tsx              (4 hero numbers)
    │   ├── CoreCapabilities.tsx   (Dark grid: 4 service cards)
    │   ├── ServiceSections.tsx    (Alternating deep-dives)
    │   ├── Differentiator.tsx     ("Why Meltwatch" — 4 pillars)
    │   ├── CTA.tsx
    │   ├── Footer.tsx
    │   ├── ui/
    │   │   └── button.tsx         (shadcn-style with cva)
    │   └── visuals/               (Custom data visuals, one per service)
    │       ├── CrisisVisual.tsx       (Sparkline + anomaly callout + alert feed)
    │       ├── CompetitiveVisual.tsx  (Share-of-voice race chart + sentiment)
    │       ├── ConsumerVisual.tsx     (NL query bar + 15-month bars + verbatims)
    │       └── InfluencerVisual.tsx   (Creator cards with auth/bot scoring)
    ├── contexts/
    │   └── LanguageContext.tsx    (EN/ZH state, localStorage persistence)
    └── lib/
        ├── utils.ts               (cn() helper)
        └── translations.ts        (Full EN + ZH dictionary)
```

## Sections (in order)

1. **Hero** — Editorial display headline + animated rings-and-context visual (your business at center, signal orbiting)
2. **Logo bar** — Marquee of fictional client wordmarks
3. **Stats** — Four data-foundation numbers
4. **Core capabilities** — Dark grid with the 4 services as anchor cards
5. **Service deep-dives** — Alternating layout, one chapter per service, each paired with its custom data visual
6. **Differentiator** — Four pillars explaining how every model is tuned to the customer's corporate context
7. **CTA** — Dark closer
8. **Footer** — Link columns, language toggle, status indicator

## Bilingual support

- Browser language is auto-detected on first visit (zh-* browsers land on Chinese)
- Selection persists to `localStorage` under key `meltwatch-lang`
- `<html lang>` is updated on language change for accessibility
- Add a third language by extending the `translations` object in `src/lib/translations.ts` and adding a button in `Navbar.tsx` and `Footer.tsx`

## Customising

- **Colors / fonts** → `tailwind.config.js`
- **All copy** → `src/lib/translations.ts`
- **Marquee logos** → `LOGOS` array in `src/components/LogoBar.tsx`
- **Service visuals** → the four files in `src/components/visuals/`
- **Stats numbers** → `stats.items` in `src/lib/translations.ts`
