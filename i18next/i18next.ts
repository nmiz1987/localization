import { getLocales } from 'expo-localization';
import Storage from 'expo-sqlite/kv-store';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nManager } from 'react-native';
import appConfig from '../appConfig';
import en from './locals/en';
import he from './locals/he';

export const resources = { he, en } as const;

const { defaultLanguages, STORAGE_KEY, fallbackLng, enabled, supportedLanguages, defaultNS } = appConfig.i18n;

export const LANGUAGE_LABELS: Record<string, string> = {
  he: 'Hebrew',
  en: 'English',
};

function resolveLanguage(): string {
  if (!enabled) {
    return defaultLanguages;
  }

  // 1. Check for a stored user preference
  try {
    const stored = Storage.getItemSync(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.language && supportedLanguages.includes(parsed.language)) {
        return parsed.language;
      }
    }
  } catch (error) {
    /* first launch or corrupt data - continue */
  }

  // 2. Auto-detect fron device or use the forced code
  return resolveDeviceLanguage();
}

/**
 * Resoles the language to app would use without a stored user preference.
 * Called when the user resets to "Device Language" in settings
 */
export const resolveDeviceLanguage = (): string => {
  if (defaultLanguages === 'device') {
    const deviceLang = getLocales()[0]?.languageCode;
    if (deviceLang && supportedLanguages.includes(deviceLang)) {
      return deviceLang;
    }
    return fallbackLng;
  }
  return supportedLanguages.includes(defaultLanguages) ? defaultLanguages : fallbackLng;
};

export const updateToDeviceLanguage = (): boolean => {
  try {
    Storage.removeItemSync(STORAGE_KEY);
    i18next.changeLanguage(resolveDeviceLanguage());
    return true;
  } catch (error) {
    console.error('Error resetting to device language:', error);
    return false;
  }
};

export const updateUserLanguage = (lng: string): boolean => {
  try {
    if (!supportedLanguages.includes(lng)) {
      console.warn(`Attempted to change to unsupported language: ${lng}`);
      return false;
    }
    if (!getLocales().some((locale) => locale.languageCode === lng)) {
      console.warn(`Attempted to change to language not available on device: ${lng}`);
      return false;
    }
    Storage.setItemSync(STORAGE_KEY, JSON.stringify({ language: lng }));
    i18next.changeLanguage(lng);
    return true;
  } catch (error) {
    console.error('Error updating user language:', error);
    return false;
  }
};

i18next.use(initReactI18next).init({
  resources,
  fallbackLng,
  defaultNS,
  supportedLngs: supportedLanguages,
  lng: resolveLanguage(),
  interpolation: {
    escapeValue: false,
  },
});

const checkRTL = () => {
  const resolvedLang = resolveLanguage();
  const local = getLocales().find((locale) => locale.languageCode === resolvedLang);
  return local ? local.textDirection === 'rtl' : false;
};

export const isRTL = checkRTL();
I18nManager.allowRTL(isRTL);
I18nManager.forceRTL(isRTL);

export default i18next;
