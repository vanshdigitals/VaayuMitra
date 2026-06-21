/**
 * TypeScript types that mirror the backend Pydantic models exactly.
 * Any change to backend/app/models.py must be reflected here.
 */

export type CommuteModeType =
  | "2_wheeler_petrol"
  | "car_petrol"
  | "auto_cng"
  | "city_bus"
  | "metro"
  | "walk_cycle";

export type DietType =
  | "veg"
  | "mostly_veg"
  | "non_veg"
  | "frequent_non_veg";

export type DifficultyType = "easy" | "medium" | "hard";

export type InsightSource = "gemini" | "rules";

export type ScoreLevel = "excellent" | "good" | "moderate" | "high" | "critical";

// ─── Input ───────────────────────────────────────────────────────────────────

export interface CalculateRequest {
  city: string;
  household_size?: number;
  monthly_electricity_bill_inr?: number;
  lpg_cylinders_per_month?: number;
  commute_mode?: CommuteModeType;
  daily_commute_km?: number;
  commute_days_per_week?: number;
  diet_type?: DietType;
  device_id?: string;
}

// ─── Calculate response ──────────────────────────────────────────────────────

export interface FootprintBreakdown {
  electricity_kg: number;
  lpg_kg: number;
  transport_kg: number;
  diet_kg: number;
}

export interface CalculateResponse {
  annual_total_tco2e: number;
  annual_total_kgco2e: number;
  breakdown: FootprintBreakdown;
  india_average_t: number;
  paris_target_t: number;
  is_below_paris_target: boolean;
  score_level: ScoreLevel;
}

// ─── Insights response ───────────────────────────────────────────────────────

export interface Recommendation {
  title: string;
  description: string;
  category: string;
  monthly_saving_kg: number;
  difficulty: DifficultyType;
  source: string;
  source_citation: string;
}

export interface InsightsResponse {
  recommendations: Recommendation[];
  source: InsightSource;
  summary?: string;
}

// ─── Entry ───────────────────────────────────────────────────────────────────

export interface EntryCreate {
  device_id: string;
  profile: CalculateRequest;
  result: CalculateResponse;
}

export interface Entry {
  id: string;
  device_id: string;
  created_at: string;
  profile: CalculateRequest;
  result: CalculateResponse;
}

// ─── Chat ────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: "user" | "model";
  content: string;
}

export interface ChatResponse {
  text: string;
}
