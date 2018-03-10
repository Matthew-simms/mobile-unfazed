import React from 'react';
import { View, Text, AsyncStorage } from 'react-native'
import * as firebase from 'firebase';
import Main from './Main';
import { StackNavigator } from 'react-navigation';
import { FormLabel, FormInput, Button } from 'react-native-elements'

firebase.initializeApp({
        apiKey: "AIzaSyAh5TKxXzav7bYBvyO9dKQnTtvKMxjE0C0",
        authDomain: "unfazed-e30ae.firebaseapp.com",
        databaseURL: "https://unfazed-e30ae.firebaseio.com",
        projectId: "unfazed-e30ae",
        storageBucket: "unfazed-e30ae.appspot.com",
        messagingSenderId: "297364784768"
}
)

// const ACCESS_TOKEN = 'access_token'

export default class login extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            email: 'Test@test.com', 
            password: '123456', error: '', 
            loading: false,
            userInfo: null,
         };
    }

    // async componentDidMount() {

    //    await firebase.auth().onAuthStateChanged((user) => {
    //       if (user != null) {
    //         console.log(user)
    //       }
    //     })
    //   }

    onLoginPress() {

        this.setState({ error: '', loading: true });

        const { email, password } = this.state;
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then(() => {
                this.setState({ error: '', loading: false });
                this.props.navigation.navigate('Main');
            })
            .catch(() => {
                this.setState({ error: 'Authentication failed', loading: false });
            })
    }

    onSignUpPress() {
        this.setState({ error: '', loading: true });
        const { email, password } = this.state;
        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then(() => {
                this.setState({ error: '', loading: false });
                this.props.navigation.navigate('Main');
            })
            .catch(() => {
                this.setState({ error: 'Authentication failed', loading: false });
            })
    }


  async loginWithFacebook() {
    this.setState({ error: '', loading: true });
    const { type, token } = await Expo.Facebook.logInWithReadPermissionsAsync('1972286079755935', { permissions: ['public_profile'] })

    if (type == 'success') {
    // Get user's name using the FB Graph API
    const response = await fetch(
        `https://graph.facebook.com/me?access_token=${token}&fields=id,name,picture.type(large)`)
        const userInfo = await response.json()
        this.setState({ userInfo })
        console.log(await userInfo)

     // Save FB token to local storage
        // await AsyncStorage.setItem(ACCESS_TOKEN, token);
        // console.log('----------------')
        // console.log(token)
        // console.log('----------------')

    // add or check login info to Firebase
      const credential = firebase.auth.FacebookAuthProvider.credential(token)

     firebase.auth().signInWithCredential(credential)
      .then(() => {
        this.setState({ error: '', loading: false });
        this.props.navigation.navigate('Main');
    })
    .catch((error) => {
        this.setState({ error: 'Authentication failed', loading: false }); 
      })
    }
  }

    renderButtonOrLoading() {
        if (this.state.loading) {
            return <Text> Loading </Text>
        }
        return <View>
            <Button
                onPress={this.onLoginPress.bind(this)}
                title='Login'/>
            <Button
                onPress={this.onSignUpPress.bind(this)}
                title='Sign up'/>
            <Button
                onPress={this.loginWithFacebook.bind(this)}
                title='Connect With Facebook'/>

        </View>

    }
    render() {
        return (
            <View>
                <FormLabel>Email</FormLabel>
                <FormInput
                 value = {this.state.email} 
                 onChangeText={email => this.setState({ email })}
                 placeholder='john@icloud.com'
                 />
                <FormLabel>Password</FormLabel>
                <FormInput 
                value = {this.state.password}
                secureTextEntry
                placeholder='*******'
                onChangeText={password => this.setState({ password })}
                />
                <Text>{this.state.error}</Text>
                {this.renderButtonOrLoading()}

            </View>

        )

    }


}