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
  COOKIE_SECRET: requireEnv("COOKIE_SECRET"),
} as const;

/**
 * Chave secreta lida de process.env (.env.local), usada para assinar o cookie.
 */
export const secure = process.env.COOKIE_SECRET as string;

/**
 * Opções do cookie de sessão. httpOnly impede o acesso via JavaScript no navegador.
 */
export const httpOnly = true;
