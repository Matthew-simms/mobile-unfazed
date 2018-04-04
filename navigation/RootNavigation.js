import React from 'react';
import { View, Button, Text } from 'react-native'
import { StackNavigator } from 'react-navigation';
import Login from '../screens/LoginScreen';
import Main from '../screens/Main';
import WalkThrough from '../screens/Walkthrough';
import * as firebase from 'firebase';
import { connect } from 'react-redux';
import { login } from '../actions';

const LoggedOut = StackNavigator(
  {
    WalkThrough:{
      screen: WalkThrough
    },
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

const LoggedIn = StackNavigator(
  {
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

 class RootNavigator extends React.Component {
  constructor() {
    super();
    this.state = {
      loading: true,
    };
  }
  /**
   * When the App component mounts, we listen for any authentication
   * state changes in Firebase.
   * Once subscribed, the 'user' parameter will either be null 
   * (logged out) or an Object (logged in)
   */
  componentDidMount() {
    this.authSubscription = firebase.auth().onAuthStateChanged((user) => {
      this.setState({
        loading: false,
        user,
      })
      if (user != null) {
        console.log('userFromCDM', user.displayName)
        this.props.onLogin(user.displayName)
      }

    });
    
    console.log('----------------')
    console.log(this.state.user)
    console.log('----------------')
  }
  /**
   * Don't forget to stop listening for authentication state changes
   * when the component unmounts.
   */
  componentWillUnmount() {
    this.authSubscription();
  }

  render() {
          // The application is initialising
          if (this.state.loading) return null;
          // The user is an Object, so they're logged in
          if (this.state.user) return <LoggedIn />;
          // The user is null, so they're logged out
          return <LoggedOut />;
  }
}

const mapStateToProps = state => {
  //const videoState = state.videoReducer;
  return state;
}

const mapDispatchToProps = (dispatch) => {
  return {
      onLogin: (username) => { dispatch(login(username)); },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(RootNavigator);