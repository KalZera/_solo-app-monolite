import type { ReactNode } from 'react'
import { ActivityIndicator, Pressable, type PressableProps } from 'react-native'
import { Text } from './Text'
import { cn } from '../utils/cn'
import { colors } from '../theme/colors'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'md' | 'lg'

const containerClass: Record<ButtonVariant, string> = {
  primary: 'bg-primary active:bg-primary-hover',
  secondary: 'bg-surface-raised border border-line active:border-primary',
  ghost: 'bg-transparent active:opacity-60',
  danger: 'bg-danger active:opacity-90',
}

const labelClass: Record<ButtonVariant, string> = {
  primary: 'text-[#06131B]',
  secondary: 'text-content',
  ghost: 'text-primary',
  danger: 'text-content',
}

const sizeClass: Record<ButtonSize, string> = {
  md: 'py-2.5 px-4',
  lg: 'py-3.5 px-6',
}

export interface ButtonProps extends Omit<PressableProps, 'children'> {
  label: string
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  icon?: ReactNode
  fullWidth?: boolean
  className?: string
}

export function Button({
  label,
  variant = 'primary',
  size = 'lg',
  loading = false,
  icon,
  fullWidth = true,
  disabled,
  className,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      className={cn(
        'flex-row items-center justify-center gap-2 rounded-xl',
        sizeClass[size],
        containerClass[variant],
        fullWidth && 'w-full',
        isDisabled && 'opacity-50',
        className,
      )}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? colors.backdrop.bottom : colors.primary}
        />
      ) : (
        icon
      )}
      <Text weight="semibold" className={cn('text-base tracking-wide', labelClass[variant])}>
        {label}
      </Text>
    </Pressable>
  )
}
