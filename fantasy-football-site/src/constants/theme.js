/**
 * Theme Configuration - NATIONAL PIGSKIN EDITION
 *
 * Red, White, and Blue color scheme inspired by National Pigskin logo.
 * Dark theme: Classic arcade cabinet with red/white/blue neon lights
 * Light theme: Clean modern with red/white/blue accents
 */

export const themes = {
  dark: {
    // Background colors - Arcade Cabinet Black
    bg: {
      primary: '#000000',           // Pure black - arcade cabinet
      secondary: '#0a0a0a',         // Slightly lighter black
      tertiary: '#1a1a1a',          // Card backgrounds
      hover: '#2a2a2a',             // Hover state
    },

    // Text colors - Red/White/Blue palette
    text: {
      primary: '#ffffff',           // White - main text
      secondary: '#aaccff',         // Light blue - secondary
      tertiary: '#888888',          // Gray - muted
      accent: '#ff0040',            // Neon red - accents
      inverse: '#000000',           // Black for light backgrounds
    },

    // Border colors - Neon red/blue glows
    border: {
      primary: 'rgba(255, 0, 64, 0.5)',      // Neon red glow
      secondary: 'rgba(0, 102, 255, 0.4)',   // Blue glow
      accent: 'rgba(255, 0, 64, 0.7)',       // Bright red accent
    },

    // Status colors - Patriotic theme
    status: {
      success: '#0066ff',           // Blue - success
      warning: '#ffaa00',           // Orange - warning
      error: '#ff0040',             // Neon red - error
      info: '#aaccff',              // Light blue - info
    },

    // Interactive elements - Red/White/Blue buttons
    interactive: {
      primary: '#ff0040',           // Neon red primary
      primaryHover: '#ff3366',      // Bright red hover
      secondary: 'rgba(0, 102, 255, 0.2)',    // Blue tint
      secondaryHover: 'rgba(0, 102, 255, 0.3)', // Brighter blue
      disabled: 'rgba(136, 136, 136, 0.3)',   // Gray disabled
    },

    // Shadows - Red/Blue neon glows
    shadow: {
      sm: '0 0 10px rgba(255, 0, 64, 0.3)',
      md: '0 0 20px rgba(255, 0, 64, 0.5), 0 0 30px rgba(255, 0, 64, 0.3)',
      lg: '0 0 30px rgba(255, 0, 64, 0.6), 0 0 50px rgba(255, 0, 64, 0.4)',
      accent: '0 0 20px rgba(255, 0, 64, 0.8), 0 0 30px rgba(255, 0, 64, 0.5)',
    },
  },

  light: {
    // Background colors - Clean white/gray
    bg: {
      primary: '#f5f5f7',           // Light gray background
      secondary: '#ffffff',         // Pure white
      tertiary: '#fafafa',          // Off-white
      hover: '#e8e8ea',             // Hover gray
    },

    // Text colors - Red/White/Blue palette
    text: {
      primary: '#1a1a1a',           // Dark gray text
      secondary: '#0066ff',         // Blue for emphasis
      tertiary: '#666666',          // Medium gray muted
      accent: '#cc0033',            // Deep red accent
      inverse: '#ffffff',           // White for dark backgrounds
    },

    // Border colors - Blue/Red lines
    border: {
      primary: 'rgba(0, 102, 255, 0.4)',     // Blue borders
      secondary: 'rgba(204, 0, 51, 0.3)',    // Red subtle
      accent: 'rgba(0, 102, 255, 0.6)',      // Bright blue highlights
    },

    // Status colors - Patriotic theme
    status: {
      success: '#0066ff',           // Blue
      warning: '#ff9900',           // Orange
      error: '#cc0033',             // Red
      info: '#0088ff',              // Bright blue
    },

    // Interactive elements - Blue/Red buttons
    interactive: {
      primary: '#0066ff',           // Blue primary
      primaryHover: '#0052cc',      // Darker blue hover
      secondary: 'rgba(204, 0, 51, 0.15)',    // Red tint
      secondaryHover: 'rgba(204, 0, 51, 0.25)', // Brighter red
      disabled: 'rgba(102, 102, 102, 0.3)',   // Gray disabled
    },

    // Shadows - Subtle depth
    shadow: {
      sm: '0 2px 4px 0 rgba(0, 0, 0, 0.15)',
      md: '0 4px 12px 0 rgba(0, 0, 0, 0.2)',
      lg: '0 8px 20px 0 rgba(0, 0, 0, 0.25)',
      accent: '0 0 0 4px rgba(0, 102, 255, 0.3)',
    },
  },
};

/**
 * Default theme mode
 */
export const DEFAULT_THEME = 'dark';

/**
 * Theme transition duration for smooth mode switching
 */
export const THEME_TRANSITION = '0.3s ease';
