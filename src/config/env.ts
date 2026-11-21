/**
 * Configuração centralizada de variáveis de ambiente.
 *
 * Valida a presença das variáveis obrigatórias no momento
 * da importação, evitando falhas silenciosas em runtime.
 *
 * NUNCA exibe credenciais ou connection strings nos logs.
 */

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `[env] Variável de ambiente "${name}" não está definida. ` +
        `Verifique seu arquivo .env.local.`
    );
  }
  return value;
}

export const env = {
  DATABASE_URL: requireEnv("DATABASE_URL"),
} as const;
