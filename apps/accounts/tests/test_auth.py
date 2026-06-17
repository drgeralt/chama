import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from apps.organizations.tests.factories import UserFactory

@pytest.mark.django_db
def test_login_success():
    user = UserFactory(email="test@example.com")
    user.set_password("strongpassword123")
    user.save()
    
    client = APIClient()
    url = reverse("token_obtain_pair")
    response = client.post(url, {"email": "test@example.com", "password": "strongpassword123"})
    
    assert response.status_code == 200
    assert "access" in response.json()
    assert "refresh" in response.json()

@pytest.mark.django_db
def test_login_invalid_credentials():
    user = UserFactory(email="test@example.com")
    user.set_password("strongpassword123")
    user.save()
    
    client = APIClient()
    url = reverse("token_obtain_pair")
    response = client.post(url, {"email": "test@example.com", "password": "wrongpassword"})
    
    assert response.status_code == 401
    assert "access" not in response.json()

@pytest.mark.django_db
def test_token_refresh():
    user = UserFactory(email="test@example.com")
    user.set_password("strongpassword123")
    user.save()
    
    client = APIClient()
    login_url = reverse("token_obtain_pair")
    login_response = client.post(login_url, {"email": "test@example.com", "password": "strongpassword123"})
    
    refresh_token = login_response.json()["refresh"]
    
    refresh_url = reverse("token_refresh")
    refresh_response = client.post(refresh_url, {"refresh": refresh_token})
    
    assert refresh_response.status_code == 200
    assert "access" in refresh_response.json()
