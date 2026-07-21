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
  funnelStage: "awareness" | "consideration" | "conversion" | "loyalty"
  effort: "low" | "medium" | "high"
  impact: "low" | "medium" | "high"
  estimatedROI: number
}

export interface Industry {
  id: string
  name: string
}
