import React from 'react'
import Spinner from 'react-native-loading-spinner-overlay';
import { View, Button, Text } from 'react-native'
import * as firebase from 'firebase';

export default class LoadingScreen extends React.Component {

    // componentWillUnmount() {
    //     this.authSubscription();
    //   }
    viewStyle() {
        return {
          flex: 1,
          backgroundColor: '#fff',
          justifyContent: 'center',
          alignItems: 'center',
        }
      }

    componentDidMount() {
        const { navigate } = this.props.navigation;
    
        firebase.auth().onAuthStateChanged(user => {
          if (user) {
            navigate('loggedIn');
          } else {
            navigate('auth');
          }
        });
      }

    render() {
      return (
        <View style={this.viewStyle()}>
            <Text>Loading... </Text>
        </View>
      );
    }
  }