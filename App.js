import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginPage from './screens/login';
import DashboardScreen from './screens/dashboard';
import GradesScreen from './screens/grades';
import PaymentsSceen from './screens/payments';

const Stack = createStackNavigator();

// Main AppNavigator
const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        {/* Login Screen */}
        <Stack.Screen
          name="Login"
          component={LoginPage}
          options={{ headerShown: false }}
        />

        {/* Dashboard Screen */}
        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{ headerShown: false }}
        />

        {/* Grades Screen */}
        <Stack.Screen
          name="Grades"
          component={GradesScreen}
          options={{ headerShown: false }}
        />
        {/* Payments Screen */}
        <Stack.Screen
          name="Payments"
          component={PaymentsSceen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
      
    </NavigationContainer>
  );
};

export default App;