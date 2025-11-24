import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../src/stores/authStore';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { AppNavigator } from './AppNavigator';

const Stack = createNativeStackNavigator();

export const RootNavigator = () => {
  const { accessToken } = useAuthStore();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {accessToken ? (
        <Stack.Screen
          name="App"
          component={AppNavigator}
        />
      ) : (
        <Stack.Group
          screenOptions={{}}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
};
