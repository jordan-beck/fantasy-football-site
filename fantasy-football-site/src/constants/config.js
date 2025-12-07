/**
 * Application Configuration
 * Centralized configuration for API endpoints and app settings
 */

export const API_CONFIG = {
  BASE_URL: 'https://api.sleeper.app/v1',
  LEAGUE_ID: '1257101142144327682',
  ENDPOINTS: {
    LEAGUE: (leagueId) => `/league/${leagueId}`,
    ROSTERS: (leagueId) => `/league/${leagueId}/rosters`,
    USERS: (leagueId) => `/league/${leagueId}/users`,
    MATCHUPS: (leagueId, week) => `/league/${leagueId}/matchups/${week}`,
    TRANSACTIONS: (leagueId, week) => `/league/${leagueId}/transactions/${week}`,
  },
};

export const STORAGE_KEYS = {
  THEME: 'fantasy-football-theme',
};

export const THEME_CONFIG = {
  DEFAULT: 'dark',
  TRANSITION_DURATION: '0.3s ease',
};

export const LEAGUE_CONFIG = {
  MAX_WEEK: 18,
  MIN_WEEK: 1,
};
