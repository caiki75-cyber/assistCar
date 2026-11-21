'use client'

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react'

type SelectContextValue = {
  value: string
  open: boolean
  listboxId: string
  setOpen: (open: boolean) => void
  selectValue: (value: string) => void
}

const SelectContext = createContext<SelectContextValue | null>(null)

function useSelect() {
  const context = useContext(SelectContext)

  if (!context) {
    throw new Error('Os componentes de Select devem estar dentro de <Select>.')
  }

  return context
}

type SelectProps = {
  children: ReactNode
  value: string
  onValueChange: (value: string) => void
}

export function Select({ children, value, onValueChange }: SelectProps) {
  const [open, setOpen] = useState(false)
  const listboxId = useId()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)

    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [])

  function selectValue(nextValue: string) {
    onValueChange(nextValue)
    setOpen(false)
  }

  return (
    <SelectContext.Provider value={{ value, open, listboxId, setOpen, selectValue }}>
      <div className="custom-select" ref={containerRef}>{children}</div>
    </SelectContext.Provider>
  )
}

export function SelectTrigger({ children }: { children: ReactNode }) {
  const { open, listboxId, setOpen } = useSelect()

  return (
    <button
      type="button"
      className="select-trigger"
      aria-expanded={open}
      aria-controls={listboxId}
      aria-haspopup="listbox"
      onClick={() => setOpen(!open)}
    >
      {children}
      <span className={`select-chevron ${open ? 'open' : ''}`} aria-hidden="true">⌄</span>
    </button>
  )
}

export function SelectValue({ placeholder = 'Selecione uma opção' }: { placeholder?: string }) {
  const { value } = useSelect()
  return <span className={value ? 'select-value' : 'select-placeholder'}>{value || placeholder}</span>
}

export function SelectItems({ children }: { children: ReactNode }) {
  const { open, listboxId } = useSelect()

  if (!open) return null

  return <div className="select-items" id={listboxId} role="listbox">{children}</div>
}

export function SelectItem({ children, value }: { children: ReactNode; value: string }) {
  const { value: selectedValue, selectValue } = useSelect()
  const selected = selectedValue === value

  return (
    <button
      type="button"
      className={`select-item ${selected ? 'selected' : ''}`}
      role="option"
      aria-selected={selected}
      onClick={() => selectValue(value)}
    >
      <span>{children}</span>
      {selected && <span aria-hidden="true">✓</span>}
    </button>
  )
}
