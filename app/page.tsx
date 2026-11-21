'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

type Screen = 'home' | 'profile'

interface ServiceType {
  id: string
  name: string
  description: string
  icon: string
  basePrice: number
  active: boolean
}

export default function Page() {
  const [screen, setScreen] = useState<Screen>('home')

  return (
    <main className="app-shell">
      <div className="phone-frame">
        {screen === 'home'
          ? <Home onProfile={() => setScreen('profile')} />
          : <Profile onHome={() => setScreen('home')} />}
      </div>
      <div className="desktop-note"><span className="brand-mark small">A</span><strong>Assist<span>Car</span></strong><p>Assistência veicular quando você mais precisa.</p></div>
    </main>
  )
}

function Header({ back, onBack, onProfile }: { back?: boolean; onBack?: () => void; onProfile?: () => void }) {
  return (
    <header className="app-header">
      {back
        ? <button className="back-button" onClick={onBack} aria-label="Voltar">‹</button>
        : <div className="brand"><span className="brand-mark">A</span><strong>Assist<span>Car</span></strong></div>}
      {!back && <button className="profile-button" onClick={onProfile} aria-label="Abrir perfil">♙</button>}
    </header>
  )
}

function Home({ onProfile }: { onProfile: () => void }) {
  const [services, setServices] = useState<ServiceType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/service-types')
      .then((res) => res.json())
      .then((json) => {
        setServices(json.data ?? [])
      })
      .catch(() => setServices([]))
      .finally(() => setLoading(false))
  }, [])

  const formatPrice = (cents: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)

  return (
    <section className="screen home-screen">
      <Header onProfile={onProfile} />
      <div className="welcome">
        <p className="eyebrow">Assistência veicular</p>
        <h1>Como podemos<br />ajudar?</h1>
        <p className="muted">Estamos prontos para cuidar do seu caminho.</p>
      </div>
      <div className="section-heading"><h2>Serviços</h2></div>
      {loading ? (
        <div className="empty-state">
          <span>⏳</span>
          <strong>Carregando serviços...</strong>
        </div>
      ) : services.length === 0 ? (
        <div className="empty-state">
          <span>⚙</span>
          <strong>Nenhum serviço disponível</strong>
          <p>Os serviços cadastrados aparecerão aqui.</p>
        </div>
      ) : (
        <div className="service-grid">
          {services.map((s) => (
            <button key={s.id} className="service-card">
              <span className="service-icon">{s.icon}</span>
              <strong>{s.name}</strong>
              <small>A partir de {formatPrice(s.basePrice)}</small>
            </button>
          ))}
        </div>
      )}
      <Nav active="home" onProfile={onProfile} onHome={() => { }} />
    </section>
  )
}

function Profile({ onHome }: { onHome: () => void }) {
  return (
    <section className="screen profile-screen">
      <Header back onBack={onHome} />
      <div className="profile-heading">
        <span className="profile-avatar">♙</span>
        <div><p className="eyebrow">Minha conta</p><h1>Perfil</h1><p className="muted">Dados não carregados</p></div>
      </div>
      <div className="profile-card">
        <div className="profile-card-title"><span>♙</span><div><strong>Dados pessoais</strong><small>Informações da sua conta</small></div></div>
        <div className="empty-state compact-empty"><strong>Nenhum dado disponível</strong><p>Seus dados aparecerão aqui após a integração com a conta.</p></div>
      </div>
      <div className="profile-field"><label>Veículo principal</label><div className="empty-field">Nenhum veículo cadastrado</div></div>
      <div className="profile-menu">
        <button><span>⌖</span><strong>Endereços salvos</strong><b>›</b></button>
        <button><span>▤</span><strong>Formas de pagamento</strong><b>›</b></button>
        <button><span>?</span><strong>Ajuda e suporte</strong><b>›</b></button>
      </div>
      <Link className="logout-button" href="/login">Sair da conta</Link>
      <Nav active="profile" onHome={onHome} onProfile={() => { }} />
    </section>
  )
}

function Nav({ active, onHome, onProfile }: { active: Screen; onHome: () => void; onProfile: () => void }) {
  return (
    <nav className="bottom-nav">
      <button className={active === 'home' ? 'active' : ''} onClick={onHome}>⌂<span>Início</span></button>
      <button>◷<span>Histórico</span></button>
      <button>▣<span>Veículos</span></button>
      <button className={active === 'profile' ? 'active' : ''} onClick={onProfile}>♙<span>Perfil</span></button>
    </nav>
  )
}
