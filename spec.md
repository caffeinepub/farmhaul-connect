# FarmHaul Connect

## Current State
Full-stack app with Farmer and Transporter dashboards. All UI text is hardcoded in English across LandingPage, RegisterPage, FarmerDashboard, TransporterDashboard, RequestCard, and FarmerVoiceAssistant.

## Requested Changes (Diff)

### Add
- Language context (`LanguageContext`) that stores current language and provides a `t()` translation function
- Translation file (`i18n/translations.ts`) with all UI strings in English, Kannada (ಕನ್ನಡ), and Hindi (हिन्दी)
- Language switcher UI: a dropdown/toggle with 3 options — English, ಕನ್ನಡ, हिन्दी — placed in the header of LandingPage, FarmerDashboard, and TransporterDashboard. Also visible on RegisterPage.
- Language preference persisted in localStorage

### Modify
- LandingPage: replace all hardcoded strings with `t()` calls
- RegisterPage: replace all hardcoded strings with `t()` calls
- FarmerDashboard: replace all hardcoded strings with `t()` calls
- TransporterDashboard: replace all hardcoded strings with `t()` calls
- RequestCard: replace all hardcoded strings with `t()` calls
- App.tsx: wrap app in `LanguageProvider`

### Remove
- Nothing removed

## Implementation Plan
1. Create `src/frontend/src/i18n/translations.ts` with full translation strings for en, kn (Kannada), hi (Hindi)
2. Create `src/frontend/src/contexts/LanguageContext.tsx` with provider and `useLanguage` hook
3. Create `src/frontend/src/components/LanguageSwitcher.tsx` dropdown component
4. Update App.tsx to wrap with LanguageProvider
5. Update LandingPage, RegisterPage, FarmerDashboard, TransporterDashboard, RequestCard with translations
