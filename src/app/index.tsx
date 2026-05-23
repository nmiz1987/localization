import * as Expo from 'expo';
import Storage from 'expo-sqlite/kv-store';
import { useTranslation } from 'react-i18next';
import { Button, StyleSheet, Text, View } from 'react-native';
import appConfig from '../../appConfig';
import i18next, { isRTL, LANGUAGE_LABELS, resolveDeviceLanguage } from '../../i18next/i18next';

export default function HomeScreen() {
  const { t } = useTranslation();
  const { STORAGE_KEY } = appConfig.i18n;

  const reloadApp = async () => {
    if (__DEV__) {
      alert('Automatic reload is disabled in development mode to preserve the state. Please reload the app manually to see the language change.');
    } else {
      await Expo.reloadAppAsync();
    }
  };

  const setLanguage = async (code: string | null) => {
    try {
      if (code === null) {
        Storage.removeItemSync(STORAGE_KEY);
        i18next.changeLanguage(resolveDeviceLanguage());
      } else {
        Storage.setItemSync(STORAGE_KEY, JSON.stringify({ language: code }));
        i18next.changeLanguage(code);
      }
      reloadApp();
    } catch (error) {
      console.error('Error setting language:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{t('home.welcome')}</Text>
      <Text>currentLanguage: {i18next.language}</Text>
      <Text>isRTL: {isRTL ? 'Yes' : 'No'}</Text>
      {appConfig.i18n.enabled && (
        <>
          <Button title="Switch to device" onPress={() => setLanguage(null)} />
          {Object.entries(LANGUAGE_LABELS).map(([code, label]) => (
            <Button key={code} title={`Switch to ${label}`} onPress={() => setLanguage(code)} />
          ))}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 16,
  },
  text: {
    fontSize: 20,
  },
});
