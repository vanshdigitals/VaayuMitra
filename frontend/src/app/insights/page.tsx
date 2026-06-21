'use client';

import { useEffect, useState } from 'react';
import { getInsights } from '@/lib/api';
import { NavTabBar, AppHeader } from '@/components/ui/Navigation';
import {
  Bike, Zap, Leaf, ShoppingBag,
  Bot, BarChart2, TrendingDown, CheckCircle2,
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

import { DEMO_INSIGHTS } from '@/lib/demo';

/* ─── Types ──────────────────────────────────────────────────────── */
interface Recommendation { title: string; description: string; category: string; monthly_saving_kg: number; difficulty: string; source: string; source_citation?: string; }
interface InsightResponse { recommendations: Recommendation[]; source: string; }
interface Footprint { annual_total_tco2e: number; is_below_paris_target: boolean; }

/* ─── Helpers ───────────────────────────────────────────────────── */
const CAT_ICON: Record<string, React.ElementType> = { transport: Bike, energy: Zap, food: Leaf, shopping: ShoppingBag };
const CAT_COLOR: Record<string, string> = { transport: '#5A9ED1', energy: '#D4A853', food: '#7BC47A', shopping: '#C47BA3' };
const DIFF_COLOR: Record<string, string> = { easy: '#5B9E6F', medium: '#D4A853', hard: '#D15A4A' };

const BENCHMARKS = [
  { label: 'You',          color: '#D4A853' },
  { label: 'India avg',    color: '#A09880', value: 1.84 },
  { label: 'World avg',    color: '#D15A4A', value: 4.7  },
  { label: 'Paris target', color: '#5B9E6F', value: 2.5  },
];

/* ─── Page ───────────────────────────────────────────────────────── */
export default function InsightsPage() {
  const [insights,  setInsights]  = useState<InsightResponse | null>(null);
  const [footprint, setFootprint] = useState<Footprint | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  const F = "'Fraunces', Georgia, serif";
  const S = "'Cabinet Grotesk', 'DM Sans', system-ui, sans-serif";
  const M = "'JetBrains Mono', monospace";

  useEffect(() => {
    const fp      = JSON.parse(localStorage.getItem('vaayumitra_footprint') ?? 'null');
    const profile = JSON.parse(localStorage.getItem('vaayumitra_profile') ?? '{}');
    setFootprint(fp);

    getInsights({ ...profile, device_id: localStorage.getItem('vaayumitra_device_id') ?? 'demo-id-001' })
      .then(d => setInsights(d))
      .catch(() => setInsights(DEMO_INSIGHTS))
      .finally(() => setLoading(false));
  }, []);

  const score   = footprint?.annual_total_tco2e ?? 1.84;
  const isBelow = footprint?.is_below_paris_target ?? true;
  const recs    = insights?.recommendations ?? [];
  const isGemini = insights?.source === 'gemini';

  return (
    <div style={{ minHeight: '100dvh', background: '#111009', color: '#F2EFE3', fontFamily: S, paddingBottom: 76 }}>

      {/* ── Header ─────────────────────────────────────────── */}
      <AppHeader title="Your Insights" backHref="/dashboard" backLabel="Dashboard" />

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '20px 16px' }}>

        {error && (
          <div style={{ background: 'rgba(209,90,74,0.10)', border: '1px solid rgba(209,90,74,0.25)', borderRadius: 12, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 13, color: '#D15A4A' }}>{error}</span>
            <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', color: '#D15A4A', cursor: 'pointer' }}>✕</button>
          </div>
        )}

        {/* ── India Context Card ──────────────────────────── */}
        <section aria-labelledby="india-ctx-h" style={{ background: '#1C1A14', border: '1px solid rgba(242,239,227,0.08)', borderRadius: 16, padding: 20, marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 id="india-ctx-h" style={{ fontFamily: F, fontSize: 17, fontWeight: 600, letterSpacing: '-0.01em' }}>How you compare</h2>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(90,158,209,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BarChart2 size={14} strokeWidth={1.5} color="#5A9ED1" />
            </div>
          </div>

          {BENCHMARKS.map(row => {
            const val = row.label === 'You' ? score : (row.value ?? 0);
            return (
              <div key={row.label} role="img" aria-label={`${row.label}: ${val} tonnes CO₂ per year`} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 12, color: '#A09880', minWidth: 80, fontWeight: 500 }}>{row.label}</span>
                <div style={{ flex: 1, height: 5, background: 'rgba(242,239,227,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(val / 5 * 100, 100)}%`, background: row.color, borderRadius: 3, transition: 'width 1.2s ease' }} />
                </div>
                <span style={{ fontSize: 12, color: row.color, fontFamily: M, minWidth: 36, textAlign: 'right' }}>{val}t</span>
              </div>
            );
          })}

          {isBelow && (
            <div role="status" style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, padding: '10px 12px', borderRadius: 8, background: 'rgba(91,158,111,0.10)', border: '1px solid rgba(91,158,111,0.18)' }}>
              <CheckCircle2 size={14} strokeWidth={1.5} color="#5B9E6F" />
              <p style={{ fontSize: 13, color: '#5B9E6F' }}>
                Already below the Paris 1.5°C target — global climate leader.
              </p>
            </div>
          )}
        </section>

        {/* ── AI Recommendations ─────────────────────────── */}
        <section aria-labelledby="recs-h">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 id="recs-h" style={{ fontSize: 11, color: '#6B6454', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>AI Recommendations</h2>
            <div role="status" aria-label={isGemini ? 'Powered by Gemini AI' : 'Deterministic analysis'} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: isGemini ? '#5A9ED1' : '#A09880', fontWeight: 600 }}>
              <Bot size={12} strokeWidth={1.5} />
              {isGemini ? 'Gemini' : 'Analysis'}
            </div>
          </div>

          {loading ? (
            <div role="status" aria-live="polite" style={{ textAlign: 'center', padding: '40px 20px', color: '#A09880' }}>
              <div style={{ animation: 'spinLeaf 2s linear infinite', marginBottom: 12, display: 'flex', justifyContent: 'center' }}>
                <Bot size={28} strokeWidth={1.5} color="#5A9ED1" />
              </div>
              <p style={{ fontSize: 14 }}>Analyzing your footprint...</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {recs.map((rec, i) => {
                const CatIcon = CAT_ICON[rec.category] ?? Zap;
                const catColor = CAT_COLOR[rec.category] ?? '#6B6454';
                const diffColor = DIFF_COLOR[rec.difficulty] ?? '#6B6454';
                return (
                  <article key={i} aria-label={`Recommendation ${i + 1}: ${rec.title}`} style={{ background: '#1C1A14', border: '1px solid rgba(242,239,227,0.08)', borderRadius: 16, padding: 20, animation: `fadeUp .4s ease ${i * 0.1}s both` }}>
                    {/* Category tag */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 7, background: `${catColor}16`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CatIcon size={14} strokeWidth={1.5} color={catColor} />
                      </div>
                      <span style={{ fontSize: 11, color: catColor, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        #{i + 1} {rec.category}
                      </span>
                    </div>

                    <h3 style={{ fontFamily: F, fontSize: 17, fontWeight: 600, letterSpacing: '-0.01em', marginBottom: 8 }}>{rec.title}</h3>
                    <p style={{ fontSize: 13, color: '#A09880', lineHeight: 1.65, marginBottom: 14 }}>{rec.description}</p>

                    {/* Meta row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#5B9E6F', fontWeight: 600 }}>
                        <TrendingDown size={14} strokeWidth={2} />
                        {rec.monthly_saving_kg} kg saved/month
                      </div>
                      <div style={{ padding: '3px 10px', borderRadius: 9999, background: `${diffColor}18`, color: diffColor, fontSize: 11, fontWeight: 600 }}>
                        {rec.difficulty}
                      </div>
                    </div>

                    {rec.source_citation && (
                      <p style={{ fontSize: 11, color: '#6B6454', fontStyle: 'italic', marginBottom: 14, fontFamily: M }}>
                        Source: {rec.source_citation}
                      </p>
                    )}

                    <button onClick={() => setError(`Goal added: ${rec.title}`)} aria-label={`Try: ${rec.title}`} style={{ padding: '9px 16px', borderRadius: 8, background: 'rgba(212,168,83,0.10)', border: '1px solid rgba(212,168,83,0.25)', color: '#D4A853', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: S, transition: 'background 150ms' }}>
                      I&apos;ll Try This →
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <NavTabBar active="insights" />
    </div>
  );
}
