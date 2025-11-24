import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { RootNavigator } from '../navigation/RootNavigator';

export default function RootLayout() {
  return (
    <>
      <RootNavigator />
      <StatusBar style="auto" />
    </>
  );
}
