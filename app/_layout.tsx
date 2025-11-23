import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { NavigationContainer } from '@react-navigation/native';
import { RootNavigator } from '../navigation/RootNavigator';

export default function RootLayout() {
  return (
    <>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
      <StatusBar style="auto" />
    </>
  );
}
