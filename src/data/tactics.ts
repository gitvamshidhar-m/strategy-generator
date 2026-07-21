import { Tactic, Channel } from "@/types"

const createTactic = (
  id: string,
  title: string,
  description: string,
  channel: Channel,
  funnelStage: "awareness" | "consideration" | "conversion" | "loyalty",
  effort: "low" | "medium" | "high",
  impact: "low" | "medium" | "high",
  estimatedROI: number
): Tactic => ({ id, title, description, channel, funnelStage, effort, impact, estimatedROI })

export const TACTICS: Record<string, Tactic[]> = {
  saas: [
    createTactic("saas-1", "Build an Authoritative Blog", "Create industry-specific blog content targeting long-tail keywords.", Channel.CONTENT, "awareness", "medium", "high", 350),
    createTactic("saas-2", "Implement LinkedIn Lead Gen", "Set up and optimize LinkedIn lead generation forms.", Channel.PAID_SOCIAL, "awareness", "low", "medium", 200),
    createTactic("saas-3", "Launch PPC Search Campaign", "Run Google Ads targeting high-intent search terms.", Channel.PPC, "conversion", "high", "high", 400),
    createTactic("saas-4", "Optimize Product Hunt Launch", "Plan a staged Product Hunt launch.", Channel.SOCIAL, "awareness", "high", "high", 500),
    createTactic("saas-5", "Start Email Drip Series", "Create automated welcome and nurture email sequences.", Channel.EMAIL, "conversion", "medium", "high", 300),
    createTactic("saas-6", "Leverage Guest Posting", "Write guest posts on SaaS publications.", Channel.CONTENT, "awareness", "medium", "medium", 250),
    createTactic("saas-7", "Run Instagram Ads", "Use Instagram ads to build community.", Channel.PAID_SOCIAL, "awareness", "medium", "medium", 150),
    createTactic("saas-8", "Retargeting Campaign", "Set up website retargeting for abandoned users.", Channel.PAID_SOCIAL, "conversion", "low", "medium", 200),
  ],
  ecommerce: [
    createTactic("ecom-1", "PPC Shopping Campaign", "Create Google Shopping ads for product visibility.", Channel.PPC, "awareness", "high", "high", 400),
    createTactic("ecom-2", "Optimize Product Pages", "Implement A/B testing on product page layouts.", Channel.CONTENT, "conversion", "medium", "high", 350),
    createTactic("ecom-3", "Email Welcome Series", "Automated email sequence for new subscribers.", Channel.EMAIL, "conversion", "medium", "high", 300),
    createTactic("ecom-4", "Retargeting Campaign", "Dynamic retargeting for abandoned carts.", Channel.PAID_SOCIAL, "conversion", "medium", "high", 250),
    createTactic("ecom-5", "Instagram Shopping", "Utilize Instagram Shopping tags.", Channel.PAID_SOCIAL, "awareness", "medium", "medium", 200),
    createTactic("ecom-6", "SEO for Product Pages", "Optimize product descriptions for search.", Channel.SEO, "awareness", "medium", "high", 300),
    createTactic("ecom-7", "Facebook Lead Ads", "Lead generation forms for customer info.", Channel.PAID_SOCIAL, "awareness", "low", "medium", 150),
    createTactic("ecom-8", "Pinterest Marketing", "Create pins for product inspiration.", Channel.PAID_SOCIAL, "awareness", "medium", "medium", 200),
  ],
  "local-services": [
    createTactic("local-1", "Google Business Profile", "Optimize GBP for local searches.", Channel.SOCIAL, "awareness", "low", "high", 100),
    createTactic("local-2", "Local SEO Campaign", "Target localized keywords and citations.", Channel.SEO, "awareness", "medium", "high", 200),
    createTactic("local-3", "Review Generation", "Generate positive customer reviews.", Channel.SOCIAL, "awareness", "low", "medium", 150),
    createTactic("local-4", "Facebook Local Ads", "Geo-targeted Facebook ads.", Channel.PAID_SOCIAL, "awareness", "medium", "medium", 250),
    createTactic("local-5", "Yelp Optimization", "Optimize Yelp listings and reviews.", Channel.SOCIAL, "awareness", "medium", "medium", 200),
    createTactic("local-6", "Email Appointment Reminders", "Send reminders and offers via email.", Channel.EMAIL, "conversion", "medium", "high", 150),
    createTactic("local-7", "Google Local Ads", "Geo-targeted Google Ads for local traffic.", Channel.PPC, "conversion", "high", "high", 300),
    createTactic("local-8", "Directory Listings", "Create listings in local directories.", Channel.SOCIAL, "awareness", "low", "medium", 100),
  ],
  healthcare: [
    createTactic("health-1", "Medical SEO", "Target long-tail medical keywords.", Channel.SEO, "awareness", "medium", "high", 400),
    createTactic("health-2", "Compliant Content Marketing", "Create compliant healthcare content.", Channel.CONTENT, "awareness", "high", "high", 450),
    createTactic("health-3", "Patient Referral Program", "Structured referral programs.", Channel.PAID_SOCIAL, "conversion", "medium", "high", 350),
    createTactic("health-4", "Health Insurance Comparisons", "Comparative content for insurance seekers.", Channel.CONTENT, "awareness", "medium", "high", 350),
    createTactic("health-5", "Google Ads Health Campaign", "Geo-targeted Google Ads.", Channel.PPC, "conversion", "high", "high", 400),
    createTactic("health-6", "Appointment Booking", "Booking forms and calendar integrations.", Channel.EMAIL, "conversion", "medium", "high", 300),
    createTactic("health-7", "Healthcare Directories", "Optimize profiles in healthcare directories.", Channel.SOCIAL, "awareness", "low", "medium", 150),
    createTactic("health-8", "Telemedicine Video", "Showcase telemedicine with video content.", Channel.CONTENT, "awareness", "medium", "high", 350),
  ],
  b2b: [
    createTactic("b2b-1", "LinkedIn Thought Leadership", "Share valuable B2B content on LinkedIn.", Channel.SOCIAL, "awareness", "medium", "high", 300),
    createTactic("b2b-2", "ABM Campaign", "Target high-value accounts with personalized campaigns.", Channel.PAID_SOCIAL, "awareness", "high", "high", 450),
    createTactic("b2b-3", "Content Syndication", "Publish articles on industry platforms.", Channel.CONTENT, "awareness", "medium", "high", 350),
    createTactic("b2b-4", "LinkedIn Lead Gen", "Implement LinkedIn lead generation.", Channel.PAID_SOCIAL, "awareness", "low", "medium", 200),
    createTactic("b2b-5", "Webinar Promotion", "Promote webinars to generate leads.", Channel.CONTENT, "conversion", "medium", "high", 400),
    createTactic("b2b-6", "Email Nurture Sequences", "Automated sequences for lead nurturing.", Channel.EMAIL, "conversion", "medium", "high", 300),
    createTactic("b2b-7", "PPC for Target Keywords", "Google Ads targeting B2B keywords.", Channel.PPC, "conversion", "high", "high", 400),
    createTactic("b2b-8", "Sales Enablement Content", "Content to support sales conversations.", Channel.CONTENT, "conversion", "medium", "high", 350),
  ],
}

export const getTacticsByIndustry = (industry: string): Tactic[] => {
  return TACTICS[industry] || []
}

export const INDUSTRIES = [
  { id: "saas", name: "SaaS/Product" },
  { id: "ecommerce", name: "E-commerce" },
  { id: "local-services", name: "Local Services" },
  { id: "healthcare", name: "Healthcare" },
  { id: "b2b", name: "B2B Services" },
]
