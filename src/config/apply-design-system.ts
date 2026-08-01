import { DESIGN_SYSTEM } from './design-system'

const FONT_LINK_ID = 'mutqin-font-stylesheet'
const FAVICON_LINK_ID = 'mutqin-favicon'

function ensureLink(id: string, rel: string, href: string) {
  let link = document.getElementById(id) as HTMLLinkElement | null

  if (!link) {
    link = document.createElement('link')
    link.id = id
    link.rel = rel
    document.head.appendChild(link)
  }

  link.href = href
}

export function applyDesignSystem() {
  document.documentElement.lang = DESIGN_SYSTEM.app.language
  document.documentElement.dir = DESIGN_SYSTEM.app.direction
  document.title = DESIGN_SYSTEM.app.title

  ensureLink(FONT_LINK_ID, 'stylesheet', DESIGN_SYSTEM.fonts.stylesheetUrl)
  ensureLink(FAVICON_LINK_ID, 'icon', DESIGN_SYSTEM.assets.favicon)

  let themeMeta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
  if (!themeMeta) {
    themeMeta = document.createElement('meta')
    themeMeta.name = 'theme-color'
    document.head.appendChild(themeMeta)
  }
  themeMeta.content = DESIGN_SYSTEM.colors.brandInk
}
