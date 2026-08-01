import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const configPath = join(projectRoot, 'src/config/design-system.json')
const config = JSON.parse(readFileSync(configPath, 'utf8'))

function kebabCase(value) {
  return value.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/_/g, '-').toLowerCase()
}

function hexToRgb(hex) {
  const normalized = hex.replace('#', '').trim()
  const expanded = normalized.length === 3
    ? normalized.split('').map((char) => char + char).join('')
    : normalized

  const value = Number.parseInt(expanded, 16)
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255]
}

const generatedTs = `/* This file is generated from design-system.json. Do not edit it directly. */\nexport const DESIGN_SYSTEM = ${JSON.stringify(config, null, 2)} as const\n\nexport type DesignSystem = typeof DESIGN_SYSTEM\n`
writeFileSync(join(projectRoot, 'src/config/design-system.generated.ts'), generatedTs)

const colorVariables = Object.entries(config.colors).flatMap(([name, value]) => {
  const token = kebabCase(name)
  const [red, green, blue] = hexToRgb(value)
  return [
    `  --color-${token}: ${value};`,
    `  --color-${token}-rgb: ${red} ${green} ${blue};`,
  ]
})

const generatedCss = `/* This file is generated from design-system.json. Do not edit it directly. */\n@theme {\n  --font-sans: '${config.fonts.primaryFamily}', ${config.fonts.fallback};\n  --color-mutqin-ink: var(--color-brand-ink);\n  --color-mutqin-gold: var(--color-brand-gold);\n  --color-mutqin-paper: var(--color-brand-paper);\n  --color-mutqin-stone: var(--color-brand-stone);\n}\n\n:root {\n${colorVariables.join('\n')}\n  --font-family-brand: '${config.fonts.primaryFamily}', ${config.fonts.fallback};\n}\n`
writeFileSync(join(projectRoot, 'src/styles/design-tokens.generated.css'), generatedCss)

const manifest = {
  name: `${config.app.name} - منصة إدارة مشاريع الإكساء`,
  short_name: config.app.name,
  description: config.app.description,
  lang: config.app.language,
  dir: config.app.direction,
  start_url: '/',
  display: 'standalone',
  background_color: config.colors.brandPaper,
  theme_color: config.colors.brandInk,
  icons: [
    {
      src: '/favicon.svg',
      sizes: 'any',
      type: 'image/svg+xml',
      purpose: 'any maskable',
    },
  ],
}
writeFileSync(join(projectRoot, 'public/manifest.webmanifest'), `${JSON.stringify(manifest, null, 2)}\n`)

const configuredFavicon = join(projectRoot, 'public', config.assets.favicon.replace(/^\//, ''))
const faviconTarget = join(projectRoot, 'public/favicon.svg')
if (existsSync(configuredFavicon)) {
  mkdirSync(dirname(faviconTarget), { recursive: true })
  copyFileSync(configuredFavicon, faviconTarget)
}
