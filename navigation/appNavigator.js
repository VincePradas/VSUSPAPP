import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import LoginPage from '../screens/login';  // Adjust the path if needed
import GradesTab from '../screens/grades';  // Assuming this exists

const Stack = createStackNavigator();

const AppNavigator = () => {
    return (
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="LoginPage"
          screenOptions={{
            headerShown: false,  // Hide the default header
          }}
        >
          <Stack.Screen name="LoginPage" component={LoginPage} />
          <Stack.Screen name="GradesTab" component={GradesTab} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  };
export default AppNavigator;
