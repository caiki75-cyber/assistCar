'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

type FormMode = 'login' | 'register'
type AccountRole = 'USER' | 'WORKER'

interface FormError {
  message: string
  type: 'error' | 'info'
}

export default function Login() {
  const router = useRouter()
  const [mode, setMode] = useState<FormMode>('login')
  // Tipo de conta escolhido no primeiro cadastro (null = ainda não escolheu)
  const [role, setRole] = useState<AccountRole | null>(null)
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<FormError | null>(null)

  // Campos do formulário
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')

  function clearFeedback() {
    setFeedback(null)
  }

  function switchToRegister(prefillEmail?: string) {
    setMode('register')
    setRole(null)
    setFeedback(null)
    setPassword('')
    setPasswordConfirmation('')
    if (prefillEmail) setEmail(prefillEmail)
  }

  function switchToLogin() {
    setMode('login')
    setFeedback(null)
    setPassword('')
    setPasswordConfirmation('')
    setName('')
    setPhone('')
  }

  // ---------------------------------------------------------------------------
  // Login
  // ---------------------------------------------------------------------------

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    clearFeedback()

    if (!email.trim() || !password) {
      setFeedback({ message: 'Preencha todos os campos.', type: 'error' })
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      })

      const json = await res.json()

      if (res.ok) {
        // Login com sucesso — guardar usuário logado e redirecionar para home
        localStorage.setItem('assistcar:user', JSON.stringify(json.user))
        router.push('/')
        return
      }

      // Usuário não cadastrado — sugerir registro
      if (json.error?.code === 'USER_NOT_REGISTERED') {
        setFeedback({
          message: 'Usuário não cadastrado. Crie sua conta para continuar.',
          type: 'info',
        })
        // Auto-switch para cadastro após 2s
        setTimeout(() => switchToRegister(email), 2000)
        return
      }

      // Senha incorreta
      if (json.error?.code === 'INVALID_CREDENTIALS') {
        setFeedback({ message: 'Senha incorreta. Tente novamente.', type: 'error' })
        return
      }

      // Erro genérico
      setFeedback({
        message: json.error?.message || 'Erro ao fazer login.',
        type: 'error',
      })
    } catch {
      setFeedback({ message: 'Erro de conexão. Tente novamente.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  // ---------------------------------------------------------------------------
  // Registro
  // ---------------------------------------------------------------------------

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    clearFeedback()

    if (!name.trim() || !email.trim() || !phone.trim() || !password) {
      setFeedback({ message: 'Preencha todos os campos.', type: 'error' })
      return
    }

    if (password.length < 8) {
      setFeedback({ message: 'A senha deve ter no mínimo 8 caracteres.', type: 'error' })
      return
    }

    if (password !== passwordConfirmation) {
      setFeedback({ message: 'As senhas não coincidem.', type: 'error' })
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password,
          role: role ?? 'USER',
        }),
      })

      const json = await res.json()

      if (res.ok) {
        // Conta criada — voltar para login
        setFeedback({
          message: 'Conta criada com sucesso! Faça login para continuar.',
          type: 'info',
        })
        setPassword('')
        setPasswordConfirmation('')
        setTimeout(() => switchToLogin(), 1500)
        return
      }

      // E-mail já cadastrado
      if (json.error?.code === 'EMAIL_ALREADY_EXISTS') {
        setFeedback({
          message: 'Este e-mail já está cadastrado. Faça login.',
          type: 'error',
        })
        setTimeout(() => switchToLogin(), 2000)
        return
      }

      // Erros de validação
      if (json.error?.code === 'VALIDATION_ERROR' && json.error?.details) {
        const details = json.error.details as { field: string; message: string }[]
        setFeedback({
          message: details.map((d) => d.message).join(' '),
          type: 'error',
        })
        return
      }

      setFeedback({
        message: json.error?.message || 'Erro ao criar conta.',
        type: 'error',
      })
    } catch {
      setFeedback({ message: 'Erro de conexão. Tente novamente.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="app-shell login-shell">
      <div className="phone-frame login-frame">
        <section className="screen login-screen">
          <div className="login-brand"><span className="brand-mark">A</span><strong>Assist<span>Car</span></strong></div>
          <div className="login-heading">
            <p className="eyebrow">{mode === 'register' ? 'Comece agora' : 'Bem-vindo de volta'}</p>
            <h1>{mode === 'register' ? 'Crie sua conta' : 'Entre na sua conta'}</h1>
            <p className="muted">{mode === 'register' ? (role === null ? 'Como você pretende usar a AssistCar?' : role === 'WORKER' ? 'Cadastro de provedor de serviço.' : 'Preencha seus dados para fazer parte da AssistCar.') : 'Acesse sua assistência veicular de forma rápida e segura.'}</p>
          </div>

          {mode === 'register' && role === null ? (
            <div className="role-choice">
              <button type="button" className="role-option" onClick={() => setRole('USER')}>
                <span>🚗</span>
                <strong>Sou usuário</strong>
                <small>Preciso de assistência para o meu veículo</small>
              </button>
              <button type="button" className="role-option" onClick={() => setRole('WORKER')}>
                <span>🔧</span>
                <strong>Sou provedor de serviço</strong>
                <small>Quero atender clientes e oferecer meus serviços</small>
              </button>
            </div>
          ) : (<>
          {feedback && (
            <div className={`login-feedback ${feedback.type}`}>
              <span>{feedback.type === 'error' ? '✕' : '✓'}</span>
              <p>{feedback.message}</p>
            </div>
          )}

          <form className="login-form" onSubmit={mode === 'login' ? handleLogin : handleRegister}>
            {mode === 'register' && (
              <>
                <label htmlFor="name">Nome completo</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Seu nome completo"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </>
            )}

            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="seu@email.com"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {mode === 'register' && (
              <>
                <label htmlFor="phone">Número de telefone</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="(00) 00000-0000"
                  autoComplete="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </>
            )}

            <div className="password-label">
              <label htmlFor="password">Senha</label>
              {mode === 'login' && <button type="button">Esqueci minha senha</button>}
            </div>
            <input
              id="password"
              name="password"
              type="password"
              placeholder={mode === 'register' ? 'Mínimo 8 caracteres' : 'Digite sua senha'}
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {mode === 'register' && (
              <>
                <label htmlFor="password-confirmation">Confirmar senha</label>
                <input
                  id="password-confirmation"
                  name="passwordConfirmation"
                  type="password"
                  placeholder="Digite sua senha novamente"
                  autoComplete="new-password"
                  required
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                />
              </>
            )}

            <button
              className="primary-button login-button"
              type="submit"
              disabled={loading}
            >
              {loading
                ? 'Aguarde...'
                : mode === 'register'
                  ? 'Criar conta'
                  : 'Entrar'}
              {!loading && <span>›</span>}
            </button>
          </form>

          </>)}

          {mode === 'login' && (
            <>
              <div className="login-divider"><span>ou continue com</span></div>
              <button className="social-login" type="button"><b>G</b> Entrar com Google</button>
            </>
          )}

          <p className="signup-copy">
            {mode === 'register' ? 'Já tem uma conta?' : 'Ainda não tem uma conta?'}{' '}
            <button type="button" onClick={() => mode === 'register' ? switchToLogin() : switchToRegister()}>
              {mode === 'register' ? 'Entrar' : 'Cadastre-se'}
            </button>
          </p>
          <p className="login-security">⌾ Seus dados estão protegidos e seguros</p>
        </section>
      </div>
      <div className="desktop-note"><span className="brand-mark small">A</span><strong>Assist<span>Car</span></strong><p>Assistência veicular quando você mais precisa.</p></div>
    </main>
  )
}
