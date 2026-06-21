export const DEMO_INSIGHTS = {
  recommendations: [
    {
      title: 'Switch to Metro 2 days/week',
      description: 'Your transport emits the most. Metro (0.025 kgCO₂/km) vs petrol 2-wheeler (0.040 kgCO₂/km). 2 days/week saves ~4.2 kg/month — the CO₂ of 2 Mumbai–Pune auto trips.',
      category: 'transport', monthly_saving_kg: 4.2, difficulty: 'easy',
      source: 'rules', source_citation: 'India GHG Program v1.0, WRI/TERI/CII 2015',
    },
    {
      title: 'Reduce AC usage by 1 hour/day',
      description: '1.5T AC uses ~1.5 kWh/hr. Reducing by 1 hr/day saves ~5.7 kg CO₂/month and approximately ₹45/month on your electricity bill.',
      category: 'energy', monthly_saving_kg: 5.7, difficulty: 'easy',
      source: 'rules', source_citation: 'CEA CO₂ Baseline v21.0, FY2024-25',
    },
    {
      title: 'Add 2 vegetarian days per week',
      description: 'Replacing 2 non-veg meals/week saves ~31 kg CO₂/year. Veg: 0.72 kgCO₂e/day vs non-veg: 1.03 kgCO₂e/day. Equivalent to planting 3 trees per year.',
      category: 'food', monthly_saving_kg: 2.6, difficulty: 'medium',
      source: 'rules', source_citation: 'Pathak et al. 2010, ICAR-IARI',
    },
  ],
  source: 'rules',
};

export const DEMO_FOOTPRINT = {
  annual_total_tco2e: 1.84,
  annual_total_kgco2e: 1840,
  breakdown: {
    electricity_kg: 400,
    lpg_kg: 300,
    transport_kg: 600,
    diet_kg: 540,
  },
  india_average_t: 1.84,
  paris_target_t: 2.5,
  is_below_paris_target: true,
  score_level: 'good'
};
