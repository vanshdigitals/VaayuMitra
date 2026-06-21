'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { calculateFootprint } from '@/lib/api';
import { getDeviceId } from '@/lib/deviceId';
import { CarbonRing } from '@/components/ui/CarbonRing';
import {
  Bike, Car, Train, Bus, PersonStanding, Zap,
  MapPin, Users, Flame, Leaf, CheckCircle2, ChevronLeft,
} from 'lucide-react';

/* ─── Constants ─────────────────────────────────────────────────── */
const CITIES = ['Mumbai', 'Delhi', 'Bengaluru', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata', 'Ahmedabad'];

const LPG_OPTIONS = [
  { label: 'Half',  value: 0.5 },
  { label: '1',     value: 1   },
  { label: '1.5',   value: 1.5 },
  { label: '2+',    value: 2   },
];

const COMMUTE_MODES = [
  { id: '2_wheeler_petrol', Icon: Bike,           label: '2-Wheeler',   factor: '0.040 kg/km' },
  { id: 'car_petrol',       Icon: Car,            label: 'Car',          factor: '0.140 kg/km' },
  { id: 'metro',            Icon: Train,          label: 'Metro',        factor: '0.025 kg/km' },
  { id: 'auto_cng',         Icon: Zap,            label: 'Auto (CNG)',   factor: '0.108 kg/km' },
  { id: 'city_bus',         Icon: Bus,            label: 'Bus',          factor: '0.015 kg/km' },
  { id: 'walk_cycle',       Icon: PersonStanding, label: 'Walk / Cycle', factor: 'Zero CO₂' },
];

const DIET_OPTIONS = [
  { id: 'veg',              label: 'Vegetarian',              desc: 'No meat or fish' },
  { id: 'mostly_veg',       label: 'Mostly vegetarian',       desc: 'Eat eggs / dairy freely' },
  { id: 'non_veg',          label: 'Non-vegetarian',          desc: 'Eat meat occasionally' },
  { id: 'frequent_non_veg', label: 'Frequent non-vegetarian', desc: 'Meat most days' },
];

const GOAL_PCTS = [5, 10, 15, 20];

interface Footprint {
  annual_total_tco2e: number;
  annual_total_kgco2e: number;
  breakdown: { electricity_kg: number; lpg_kg: number; transport_kg: number; diet_kg: number };
  india_average_t: number;
  paris_target_t: number;
  is_below_paris_target: boolean;
  score_level: string;
}

import { DEMO_FOOTPRINT } from '@/lib/demo';

/* ─── Sub-components ─────────────────────────────────────────────── */
function LeafSpinner() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, padding: '60px 0', color: '#A09880' }}>
      <div style={{ animation: 'spinLeaf 2s linear infinite', color: '#5B9E6F' }}>
        <Leaf size={36} strokeWidth={1.5} />
      </div>
      <p style={{ fontSize: 15, letterSpacing: '-0.01em' }}>Crunching the numbers...</p>
      <p style={{ fontSize: 12, color: '#6B6454' }}>Using CEA v21.0 grid factor · India GHG Program data</p>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────── */
export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep]               = useState(1);
  const [loading, setLoading]         = useState(false);
  const [result, setResult]           = useState<Footprint | null>(null);
  const [city, setCity]               = useState('');
  const [customCity, setCustomCity]   = useState('');
  const [householdSize, setHouseholdSize] = useState(2);
  const [electricityBill, setElectricityBill] = useState('');
  const [lpg, setLpg]                 = useState(1);
  const [commuteMode, setCommuteMode] = useState('2_wheeler_petrol');
  const [dailyKm, setDailyKm]         = useState('');
  const [diet, setDiet]               = useState('veg');
  const [goalPct, setGoalPct]         = useState(10);

  const TOTAL_STEPS = 5;
  const F = "'Fraunces', Georgia, serif";
  const S = "'Cabinet Grotesk', 'DM Sans', system-ui, sans-serif";
  const M = "'JetBrains Mono', monospace";

  const inputStyle: React.CSSProperties = {
    background: '#1F1D16',
    border: '1px solid rgba(242,239,227,0.10)',
    borderRadius: 8, color: '#F2EFE3', fontSize: 15,
    padding: '13px 16px', width: '100%', fontFamily: S, outline: 'none',
    transition: 'border-color 150ms',
  };

  const chip = (active: boolean, accent = '#D4A853'): React.CSSProperties => ({
    padding: '13px 16px', borderRadius: 8, cursor: 'pointer', fontFamily: S,
    fontWeight: active ? 600 : 400, fontSize: 14, textAlign: 'left',
    border: `1px solid ${active ? `${accent}80` : 'rgba(242,239,227,0.08)'}`,
    background: active ? `${accent}18` : '#1F1D16',
    color: active ? accent : '#F2EFE3',
    transition: 'all 150ms',
  });

  async function handleCalculate() {
    setLoading(true);
    const finalCity = city === 'Other' ? customCity : city;
    try {
      const payload = {
        city: finalCity || 'India',
        household_size: householdSize,
        monthly_electricity_bill_inr: parseFloat(electricityBill) || 0,
        lpg_cylinders_per_month: lpg,
        commute_mode: commuteMode,
        daily_commute_km: parseFloat(dailyKm) || 0,
        commute_days_per_week: 5,
        diet_type: diet,
        device_id: getDeviceId(),
      };
      const data = await calculateFootprint(payload);
      const final = data ?? DEMO_FOOTPRINT;
      setResult(final);
      localStorage.setItem('vaayumitra_footprint', JSON.stringify(final));
      localStorage.setItem('vaayumitra_profile',   JSON.stringify(payload));
    } catch {
      setResult(DEMO_FOOTPRINT);
    } finally {
      setLoading(false);
    }
  }

  function handleNext() {
    if (step === 4) handleCalculate();
    setStep(s => Math.min(s + 1, TOTAL_STEPS));
  }

  const canContinue = step !== 1 || !!city;

  return (
    <div style={{ minHeight: '100dvh', background: '#111009', color: '#F2EFE3', fontFamily: S }}>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px 20px', minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>

        {/* ── Progress Header ──────────────────────────────── */}
        <header style={{ marginBottom: 44 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            {step > 1
              ? (
                <button onClick={() => setStep(s => s - 1)} aria-label="Go back" style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: '#A09880', cursor: 'pointer', fontSize: 14, fontFamily: S, padding: 0 }}>
                  <ChevronLeft size={16} strokeWidth={1.5} />
                  Back
                </button>
              ) : <div />}
            <span style={{ fontSize: 12, color: '#6B6454', fontFamily: M }}>
              {step} / {TOTAL_STEPS}
            </span>
          </div>
          {/* Segmented progress bar */}
          <div role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={TOTAL_STEPS} aria-label={`Step ${step} of ${TOTAL_STEPS}`} style={{ display: 'flex', gap: 6 }}>
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div key={i} style={{
                height: 3, flex: 1, borderRadius: 2,
                background: i < step ? '#D4A853' : 'rgba(242,239,227,0.08)',
                transition: 'background 300ms ease',
              }} />
            ))}
          </div>
        </header>

        <main style={{ flex: 1 }}>

          {/* ── Step 1 — City ───────────────────────────────── */}
          {step === 1 && (
            <section aria-labelledby="step1-h">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(212,168,83,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MapPin size={20} strokeWidth={1.5} color="#D4A853" />
                </div>
                <div>
                  <h1 id="step1-h" style={{ fontFamily: F, fontSize: 26, lineHeight: 1.2, letterSpacing: '-0.02em' }}>Which city are you in?</h1>
                  <p style={{ color: '#A09880', fontSize: 13, marginTop: 2 }}>Helps us use the right grid emission factor for your area.</p>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                {CITIES.map(c => (
                  <button key={c} onClick={() => setCity(c)} aria-pressed={city === c} style={chip(city === c)}>
                    {c}
                  </button>
                ))}
                <button onClick={() => setCity('Other')} aria-pressed={city === 'Other'} style={{ ...chip(city === 'Other'), color: city === 'Other' ? '#D4A853' : '#A09880' }}>
                  + Other city
                </button>
              </div>
              {city === 'Other' && (
                <input type="text" value={customCity} onChange={e => setCustomCity(e.target.value)} placeholder="Type your city..." aria-label="Enter city name" style={inputStyle} />
              )}
            </section>
          )}

          {/* ── Step 2 — Household ─────────────────────────── */}
          {step === 2 && (
            <section aria-labelledby="step2-h">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(212,168,83,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={20} strokeWidth={1.5} color="#D4A853" />
                </div>
                <div>
                  <h1 id="step2-h" style={{ fontFamily: F, fontSize: 26, lineHeight: 1.2, letterSpacing: '-0.02em' }}>Who shares your home?</h1>
                  <p style={{ color: '#A09880', fontSize: 13, marginTop: 2 }}>Splits energy and LPG costs across household members.</p>
                </div>
              </div>

              {/* Household size stepper */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6B6454', marginBottom: 10, fontWeight: 600 }}>
                  People in your home
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <button onClick={() => setHouseholdSize(s => Math.max(1, s - 1))} aria-label="Decrease" style={{ width: 44, height: 44, borderRadius: 8, background: '#1F1D16', border: '1px solid rgba(242,239,227,0.10)', color: '#F2EFE3', fontSize: 20, cursor: 'pointer', fontFamily: S }}>−</button>
                  <span aria-live="polite" style={{ fontFamily: F, fontSize: 36, fontWeight: 600, minWidth: 48, textAlign: 'center', letterSpacing: '-0.02em' }}>{householdSize}</span>
                  <button onClick={() => setHouseholdSize(s => Math.min(20, s + 1))} aria-label="Increase" style={{ width: 44, height: 44, borderRadius: 8, background: '#1F1D16', border: '1px solid rgba(242,239,227,0.10)', color: '#F2EFE3', fontSize: 20, cursor: 'pointer', fontFamily: S }}>+</button>
                </div>
              </div>

              {/* Electricity bill */}
              <div style={{ marginBottom: 24 }}>
                <label htmlFor="elec-bill" style={{ display: 'block', fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6B6454', marginBottom: 8, fontWeight: 600 }}>
                  Monthly Electricity Bill (₹)
                </label>
                <input id="elec-bill" type="number" min={0} value={electricityBill} onChange={e => setElectricityBill(e.target.value)} placeholder="e.g. 800" style={inputStyle} />
                <p style={{ fontSize: 11, color: '#6B6454', marginTop: 6, fontFamily: M }}>~₹6.5/unit · Grid: 0.71 kgCO₂/kWh (CEA v21.0)</p>
              </div>

              {/* LPG */}
              <div>
                <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6B6454', marginBottom: 8, fontWeight: 600 }}>
                  LPG Cylinders Per Month
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {LPG_OPTIONS.map(opt => (
                    <button key={opt.value} onClick={() => setLpg(opt.value)} aria-pressed={lpg === opt.value} style={{ flex: 1, padding: '13px 0', borderRadius: 8, border: `1px solid ${lpg === opt.value ? 'rgba(224,134,69,0.6)' : 'rgba(242,239,227,0.08)'}`, background: lpg === opt.value ? 'rgba(224,134,69,0.14)' : '#1F1D16', color: lpg === opt.value ? '#E08645' : '#F2EFE3', fontWeight: lpg === opt.value ? 700 : 400, fontSize: 14, cursor: 'pointer', fontFamily: S, transition: 'all 150ms' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                        <Flame size={13} strokeWidth={1.5} />
                        {opt.label}
                      </div>
                    </button>
                  ))}
                </div>
                <p style={{ fontSize: 11, color: '#6B6454', marginTop: 6, fontFamily: M }}>14.2 kg cylinder = {(lpg * 42.36).toFixed(1)} kg CO₂ · Source: IPCC 2006</p>
              </div>
            </section>
          )}

          {/* ── Step 3 — Commute ─────────────────────────────── */}
          {step === 3 && (
            <section aria-labelledby="step3-h">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(90,158,209,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bike size={20} strokeWidth={1.5} color="#5A9ED1" />
                </div>
                <div>
                  <h1 id="step3-h" style={{ fontFamily: F, fontSize: 26, lineHeight: 1.2, letterSpacing: '-0.02em' }}>How do you get around?</h1>
                  <p style={{ color: '#A09880', fontSize: 13, marginTop: 2 }}>Select your primary commute mode.</p>
                </div>
              </div>

              <div role="radiogroup" aria-label="Commute mode" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 24 }}>
                {COMMUTE_MODES.map(({ id, Icon, label, factor }) => {
                  const active = commuteMode === id;
                  return (
                    <button key={id} onClick={() => setCommuteMode(id)} aria-pressed={active} aria-label={`${label}: ${factor}`} style={{ padding: '16px 8px', borderRadius: 12, background: active ? 'rgba(90,158,209,0.12)' : '#1C1A14', border: `1px solid ${active ? 'rgba(90,158,209,0.50)' : 'rgba(242,239,227,0.08)'}`, color: active ? '#5A9ED1' : '#F2EFE3', cursor: 'pointer', textAlign: 'center', transition: 'all 150ms', fontFamily: S }}>
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
                        <Icon size={22} strokeWidth={active ? 2 : 1.5} />
                      </div>
                      <div style={{ fontSize: 12, fontWeight: active ? 600 : 400 }}>{label}</div>
                      <div style={{ fontSize: 10, color: '#6B6454', marginTop: 3, fontFamily: M }}>{factor}</div>
                    </button>
                  );
                })}
              </div>

              <div>
                <label htmlFor="daily-km" style={{ display: 'block', fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6B6454', marginBottom: 8, fontWeight: 600 }}>
                  Daily Commute Distance (km each way)
                </label>
                <input id="daily-km" type="number" min={0} value={dailyKm} onChange={e => setDailyKm(e.target.value)} placeholder="e.g. 12" style={inputStyle} />
              </div>
            </section>
          )}

          {/* ── Step 4 — Diet ────────────────────────────────── */}
          {step === 4 && (
            <section aria-labelledby="step4-h">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(123,196,122,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Leaf size={20} strokeWidth={1.5} color="#7BC47A" />
                </div>
                <div>
                  <h1 id="step4-h" style={{ fontFamily: F, fontSize: 26, lineHeight: 1.2, letterSpacing: '-0.02em' }}>What describes your diet?</h1>
                  <p style={{ color: '#A09880', fontSize: 13, marginTop: 2 }}>Source: Pathak et al. 2010, ICAR-IARI</p>
                </div>
              </div>

              <div role="radiogroup" aria-label="Diet type" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {DIET_OPTIONS.map(d => {
                  const active = diet === d.id;
                  return (
                    <button key={d.id} onClick={() => setDiet(d.id)} aria-pressed={active} style={{ padding: 16, borderRadius: 12, background: active ? 'rgba(123,196,122,0.08)' : '#1C1A14', border: `1px solid ${active ? 'rgba(123,196,122,0.45)' : 'rgba(242,239,227,0.08)'}`, cursor: 'pointer', textAlign: 'left', transition: 'all 150ms', fontFamily: S }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {/* Radio dot */}
                        <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${active ? '#7BC47A' : 'rgba(242,239,227,0.28)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {active && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#7BC47A' }} />}
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: active ? '#7BC47A' : '#F2EFE3' }}>{d.label}</div>
                          <div style={{ fontSize: 12, color: '#6B6454', marginTop: 1 }}>{d.desc}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* ── Step 5 — Results ─────────────────────────────── */}
          {step === 5 && (
            <section aria-labelledby="step5-h">
              <h1 id="step5-h" style={{ fontFamily: F, fontSize: 26, lineHeight: 1.2, letterSpacing: '-0.02em', marginBottom: 6 }}>
                {loading ? 'Calculating your footprint...' : 'Your footprint is ready'}
              </h1>

              {loading && <LeafSpinner />}

              {result && !loading && (
                <>
                  <p style={{ color: '#A09880', fontSize: 14, marginBottom: 28 }}>Your estimated annual carbon footprint</p>

                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                    <CarbonRing score={result.annual_total_tco2e} maxScore={2.5} size={168} animated aria-label={`Your footprint: ${result.annual_total_tco2e.toFixed(2)} tCO₂e per year`} />
                  </div>

                  {/* Status banner */}
                  <div style={{ background: result.is_below_paris_target ? 'rgba(91,158,111,0.10)' : 'rgba(224,134,69,0.10)', border: `1px solid ${result.is_below_paris_target ? 'rgba(91,158,111,0.25)' : 'rgba(224,134,69,0.25)'}`, borderRadius: 12, padding: 14, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <CheckCircle2 size={16} strokeWidth={1.5} color={result.is_below_paris_target ? '#5B9E6F' : '#E08645'} />
                    <div style={{ fontSize: 13, color: result.is_below_paris_target ? '#5B9E6F' : '#E08645' }}>
                      {result.is_below_paris_target
                        ? 'Below the Paris 1.5°C target — you\'re already doing well.'
                        : `${(result.annual_total_tco2e - 2.5).toFixed(2)}t above the Paris target.`}
                    </div>
                  </div>

                  {/* Goal selector */}
                  <div>
                    <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6B6454', marginBottom: 10, fontWeight: 600 }}>
                      I want to reduce my footprint by
                    </label>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      {GOAL_PCTS.map(p => (
                        <button key={p} onClick={() => setGoalPct(p)} aria-pressed={goalPct === p} style={{ flex: 1, padding: '13px 0', borderRadius: 8, border: `1px solid ${goalPct === p ? 'rgba(212,168,83,0.6)' : 'rgba(242,239,227,0.08)'}`, background: goalPct === p ? 'rgba(212,168,83,0.15)' : '#1F1D16', color: goalPct === p ? '#D4A853' : '#F2EFE3', fontWeight: goalPct === p ? 700 : 400, fontSize: 14, cursor: 'pointer', fontFamily: S, transition: 'all 150ms' }}>
                          {p}%
                        </button>
                      ))}
                    </div>
                    <p style={{ fontSize: 12, color: '#6B6454', fontFamily: M }}>
                      Target: {(result.annual_total_tco2e * (1 - goalPct / 100)).toFixed(2)} t/yr in 3 months
                    </p>
                  </div>
                </>
              )}
            </section>
          )}
        </main>

        {/* ── Footer CTA ──────────────────────────────────── */}
        <div style={{ paddingTop: 28, paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}>
          {step < 5 ? (
            <button onClick={handleNext} disabled={!canContinue} aria-label={step === 4 ? 'Calculate my footprint' : 'Continue'} style={{ width: '100%', padding: 17, borderRadius: 8, background: canContinue ? '#D4A853' : 'rgba(212,168,83,0.28)', color: '#111009', fontWeight: 700, fontSize: 16, border: 'none', cursor: canContinue ? 'pointer' : 'not-allowed', fontFamily: S, letterSpacing: '-0.01em', transition: 'background 150ms' }}>
              {step === 4 ? 'Calculate My Footprint →' : 'Continue →'}
            </button>
          ) : result && !loading ? (
            <button onClick={() => router.push('/dashboard')} aria-label="See my dashboard" style={{ width: '100%', padding: 17, borderRadius: 8, background: '#D4A853', color: '#111009', fontWeight: 700, fontSize: 16, border: 'none', cursor: 'pointer', fontFamily: S, letterSpacing: '-0.01em' }}>
              See My Dashboard →
            </button>
          ) : null}
        </div>

      </div>
    </div>
  );
}
