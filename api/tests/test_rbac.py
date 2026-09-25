import pytest
from app.utils.security import create_access_token, decode_token, require_roles
from app.models.users import UserRole
from fastapi import HTTPException

def test_jwt_rbac_generation_and_verification():
    payload = {"sub": "kitchen@foodloop.gov.in", "role": UserRole.KITCHEN_MANAGER.value, "user_id": 2}
    token = create_access_token(payload)
    decoded = decode_token(token)
    assert decoded["sub"] == "kitchen@foodloop.gov.in"
    assert decoded["role"] == "kitchen_manager"

def test_rbac_role_enforcement():
    kitchen_user = {"sub": "kitchen@foodloop.gov.in", "role": UserRole.KITCHEN_MANAGER.value}
    driver_user = {"sub": "driver@foodloop.gov.in", "role": UserRole.DRIVER.value}
    admin_user = {"sub": "admin@foodloop.gov.in", "role": UserRole.ADMIN.value}

    # Endpoint requiring kitchen_manager role
    checker = require_roles([UserRole.KITCHEN_MANAGER])
    
    assert checker(kitchen_user) == kitchen_user
    assert checker(admin_user) == admin_user # Admin has superuser access

    # Driver should be denied
    with pytest.raises(HTTPException) as excinfo:
        checker(driver_user)
    assert excinfo.value.status_code == 403
