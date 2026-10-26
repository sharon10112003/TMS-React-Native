import { Platform } from 'react-native';
import Constants from 'expo-constants';

const getBaseUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:5000/api';
  }

  // Automatically detect the computer's IP address from Expo Metro bundler
  const hostUri = Constants.expoConfig?.hostUri || Constants.manifest2?.extra?.expoGo?.debuggerHost || '';
  const ip = hostUri ? hostUri.split(':')[0] : '192.168.200.55';

  return `http://${ip}:5000/api`;
};

export const API_BASE_URL = getBaseUrl();
export default { API_BASE_URL };
