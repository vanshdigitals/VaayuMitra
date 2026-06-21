'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getInsights } from '@/lib/api';
import { DEMO_FOOTPRINT } from '@/lib/demo';
import { CarbonRing } from '@/components/ui/CarbonRing';
import { NavTabBar, AppHeader } from '@/components/ui/Navigation';
import {
  Bot, Settings, Bike, Zap, Leaf, Flame,
  TrendingDown, Activity, CheckCircle2, ChevronRight,
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

/* ─── Meta ───────────────────────────────────────────────────────── */
const CATEGORY_META = [
  { key: 'transport_kg', label: 'Transport', Icon: Bike,   color: '#5A9ED1' },
  { key: 'electricity_kg', label: 'Energy',  Icon: Zap,    color: '#D4A853' },
  { key: 'diet_kg',      label: 'Food',      Icon: Leaf,   color: '#7BC47A' },
  { key: 'lpg_kg',       label: 'LPG',       Icon: Flame,  color: '#E08645' },
];

const QUICK_CHIPS = [
  { Icon: Bike,     label: 'Commute' },
  { Icon: Leaf,     label: 'Meals'   },
  { Icon: Zap,      label: 'Energy'  },
  { Icon: Activity, label: 'Travel'  },
];

/* ─── Types ──────────────────────────────────────────────────────── */
interface Footprint {
  annual_total_tco2e: number;
  annual_total_kgco2e: number;
  breakdown: Record<string, number>;
  is_below_paris_target: boolean;
  score_level: string;
  india_average_t?: number;
  paris_target_t?: number;
}
interface Recommendation { title: string; description: string; category: string; monthly_saving_kg: number; difficulty: string; source: string; }
interface InsightResponse { recommendations: Recommendation[]; source: string; }

/* ─── Page ───────────────────────────────────────────────────────── */
export default function DashboardPage() {
  const [footprint, setFootprint]       = useState<Footprint | null>(null);
  const [insight, setInsight]           = useState<InsightResponse | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const [greeting, setGreeting]         = useState('');

  const F = "'Fraunces', Georgia, serif";
  const S = "'Cabinet Grotesk', 'DM Sans', system-ui, sans-serif";
  const M = "'JetBrains Mono', monospace";

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening');

    const stored = localStorage.getItem('vaayumitra_footprint');
    const fp: Footprint = stored ? JSON.parse(stored) : DEMO_FOOTPRINT;
    setFootprint(fp);
  }, []);

  useEffect(() => {
    if (!footprint) return;
    setInsightLoading(true);
    const profile = JSON.parse(localStorage.getItem('vaayumitra_profile') ?? '{}');
    getInsights({ ...profile, device_id: localStorage.getItem('vaayumitra_device_id') ?? 'demo-id-001' })
      .then(d => setInsight(d))
      .catch(() => setInsight({
        recommendations: [{
          title: 'Switch to Metro 2 days/week',
          description: 'Your transport emits the most. Taking Metro on 2 days/week saves ~4.2 kg CO₂/month — equivalent to 2 Mumbai-Pune auto trips.',
          category: 'transport', monthly_saving_kg: 4.2, difficulty: 'easy', source: 'rules',
        }],
        source: 'rules',
      }))
      .finally(() => setInsightLoading(false));
  }, [footprint]);

  /* Loading state */
  if (!footprint) {
    return (
      <div style={{ minHeight: '100dvh', background: '#111009', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: 20, fontFamily: S }}>
        <div style={{ animation: 'spinLeaf 2s linear infinite', color: '#5B9E6F' }}>
          <Leaf size={40} strokeWidth={1.5} />
        </div>
        <p style={{ color: '#A09880', fontSize: 15 }}>Loading your footprint...</p>
        <Link href="/onboarding" style={{ color: '#D4A853', fontSize: 14, textDecoration: 'none' }}>Start onboarding →</Link>
      </div>
    );
  }

  const breakdown = footprint.breakdown ?? {};
  const totalKg   = footprint.annual_total_kgco2e ?? 0;
  const score     = footprint.annual_total_tco2e ?? 0;
  const topInsight = insight?.recommendations?.[0];

  const difficultyColor = (d: string) => ({ easy: '#5B9E6F', medium: '#D4A853', hard: '#D15A4A' }[d] ?? '#6B6454');
  const levelLabel = footprint.score_level;
  const levelColor = { excellent: '#5B9E6F', good: '#7BC47A', moderate: '#D4A853', high: '#E08645', critical: '#D15A4A' }[levelLabel] ?? '#D4A853';

  return (
    <div style={{ minHeight: '100dvh', background: '#111009', color: '#F2EFE3', fontFamily: S, paddingBottom: 76 }}>

      {/* ── Header ────────────────────────────────────────── */}
      <AppHeader showLogo rightSlot={
        <Link href="/settings" aria-label="Settings" style={{ width: 36, height: 36, borderRadius: 8, background: '#1C1A14', border: '1px solid rgba(242,239,227,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
          <Settings size={16} strokeWidth={1.5} color="#A09880" />
        </Link>
      } />

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 16px' }}>

        {/* ── Greeting ───────────────────────────────────── */}
        <div style={{ paddingTop: 24, marginBottom: 20, animation: 'fadeUp .4s ease both' }}>
          <h1 style={{ fontFamily: F, fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 2 }}>
            {greeting}
          </h1>
          <p style={{ color: '#A09880', fontSize: 14 }}>Your footprint this week</p>
        </div>

        {/* ── Hero Carbon Score Card ──────────────────────── */}
        <section aria-labelledby="score-h" style={{ background: '#252219', border: '1px solid rgba(212,168,83,0.22)', borderRadius: 24, padding: 24, marginBottom: 14, animation: 'scaleIn .5s cubic-bezier(.34,1.56,.64,1) .1s both' }}>
          <h2 id="score-h" className="sr-only">Carbon Score</h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
            <CarbonRing score={score} maxScore={2.5} size={120} animated aria-label={`Carbon score: ${score.toFixed(2)} tCO₂e per year. Level: ${levelLabel}`} />
            <div style={{ flex: 1 }}>
              {/* Level badge */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 9999, background: `${levelColor}18`, marginBottom: 10 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: levelColor }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: levelColor, textTransform: 'capitalize', letterSpacing: '0.04em' }}>{levelLabel}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: footprint.is_below_paris_target ? '#5B9E6F' : '#E08645' }}>
                <CheckCircle2 size={14} strokeWidth={1.5} />
                {footprint.is_below_paris_target ? 'Below Paris target' : 'Above Paris target'}
              </div>
              <div style={{ marginTop: 8, fontSize: 12, color: '#6B6454', fontFamily: M }}>
                India avg: 1.84t · You: {score.toFixed(2)}t
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div>
            <div style={{ height: 5, background: 'rgba(242,239,227,0.07)', borderRadius: 3, overflow: 'hidden', marginBottom: 6 }}>
              <div style={{ height: '100%', width: `${Math.min(score / 2.5 * 100, 100)}%`, background: score < 1.84 ? '#5B9E6F' : '#D4A853', borderRadius: 3, transition: 'width 1.2s ease' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#6B6454', fontFamily: M }}>
              <span>0t</span><span>Target: 1.2t</span><span>2.5t</span>
            </div>
          </div>
        </section>

        {/* ── Quick Log Chips ────────────────────────────── */}
        <section aria-labelledby="quick-log-h" style={{ marginBottom: 14 }}>
          <h2 id="quick-log-h" style={{ fontSize: 11, color: '#6B6454', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 10 }}>
            Log today&apos;s activities
          </h2>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
            {QUICK_CHIPS.map(({ Icon, label }) => (
              <Link key={label} href="/track" aria-label={`Log ${label}`} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 14px', borderRadius: 9999, background: '#1C1A14', border: '1px solid rgba(242,239,227,0.08)', whiteSpace: 'nowrap', textDecoration: 'none', color: '#F2EFE3', fontSize: 13, fontWeight: 500, fontFamily: S, transition: 'border-color 150ms' }}>
                <Icon size={14} strokeWidth={1.5} />
                {label}
              </Link>
            ))}
          </div>
        </section>

        {/* ── Top AI Insight ─────────────────────────────── */}
        <section aria-labelledby="insight-h" style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <h2 id="insight-h" style={{ fontSize: 11, color: '#6B6454', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>Top AI Insight</h2>
            {insight && (
              <span style={{ fontSize: 11, color: insight.source === 'gemini' ? '#5A9ED1' : '#A09880', fontWeight: 600 }}>
                {insight.source === 'gemini' ? 'Gemini' : 'Analysis'}
              </span>
            )}
          </div>

          {insightLoading ? (
            <div style={{ padding: 20, borderRadius: 16, background: '#1C1A14', border: '1px solid rgba(242,239,227,0.08)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ animation: 'spinLeaf 2s linear infinite', color: '#5B9E6F', flexShrink: 0 }}>
                <Bot size={18} strokeWidth={1.5} />
              </div>
              <span role="status" aria-live="polite" style={{ fontSize: 13, color: '#A09880' }}>VaayuMitra is analyzing your footprint...</span>
            </div>
          ) : topInsight ? (
            <div style={{ background: '#1C1A14', border: '1px solid rgba(242,239,227,0.08)', borderRadius: 16, padding: 20 }}>
              {/* Category tag */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(90,158,209,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bot size={14} strokeWidth={1.5} color="#5A9ED1" />
                </div>
                <span style={{ fontSize: 11, color: '#5A9ED1', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {topInsight.category}
                </span>
              </div>
              <h3 style={{ fontFamily: F, fontSize: 17, fontWeight: 600, letterSpacing: '-0.01em', marginBottom: 8 }}>{topInsight.title}</h3>
              <p style={{ fontSize: 13, color: '#A09880', lineHeight: 1.65, marginBottom: 14 }}>{topInsight.description}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#5B9E6F', fontWeight: 600 }}>
                  <TrendingDown size={14} strokeWidth={2} />
                  {topInsight.monthly_saving_kg} kg/month
                </div>
                <div style={{ padding: '3px 10px', borderRadius: 9999, background: `${difficultyColor(topInsight.difficulty)}18`, color: difficultyColor(topInsight.difficulty), fontSize: 11, fontWeight: 600 }}>
                  {topInsight.difficulty}
                </div>
              </div>
              <Link href="/insights" aria-label="See all insights" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#D4A853', textDecoration: 'none', fontWeight: 600 }}>
                See All Insights <ChevronRight size={14} strokeWidth={2} />
              </Link>
            </div>
          ) : null}
        </section>

        {/* ── Category Breakdown ─────────────────────────── */}
        <section aria-labelledby="breakdown-h" style={{ marginBottom: 14 }}>
          <h2 id="breakdown-h" style={{ fontSize: 11, color: '#6B6454', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 10 }}>Category Breakdown</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {CATEGORY_META.map(({ key, label, Icon, color }) => {
              const kg  = breakdown[key] ?? 0;
              const pct = totalKg > 0 ? Math.round((kg / totalKg) * 100) : 0;
              return (
                <div key={key} role="img" aria-label={`${label}: ${kg.toFixed(0)} kg CO₂/yr, ${pct}% of total`} style={{ padding: '16px 14px', background: '#1C1A14', border: '1px solid rgba(242,239,227,0.08)', borderRadius: 14 }}>
                  {/* Icon + label */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
                    <div style={{ width: 26, height: 26, borderRadius: 7, background: `${color}16`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={14} strokeWidth={1.5} color={color} />
                    </div>
                    <span style={{ fontSize: 12, color: '#A09880' }}>{label}</span>
                  </div>
                  {/* Value */}
                  <div style={{ fontFamily: F, fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8, color: '#F2EFE3' }}>
                    {(kg / 1000).toFixed(2)}<span style={{ fontSize: 13, color: '#6B6454', marginLeft: 2 }}>t</span>
                  </div>
                  {/* Bar */}
                  <div style={{ height: 3, background: 'rgba(242,239,227,0.07)', borderRadius: 2, overflow: 'hidden', marginBottom: 4 }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 2, transition: 'width 1s ease' }} />
                  </div>
                  <div style={{ fontSize: 10, color: '#6B6454', fontFamily: M }}>{pct}% of total</div>
                </div>
              );
            })}
          </div>
        </section>

      </div>

      <NavTabBar active="dashboard" />
    </div>
  );
}
