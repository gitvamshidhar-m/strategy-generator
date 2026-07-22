export enum Channel {
  SEO = "SEO",
  PPC = "PPC",
  SOCIAL = "SOCIAL",
  EMAIL = "EMAIL",
  CONTENT = "CONTENT",
  PAID_SOCIAL = "PAID_SOCIAL",
  INFLUENCER = "INFLUENCER",
  AFFILIATE = "AFFILIATE",
  SMS = "SMS",
  DISPLAY = "DISPLAY",
}

export enum Goal {
  AWARENESS = "awareness",
  LEADS = "leads",
  SALES = "sales",
  RETENTION = "retention",
  GROWTH = "growth",
}

export enum BusinessStage {
  STARTUP = "startup",
  GROWING = "growing",
  ESTABLISHED = "established",
  ENTERPRISE = "enterprise",
}

export enum TeamSize {
  SOLO = "solo",
  SMALL = "small",
  MEDIUM = "medium",
  LARGE = "large",
}

export interface Tactic {
  id: string
  title: string
  description: string
  channel: Channel
  funnelStage: FunnelStageName
  effort: "low" | "medium" | "high"
  impact: "low" | "medium" | "high"
  estimatedROI: number
}

export interface Industry {
  id: string
  name: string
}

export type FunnelStageName = "awareness" | "consideration" | "conversion" | "loyalty"

export interface StrategyInput {
  industry: string
  currentChannels: string[]
  monthlyBudget: number
  primaryGoal: string
  targetAudience?: string
  businessStage?: string
  teamSize?: string
  targetCPA?: number
  targetROAS?: number
  targetConversionRate?: number
  strategyStyle?: string
  competitors?: string
}

export interface FunnelTactic {
  id: string
  title: string
  description: string
  reasoning: string
  effort: string
  impact: string
  estimatedROI: number
  channel: string
  steps?: string[]
}

export interface FunnelStage {
  stage: FunnelStageName
  label: string
  goal: string
  tactics: FunnelTactic[]
}

export interface ChannelAllocation {
  channel: string
  priority: number
  budgetAllocation: number
}

export interface Benchmark {
  metric: string
  yourValue: string
  industryAvg: string
  unit: string
}

export interface TimelinePhase {
  name: string
  duration: number
  tactics: string[]
}

export interface ChannelRoadmapMonth {
  month: number
  channels: { name: string; action: string }[]
}

export interface GeneratedStrategy {
  channels: ChannelAllocation[]
  funnel: FunnelStage[]
  tactics: FunnelTactic[]
  timeline: { phases: TimelinePhase[] }
  reasoning: string
  estimatedROI: number
  benchmarks?: Benchmark[]
  channelRoadmap?: ChannelRoadmapMonth[]
}

export interface BrandingConfig {
  companyName: string; accentColor: string; showBranding: boolean
}

export interface FormState {
  industry: string; budget: number; goal: string; selectedChannels: string[]
  targetCPA?: number; targetROAS?: number; targetConversionRate?: number
  strategyStyle?: string; competitors?: string; clientName?: string
}

export interface SWOTAnalysis {
  strengths: string[]
  weaknesses: string[]
  opportunities: string[]
  threats: string[]
}

export interface BudgetOptimization {
  channel: string
  budgetAllocation: number
  reasoning: string
}
