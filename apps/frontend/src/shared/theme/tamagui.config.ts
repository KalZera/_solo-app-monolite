import { createTamagui } from 'tamagui'
import { config as defaultConfig } from '@tamagui/config/v3'

/**
 * Palette grounded in the "System" window from Solo Leveling: a deep navy/indigo
 * backdrop with an electric-blue glow and cyan highlights (cross-checked against
 * fan recreations of the System UI, e.g. #1a2239/#24243e backgrounds, #4e9afe
 * borders and #76fffa glow accents).
 */
export const soloColors = {
  soloBg: '#05070f',
  soloBgElevated: '#0b1024',
  soloPanel: '#151b33',
  soloPanelAlt: '#1f2947',
  soloBorder: '#2c3a66',
  soloBorderStrong: '#4e9afe',
  soloBlue: '#4e9afe',
  soloBlueHover: '#6fb0ff',
  soloBluePress: '#3a7fe0',
  soloCyan: '#76fffa',
  soloText: '#eaf2ff',
  soloTextMuted: '#93a1c7',
  soloDanger: '#ff5d7a',
}

const config = createTamagui({
  ...defaultConfig,
  tokens: {
    ...defaultConfig.tokens,
    color: {
      ...defaultConfig.tokens.color,
      ...soloColors,
    },
  },
  themes: {
    ...defaultConfig.themes,
    dark: {
      ...defaultConfig.themes.dark,
      background: soloColors.soloBg,
      backgroundHover: soloColors.soloPanel,
      backgroundPress: soloColors.soloPanelAlt,
      backgroundFocus: soloColors.soloPanelAlt,
      borderColor: soloColors.soloBorder,
      borderColorHover: soloColors.soloBorderStrong,
      borderColorPress: soloColors.soloBorderStrong,
      borderColorFocus: soloColors.soloBlue,
      color: soloColors.soloText,
      colorHover: soloColors.soloCyan,
      colorPress: soloColors.soloBlue,
      colorFocus: soloColors.soloCyan,
      placeholderColor: soloColors.soloTextMuted,
      outlineColor: soloColors.soloBlue,
    },
  },
})

export type AppTamaguiConfig = typeof config

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppTamaguiConfig {}
}

export default config
