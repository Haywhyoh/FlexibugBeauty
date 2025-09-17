/**
 * Brand Colors Utility
 * 
 * This utility provides functions to work with brand colors for dynamic theming
 * across public profiles and email templates.
 */

export interface BrandColors {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  secondary: string;
  accent: string;
  textPrimary: string;
  background: string;
  border: string;
}

export const defaultBrandColors: BrandColors = {
  primary: "#ec4899",
  primaryDark: "#be185d",
  primaryLight: "#f3e8ff",
  secondary: "#9333ea",
  accent: "#f59e0b",
  textPrimary: "#1f2937",
  background: "#ffffff",
  border: "#e5e7eb"
};

/**
 * Generates CSS custom properties from brand colors
 * @param colors - Brand colors object
 * @returns CSS string with custom properties
 */
export function generateBrandCSS(colors: BrandColors): string {
  return `
    :root {
      --brand-primary: ${colors.primary};
      --brand-primary-dark: ${colors.primaryDark};
      --brand-primary-light: ${colors.primaryLight};
      --brand-secondary: ${colors.secondary};
      --brand-accent: ${colors.accent};
      --brand-text-primary: ${colors.textPrimary};
      --brand-background: ${colors.background};
      --brand-border: ${colors.border};
      
      /* Computed colors for better contrast */
      --brand-primary-rgb: ${hexToRgb(colors.primary)};
      --brand-primary-dark-rgb: ${hexToRgb(colors.primaryDark)};
      --brand-secondary-rgb: ${hexToRgb(colors.secondary)};
      --brand-accent-rgb: ${hexToRgb(colors.accent)};
    }
  `;
}

/**
 * Applies brand colors to a DOM element by injecting CSS custom properties
 * @param element - DOM element to apply colors to
 * @param colors - Brand colors object
 */
export function applyBrandColors(element: HTMLElement, colors: BrandColors): void {
  const css = generateBrandCSS(colors);
  
  // Remove existing brand styles
  const existingStyle = element.querySelector('#brand-colors-style');
  if (existingStyle) {
    existingStyle.remove();
  }
  
  // Create and inject new style element
  const styleElement = document.createElement('style');
  styleElement.id = 'brand-colors-style';
  styleElement.textContent = css;
  element.appendChild(styleElement);
}

/**
 * Converts hex color to RGB values
 * @param hex - Hex color string (e.g., "#ff0000")
 * @returns RGB string (e.g., "255, 0, 0")
 */
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "0, 0, 0";
  
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  
  return `${r}, ${g}, ${b}`;
}

/**
 * Gets brand color CSS classes for Tailwind-like usage
 * @param colors - Brand colors object
 * @returns Object with CSS class mappings
 */
export function getBrandColorClasses(colors: BrandColors) {
  return {
    primary: `[color:var(--brand-primary)]`,
    primaryDark: `[color:var(--brand-primary-dark)]`,
    primaryLight: `[color:var(--brand-primary-light)]`,
    secondary: `[color:var(--brand-secondary)]`,
    accent: `[color:var(--brand-accent)]`,
    textPrimary: `[color:var(--brand-text-primary)]`,
    background: `[background-color:var(--brand-background)]`,
    border: `[border-color:var(--brand-border)]`,
    
    // Background classes
    bgPrimary: `[background-color:var(--brand-primary)]`,
    bgPrimaryDark: `[background-color:var(--brand-primary-dark)]`,
    bgPrimaryLight: `[background-color:var(--brand-primary-light)]`,
    bgSecondary: `[background-color:var(--brand-secondary)]`,
    bgAccent: `[background-color:var(--brand-accent)]`,
    
    // Hover states
    hoverPrimary: `hover:[background-color:var(--brand-primary-dark)]`,
    hoverPrimaryLight: `hover:[background-color:var(--brand-primary-light)]`,
    
    // Border classes
    borderPrimary: `[border-color:var(--brand-primary)]`,
    borderSecondary: `[border-color:var(--brand-secondary)]`,
    borderAccent: `[border-color:var(--brand-accent)]`,
  };
}

/**
 * Creates inline styles object for React components
 * @param colors - Brand colors object
 * @returns Object with inline style properties
 */
export function getBrandInlineStyles(colors: BrandColors) {
  return {
    primary: { color: colors.primary },
    primaryDark: { color: colors.primaryDark },
    primaryLight: { color: colors.primaryLight },
    secondary: { color: colors.secondary },
    accent: { color: colors.accent },
    textPrimary: { color: colors.textPrimary },
    background: { backgroundColor: colors.background },
    border: { borderColor: colors.border },
    
    // Background styles
    bgPrimary: { backgroundColor: colors.primary },
    bgPrimaryDark: { backgroundColor: colors.primaryDark },
    bgPrimaryLight: { backgroundColor: colors.primaryLight },
    bgSecondary: { backgroundColor: colors.secondary },
    bgAccent: { backgroundColor: colors.accent },
  };
}

/**
 * Validates if a color string is a valid hex color
 * @param color - Color string to validate
 * @returns boolean indicating if color is valid
 */
export function isValidHexColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

/**
 * Gets contrast color (black or white) for a given background color
 * @param backgroundColor - Background color in hex format
 * @returns "#000000" for light backgrounds, "#ffffff" for dark backgrounds
 */
export function getContrastColor(backgroundColor: string): string {
  const rgb = hexToRgb(backgroundColor).split(', ').map(Number);
  const brightness = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
  return brightness > 128 ? "#000000" : "#ffffff";
}
