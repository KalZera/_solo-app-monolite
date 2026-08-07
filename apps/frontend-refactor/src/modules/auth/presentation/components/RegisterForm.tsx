import { useMemo } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { Button, ControlledInput } from '@/shared/components'
import { useRegister } from '../../application/useRegister'
import { createRegisterSchema, type RegisterFormValues } from '../../schemas/register.schema'

export function RegisterForm() {
  const { t } = useTranslation()
  const registerHunter = useRegister()
  const schema = useMemo(() => createRegisterSchema(t), [t])

  const { control, handleSubmit } = useForm<RegisterFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', username: '', password: '' },
  })

  return (
    <View className="gap-4">
      <ControlledInput
        control={control}
        name="email"
        label={t('auth.register.email')}
        inputProps={{
          placeholder: t('auth.register.emailPlaceholder'),
          autoCapitalize: 'none',
          autoComplete: 'email',
          keyboardType: 'email-address',
        }}
      />
      <ControlledInput
        control={control}
        name="username"
        label={t('auth.register.username')}
        inputProps={{
          placeholder: t('auth.register.usernamePlaceholder'),
          autoCapitalize: 'none',
          autoComplete: 'username',
        }}
      />
      <ControlledInput
        control={control}
        name="password"
        label={t('auth.register.password')}
        inputProps={{
          placeholder: t('auth.register.passwordPlaceholder'),
          secureTextEntry: true,
          autoComplete: 'new-password',
        }}
      />
      <Button
        label={registerHunter.isPending ? t('auth.register.submitting') : t('auth.register.submit')}
        loading={registerHunter.isPending}
        onPress={handleSubmit((values) => registerHunter.mutate(values))}
        className="mt-2"
      />
    </View>
  )
}
