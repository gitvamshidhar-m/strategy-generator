"use client"
import { useState, useEffect, useCallback, createContext, useContext } from "react"

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

export interface FormState {
  industry: string; budget: number; goal: string; selectedChannels: string[]
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
  id: string; name: string; date: string; form: FormState; result: any
}

export function useStrategyHistory() {
  const [history, setHistory] = useLocalStorage<SavedStrategy[]>("strategy-history", [])
  const save = useCallback((form: FormState, result: any) => {
    const entry: SavedStrategy = {
      id: Date.now().toString(36), name: `${form.industry} - ${new Date().toLocaleDateString()}`,
      date: new Date().toISOString(), form, result,
    }
    setHistory((prev) => [entry, ...prev].slice(0, 20))
    return entry
  }, [setHistory])
  const remove = useCallback((id: string) => {
    setHistory((prev) => prev.filter((s) => s.id !== id))
  }, [setHistory])
  return { history, save, remove }
}

export interface BrandingConfig {
  companyName: string; accentColor: string; showBranding: boolean
}
const defaultBranding: BrandingConfig = { companyName: "", accentColor: "#2563eb", showBranding: false }
export function useBranding() {
  return useLocalStorage<BrandingConfig>("strategy-branding", defaultBranding)
}

type Theme = "light" | "dark"
const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({ theme: "light", toggle: () => {} })
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useLocalStorage<Theme>("strategy-theme", "light")
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark")
  }, [theme])
  const toggle = useCallback(() => setTheme((p) => (p === "light" ? "dark" : "light")), [setTheme])
  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>
}
export function useTheme() { return useContext(ThemeContext) }
