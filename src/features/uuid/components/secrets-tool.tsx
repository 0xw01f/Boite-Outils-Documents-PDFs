"use client";

import { useState, useCallback } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Check, RefreshCw } from "lucide-react";
import { secureRandomInt, secureShuffle } from "@/lib/random";

type SecretType = "uuid" | "api-key" | "token" | "password";

const TYPE_LABELS: Record<SecretType, string> = {
  uuid: "UUID v4",
  "api-key": "Clé API",
  token: "Token sécurisé",
  password: "Mot de passe",
};

function generateUuid(): string {
  return crypto.randomUUID();
}

function generateApiKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "ak_";
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(secureRandomInt(chars.length));
  }
  return result;
}

function generateToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  let result = "";
  for (let i = 0; i < 48; i++) {
    result += chars.charAt(secureRandomInt(chars.length));
  }
  return result;
}

function generatePassword(length: number): string {
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";
  const all = lower + upper + numbers + symbols;

  let result = "";
  result += lower.charAt(secureRandomInt(lower.length));
  result += upper.charAt(secureRandomInt(upper.length));
  result += numbers.charAt(secureRandomInt(numbers.length));
  result += symbols.charAt(secureRandomInt(symbols.length));

  for (let i = 4; i < length; i++) {
    result += all.charAt(secureRandomInt(all.length));
  }

  return secureShuffle(result.split("")).join("");
}

function generateSecret(type: SecretType, passwordLength: number): string {
  switch (type) {
    case "uuid":
      return generateUuid();
    case "api-key":
      return generateApiKey();
    case "token":
      return generateToken();
    case "password":
      return generatePassword(passwordLength);
  }
}

export function SecretsTool() {
  const [type, setType] = useState<SecretType>("uuid");
  const [count, setCount] = useState([5]);
  const [passwordLength, setPasswordLength] = useState([16]);
  const [secrets, setSecrets] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const generateSecrets = useCallback(() => {
    const newSecrets = Array.from({ length: count[0] }, () =>
      generateSecret(type, passwordLength[0])
    );
    setSecrets(newSecrets);
  }, [type, count, passwordLength]);

  const copyToClipboard = async (secret: string, index: number) => {
    await navigator.clipboard.writeText(secret);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <ToolLayout
      title="Générateur de secrets"
      description="Générez des UUID, clés API, tokens et mots de passe forts."
    >
      <div className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label>Type de secret</Label>
            <Select value={type} onValueChange={(v) => setType(v as SecretType)}>
              <SelectTrigger className="w-full sm:w-[260px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="uuid">UUID v4</SelectItem>
                <SelectItem value="api-key">Clé API</SelectItem>
                <SelectItem value="token">Token sécurisé</SelectItem>
                <SelectItem value="password">Mot de passe</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {type === "password" && (
            <div>
              <Label>Longueur ({passwordLength[0]})</Label>
              <Slider
                value={passwordLength}
                onValueChange={setPasswordLength}
                min={8}
                max={64}
                step={1}
              />
            </div>
          )}

          <div>
            <Label>Nombre à générer ({count[0]})</Label>
            <Slider
              value={count}
              onValueChange={setCount}
              min={1}
              max={50}
              step={1}
            />
          </div>
        </div>

        <Button onClick={generateSecrets} className="w-full sm:w-auto">
          <RefreshCw className="h-4 w-4 mr-2" />
          Générer
        </Button>

        {secrets.length > 0 && (
          <div className="space-y-2">
            {secrets.map((secret, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-2 rounded-md bg-muted"
              >
                <code className="text-sm font-mono flex-1 break-all">{secret}</code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => copyToClipboard(secret, index)}
                >
                  {copiedIndex === index ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
