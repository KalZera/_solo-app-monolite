import { useMemo } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { Button, ControlledInput } from '@/shared/components'
import { useLogin } from '../../application/useLogin'
import { createLoginSchema, type LoginFormValues } from '../../schemas/login.schema'

export function LoginForm() {
  const { t } = useTranslation()
  const login = useLogin()
  const schema = useMemo(() => createLoginSchema(t), [t])

  const { control, handleSubmit } = useForm<LoginFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  })

  return (
    <View className="gap-4">
      <ControlledInput
        control={control}
        name="email"
        label={t('auth.login.email')}
        inputProps={{
          placeholder: t('auth.login.emailPlaceholder'),
          autoCapitalize: 'none',
          autoComplete: 'email',
          keyboardType: 'email-address',
        }}
      />
      <ControlledInput
        control={control}
        name="password"
        label={t('auth.login.password')}
        inputProps={{
          placeholder: t('auth.login.passwordPlaceholder'),
          secureTextEntry: true,
          autoComplete: 'current-password',
        }}
      />
      <Button
        label={login.isPending ? t('auth.login.submitting') : t('auth.login.submit')}
        loading={login.isPending}
        onPress={handleSubmit((values) => login.mutate(values))}
        className="mt-2"
      />
    </View>
  )
}
