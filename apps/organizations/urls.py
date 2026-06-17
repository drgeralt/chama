from django.urls import path
from .views import (
    OrganizationListCreateView,
    OrganizationDetailView,
    OrganizationDepartmentsView,
    OrganizationMembershipsView,
    OrganizationMembershipDetailView,
    OrganizationInviteView,
    OrganizationInviteAcceptView,
)

urlpatterns = [
    path("", OrganizationListCreateView.as_view(), name="org-list-create"),
    path("<uuid:id>/", OrganizationDetailView.as_view(), name="org-detail"),
    path(
        "<uuid:id>/departments/",
        OrganizationDepartmentsView.as_view(),
        name="org-departments",
    ),
    path(
        "<uuid:id>/members/",
        OrganizationMembershipsView.as_view(),
        name="org-members",
    ),
    path(
        "<uuid:id>/members/<uuid:pk>/",
        OrganizationMembershipDetailView.as_view(),
        name="org-member-detail",
    ),
    path(
        "<uuid:id>/invites/",
        OrganizationInviteView.as_view(),
        name="org-invites",
    ),
    path(
        "invites/<uuid:invite_id>/accept/",
        OrganizationInviteAcceptView.as_view(),
        name="org-invite-accept",
    ),
]
