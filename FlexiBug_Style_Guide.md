# Botglam - Style Guide

## Overview
This style guide defines the visual identity and design system for Botglam, the AI-powered beauty industry appointment booking platform. The design emphasizes elegance, professionalism, and accessibility while creating an inviting experience for both beauty professionals and their clients.

---

## 🎨 Color Palette

### Primary Colors
```css
/* Rose Gold - Primary Brand Color */
--primary-50: #fdf2f8;
--primary-100: #fce7f3;
--primary-200: #fbcfe8;
--primary-300: #f9a8d4;
--primary-400: #f472b6;
--primary-500: #ec4899;  /* Main Primary */
--primary-600: #db2777;
--primary-700: #be185d;
--primary-800: #9d174d;
--primary-900: #831843;

/* Deep Plum - Secondary Color */
--secondary-50: #faf7ff;
--secondary-100: #f3edff;
--secondary-200: #e9dcfe;
--secondary-300: #d8bffd;
--secondary-400: #c084fc;
--secondary-500: #a855f7;
--secondary-600: #9333ea;  /* Main Secondary */
--secondary-700: #7c2d12;
--secondary-800: #6b21a8;
--secondary-900: #581c87;
```

### Neutral Colors
```css
/* Warm Grays */
--neutral-50: #fafaf9;
--neutral-100: #f5f5f4;
--neutral-200: #e7e5e4;
--neutral-300: #d6d3d1;
--neutral-400: #a8a29e;
--neutral-500: #78716c;
--neutral-600: #57534e;  /* Main Text */
--neutral-700: #44403c;
--neutral-800: #292524;
--neutral-900: #1c1917;
```

### Accent Colors
```css
/* Success - Sage Green */
--success-50: #f0fdf4;
--success-500: #22c55e;
--success-600: #16a34a;

/* Warning - Warm Amber */
--warning-50: #fffbeb;
--warning-500: #f59e0b;
--warning-600: #d97706;

/* Error - Soft Red */
--error-50: #fef2f2;
--error-500: #ef4444;
--error-600: #dc2626;

/* Info - Soft Blue */
--info-50: #eff6ff;
--info-500: #3b82f6;
--info-600: #2563eb;
```

### Usage Guidelines
- **Primary (Rose Gold)**: CTAs, links, active states, brand elements
- **Secondary (Deep Plum)**: Headers, important UI elements, hover states
- **Neutrals**: Text, backgrounds, borders, subtle UI elements
- **Accents**: Status indicators, notifications, feedback

---

## 📱 Typography

### Font Stack
```css
/* Primary Font - Modern Sans-serif */
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;

/* Secondary Font - Elegant Display */
--font-secondary: 'Playfair Display', Georgia, serif;

/* Monospace */
--font-mono: 'Fira Code', Consolas, 'Monaco', monospace;
```

### Type Scale
```css
/* Display & Headers */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
--text-5xl: 3rem;      /* 48px */

/* Line Heights */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;

/* Font Weights */
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Typography Usage
```css
/* Headers */
.h1 {
  font-family: var(--font-secondary);
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  color: var(--neutral-800);
}

.h2 {
  font-family: var(--font-secondary);
  font-size: var(--text-3xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-tight);
  color: var(--neutral-700);
}

.h3 {
  font-family: var(--font-primary);
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-normal);
  color: var(--neutral-700);
}

/* Body Text */
.body-large {
  font-family: var(--font-primary);
  font-size: var(--text-lg);
  font-weight: var(--font-normal);
  line-height: var(--leading-relaxed);
  color: var(--neutral-600);
}

.body {
  font-family: var(--font-primary);
  font-size: var(--text-base);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
  color: var(--neutral-600);
}

.body-small {
  font-family: var(--font-primary);
  font-size: var(--text-sm);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
  color: var(--neutral-500);
}
```

---

## 📏 Spacing & Layout

### Spacing Scale
```css
--space-px: 1px;
--space-0: 0;
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-5: 1.25rem;  /* 20px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-10: 2.5rem;  /* 40px */
--space-12: 3rem;    /* 48px */
--space-16: 4rem;    /* 64px */
--space-20: 5rem;    /* 80px */
--space-24: 6rem;    /* 96px */
```

### Border Radius
```css
--radius-none: 0;
--radius-sm: 0.125rem;  /* 2px */
--radius-md: 0.375rem;  /* 6px */
--radius-lg: 0.5rem;    /* 8px */
--radius-xl: 0.75rem;   /* 12px */
--radius-2xl: 1rem;     /* 16px */
--radius-full: 9999px;
```

### Shadows
```css
--shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
```

---

## 🎯 Component Library

### Buttons

#### Primary Button
```css
.btn-primary {
  background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
  color: white;
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-lg);
  font-weight: var(--font-medium);
  font-size: var(--text-base);
  border: none;
  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: linear-gradient(135deg, var(--primary-600), var(--primary-700));
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.btn-primary:active {
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}
```

#### Secondary Button
```css
.btn-secondary {
  background: var(--neutral-50);
  color: var(--neutral-700);
  border: 1px solid var(--neutral-200);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-lg);
  font-weight: var(--font-medium);
  font-size: var(--text-base);
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: var(--neutral-100);
  border-color: var(--neutral-300);
}
```

#### Button Sizes
```css
.btn-sm {
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-sm);
}

.btn-lg {
  padding: var(--space-4) var(--space-8);
  font-size: var(--text-lg);
}
```

### Input Fields
```css
.input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--neutral-300);
  border-radius: var(--radius-lg);
  font-size: var(--text-base);
  background: var(--neutral-50);
  transition: all 0.2s ease;
}

.input:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.1);
  background: white;
}

.input::placeholder {
  color: var(--neutral-400);
}
```

### Cards
```css
.card {
  background: white;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--neutral-200);
  overflow: hidden;
  transition: all 0.2s ease;
}

.card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.card-header {
  padding: var(--space-6) var(--space-6) var(--space-4);
  border-bottom: 1px solid var(--neutral-100);
}

.card-body {
  padding: var(--space-6);
}

.card-footer {
  padding: var(--space-4) var(--space-6) var(--space-6);
  border-top: 1px solid var(--neutral-100);
  background: var(--neutral-50);
}
```

### Navigation
```css
.nav-item {
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  color: var(--neutral-600);
  text-decoration: none;
  font-weight: var(--font-medium);
  transition: all 0.2s ease;
}

.nav-item:hover {
  background: var(--primary-50);
  color: var(--primary-600);
}

.nav-item.active {
  background: var(--primary-100);
  color: var(--primary-700);
}
```

---

## 🌟 Beauty Industry Specific Components

### Portfolio Gallery
```css
.portfolio-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-6);
}

.portfolio-item {
  position: relative;
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-md);
  transition: all 0.3s ease;
}

.portfolio-item:hover {
  transform: scale(1.02);
  box-shadow: var(--shadow-xl);
}

.portfolio-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  color: white;
  padding: var(--space-6);
  transform: translateY(100%);
  transition: transform 0.3s ease;
}

.portfolio-item:hover .portfolio-overlay {
  transform: translateY(0);
}
```

### Service Cards
```css
.service-card {
  background: white;
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--neutral-200);
  position: relative;
  overflow: hidden;
}

.service-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary-500), var(--secondary-500));
}

.service-price {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--primary-600);
  font-family: var(--font-secondary);
}

.service-duration {
  color: var(--neutral-500);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
}
```

### Appointment Calendar
```css
.calendar {
  background: white;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  overflow: hidden;
}

.calendar-header {
  background: linear-gradient(135deg, var(--primary-500), var(--secondary-500));
  color: white;
  padding: var(--space-6);
  text-align: center;
}

.calendar-day {
  padding: var(--space-3);
  border: 1px solid var(--neutral-100);
  min-height: 80px;
  position: relative;
}

.calendar-day.today {
  background: var(--primary-50);
  border-color: var(--primary-200);
}

.calendar-appointment {
  background: var(--primary-100);
  color: var(--primary-700);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  margin: var(--space-1) 0;
}
```

---

## 📱 Responsive Design

### Breakpoints
```css
/* Mobile First Approach */
--breakpoint-sm: 640px;   /* Small devices */
--breakpoint-md: 768px;   /* Medium devices */
--breakpoint-lg: 1024px;  /* Large devices */
--breakpoint-xl: 1280px;  /* Extra large devices */
--breakpoint-2xl: 1536px; /* 2X large devices */
```

### Container Sizes
```css
.container {
  width: 100%;
  margin: 0 auto;
  padding: 0 var(--space-4);
}

@media (min-width: 640px) {
  .container { max-width: 640px; }
}

@media (min-width: 768px) {
  .container { max-width: 768px; }
}

@media (min-width: 1024px) {
  .container { max-width: 1024px; }
}

@media (min-width: 1280px) {
  .container { max-width: 1280px; }
}
```

---

## ♿ Accessibility Guidelines

### Color Contrast
- **Text on Background**: Minimum 4.5:1 ratio
- **Large Text**: Minimum 3:1 ratio
- **Interactive Elements**: Minimum 3:1 ratio

### Focus States
```css
.focus-visible {
  outline: 2px solid var(--primary-500);
  outline-offset: 2px;
}

.focus-visible:not(.focus-visible) {
  outline: none;
}
```

### Screen Reader Support
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

---

## 🚀 Implementation Guidelines

### CSS Custom Properties Setup
```css
:root {
  /* Import all variables defined above */
  color-scheme: light;
}

@media (prefers-color-scheme: dark) {
  :root {
    /* Dark mode variants can be added here */
  }
}
```

### Tailwind CSS Configuration
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
        },
        secondary: {
          50: '#faf7ff',
          100: '#f3edff',
          200: '#e9dcfe',
          300: '#d8bffd',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c2d12',
          800: '#6b21a8',
          900: '#581c87',
        },
        neutral: {
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
        }
      },
      fontFamily: {
        primary: ['Inter', 'sans-serif'],
        secondary: ['Playfair Display', 'serif'],
      }
    }
  }
}
```

### Component Organization
```
styles/
├── base/
│   ├── reset.css
│   ├── typography.css
│   └── variables.css
├── components/
│   ├── buttons.css
│   ├── forms.css
│   ├── cards.css
│   └── navigation.css
├── layouts/
│   ├── grid.css
│   └── containers.css
└── utilities/
    ├── spacing.css
    └── accessibility.css
```

---

## 🎨 Brand Identity

### Color Psychology
- **Rose Gold**: Luxury, femininity, sophistication, warmth
- **Deep Plum**: Creativity, mystery, premium quality, elegance
- **Warm Neutrals**: Approachability, comfort, professionalism

### Design Principles
1. **Elegance**: Refined and sophisticated aesthetic
2. **Accessibility**: Inclusive design for all users
3. **Consistency**: Uniform experience across all touchpoints
4. **Simplicity**: Clean, uncluttered interfaces
5. **Beauty-Focused**: Tailored to the beauty industry aesthetic

---

*This style guide is a living document and should be updated as the Botglam design system evolves.* 