"""
India-Specific Emission Factors for VaayuMitra
RULE: Every constant MUST have a source comment. No exceptions.
"""

ELECTRICITY_FACTOR_KG_CO2_PER_KWH = 0.71
# Source: CEA CO2 Baseline Database v21.0, FY2024-25, India all-India weighted average

LPG_KG_CO2_PER_KG = 2.983
# Source: IPCC 2006 Guidelines, Volume 2, Chapter 2
LPG_CYLINDER_WEIGHT_KG = 14.2
LPG_KG_CO2_PER_CYLINDER = 42.36  # 14.2 * 2.983

TRANSPORT_FACTORS = {
    "2_wheeler_petrol": 0.040,   # Source: India GHG Program v1.0, WRI/TERI/CII 2015
    "car_petrol": 0.140,          # Source: India GHG Program v1.0
    "auto_cng": 0.108,            # Source: India GHG Program v1.0
    "city_bus": 0.015,            # Source: India GHG Program v1.0
    "metro": 0.025,               # Source: Derived - 0.035 kWh/pax-km x CEA 0.71
    "domestic_flight": 0.121,     # Source: India GHG Program v1.0
    "walk_cycle": 0.000,
}

ELECTRICITY_BILL_TO_KWH = 1 / 6.5

DIET_FACTORS_KG_CO2E_PER_DAY = {
    "veg": 0.72,
    "mostly_veg": 0.85,
    "non_veg": 1.03,
    "frequent_non_veg": 1.35
}
