/**
 * FrawdBot Supported Platforms
 */

export interface Platform {
  id: string;
  name: string;
  status: 'active' | 'in_development' | 'planned';
  description: string;
}

export const platforms: Platform[] = [
  {
    id: 'google_workspace',
    name: 'Google Workspace',
    status: 'active',
    description: 'Full integration with Google Workspace audit logs — Drive, Gmail, Admin, Login, OAuth, and Calendar events.',
  },
  {
    id: 'microsoft_365',
    name: 'Microsoft 365',
    status: 'in_development',
    description: 'Microsoft 365 integration covering OneDrive, Exchange, SharePoint, and Azure AD audit logs. Coming soon.',
  },
];
