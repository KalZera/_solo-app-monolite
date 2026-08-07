import {
  Rajdhani_300Light,
  Rajdhani_400Regular,
  Rajdhani_500Medium,
  Rajdhani_600SemiBold,
  Rajdhani_700Bold,
} from '@expo-google-fonts/rajdhani'

/**
 * Rajdhani is the app's default typeface. The keys here MUST match the
 * `fontFamily` entries declared in `tailwind.config.js`.
 */
export const appFonts = {
  Rajdhani_300Light,
  Rajdhani_400Regular,
  Rajdhani_500Medium,
  Rajdhani_600SemiBold,
  Rajdhani_700Bold,
} as const

export const fontFamily = {
  light: 'Rajdhani_300Light',
  regular: 'Rajdhani_400Regular',
  medium: 'Rajdhani_500Medium',
  semibold: 'Rajdhani_600SemiBold',
  bold: 'Rajdhani_700Bold',
} as const
