import { Link, type Href } from 'expo-router'
import { Pressable } from 'react-native'
import { Text } from '@/shared/components'

interface AuthLinkProps {
  href: Href
  label: string
}

/** Centered navigation link used beneath the auth forms. */
export function AuthLink({ href, label }: AuthLinkProps) {
  return (
    <Link href={href} asChild>
      <Pressable accessibilityRole="link" className="items-center py-2">
        <Text weight="semibold" className="text-sm text-primary">
          {label}
        </Text>
      </Pressable>
    </Link>
  )
}
