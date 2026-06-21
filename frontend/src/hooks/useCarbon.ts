'use client';

/**
 * Central async state hook for carbon footprint data.
 *
 * Single source of truth for profile, result, and insights across all pages.
 * Hydrates from localStorage on mount. Caches AI insights in sessionStorage
 * to prevent duplicate API calls when navigating between Dashboard and Insights.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { getDeviceId } from '@/lib/deviceId';
import { calculateFootprint, getInsights, listEntries, saveEntry } from '@/lib/api';
import type {
  CalculateRequest,
  CalculateResponse,
  Entry,
  InsightsResponse,
} from '@/lib/types';

const INSIGHTS_CACHE_KEY = 'vaayumitra_insights_cache';

export interface UseCarbonReturn {
  profile: CalculateRequest | null;
  result: CalculateResponse | null;
  insights: InsightsResponse | null;
  entries: Entry[];
  loading: boolean;
  insightsLoading: boolean;
  savingEntry: boolean;
  error: string | null;
  /** ARIA live-region message for accessible async announcements */
  statusMsg: string;
  calculate: (req: CalculateRequest) => Promise<void>;
  fetchInsights: (req: CalculateRequest) => Promise<void>;
  persistEntry: () => Promise<void>;
  clearError: () => void;
}

export function useCarbon(): UseCarbonReturn {
  const deviceId = useRef(getDeviceId());

  const [profile, setProfile] = useState<CalculateRequest | null>(null);
  const [result, setResult] = useState<CalculateResponse | null>(null);
  const [insights, setInsights] = useState<InsightsResponse | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [savingEntry, setSavingEntry] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState('');

  // Hydrate from localStorage on mount (client-only)
  useEffect(() => {
    try {
      const p = localStorage.getItem('vaayumitra_profile');
      const r = localStorage.getItem('vaayumitra_footprint');
      if (p) setProfile(JSON.parse(p) as CalculateRequest);
      if (r) setResult(JSON.parse(r) as CalculateResponse);
    } catch {
      // ignore malformed localStorage data
    }
  }, []);

  // Load entry history on mount; non-critical, fail silently
  useEffect(() => {
    listEntries(deviceId.current)
      .then(setEntries)
      .catch(() => {});
  }, []);

  const calculate = useCallback(async (req: CalculateRequest): Promise<void> => {
    setLoading(true);
    setError(null);
    setStatusMsg('Calculating your footprint…');
    try {
      const calcResult = await calculateFootprint(req);
      setResult(calcResult);
      setProfile(req);
      localStorage.setItem('vaayumitra_footprint', JSON.stringify(calcResult));
      localStorage.setItem('vaayumitra_profile', JSON.stringify(req));
      sessionStorage.removeItem(INSIGHTS_CACHE_KEY);
      setStatusMsg(`Footprint: ${calcResult.annual_total_tco2e.toFixed(2)} t CO₂e/yr`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Calculation failed';
      setError(msg);
      setStatusMsg('');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchInsights = useCallback(async (req: CalculateRequest): Promise<void> => {
    // Serve from sessionStorage cache to avoid duplicate AI calls between pages
    try {
      const cached = sessionStorage.getItem(INSIGHTS_CACHE_KEY);
      if (cached) {
        setInsights(JSON.parse(cached) as InsightsResponse);
        return;
      }
    } catch {
      // ignore cache read errors
    }

    setInsightsLoading(true);
    try {
      const data = await getInsights(req);
      setInsights(data);
      sessionStorage.setItem(INSIGHTS_CACHE_KEY, JSON.stringify(data));
    } catch {
      // Insights are non-critical; caller renders fallback UI
    } finally {
      setInsightsLoading(false);
    }
  }, []);

  const persistEntry = useCallback(async (): Promise<void> => {
    if (!profile || !result) return;
    setSavingEntry(true);
    setError(null);
    try {
      await saveEntry({ device_id: deviceId.current, profile, result });
      const updated = await listEntries(deviceId.current);
      setEntries(updated);
      setStatusMsg('Entry saved to history');
    } catch {
      setError('Could not save entry — please try again');
    } finally {
      setSavingEntry(false);
    }
  }, [profile, result]);

  const clearError = useCallback(() => setError(null), []);

  return {
    profile, result, insights, entries,
    loading, insightsLoading, savingEntry,
    error, statusMsg,
    calculate, fetchInsights, persistEntry, clearError,
  };
}
