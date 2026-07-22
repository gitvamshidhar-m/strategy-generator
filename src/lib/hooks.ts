"use client"
import { useState, useEffect, useCallback } from "react"
import { FormState, BrandingConfig, GeneratedStrategy } from "@/types"

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [stored, setStored] = useState<T>(initialValue)
  useEffect(() => {
    try {
      const item = localStorage.getItem(key)
      if (item) setStored(JSON.parse(item))
    } catch { /* ignore */ }
  }, [key])
  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setStored((prev) => {
      const next = value instanceof Function ? value(prev) : value
      try { localStorage.setItem(key, JSON.stringify(next)) } catch { /* ignore */ }
      return next
    })
  }, [key])
  return [stored, setValue]
}

const defaultForm: FormState = { industry: "saas", budget: 10000, goal: "growth", selectedChannels: [] }

export function useFormPersist(): [FormState, (updates: Partial<FormState>) => void] {
  const [form, setForm] = useLocalStorage<FormState>("strategy-form", defaultForm)
  const update = useCallback((updates: Partial<FormState>) => {
    setForm((prev) => ({ ...prev, ...updates }))
  }, [setForm])
  return [form, update]
}

export interface SavedStrategy {
  id: string; name: string; date: string; form: FormState; result: GeneratedStrategy
}

export function useStrategyHistory() {
  const [history, setHistory] = useLocalStorage<SavedStrategy[]>("strategy-history", [])
  const save = useCallback((form: FormState, result: GeneratedStrategy) => {
    const entry: SavedStrategy = {
      id: Date.now().toString(36),
      name: form.clientName ? `${form.clientName} — ${form.industry}` : `${form.industry} - ${new Date().toLocaleDateString()}`,
      date: new Date().toISOString(), form, result,
    }
    setHistory((prev) => [entry, ...prev].slice(0, 20))
    return entry
  }, [setHistory])
  const remove = useCallback((id: string) => {
    setHistory((prev) => prev.filter((s) => s.id !== id))
  }, [setHistory])
  const rename = useCallback((id: string, name: string) => {
    setHistory((prev) => prev.map((s) => s.id === id ? { ...s, name } : s))
  }, [setHistory])
  return { history, save, remove, rename }
}

const defaultBranding: BrandingConfig = { companyName: "", accentColor: "#2563eb", showBranding: false }
export function useBranding() {
  return useLocalStorage<BrandingConfig>("strategy-branding", defaultBranding)
}

export function useDarkMode() {
  const [dark, setDark] = useLocalStorage<boolean>("strategy-dark", false)
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
  }, [dark])
  return [dark, () => setDark((p) => !p)] as const
}
