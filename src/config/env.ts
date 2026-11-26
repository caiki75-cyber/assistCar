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

/**
 * Chave secreta lida de process.env, usada para assinar o cookie.
 *
 * Ainda não é obrigatória na inicialização, pois nenhum cookie é criado.
 * Quando a sessão for implementada, valide-a no momento do uso (nunca na
 * importação, para não quebrar o build do Docker, que não tem os segredos).
 */
export const secure = process.env.COOKIE_SECRET;

/**
 * Opções do cookie de sessão. httpOnly impede o acesso via JavaScript no navegador.
 */
export const httpOnly = true;
