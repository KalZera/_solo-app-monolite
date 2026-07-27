import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Text, YStack } from "tamagui";
import { SystemButton } from "@/shared/components/SystemButton";
import { FormField } from "@/shared/components/FormField";
import { getErrorMessage } from "@/shared/api/get-error-message";
import { useLogin } from "../api/useLogin";
import { loginSchema, type LoginFormValues } from "../schemas/login.schema";
import type { LoginResponse } from "../types";

interface LoginFormProps {
  onSuccess: (data: LoginResponse) => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const login = useLogin();
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
        label="Hunter ID"
        inputProps={{
          placeholder: "hunter@association.com",
          autoCapitalize: "none",
          keyboardType: "email-address",
        }}
      />

      <FormField
        control={control}
        name="password"
        label="Password"
        inputProps={{ placeholder: "••••••••", secureTextEntry: true }}
      />

      {login.isError && (
        <Text color="$soloDanger" fontSize="$2">
          {getErrorMessage(login.error)}
        </Text>
      )}

      <SystemButton onPress={handleSubmit(onSubmit)} disabled={login.isPending}>
        {login.isPending ? "Authenticating…" : "Enter the System"}
      </SystemButton>
    </YStack>
  );
}
