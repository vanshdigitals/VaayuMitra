import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { calculateFootprint, getInsights, healthCheck, saveEntry, listEntries } from './api';
import type { CalculateRequest, CalculateResponse } from './types';

const MOCK_PROFILE: CalculateRequest = {
  city: 'Mumbai',
  household_size: 2,
  monthly_electricity_bill_inr: 2000,
  lpg_cylinders_per_month: 1,
  commute_mode: 'metro',
  daily_commute_km: 15,
  commute_days_per_week: 5,
  diet_type: 'veg',
};

const MOCK_RESULT: CalculateResponse = {
  annual_total_tco2e: 1.5,
  annual_total_kgco2e: 1500,
  breakdown: { electricity_kg: 1000, lpg_kg: 300, transport_kg: 150, diet_kg: 50 },
  india_average_t: 1.84,
  paris_target_t: 2.5,
  is_below_paris_target: true,
  score_level: 'good',
};

describe('API Helpers', () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('healthCheck calls /api/health', async () => {
    const mockResponse = { status: 'ok', version: '1.0.0' };
    mockFetch.mockResolvedValue({ ok: true, json: async () => mockResponse });

    const result = await healthCheck();
    expect(mockFetch).toHaveBeenCalledWith('/api/health');
    expect(result).toEqual(mockResponse);
  });

  it('calculateFootprint posts typed payload correctly', async () => {
    const mockResponse = { annual_total_tco2e: 1.5 };
    mockFetch.mockResolvedValue({ ok: true, json: async () => mockResponse });

    const result = await calculateFootprint(MOCK_PROFILE);
    expect(mockFetch).toHaveBeenCalledWith('/api/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(MOCK_PROFILE),
    });
    expect(result).toEqual(mockResponse);
  });

  it('throws on non-2xx status', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500 });
    await expect(getInsights(MOCK_PROFILE)).rejects.toThrow('500');
  });

  it('saveEntry posts entry correctly', async () => {
    const mockEntry = { id: 'abc123', device_id: 'vm-test' };
    mockFetch.mockResolvedValue({ ok: true, json: async () => mockEntry });

    await saveEntry({ device_id: 'vm-test', profile: MOCK_PROFILE, result: MOCK_RESULT });

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/entries',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('listEntries calls correct URL with encoded device id', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => [] });

    await listEntries('vm-device-001');
    expect(mockFetch).toHaveBeenCalledWith('/api/entries/vm-device-001');
  });
});
