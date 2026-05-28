import * as Expo from 'expo';
import { useTranslation } from 'react-i18next';
import { Button, StyleSheet, Text, View } from 'react-native';
import appConfig from '../../appConfig';
import i18next, { isRTL, LANGUAGE_LABELS, updateToDeviceLanguage, updateUserLanguage } from '../../i18next/i18next';

export default function HomeScreen() {
  const { t } = useTranslation();

  const reloadApp = async () => {
    if (__DEV__) {
      alert('Automatic reload is disabled in development mode to preserve the state. Please reload the app manually to see the language change.');
    } else {
      await Expo.reloadAppAsync();
    }
  };

  const setLanguage = async (code: string | null) => {
    try {
      let success = false;
      if (code === null) {
        success = updateToDeviceLanguage();
      } else {
        success = updateUserLanguage(code);
      }
      success && reloadApp();
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
