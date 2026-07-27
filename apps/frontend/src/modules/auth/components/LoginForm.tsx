import { useState } from "react";
import { Text, YStack } from "tamagui";
import { SystemButton } from "@/shared/components/SystemButton";
import { SystemInput } from "@/shared/components/SystemInput";
import { getErrorMessage } from "@/shared/api/get-error-message";
import { useLogin } from "../api/useLogin";
import type { LoginResponse } from "../types";

interface LoginFormProps {
  onSuccess: (data: LoginResponse) => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const login = useLogin();

  const canSubmit =
    email.trim().length > 0 && password.length > 0 && !login.isPending;

  function handleSubmit() {
    if (!canSubmit) return;
    login.mutate({ email: email.trim(), password }, { onSuccess });
  }

  return (
    <YStack gap="$4">
      <YStack gap="$2">
        <Text
          color="$soloTextMuted"
          fontSize="$2"
          letterSpacing={1}
          textTransform="uppercase"
        >
          Hunter ID
        </Text>
        <SystemInput
          value={email}
          onChangeText={setEmail}
          placeholder="hunter@association.com"
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </YStack>

      <YStack gap="$2">
        <Text
          color="$soloTextMuted"
          fontSize="$2"
          letterSpacing={1}
          textTransform="uppercase"
        >
          Password
        </Text>
        <SystemInput
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          secureTextEntry
          type="password"
        />
      </YStack>

      {login.isError && (
        <Text color="$soloDanger" fontSize="$2">
          {getErrorMessage(login.error)}
        </Text>
      )}

      <SystemButton onPress={handleSubmit} disabled={!canSubmit}>
        {login.isPending ? "Authenticating…" : "Enter the System"}
      </SystemButton>
    </YStack>
  );
}
