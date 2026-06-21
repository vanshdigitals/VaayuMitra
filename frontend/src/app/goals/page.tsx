'use client';

import { useState, useEffect } from 'react';
import { NavTabBar, AppHeader } from '@/components/ui/Navigation';
import { Target, TrendingDown, CheckCircle2, Plus, Trash2, Leaf } from 'lucide-react';

const S = "'Cabinet Grotesk', 'DM Sans', system-ui, sans-serif";
const F = "'Fraunces', Georgia, serif";
const M = "'JetBrains Mono', monospace";

interface Goal {
  id: string;
  title: string;
  targetKg: number;
  currentKg: number;
  createdAt: string;
  category: 'transport' | 'energy' | 'food' | 'general';
}

const CATEGORY_COLOR: Record<string, string> = {
  transport: '#5A9ED1',
  energy: '#D4A853',
  food: '#7BC47A',
  general: '#A09880',
};

const SUGGESTED_GOALS = [
  { title: 'Switch to Metro 2 days/week', targetKg: 4.2, category: 'transport' as const },
  { title: 'Reduce AC usage by 2 hrs/day', targetKg: 3.8, category: 'energy' as const },
  { title: 'Go vegetarian on weekdays', targetKg: 5.5, category: 'food' as const },
  { title: 'Carpool to office 3x/week', targetKg: 6.0, category: 'transport' as const },
  { title: 'Cut 0.5 LPG cylinder/month', targetKg: 2.1, category: 'energy' as const },
];

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [footprintScore, setFootprintScore] = useState<number | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('vaayumitra_goals');
    if (stored) setGoals(JSON.parse(stored));

    const fp = JSON.parse(localStorage.getItem('vaayumitra_footprint') ?? 'null');
    if (fp) setFootprintScore(fp.annual_total_tco2e);
  }, []);

  function addGoal(suggestion: typeof SUGGESTED_GOALS[number]) {
    const newGoal: Goal = {
      id: `goal_${Date.now()}`,
      title: suggestion.title,
      targetKg: suggestion.targetKg,
      currentKg: 0,
      createdAt: new Date().toISOString(),
      category: suggestion.category,
    };
    const updated = [...goals, newGoal];
    setGoals(updated);
    localStorage.setItem('vaayumitra_goals', JSON.stringify(updated));
  }

  function removeGoal(id: string) {
    const updated = goals.filter(g => g.id !== id);
    setGoals(updated);
    localStorage.setItem('vaayumitra_goals', JSON.stringify(updated));
  }

  const totalSavingsKg = goals.reduce((sum, g) => sum + g.targetKg, 0);
  const totalSavingsT = (totalSavingsKg * 12) / 1000;

  return (
    <div style={{ minHeight: '100dvh', background: '#111009', color: '#F2EFE3', fontFamily: S, paddingBottom: 76 }}>

      <AppHeader title="My Goals" backHref="/dashboard" backLabel="Dashboard" />

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '20px 16px' }}>

        {/* ── Impact Summary ─────────────────────────────────── */}
        {goals.length > 0 && (
          <section aria-labelledby="impact-h" style={{ background: '#1C1A14', border: '1px solid rgba(212,168,83,0.22)', borderRadius: 16, padding: 20, marginBottom: 20 }}>
            <h2 id="impact-h" style={{ fontSize: 11, color: '#6B6454', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 12 }}>
              Projected Impact
            </h2>
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: F, fontSize: 28, fontWeight: 700, color: '#5B9E6F', letterSpacing: '-0.02em' }}>
                  {totalSavingsKg.toFixed(1)}
                </div>
                <div style={{ fontSize: 12, color: '#A09880', marginTop: 2 }}>kg CO₂ saved/month</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: F, fontSize: 28, fontWeight: 700, color: '#D4A853', letterSpacing: '-0.02em' }}>
                  {totalSavingsT.toFixed(2)}
                </div>
                <div style={{ fontSize: 12, color: '#A09880', marginTop: 2 }}>tonnes saved/year</div>
              </div>
            </div>
            {footprintScore !== null && totalSavingsT > 0 && (
              <div style={{ marginTop: 14, padding: '10px 12px', background: 'rgba(91,158,111,0.10)', border: '1px solid rgba(91,158,111,0.18)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle2 size={14} strokeWidth={1.5} color="#5B9E6F" />
                <span style={{ fontSize: 13, color: '#5B9E6F' }}>
                  New footprint: {(footprintScore - totalSavingsT).toFixed(2)} t/yr
                  {footprintScore - totalSavingsT < 2.5 ? ' ✓ Below Paris target' : ''}
                </span>
              </div>
            )}
          </section>
        )}

        {/* ── Active Goals ──────────────────────────────────── */}
        {goals.length > 0 && (
          <section aria-labelledby="active-h" style={{ marginBottom: 24 }}>
            <h2 id="active-h" style={{ fontSize: 11, color: '#6B6454', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 12 }}>
              Active Goals ({goals.length})
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {goals.map((goal) => {
                const color = CATEGORY_COLOR[goal.category];
                return (
                  <div
                    key={goal.id}
                    style={{ background: '#1C1A14', border: `1px solid rgba(242,239,227,0.08)`, borderRadius: 14, padding: '16px 20px' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />
                          <span style={{ fontSize: 11, color, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {goal.category}
                          </span>
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{goal.title}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#5B9E6F' }}>
                          <TrendingDown size={13} strokeWidth={2} />
                          <span style={{ fontFamily: M, fontWeight: 600 }}>{goal.targetKg} kg</span>
                          <span style={{ color: '#6B6454' }}>saved/month</span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeGoal(goal.id)}
                        aria-label={`Remove goal: ${goal.title}`}
                        style={{ background: 'rgba(209,90,74,0.10)', border: '1px solid rgba(209,90,74,0.20)', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#D15A4A', flexShrink: 0 }}
                      >
                        <Trash2 size={14} strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Suggested Goals ───────────────────────────────── */}
        <section aria-labelledby="suggest-h">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <Target size={14} strokeWidth={1.5} color="#D4A853" />
            <h2 id="suggest-h" style={{ fontSize: 11, color: '#6B6454', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>
              Suggested Goals
            </h2>
          </div>

          {goals.length === 0 && (
            <div style={{ textAlign: 'center', padding: '28px 20px', marginBottom: 16 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(212,168,83,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <Leaf size={24} strokeWidth={1.5} color="#D4A853" />
              </div>
              <p style={{ fontSize: 14, color: '#A09880', lineHeight: 1.6 }}>
                Add goals below to track your reduction journey
              </p>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {SUGGESTED_GOALS.map((s) => {
              const alreadyAdded = goals.some(g => g.title === s.title);
              const color = CATEGORY_COLOR[s.category];
              return (
                <div
                  key={s.title}
                  style={{ background: '#1C1A14', border: '1px solid rgba(242,239,227,0.08)', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
                      <div style={{ width: 5, height: 5, borderRadius: '50%', background: color }} />
                      <span style={{ fontSize: 10, color, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.category}</span>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{s.title}</div>
                    <div style={{ fontSize: 12, color: '#5B9E6F', fontFamily: M }}>−{s.targetKg} kg CO₂/month</div>
                  </div>
                  <button
                    id={`add-goal-${s.title.replace(/\s+/g, '-').toLowerCase()}`}
                    onClick={() => !alreadyAdded && addGoal(s)}
                    disabled={alreadyAdded}
                    aria-label={alreadyAdded ? `${s.title} already added` : `Add goal: ${s.title}`}
                    style={{
                      padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                      border: `1px solid ${alreadyAdded ? 'rgba(91,158,111,0.35)' : 'rgba(212,168,83,0.35)'}`,
                      background: alreadyAdded ? 'rgba(91,158,111,0.10)' : 'rgba(212,168,83,0.10)',
                      color: alreadyAdded ? '#5B9E6F' : '#D4A853',
                      cursor: alreadyAdded ? 'not-allowed' : 'pointer',
                      fontFamily: S, display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0,
                      transition: 'all 150ms',
                    }}
                  >
                    {alreadyAdded ? <CheckCircle2 size={13} strokeWidth={2} /> : <Plus size={13} strokeWidth={2.5} />}
                    {alreadyAdded ? 'Added' : 'Add'}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

      </div>

      <NavTabBar active="goals" />
    </div>
  );
}
