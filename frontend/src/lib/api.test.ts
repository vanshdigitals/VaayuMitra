import { calculateFootprint, getInsights, healthCheck, saveEntry, listEntries } from './api';
import type { CalculateRequest } from './types';

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

describe('API Helpers', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('healthCheck calls /api/health', async () => {
    const mockResponse = { status: 'ok', version: '1.0.0' };
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await healthCheck();
    expect(global.fetch).toHaveBeenCalledWith('/api/health');
    expect(result).toEqual(mockResponse);
  });

  it('calculateFootprint posts typed payload correctly', async () => {
    const mockResponse = { annual_total_tco2e: 1.5 };
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await calculateFootprint(MOCK_PROFILE);
    expect(global.fetch).toHaveBeenCalledWith('/api/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(MOCK_PROFILE),
    });
    expect(result).toEqual(mockResponse);
  });

  it('throws on non-2xx status', async () => {
    (global.fetch as any).mockResolvedValue({ ok: false, status: 500 });
    await expect(getInsights(MOCK_PROFILE)).rejects.toThrow('500');
  });

  it('saveEntry posts entry correctly', async () => {
    const mockEntry = { id: 'abc123', device_id: 'vm-test' };
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockEntry,
    });

    await saveEntry({
      device_id: 'vm-test',
      profile: MOCK_PROFILE,
      result: { annual_total_tco2e: 1.5 } as any,
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/entries', expect.objectContaining({
      method: 'POST',
    }));
  });

  it('listEntries calls correct URL with encoded device id', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    await listEntries('vm-device-001');
    expect(global.fetch).toHaveBeenCalledWith('/api/entries/vm-device-001');
  });
});
