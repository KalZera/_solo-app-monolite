import { useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Text, YStack } from "tamagui";
import { SystemButton } from "@/shared/components/SystemButton";
import { FormField } from "@/shared/components/FormField";
import { getErrorMessage } from "@/shared/api/get-error-message";
import { useLogin } from "../api/useLogin";
import { createLoginSchema, type LoginFormValues } from "../schemas/login.schema";
import type { LoginResponse } from "../types";

interface LoginFormProps {
  onSuccess: (data: LoginResponse) => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { t } = useTranslation();
  const login = useLogin();
  const loginSchema = useMemo(() => createLoginSchema(t), [t]);
  const { control, handleSubmit } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  function onSubmit(values: LoginFormValues) {
    login.mutate(values, { onSuccess });
  }

  return (
    <YStack gap="$4">
      <FormField
        control={control}
        name="email"
        label={t("auth.login.hunterId")}
        inputProps={{
          placeholder: t("auth.login.hunterIdPlaceholder"),
          autoCapitalize: "none",
          keyboardType: "email-address",
        }}
      />

      <FormField
        control={control}
        name="password"
        label={t("auth.login.password")}
        inputProps={{ placeholder: "••••••••", secureTextEntry: true }}
      />

      {login.isError && (
        <Text color="$soloDanger" fontSize="$2">
          {getErrorMessage(login.error)}
        </Text>
      )}

      <SystemButton onPress={handleSubmit(onSubmit)} disabled={login.isPending}>
        {login.isPending ? t("auth.login.submitting") : t("auth.login.submit")}
      </SystemButton>
    </YStack>
  );
}
