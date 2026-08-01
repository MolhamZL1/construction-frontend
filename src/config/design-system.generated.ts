/* This file is generated from design-system.json. Do not edit it directly. */
export const DESIGN_SYSTEM = {
  "app": {
    "name": "متقن",
    "englishName": "MUTQIN",
    "title": "متقن | إدارة مشاريع الإكساء",
    "description": "منصة متقن لإدارة مشاريع الإكساء ومتابعة التنفيذ والتكاليف.",
    "language": "ar",
    "direction": "rtl",
    "defaultApiBaseUrl": "http://127.0.0.1:8000/api"
  },
  "auth": {
    "projectManagerIdentifierPrefix": "pm.",
    "identifierPlaceholder": "ادخل معرفك"
  },
  "fonts": {
    "primaryFamily": "Tajawal",
    "fallback": "system-ui, 'Segoe UI', sans-serif",
    "stylesheetUrl": "https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;600;700;800;900&display=swap"
  },
  "assets": {
    "favicon": "/branding/icon-color.svg",
    "brand": {
      "icon": "/branding/icon-color.svg",
      "iconInk": "/branding/icon-mono-ink.svg",
      "iconPaper": "/branding/icon-mono-paper.svg",
      "iconLight": "/branding/icon-light-on-dark.svg",
      "horizontal": "/branding/lockup-horizontal-color.svg",
      "horizontalReversed": "/branding/lockup-horizontal-reversed.svg",
      "stacked": "/branding/lockup-stacked-color.svg",
      "stackedReversed": "/branding/lockup-stacked-reversed.svg",
      "wordmark": "/branding/wordmark-color.svg",
      "wordmarkLight": "/branding/wordmark-light-on-dark.svg"
    }
  },
  "externalServices": {
    "maps": {
      "tileUrl": "https://tile.openstreetmap.de/{z}/{x}/{y}.png",
      "attributionHtml": "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a>",
      "searchUrl": "https://nominatim.openstreetmap.org/search",
      "reverseGeocodeUrl": "https://nominatim.openstreetmap.org/reverse",
      "markerIconUrl": "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      "markerRetinaIconUrl": "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      "markerShadowUrl": "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      "defaultCenter": [
        24.7136,
        46.6753
      ],
      "defaultZoom": 6,
      "selectedZoom": 14
    },
    "firebaseSdk": {
      "appScriptUrl": "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js",
      "messagingScriptUrl": "https://www.gstatic.com/firebasejs/10.12.5/firebase-messaging.js"
    }
  },
  "colors": {
    "brandInk": "#1C2624",
    "brandInkSoft": "#263431",
    "brandInkMuted": "#273330",
    "brandInkDeep": "#101816",
    "brandGold": "#C99A46",
    "brandGoldDark": "#B58635",
    "brandGoldDeep": "#8A642A",
    "brandGoldWarm": "#A66A12",
    "brandPaper": "#F6F2EA",
    "brandPaperSoft": "#F5F2EC",
    "brandPaperMuted": "#F1EEE8",
    "brandPaperWarm": "#FCFBF8",
    "brandPaperHover": "#FBF8F2",
    "brandStone": "#8B8478",
    "brandStoneDark": "#6F6A62",
    "brandStoneSoft": "#A49B8E",
    "brandStoneMuted": "#A29A8D",
    "brandGoldSurface": "#F2E8D6",
    "brandGoldSurfaceStrong": "#E9D8BA",
    "brandGoldBorder": "#E8D4B3",
    "neutral100": "#EEE7DA",
    "neutral200": "#E3D9C8",
    "neutral300": "#DDD2C1",
    "neutral400": "#D2C5B3",
    "neutral500": "#C5BBAB",
    "neutral600": "#A49B8E",
    "brandBorderSoft": "#E6DED1",
    "white": "#FFFFFF",
    "danger": "#FF5630",
    "success": "#16A34A",
    "warning": "#FBBF24",
    "orange": "#F97316",
    "info": "#0EA5E9",
    "legacyF7F9F5": "#F7F9F5",
    "legacyDC6B3F": "#DC6B3F",
    "legacy3F7A57": "#3F7A57",
    "legacyF3F6F0": "#F3F6F0",
    "legacy64748B": "#64748B",
    "legacyF5F7F2": "#F5F7F2",
    "legacyRgb94A3B8": "#94A3B8"
  }
} as const

export type DesignSystem = typeof DESIGN_SYSTEM
