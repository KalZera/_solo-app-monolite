/**
 * Design tokens mirrored from `tailwind.config.js`.
 *
 * Prefer NativeWind `className` for styling. These JS values exist only for the few
 * APIs that cannot take a className: the background gradient, the navigation tab bar,
 * icon `color` props and native status-bar configuration.
 */
export const colors = {
  backdrop: {
    top: '#132C3A',
    mid: '#0F2230',
    bottom: '#0B1720',
  },
  surface: {
    base: '#11151B',
    raised: '#161C24',
  },
  primary: '#29B6F6',
  primaryHover: '#53D3FF',
  success: '#41E37A',
  warning: '#F6C453',
  danger: '#FF5C5C',
  epic: '#A970FF',
  legendary: '#FFD54A',
  content: '#F8FAFC',
  contentMuted: '#A5B4C4',
  line: 'rgba(41, 182, 246, 0.22)',
  lineSoft: 'rgba(165, 180, 196, 0.14)',
} as const

/** The three-stop vertical background gradient used across every screen. */
export const backgroundGradient = [
  colors.backdrop.top,
  colors.backdrop.mid,
  colors.backdrop.bottom,
] as const
