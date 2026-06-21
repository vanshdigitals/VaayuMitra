'use client';

import { useState } from 'react';
import { calculateFootprint, saveEntry } from '@/lib/api';
import { getDeviceId } from '@/lib/deviceId';
import { NavTabBar, AppHeader } from '@/components/ui/Navigation';
import {
  Bike, Car, Train, Bus, PersonStanding, Zap,
  Leaf, Flame, TrendingDown, Plus, CheckCircle2,
} from 'lucide-react';
import type { CalculateRequest, CommuteModeType } from '@/lib/types';

/* ─── Constants ─────────────────────────────────────────────────── */
const TRANSPORT_MODES = [
  { id: '2_wheeler_petrol', Icon: Bike,           label: '2-Wheeler', factor: 0.040, unit: 'kg/km' },
  { id: 'car_petrol',       Icon: Car,            label: 'Car',       factor: 0.140, unit: 'kg/km' },
  { id: 'metro',            Icon: Train,          label: 'Metro',     factor: 0.025, unit: 'kg/km' },
  { id: 'auto_cng',         Icon: Zap,            label: 'Auto',      factor: 0.108, unit: 'kg/km' },
  { id: 'city_bus',         Icon: Bus,            label: 'Bus',       factor: 0.015, unit: 'kg/km' },
  { id: 'walk_cycle',       Icon: PersonStanding, label: 'Walk',      factor: 0.000, unit: 'Zero'   },
];

const FOOD_PRESETS = [
  { id: 'thali',     label: 'Veg Thali',    kg: 0.18, veg: true  },
  { id: 'roti-dal',  label: 'Roti + Dal',   kg: 0.14, veg: true  },
  { id: 'rice-sabzi',label: 'Rice + Sabzi', kg: 0.16, veg: true  },
  { id: 'eggs',      label: 'Eggs',         kg: 0.22, veg: false },
  { id: 'chicken',   label: 'Chicken',      kg: 0.35, veg: false },
  { id: 'paneer',    label: 'Paneer',       kg: 0.20, veg: false },
];

const LPG_OPTIONS = [
  { label: 'Half', value: 0.5 },
  { label: '1',    value: 1   },
  { label: '1.5',  value: 1.5 },
  { label: '2+',   value: 2   },
];

type TabId = 'transport' | 'food' | 'energy';

const TAB_META: { id: TabId; Icon: React.ElementType; label: string; color: string }[] = [
  { id: 'transport', Icon: Bike,  label: 'Transport', color: '#5A9ED1' },
  { id: 'food',      Icon: Leaf,  label: 'Food',      color: '#7BC47A' },
  { id: 'energy',    Icon: Zap,   label: 'Energy',    color: '#D4A853' },
];

/* ─── Page ───────────────────────────────────────────────────────── */
export default function TrackPage() {
  const [tab,             setTab]             = useState<TabId>('transport');
  const [mode,            setMode]            = useState('2_wheeler_petrol');
  const [km,              setKm]              = useState('');
  const [foodSelected,    setFoodSelected]    = useState('thali');
  const [electricityBill, setElectricityBill] = useState('');
  const [lpg,             setLpg]             = useState(1);
  const [saving,          setSaving]          = useState(false);
  const [success,         setSuccess]         = useState<string | null>(null);
  const [error,           setError]           = useState<string | null>(null);

  const S = "'Cabinet Grotesk', 'DM Sans', system-ui, sans-serif";
  const F = "'Fraunces', Georgia, serif";
  const M = "'JetBrains Mono', monospace";

  const selectedMeta  = TRANSPORT_MODES.find(m => m.id === mode);
  const liveKg        = selectedMeta && km ? (parseFloat(km) * 2 * selectedMeta.factor).toFixed(2) : '0.00';
  const selectedFood  = FOOD_PRESETS.find(f => f.id === foodSelected);
  const kwh           = electricityBill ? (parseFloat(electricityBill) / 6.5).toFixed(0) : null;
  const elecCo2       = kwh ? (parseFloat(kwh) * 0.71).toFixed(1) : null;
  const activeTab     = TAB_META.find(t => t.id === tab)!;

  const baseProfile = (): CalculateRequest => {
    try { return JSON.parse(localStorage.getItem('vaayumitra_profile') ?? '{}') as CalculateRequest; }
    catch { return { city: 'India' }; }
  };

  const handleSave = async (overrides: Partial<CalculateRequest>, label: string) => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const base = baseProfile();
      const profile: CalculateRequest = { ...base, city: base.city || 'India', ...overrides };
      const result = await calculateFootprint(profile);
      await saveEntry({ device_id: getDeviceId(), profile, result });
      sessionStorage.removeItem('vaayumitra_insights_cache');
      setSuccess(label);
    } catch {
      setError('Could not save entry — please try again');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    background: '#1F1D16', border: '1px solid rgba(242,239,227,0.10)',
    borderRadius: 8, color: '#F2EFE3', fontSize: 15,
    padding: '13px 16px', width: '100%', fontFamily: S, outline: 'none',
  };

  return (
    <div style={{ minHeight: '100dvh', background: '#111009', color: '#F2EFE3', fontFamily: S, paddingBottom: 76 }}>

      {/* ── Header ─────────────────────────────────────────── */}
      <AppHeader
        title="Today's Log"
        backHref="/dashboard"
        backLabel="Dashboard"
        rightSlot={
          <span style={{ fontSize: 12, color: '#6B6454', fontFamily: M }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
          </span>
        }
      />

      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        {success && (
          <div role="status" aria-live="polite" style={{ background: 'rgba(91,158,111,0.10)', border: '1px solid rgba(91,158,111,0.25)', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8, margin: '16px 16px 0 16px' }}>
            <CheckCircle2 size={15} strokeWidth={2} color="#5B9E6F" />
            <span style={{ fontSize: 13, color: '#5B9E6F', flex: 1 }}>{success}</span>
            <button onClick={() => setSuccess(null)} style={{ background: 'none', border: 'none', color: '#5B9E6F', cursor: 'pointer' }}>✕</button>
          </div>
        )}
        {error && (
          <div role="alert" style={{ background: 'rgba(209,90,74,0.10)', border: '1px solid rgba(209,90,74,0.25)', borderRadius: 12, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '16px 16px 0 16px' }}>
            <span style={{ fontSize: 13, color: '#D15A4A' }}>{error}</span>
            <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', color: '#D15A4A', cursor: 'pointer' }}>✕</button>
          </div>
        )}

        {/* ── Category Tab Bar ──────────────────────────────── */}
        <div role="tablist" aria-label="Activity categories" style={{ display: 'flex', borderBottom: '1px solid rgba(242,239,227,0.08)', padding: '0 16px' }}>
          {TAB_META.map(({ id, Icon, label, color }) => {
            const active = tab === id;
            return (
              <button key={id} role="tab" id={`tab-${id}`} aria-selected={active} aria-controls={`panel-${id}`} onClick={() => setTab(id)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '14px 16px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: active ? 700 : 400, color: active ? color : '#6B6454', borderBottom: `2px solid ${active ? color : 'transparent'}`, marginBottom: -1, transition: 'all 150ms', fontFamily: S }}>
                <Icon size={14} strokeWidth={active ? 2 : 1.5} />
                {label}
              </button>
            );
          })}
        </div>

        <div style={{ padding: '24px 16px' }}>

          {/* ── Transport Panel ───────────────────────────── */}
          {tab === 'transport' && (
            <section id="panel-transport" role="tabpanel" aria-labelledby="tab-transport">
              <h2 style={{ fontFamily: F, fontSize: 20, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 4 }}>
                How did you commute today?
              </h2>
              <p style={{ fontSize: 12, color: '#6B6454', marginBottom: 20, fontFamily: M }}>
                Source: India GHG Program v1.0, WRI/TERI/CII 2015
              </p>

              <div role="radiogroup" aria-label="Commute mode" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 20 }}>
                {TRANSPORT_MODES.map(({ id, Icon, label, factor, unit }) => {
                  const active = mode === id;
                  return (
                    <button key={id} onClick={() => setMode(id)} aria-pressed={active} aria-label={`${label}: ${factor === 0 ? 'Zero CO₂' : `${factor} kg/km`}`} style={{ padding: '14px 8px', borderRadius: 12, background: active ? 'rgba(90,158,209,0.12)' : '#1C1A14', border: `1px solid ${active ? 'rgba(90,158,209,0.50)' : 'rgba(242,239,227,0.08)'}`, color: active ? '#5A9ED1' : '#F2EFE3', cursor: 'pointer', textAlign: 'center', transition: 'all 150ms', fontFamily: S }}>
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
                        <Icon size={20} strokeWidth={active ? 2 : 1.5} />
                      </div>
                      <div style={{ fontSize: 11, fontWeight: active ? 600 : 400 }}>{label}</div>
                      <div style={{ fontSize: 9, color: '#6B6454', marginTop: 3, fontFamily: M }}>
                        {factor === 0 ? unit : `${factor}`}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div style={{ marginBottom: 20 }}>
                <label htmlFor="km-input" style={{ display: 'block', fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6B6454', marginBottom: 8, fontWeight: 600 }}>
                  Distance (km each way)
                </label>
                <input id="km-input" type="number" min={0} value={km} onChange={e => setKm(e.target.value)} placeholder="e.g. 12" style={inputStyle} />
              </div>

              {/* Live CO₂ estimate */}
              <div role="status" aria-live="polite" aria-label={`Live estimate: ${liveKg} kg CO₂`} style={{ padding: 16, borderRadius: 12, background: 'rgba(90,158,209,0.07)', border: '1px solid rgba(90,158,209,0.18)', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#5A9ED1', marginBottom: 6, fontWeight: 600 }}>
                  <TrendingDown size={12} strokeWidth={2} />
                  LIVE CO₂ ESTIMATE
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{ fontFamily: F, fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em' }}>{liveKg}</span>
                  <span style={{ fontSize: 14, color: '#A09880' }}>kg CO₂</span>
                </div>
                <div style={{ fontSize: 11, color: '#6B6454', marginTop: 4, fontFamily: M }}>
                  {selectedMeta?.factor} × {km || '0'} km × 2 (round trip)
                </div>
              </div>

              <button
                onClick={() => handleSave({ commute_mode: mode as CommuteModeType, daily_commute_km: parseFloat(km) || 0 }, `Transport logged — ${liveKg} kg CO₂`)}
                disabled={saving || !km}
                aria-label="Add transport entry"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 15, borderRadius: 8, background: saving ? 'rgba(90,158,209,0.4)' : '#5A9ED1', color: '#111009', fontWeight: 700, fontSize: 15, border: 'none', cursor: saving || !km ? 'not-allowed' : 'pointer', fontFamily: S, opacity: !km ? 0.5 : 1 }}
              >
                <Plus size={16} strokeWidth={2.5} />
                {saving ? 'Saving…' : 'Add Transport Entry'}
              </button>
            </section>
          )}

          {/* ── Food Panel ────────────────────────────────── */}
          {tab === 'food' && (
            <section id="panel-food" role="tabpanel" aria-labelledby="tab-food">
              <h2 style={{ fontFamily: F, fontSize: 20, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 4 }}>
                What did you eat today?
              </h2>
              <p style={{ fontSize: 12, color: '#6B6454', marginBottom: 20, fontFamily: M }}>
                Source: Pathak et al. 2010, ICAR-IARI
              </p>

              <div role="radiogroup" aria-label="Meal type" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
                {FOOD_PRESETS.map(f => {
                  const active = foodSelected === f.id;
                  return (
                    <button key={f.id} onClick={() => setFoodSelected(f.id)} aria-pressed={active} style={{ padding: 14, borderRadius: 12, background: active ? 'rgba(123,196,122,0.10)' : '#1C1A14', border: `1px solid ${active ? 'rgba(123,196,122,0.45)' : 'rgba(242,239,227,0.08)'}`, color: active ? '#7BC47A' : '#F2EFE3', cursor: 'pointer', textAlign: 'left', transition: 'all 150ms', fontFamily: S }}>
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{f.label}</div>
                      <div style={{ fontSize: 11, color: '#6B6454', fontFamily: M }}>{f.kg} kg CO₂</div>
                      {f.veg && <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: '#5B9E6F', marginTop: 4 }}><Leaf size={10} strokeWidth={1.5} />Veg</div>}
                    </button>
                  );
                })}
              </div>

              {/* CO₂ estimate */}
              <div role="status" aria-live="polite" style={{ padding: 16, borderRadius: 12, background: 'rgba(123,196,122,0.07)', border: '1px solid rgba(123,196,122,0.18)', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#7BC47A', marginBottom: 6, fontWeight: 600 }}>
                  <Leaf size={12} strokeWidth={1.5} />
                  CO₂ ESTIMATE
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{ fontFamily: F, fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em' }}>{selectedFood?.kg}</span>
                  <span style={{ fontSize: 14, color: '#A09880' }}>kg CO₂</span>
                </div>
                {selectedFood?.veg && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#5B9E6F', marginTop: 6 }}>
                    <Leaf size={11} strokeWidth={1.5} />
                    Vegetarian choice — lower impact
                  </div>
                )}
              </div>

              <button
                onClick={() => handleSave({ diet_type: selectedFood?.veg ? 'veg' : 'non_veg' }, `Meal logged — ${selectedFood?.kg} kg CO₂`)}
                disabled={saving}
                aria-label="Add meal entry"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 15, borderRadius: 8, background: saving ? 'rgba(123,196,122,0.4)' : '#7BC47A', color: '#111009', fontWeight: 700, fontSize: 15, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: S }}
              >
                <Plus size={16} strokeWidth={2.5} />
                {saving ? 'Saving…' : 'Add Meal Entry'}
              </button>
            </section>
          )}

          {/* ── Energy Panel ──────────────────────────────── */}
          {tab === 'energy' && (
            <section id="panel-energy" role="tabpanel" aria-labelledby="tab-energy">
              <h2 style={{ fontFamily: F, fontSize: 20, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 4 }}>
                Monthly Energy Usage
              </h2>
              <p style={{ fontSize: 12, color: '#6B6454', marginBottom: 20, fontFamily: M }}>
                Log once a month for accuracy
              </p>

              {/* Electricity */}
              <div style={{ marginBottom: 20 }}>
                <label htmlFor="energy-bill" style={{ display: 'block', fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6B6454', marginBottom: 8, fontWeight: 600 }}>
                  Monthly Electricity Bill (₹)
                </label>
                <input id="energy-bill" type="number" min={0} value={electricityBill} onChange={e => setElectricityBill(e.target.value)} placeholder="e.g. 800" style={inputStyle} />
                {kwh && (
                  <div role="status" aria-live="polite" style={{ fontSize: 12, color: '#D4A853', marginTop: 8, fontFamily: M }}>
                    ≈ {kwh} kWh → {elecCo2} kg CO₂/month
                  </div>
                )}
                <p style={{ fontSize: 11, color: '#6B6454', marginTop: 4, fontFamily: M }}>
                  Grid: 0.71 kgCO₂/kWh · CEA v21.0, FY2024-25
                </p>
              </div>

              {/* LPG */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6B6454', marginBottom: 8, fontWeight: 600 }}>
                  LPG Cylinders This Month
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {LPG_OPTIONS.map(opt => (
                    <button key={opt.value} onClick={() => setLpg(opt.value)} aria-pressed={lpg === opt.value} style={{ flex: 1, padding: '13px 0', borderRadius: 8, border: `1px solid ${lpg === opt.value ? 'rgba(224,134,69,0.6)' : 'rgba(242,239,227,0.08)'}`, background: lpg === opt.value ? 'rgba(224,134,69,0.14)' : '#1F1D16', color: lpg === opt.value ? '#E08645' : '#F2EFE3', fontWeight: lpg === opt.value ? 700 : 400, fontSize: 14, cursor: 'pointer', fontFamily: S, transition: 'all 150ms' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                        <Flame size={12} strokeWidth={1.5} />
                        {opt.label}
                      </div>
                    </button>
                  ))}
                </div>
                <p style={{ fontSize: 11, color: '#6B6454', marginTop: 6, fontFamily: M }}>
                  14.2 kg × 2.983 = {(lpg * 42.36).toFixed(1)} kg CO₂ · IPCC 2006
                </p>
              </div>

              <button
                onClick={() => handleSave({ monthly_electricity_bill_inr: parseFloat(electricityBill) || 0, lpg_cylinders_per_month: lpg }, `Energy logged — ${elecCo2 ?? '0'} kg CO₂ (electricity)`)}
                disabled={saving}
                aria-label="Update monthly energy"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 15, borderRadius: 8, background: saving ? 'rgba(212,168,83,0.4)' : '#D4A853', color: '#111009', fontWeight: 700, fontSize: 15, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: S }}
              >
                <Plus size={16} strokeWidth={2.5} />
                {saving ? 'Saving…' : 'Update Monthly Energy'}
              </button>
            </section>
          )}
        </div>
      </div>

      <NavTabBar active="track" />
    </div>
  );
}
