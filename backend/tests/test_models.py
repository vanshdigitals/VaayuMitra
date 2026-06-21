import pytest
from app.models import CalculateRequest
from pydantic import ValidationError

def test_validation_bounds():
    # Valid
    req = CalculateRequest(city="Test")
    assert req.household_size == 1
    
    # Invalid household size
    with pytest.raises(ValidationError):
        CalculateRequest(city="Test", household_size=0)
        
    # Invalid commute mode
    with pytest.raises(ValidationError):
        CalculateRequest(city="Test", commute_mode="spaceship")
        
    # Invalid daily commute
    with pytest.raises(ValidationError):
        CalculateRequest(city="Test", daily_commute_km=600)
