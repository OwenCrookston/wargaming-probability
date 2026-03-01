import { useEffect, useState } from 'react'
import type { DieType } from '../math/types'

// ─── Shared style tokens ──────────────────────────────────────────────────────

export const inputCls =
  'w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm ' +
  'focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors'

// ─── Field ────────────────────────────────────────────────────────────────────

export function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs text-slate-500 uppercase tracking-widest">{label}</p>
      {children}
    </div>
  )
}

// ─── NumberInput ──────────────────────────────────────────────────────────────

interface NumberInputProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  placeholder?: string
}

export function NumberInput({ value, onChange, min, max, placeholder }: NumberInputProps) {
  const [raw, setRaw] = useState(String(value))

  // Keep local state in sync when parent resets (e.g. roll type change)
  useEffect(() => {
    setRaw(String(value))
  }, [value])

  return (
    <input
      type="number"
      value={raw}
      placeholder={placeholder}
      onChange={(e) => {
        setRaw(e.target.value)
        const n = Number(e.target.value)
        if (!isNaN(n) && e.target.value.trim() !== '') {
          const clamped = clamp(n, min, max)
          onChange(clamped)
        }
      }}
      onBlur={() => {
        const n = Number(raw)
        if (isNaN(n) || raw.trim() === '') {
          setRaw(String(value))
        } else {
          const clamped = clamp(n, min, max)
          setRaw(String(clamped))
          onChange(clamped)
        }
      }}
      className={inputCls}
    />
  )
}

function clamp(n: number, min?: number, max?: number): number {
  if (min !== undefined) n = Math.max(min, n)
  if (max !== undefined) n = Math.min(max, n)
  return n
}

// ─── DieSelect ───────────────────────────────────────────────────────────────

const DIE_OPTIONS: DieType[] = [2, 3, 4, 6, 8, 10, 12, 20]

interface DieSelectProps {
  value: DieType
  onChange: (value: DieType) => void
}

export function DieSelect({ value, onChange }: DieSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(Number(e.target.value) as DieType)}
      className={inputCls}
    >
      {DIE_OPTIONS.map((d) => (
        <option key={d} value={d}>
          d{d}
        </option>
      ))}
    </select>
  )
}

// ─── ToggleGroup ──────────────────────────────────────────────────────────────

interface ToggleOption<T extends string> {
  value: T
  label: string
}

interface ToggleGroupProps<T extends string> {
  value: T
  onChange: (value: T) => void
  options: ToggleOption<T>[]
}

export function ToggleGroup<T extends string>({
  value,
  onChange,
  options,
}: ToggleGroupProps<T>) {
  return (
    <div className="flex bg-slate-800 rounded-lg p-0.5 gap-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={
            'flex-1 px-3 py-1.5 text-sm rounded-md transition-colors ' +
            (value === opt.value
              ? 'bg-slate-600 text-slate-100 font-medium'
              : 'text-slate-400 hover:text-slate-200')
          }
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

// ─── Checkbox ─────────────────────────────────────────────────────────────────

interface CheckboxProps {
  checked: boolean
  onChange: (value: boolean) => void
  label: string
  disabled?: boolean
}

export function Checkbox({ checked, onChange, label, disabled }: CheckboxProps) {
  return (
    <label
      className={
        'flex items-center gap-2.5 cursor-pointer group ' +
        (disabled ? 'opacity-40 pointer-events-none' : '')
      }
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-slate-600 bg-slate-700 accent-amber-400 focus:ring-amber-400 focus:ring-offset-0"
      />
      <span className="text-sm text-slate-300 group-hover:text-slate-100 transition-colors">
        {label}
      </span>
    </label>
  )
}
