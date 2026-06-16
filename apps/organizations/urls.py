from django.urls import path
from .views import (
    OrganizationListCreateView,
    OrganizationDetailView,
    OrganizationDepartmentsView
)

urlpatterns = [
    path('', OrganizationListCreateView.as_view(), name='org-list-create'),
    path('<slug:slug>/', OrganizationDetailView.as_view(), name='org-detail'),
    path('<slug:slug>/departments/', OrganizationDepartmentsView.as_view(), name='org-departments'),
]
