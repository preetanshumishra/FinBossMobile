import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { RootNavigator } from '../navigation/RootNavigator';
import { useTheme } from '../src/hooks/useTheme';

export default function RootLayout() {
  const { theme } = useTheme();

  return (
    <>
      <RootNavigator />
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
    </>
  );
}
