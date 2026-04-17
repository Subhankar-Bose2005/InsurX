import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer
        theme={{
          dark: false,
          colors: {
            primary: '#1565C0',
            background: '#F0F4F9',
            card: '#FFFFFF',
            text: '#1A2233',
            border: '#D5E3F5',
            notification: '#E87722',
          },
        }}
      >
        <StatusBar style="dark" backgroundColor="#FFFFFF" />
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
