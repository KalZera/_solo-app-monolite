import { Text as RNText, type TextProps } from 'react-native'
import { cn } from '../utils/cn'

export type TextWeight = 'light' | 'regular' | 'medium' | 'semibold' | 'bold'

const weightClass: Record<TextWeight, string> = {
  light: 'font-rajdhani-light',
  regular: 'font-rajdhani-regular',
  medium: 'font-rajdhani-medium',
  semibold: 'font-rajdhani-semibold',
  bold: 'font-rajdhani-bold',
}

export interface AppTextProps extends TextProps {
  weight?: TextWeight
  className?: string
}

/**
 * Default text primitive. Always applies Rajdhani (the app default typeface) and
 * the base content color; both can be overridden through `className`.
 */
export function Text({ weight = 'regular', className, ...props }: AppTextProps) {
  return <RNText className={cn(weightClass[weight], 'text-content', className)} {...props} />
}
