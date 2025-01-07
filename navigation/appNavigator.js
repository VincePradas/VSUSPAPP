import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import LoginPage from '../screens/login';  
import GradesTab from '../screens/grades';  

const Stack = createStackNavigator();

const AppNavigator = () => {
    return (
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="LoginPage"
          screenOptions={{
            headerShown: false,  
          }}
        >
          <Stack.Screen name="LoginPage" component={LoginPage} />
          <Stack.Screen name="GradesTab" component={GradesTab} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  };
export default AppNavigator;
