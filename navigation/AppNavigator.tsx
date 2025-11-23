import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { DashboardScreen } from '../screens/DashboardScreen';
import { TransactionsScreen } from '../screens/TransactionsScreen';
import { BudgetsScreen } from '../screens/BudgetsScreen';
import { AnalyticsScreen } from '../screens/AnalyticsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const DashboardStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: true,
      headerStyle: { backgroundColor: '#f5f5f5' },
      headerTitleStyle: { fontSize: 18, fontWeight: '600' },
    }}
  >
    <Stack.Screen
      name="DashboardHome"
      component={DashboardScreen}
      options={{ title: 'Dashboard' }}
    />
  </Stack.Navigator>
);

const TransactionsStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: true,
      headerStyle: { backgroundColor: '#f5f5f5' },
      headerTitleStyle: { fontSize: 18, fontWeight: '600' },
    }}
  >
    <Stack.Screen
      name="TransactionsHome"
      component={TransactionsScreen}
      options={{ title: 'Transactions' }}
    />
  </Stack.Navigator>
);

const BudgetsStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: true,
      headerStyle: { backgroundColor: '#f5f5f5' },
      headerTitleStyle: { fontSize: 18, fontWeight: '600' },
    }}
  >
    <Stack.Screen
      name="BudgetsHome"
      component={BudgetsScreen}
      options={{ title: 'Budgets' }}
    />
  </Stack.Navigator>
);

const AnalyticsStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: true,
      headerStyle: { backgroundColor: '#f5f5f5' },
      headerTitleStyle: { fontSize: 18, fontWeight: '600' },
    }}
  >
    <Stack.Screen
      name="AnalyticsHome"
      component={AnalyticsScreen}
      options={{ title: 'Analytics' }}
    />
  </Stack.Navigator>
);

const SettingsStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: true,
      headerStyle: { backgroundColor: '#f5f5f5' },
      headerTitleStyle: { fontSize: 18, fontWeight: '600' },
    }}
  >
    <Stack.Screen
      name="SettingsHome"
      component={SettingsScreen}
      options={{ title: 'Settings' }}
    />
  </Stack.Navigator>
);

export const AppNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;

          if (route.name === 'Dashboard') {
            iconName = 'dashboard';
          } else if (route.name === 'Transactions') {
            iconName = 'swap-horiz';
          } else if (route.name === 'Budgets') {
            iconName = 'account-balance-wallet';
          } else if (route.name === 'Analytics') {
            iconName = 'analytics';
          } else if (route.name === 'Settings') {
            iconName = 'settings';
          }

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#999',
        tabBarLabelStyle: { fontSize: 12, marginTop: -5 },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardStack}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen
        name="Transactions"
        component={TransactionsStack}
        options={{ title: 'Transactions' }}
      />
      <Tab.Screen
        name="Budgets"
        component={BudgetsStack}
        options={{ title: 'Budgets' }}
      />
      <Tab.Screen
        name="Analytics"
        component={AnalyticsStack}
        options={{ title: 'Analytics' }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsStack}
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );
};
