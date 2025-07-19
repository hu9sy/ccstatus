export const API_CONSTANTS = {
  ANTHROPIC_API_BASE: 'https://status.anthropic.com/api/v2/',
  ENDPOINTS: {
    INCIDENTS: 'incidents.json',
    SUMMARY: 'summary.json'
  }
} as const;

export const UI_CONSTANTS = {
  TABLE: {
    SERVICE_COL_WIDTHS: [30, 25, 30, 50],
    DEFAULT_STYLE: {
      HEAD: ['cyan'],
      BORDER: ['grey']
    }
  },
  BOX_STYLE: {
    BORDER_COLOR: 'blue',
    BORDER_STYLE: 'round'
  }
} as const;

export const APP_CONSTANTS = {
  DEFAULT_INCIDENT_LIMIT: 3
} as const;