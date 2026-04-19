import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebar: SidebarsConfig = {
  apisidebar: [
    {
      type: "doc",
      id: "api/server/lorack-services-api",
    },
    {
      type: "category",
      label: "Health",
      link: {
        type: "doc",
        id: "api/server/health",
      },
      items: [
        {
          type: "doc",
          id: "api/server/service-health-check",
          label: "Service health check",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "Auth",
      link: {
        type: "doc",
        id: "api/server/auth",
      },
      items: [
        {
          type: "doc",
          id: "api/server/login-with-username-and-password",
          label: "Login with username and password",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/server/bridge-signed-field-tech-invite-to-server-user",
          label: "Bridge signed field-tech invite to server user",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "Users",
      link: {
        type: "doc",
        id: "api/server/users",
      },
      items: [
        {
          type: "doc",
          id: "api/server/get-current-user-with-effective-permissions",
          label: "Get current user with effective permissions",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/server/get-boolean-permission-snapshot",
          label: "Get boolean permission snapshot",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/server/list-users-admin",
          label: "List users (admin+)",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/server/create-user-admin",
          label: "Create user (admin+)",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/server/update-user-role-scopes-active-admin",
          label: "Update user role/scopes/active (admin+)",
          className: "api-method put",
        },
      ],
    },
    {
      type: "category",
      label: "History",
      link: {
        type: "doc",
        id: "api/server/history",
      },
      items: [
        {
          type: "doc",
          id: "api/server/push-health-score-history-for-a-device",
          label: "Push health score history for a device",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/server/pull-health-score-history-for-a-device",
          label: "Pull health score history for a device",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/server/push-battery-reading-history-for-a-device",
          label: "Push battery reading history for a device",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/server/pull-battery-reading-history-for-a-device",
          label: "Pull battery reading history for a device",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "Contacts",
      link: {
        type: "doc",
        id: "api/server/contacts",
      },
      items: [
        {
          type: "doc",
          id: "api/server/replace-all-contacts-for-a-resource",
          label: "Replace all contacts for a resource",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/server/list-contacts-for-a-resource",
          label: "List contacts for a resource",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/server/export-all-contact-entries",
          label: "Export all contact entries",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/server/import-contacts-using-merge-or-replace-strategy",
          label: "Import contacts using merge or replace strategy",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "AI",
      link: {
        type: "doc",
        id: "api/server/ai",
      },
      items: [
        {
          type: "doc",
          id: "api/server/submit-device-ai-snapshot",
          label: "Submit device AI snapshot",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/server/get-latest-ai-insight-for-device",
          label: "Get latest AI insight for device",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/server/get-latest-ai-model-metadata",
          label: "Get latest AI model metadata",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "Fleet",
      link: {
        type: "doc",
        id: "api/server/fleet",
      },
      items: [
        {
          type: "doc",
          id: "api/server/submit-fleet-snapshot",
          label: "Submit fleet snapshot",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/server/get-fleet-dashboard-aggregate",
          label: "Get fleet dashboard aggregate",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/server/get-fleet-coverage-aggregate",
          label: "Get fleet coverage aggregate",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/server/get-fleet-alert-history",
          label: "Get fleet alert history",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "Device Profiles",
      link: {
        type: "doc",
        id: "api/server/device-profiles",
      },
      items: [
        {
          type: "doc",
          id: "api/server/get-popular-device-profiles",
          label: "Get popular device profiles",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/server/get-available-battery-chemistries",
          label: "Get available battery chemistries",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/server/get-device-profile-details-by-id",
          label: "Get device profile details by id",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/server/search-device-profiles",
          label: "Search device profiles",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/server/contribute-a-device-profile",
          label: "Contribute a device profile",
          className: "api-method post",
        },
      ],
    },
  ],
};

export default sidebar.apisidebar;
