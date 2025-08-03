// Brand Configuration for Career Transition Portfolio
// This file defines the complete visual identity and branding system

export interface BrandColors {
  primary: {
    main: string;
    light: string;
    dark: string;
    contrastText: string;
  };
  secondary: {
    main: string;
    light: string;
    dark: string;
    contrastText: string;
  };
  success: {
    main: string;
    light: string;
    dark: string;
  };
  warning: {
    main: string;
    light: string;
    dark: string;
  };
  error: {
    main: string;
    light: string;
    dark: string;
  };
  info: {
    main: string;
    light: string;
    dark: string;
  };
  grey: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
}

export interface BrandTypography {
  fontFamily: {
    primary: string;
    secondary: string;
    mono: string;
  };
  fontWeight: {
    light: number;
    regular: number;
    medium: number;
    semiBold: number;
    bold: number;
  };
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
  };
}

export interface BrandSpacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
}

export interface BrandShadows {
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export interface BrandRadius {
  sm: number;
  md: number;
  lg: number;
  xl: number;
  full: number;
}

export interface BrandConfig {
  name: string;
  tagline: string;
  description: string;
  colors: BrandColors;
  typography: BrandTypography;
  spacing: BrandSpacing;
  shadows: BrandShadows;
  radius: BrandRadius;
  logo: {
    primary: string;
    secondary: string;
    icon: string;
  };
}

// Light theme brand colors
export const lightBrandColors: BrandColors = {
  primary: {
    main: '#2563eb', // Professional blue
    light: '#3b82f6',
    dark: '#1d4ed8',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#7c3aed', // Purple accent
    light: '#8b5cf6',
    dark: '#6d28d9',
    contrastText: '#ffffff',
  },
  success: {
    main: '#10b981',
    light: '#34d399',
    dark: '#059669',
  },
  warning: {
    main: '#f59e0b',
    light: '#fbbf24',
    dark: '#d97706',
  },
  error: {
    main: '#ef4444',
    light: '#f87171',
    dark: '#dc2626',
  },
  info: {
    main: '#3b82f6',
    light: '#60a5fa',
    dark: '#2563eb',
  },
  grey: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
};

// Dark theme brand colors
export const darkBrandColors: BrandColors = {
  primary: {
    main: '#3b82f6', // Brighter blue for dark mode
    light: '#60a5fa',
    dark: '#2563eb',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#8b5cf6', // Brighter purple for dark mode
    light: '#a78bfa',
    dark: '#7c3aed',
    contrastText: '#ffffff',
  },
  success: {
    main: '#10b981',
    light: '#34d399',
    dark: '#059669',
  },
  warning: {
    main: '#f59e0b',
    light: '#fbbf24',
    dark: '#d97706',
  },
  error: {
    main: '#ef4444',
    light: '#f87171',
    dark: '#dc2626',
  },
  info: {
    main: '#3b82f6',
    light: '#60a5fa',
    dark: '#2563eb',
  },
  grey: {
    50: '#0f172a',
    100: '#1e293b',
    200: '#334155',
    300: '#475569',
    400: '#64748b',
    500: '#94a3b8',
    600: '#cbd5e1',
    700: '#e2e8f0',
    800: '#f1f5f9',
    900: '#f8fafc',
  },
};

// Typography configuration
export const brandTypography: BrandTypography = {
  fontFamily: {
    primary: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    secondary: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    mono: '"JetBrains Mono", "Fira Code", "Consolas", "Monaco", monospace',
  },
  fontWeight: {
    light: 300,
    regular: 400,
    medium: 500,
    semiBold: 600,
    bold: 700,
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
  },
};

// Spacing configuration
export const brandSpacing: BrandSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
};

// Shadow configuration
export const brandShadows: BrandShadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
};

// Border radius configuration
export const brandRadius: BrandRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

// Complete brand configuration
export const brandConfig: BrandConfig = {
  name: 'Career Portfolio',
  tagline: 'Build Your Future, One Project at a Time',
  description: 'A comprehensive platform for career-transitioning developers to build, track, and showcase portfolio projects while managing their entire job search process.',
  colors: lightBrandColors, // Default to light theme
  typography: brandTypography,
  spacing: brandSpacing,
  shadows: brandShadows,
  radius: brandRadius,
  logo: {
    primary: '/logo-primary.svg',
    secondary: '/logo-secondary.svg',
    icon: '/logo-icon.svg',
  },
};

// Brand utility functions
export const getBrandColors = (isDarkMode: boolean): BrandColors => {
  return isDarkMode ? darkBrandColors : lightBrandColors;
};

export const getBrandConfig = (isDarkMode: boolean): BrandConfig => {
  return {
    ...brandConfig,
    colors: getBrandColors(isDarkMode),
  };
};

// Brand color palette for easy access
export const brandPalette = {
  light: lightBrandColors,
  dark: darkBrandColors,
}; 