import React from 'react';
import { View, Button, Text } from 'react-native'
import { StackNavigator } from 'react-navigation';
import Login from '../screens/LoginScreen';
import Main from '../screens/Main';

const RootStackNavigator = StackNavigator(
  {
    Login:{
      screen: Login

    },
    Main: {
      screen: Main,
    },
    
  },
  {
    navigationOptions: () => ({
      header: null
    }),
  }
);

export default class RootNavigator extends React.Component {
  render() {
 
    return <RootStackNavigator />;
  }
}
