import type { Metadata } from 'next'
import Login from './login'

export const metadata: Metadata = {
  title: 'Entrar — AssistCar',
  description: 'Entre na sua conta AssistCar.',
}

export default function LoginPage() {
  return <Login />
}
