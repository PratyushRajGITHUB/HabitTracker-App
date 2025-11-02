import 'react-native-gesture-handler'; // required for gesture handler
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import TabNavigator from './navigation/TabNavigator';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#4f46e5',
    accent: '#06b6d4',
  },
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={theme}>
        <NavigationContainer>
          <TabNavigator />
        </NavigationContainer>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
