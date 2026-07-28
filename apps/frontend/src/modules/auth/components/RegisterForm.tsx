import { useMemo } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Text, YStack } from 'tamagui'
import { SystemButton } from '@/shared/components/SystemButton'
import { FormField } from '@/shared/components/FormField'
import { getErrorMessage } from '@/shared/api/get-error-message'
import { useLogin } from '../api/useLogin'
import { useRegister } from '../api/useRegister'
import { createRegisterSchema, type RegisterFormValues } from '../schemas/register.schema'
import type { LoginResponse } from '../types'

interface RegisterFormProps {
  onSuccess: (data: LoginResponse) => void
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const { t } = useTranslation()
  const registerUser = useRegister()
  const login = useLogin()
  const registerSchema = useMemo(() => createRegisterSchema(t), [t])

  const { control, handleSubmit } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', username: '', password: '' },
  })

  const isPending = registerUser.isPending || login.isPending

  function onSubmit(values: RegisterFormValues) {
    registerUser.mutate(values, {
      onSuccess: () => {
        login.mutate({ email: values.email, password: values.password }, { onSuccess })
      },
    })
  }

  return (
    <YStack gap="$4">
      <FormField
        control={control}
        name="email"
        label={t('auth.register.hunterId')}
        inputProps={{
          placeholder: t('auth.register.hunterIdPlaceholder'),
          autoCapitalize: 'none',
          keyboardType: 'email-address',
        }}
      />

      <FormField
        control={control}
        name="username"
        label={t('auth.register.hunterName')}
        inputProps={{ placeholder: t('auth.register.hunterNamePlaceholder'), autoCapitalize: 'none' }}
      />

      <FormField
        control={control}
        name="password"
        label={t('auth.register.password')}
        inputProps={{ placeholder: '••••••••', secureTextEntry: true }}
      />

      {(registerUser.isError || login.isError) && (
        <Text color="$soloDanger" fontSize="$2">
          {getErrorMessage(registerUser.error ?? login.error)}
        </Text>
      )}

      <SystemButton onPress={handleSubmit(onSubmit)} disabled={isPending}>
        {isPending ? t('auth.register.submitting') : t('auth.register.submit')}
      </SystemButton>
    </YStack>
  )
}
