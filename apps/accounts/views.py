from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.throttling import AnonRateThrottle
from rest_framework import generics
from rest_framework.permissions import AllowAny
from .models import User
from .serializers import UserSerializer

class AuthRateThrottle(AnonRateThrottle):
    rate = "5/min"


class CustomTokenObtainPairView(TokenObtainPairView):
    throttle_classes = [AuthRateThrottle]


class CustomTokenRefreshView(TokenRefreshView):
    throttle_classes = [AuthRateThrottle]


class LoginView(CustomTokenObtainPairView):
    pass

class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]