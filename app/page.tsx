'use client'

import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'
import type { LatLng } from '@/components/tracking-map'

// Leaflet usa `window`, então o mapa só carrega no navegador
const TrackingMap = dynamic(() => import('@/components/tracking-map'), {
  ssr: false,
  loading: () => <div className="empty-state compact-empty"><strong>Carregando mapa…</strong></div>,
})

type Screen = 'home' | 'profile'

interface ServiceType {
  id: string
  name: string
  description: string
  icon: string
  basePrice: number
  active: boolean
}

interface LoggedUser {
  name: string
  email: string
  phone: string
}

const USER_KEY = 'assistcar:user'

const formatPrice = (cents: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)

function readStoredUser(): LoggedUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export default function Page() {
  const [screen, setScreen] = useState<Screen>('home')
  const [user, setUser] = useState<LoggedUser | null>(null)
  // true = section Veículos aberta
  const [veiculos, setVeiculos] = useState(false)
  // Veículos cadastrados (compartilhado entre Veículos e Confirmar pedido)
  const [frota, setFrota] = useState<Vehicle[]>([])
  // Serviço clicado na Home; quando definido, abre a tela de confirmação
  const [servicoSelecionado, setServicoSelecionado] = useState<ServiceType | null>(null)

  const goHome = () => { setVeiculos(false); setServicoSelecionado(null); setScreen('home') }
  const goProfile = () => { setVeiculos(false); setServicoSelecionado(null); setScreen('profile') }
  const goVehicles = () => { setServicoSelecionado(null); setVeiculos(true) }

  // Carrega o usuário logado e acompanha mudanças feitas em outras abas
  useEffect(() => {
    setUser(readStoredUser())
    const onStorage = (e: StorageEvent) => {
      if (e.key === USER_KEY) setUser(readStoredUser())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  // Sempre que o estado mudar, o localStorage acompanha
  function updateUser(next: LoggedUser | null) {
    setUser(next)
    if (next) localStorage.setItem(USER_KEY, JSON.stringify(next))
    else localStorage.removeItem(USER_KEY)
  }

  return (
    <main className="app-shell">
      <div className="phone-frame">
        {veiculos
          ? <Vehicles lista={frota} setLista={setFrota} onHome={goHome} onProfile={goProfile} />
          : servicoSelecionado
            ? <ConfirmOrder service={servicoSelecionado} frota={frota} onBack={() => setServicoSelecionado(null)} onVehicles={goVehicles} onHome={goHome} onProfile={goProfile} />
            : screen === 'home'
              ? <Home onProfile={goProfile} onVehicles={goVehicles} onSelectService={setServicoSelecionado} />
              : <Profile user={user} setUser={updateUser} onHome={goHome} onVehicles={goVehicles} />}
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

function Home({ onProfile, onVehicles, onSelectService }: { onProfile: () => void; onVehicles: () => void; onSelectService: (s: ServiceType) => void }) {
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
            <button key={s.id} className="service-card" onClick={() => onSelectService(s)}>
              <span className="service-icon">{s.icon}</span>
              <strong>{s.name}</strong>
              <small>A partir de {formatPrice(s.basePrice)}</small>
            </button>
          ))}
        </div>
      )}
      <Nav active="home" onProfile={onProfile} onHome={() => { }} onVehicles={onVehicles} />
    </section>
  )
}

function Profile({ user, setUser, onHome, onVehicles }: {
  user: LoggedUser | null
  setUser: (u: LoggedUser | null) => void
  onHome: () => void
  onVehicles: () => void
}) {
  return (
    <section className="screen profile-screen">
      <Header back onBack={onHome} />
      <div className="profile-heading">
        <span className="profile-avatar">♙</span>
        <div><p className="eyebrow">Minha conta</p><h1>{user?.name ?? 'Perfil'}</h1><p className="muted">{user?.email ?? 'Dados não carregados'}</p></div>
      </div>
      <div className="profile-card">
        <div className="profile-card-title"><span>♙</span><div><strong>Dados pessoais</strong><small>Informações da sua conta</small></div></div>
        {user ? (
          <div className="profile-data">
            <p><small>Nome</small><br /><strong>{user.name}</strong></p>
            <p><small>E-mail</small><br /><strong>{user.email}</strong></p>
            <p><small>Telefone</small><br /><strong>{user.phone}</strong></p>
          </div>
        ) : (
          <div className="empty-state compact-empty"><strong>Nenhum dado disponível</strong><p>Faça login para ver os dados da sua conta.</p></div>
        )}
      </div>
      <div className="profile-field"><label>Veículo principal</label><div className="empty-field">Nenhum veículo cadastrado</div></div>
      <div className="profile-menu">
        <button><span>⌖</span><strong>Endereços salvos</strong><b>›</b></button>
        <button><span>▤</span><strong>Formas de pagamento</strong><b>›</b></button>
        <button><span>?</span><strong>Ajuda e suporte</strong><b>›</b></button>
      </div>
      <Link className="logout-button" href="/login" onClick={() => setUser(null)}>Sair da conta</Link>
      <Nav active="profile" onHome={onHome} onProfile={() => { }} onVehicles={onVehicles} />
    </section>
  )
}

interface Vehicle {
  marca: string
  modelo: string
  ano: string
  placa: string
  cor: string
}

function Vehicles({ lista, setLista, onHome, onProfile }: {
  lista: Vehicle[]
  setLista: React.Dispatch<React.SetStateAction<Vehicle[]>>
  onHome: () => void
  onProfile: () => void
}) {
  const [marca, setMarca] = useState('')
  const [modelo, setModelo] = useState('')
  const [ano, setAno] = useState('')
  const [placa, setPlaca] = useState('')
  const [cor, setCor] = useState('')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLista((prev) => [...prev, { marca, modelo, ano, placa: placa.toUpperCase(), cor }])
    setMarca(''); setModelo(''); setAno(''); setPlaca(''); setCor('')
  }

  return (
    <section className="screen profile-screen">
      <Header back onBack={onHome} />
      <div className="profile-heading">
        <span className="profile-avatar">▣</span>
        <div><p className="eyebrow">Minha garagem</p><h1>Veículos</h1><p className="muted">Cadastre os dados básicos do seu veículo</p></div>
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
        <label htmlFor="marca">Marca</label>
        <input id="marca" name="marca" type="text" placeholder="Ex.: Fiat" required value={marca} onChange={(e) => setMarca(e.target.value)} />

        <label htmlFor="modelo">Modelo</label>
        <input id="modelo" name="modelo" type="text" placeholder="Ex.: Uno" required value={modelo} onChange={(e) => setModelo(e.target.value)} />

        <label htmlFor="ano">Ano</label>
        <input id="ano" name="ano" type="number" min={1900} max={2100} placeholder="Ex.: 2020" required value={ano} onChange={(e) => setAno(e.target.value)} />

        <label htmlFor="placa">Placa</label>
        <input id="placa" name="placa" type="text" maxLength={8} placeholder="ABC1D23" required value={placa} onChange={(e) => setPlaca(e.target.value)} />

        <label htmlFor="cor">Cor</label>
        <input id="cor" name="cor" type="text" placeholder="Ex.: Prata" required value={cor} onChange={(e) => setCor(e.target.value)} />

        <button className="primary-button login-button" type="submit">Cadastrar veículo</button>
      </form>

      <div className="profile-field">
        <label>Veículos cadastrados</label>
        {lista.length === 0
          ? <div className="empty-field">Nenhum veículo cadastrado</div>
          : lista.map((v, i) => (
            <div key={i} className="empty-field">{v.marca} {v.modelo} · {v.ano} · {v.placa} · {v.cor}</div>
          ))}
      </div>
      <Nav active="vehicles" onHome={onHome} onProfile={onProfile} onVehicles={() => { }} />
    </section>
  )
}

function ConfirmOrder({ service, frota, onBack, onVehicles, onHome, onProfile }: {
  service: ServiceType
  frota: Vehicle[]
  onBack: () => void
  onVehicles: () => void
  onHome: () => void
  onProfile: () => void
}) {
  const [veiculoIdx, setVeiculoIdx] = useState(0)
  const [endereco, setEndereco] = useState('')
  const [solicitado, setSolicitado] = useState(false)

  const veiculo = frota[veiculoIdx]

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!veiculo) return
    setSolicitado(true)
  }

  return (
    <section className="screen profile-screen">
      <Header back onBack={onBack} />
      <div className="profile-heading">
        <span className="profile-avatar">{service.icon}</span>
        <div><p className="eyebrow">Confirmar pedido</p><h1>{service.name}</h1><p className="muted">{service.description}</p></div>
      </div>

      {solicitado ? (
        <Tracking service={service} endereco={endereco} onHome={onHome} />
      ) : (
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="profile-card">
            <div className="profile-card-title"><span>{service.icon}</span><div><strong>{service.name}</strong><small>A partir de {formatPrice(service.basePrice)}</small></div></div>
          </div>

          <label htmlFor="veiculo">Veículo</label>
          {frota.length === 0 ? (
            <div className="empty-field">
              Nenhum veículo cadastrado.{' '}
              <button type="button" onClick={onVehicles}>Cadastrar veículo</button>
            </div>
          ) : (
            <select id="veiculo" className="empty-field" value={veiculoIdx} onChange={(e) => setVeiculoIdx(Number(e.target.value))}>
              {frota.map((v, i) => (
                <option key={i} value={i}>{v.marca} {v.modelo} · {v.placa}</option>
              ))}
            </select>
          )}

          <label htmlFor="endereco">Endereço / localização</label>
          <input id="endereco" name="endereco" type="text" placeholder="Rua, número, bairro" required value={endereco} onChange={(e) => setEndereco(e.target.value)} />

          <button className="primary-button login-button" type="submit" disabled={frota.length === 0}>Solicitar {service.name}</button>
        </form>
      )}
      <Nav active="home" onHome={onHome} onProfile={onProfile} onVehicles={onVehicles} />
    </section>
  )
}

// Distância em metros entre dois pontos (fórmula de haversine)
function distanceMeters(a: LatLng, b: LatLng) {
  const R = 6371000
  const rad = (d: number) => (d * Math.PI) / 180
  const dLat = rad(b.lat - a.lat)
  const dLng = rad(b.lng - a.lng)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

function Tracking({ service, endereco, onHome }: { service: ServiceType; endereco: string; onHome: () => void }) {
  const [pos, setPos] = useState<LatLng | null>(null)
  const [driver, setDriver] = useState<LatLng | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  // Geolocalização real do usuário (atualiza enquanto ele se move)
  useEffect(() => {
    if (!navigator.geolocation) {
      setErro('Seu navegador não suporta geolocalização.')
      return
    }
    const id = navigator.geolocation.watchPosition(
      (p) => setPos({ lat: p.coords.latitude, lng: p.coords.longitude }),
      (e) => setErro(e.code === e.PERMISSION_DENIED
        ? 'Permita o acesso à localização para acompanhar o atendimento.'
        : 'Não foi possível obter sua localização.'),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
    )
    return () => navigator.geolocation.clearWatch(id)
  }, [])

  // SIMULAÇÃO: o motorista começa ~1,5 km de distância e se aproxima do usuário.
  // Será substituído pela posição real enviada pelo backend (WebSocket/SSE).
  const posKey = pos ? `${pos.lat},${pos.lng}` : null
  useEffect(() => {
    if (!pos) return
    setDriver((d) => d ?? { lat: pos.lat + 0.01, lng: pos.lng + 0.006 })
    const timer = setInterval(() => {
      setDriver((d) => d && { lat: d.lat + (pos.lat - d.lat) * 0.04, lng: d.lng + (pos.lng - d.lng) * 0.04 })
    }, 1000)
    return () => clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posKey])

  if (erro) {
    return (
      <div className="profile-card">
        <div className="empty-state compact-empty"><strong>Localização indisponível</strong><p>{erro}</p></div>
        <button className="primary-button" type="button" onClick={onHome}>Voltar ao início</button>
      </div>
    )
  }

  if (!pos || !driver) {
    return (
      <div className="profile-card">
        <div className="empty-state compact-empty">
          <span>⏳</span>
          <strong>Obtendo sua localização…</strong>
          <p>Aceite a permissão do navegador para continuar.</p>
        </div>
      </div>
    )
  }

  const metros = distanceMeters(driver, pos)
  const chegou = metros < 30
  const minutos = Math.max(1, Math.round(metros / 500)) // ~30 km/h

  return (
    <div className="profile-card">
      <TrackingMap user={pos} driver={driver} />
      <div className="profile-data">
        <p><strong>{chegou ? 'O profissional chegou!' : 'Profissional a caminho'}</strong><br />
          <small>{service.name} · {endereco}</small></p>
        {!chegou && <p><small>Distância</small><br /><strong>{metros >= 1000 ? `${(metros / 1000).toFixed(1)} km` : `${Math.round(metros)} m`} · ~{minutos} min</strong></p>}
        <p><small>Posição do profissional simulada nesta versão.</small></p>
      </div>
      <button className="primary-button" type="button" onClick={onHome}>{chegou ? 'Concluir' : 'Cancelar pedido'}</button>
    </div>
  )
}

function Nav({ active, onHome, onProfile, onVehicles }: { active: Screen | 'vehicles'; onHome: () => void; onProfile: () => void; onVehicles: () => void }) {
  return (
    <nav className="bottom-nav">
      <button className={active === 'home' ? 'active' : ''} onClick={onHome}>⌂<span>Início</span></button>
      <button>◷<span>Histórico</span></button>
      <button className={active === 'vehicles' ? 'active' : ''} onClick={onVehicles}>▣<span>Veículos</span></button>
      <button className={active === 'profile' ? 'active' : ''} onClick={onProfile}>♙<span>Perfil</span></button>
    </nav>
  )
}
