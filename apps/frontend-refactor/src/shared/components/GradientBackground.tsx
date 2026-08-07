import type { ReactNode } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { backgroundGradient } from '../theme/colors'

interface GradientBackgroundProps {
  children?: ReactNode
}

/** The three-stop vertical backdrop shared by every screen. */
export function GradientBackground({ children }: GradientBackgroundProps) {
  return (
    <LinearGradient
      colors={[...backgroundGradient]}
      locations={[0, 0.35, 1]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={{ flex: 1 }}
    >
      {children}
    </LinearGradient>
  )
}
