import { DESIGN_SYSTEM } from './design-system.generated'

export { DESIGN_SYSTEM }

export const BRAND_ASSETS = DESIGN_SYSTEM.assets.brand
export const APP_CONFIG = DESIGN_SYSTEM.app
export const AUTH_CONFIG = DESIGN_SYSTEM.auth
export const EXTERNAL_SERVICES = DESIGN_SYSTEM.externalServices

export type BrandAssetKey = keyof typeof BRAND_ASSETS
