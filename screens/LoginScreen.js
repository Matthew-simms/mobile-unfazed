import React from 'react';
import { View, Text, AsyncStorage, StyleSheet } from 'react-native'
import * as firebase from 'firebase';
import Main from './Main';
import { StackNavigator } from 'react-navigation';
import { FormLabel, FormInput, Button, SocialIcon, Divider } from 'react-native-elements'
import { MaterialIcons } from '@expo/vector-icons';
import { connect } from 'react-redux';
import { login, loginFb, signup } from '../actions';
import { mainCss } from '../styles/mainCss'

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

class auth extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            email: 'Test@test.com', 
            password: '123456', error: '', 
            loading: false,
            userInfo: null,
            username: null,
            fromWalkThrough: this.props.navigation.state.params.fromWalkThrough
         };
    }

    componentDidMount() {
        console.log('userClickedSIGNUP', this.state.fromWalkThrough);
    }

   async onLoginPress() {

        this.setState({ error: '', loading: true });

        const { email, password, username } = this.state;

       await firebase.auth().signInWithEmailAndPassword(email, password)
            .then(() => {
                this.setState({ error: '', loading: false });
            })
            .catch(() => {
                this.setState({ error: 'Authentication failed', loading: false });
            })

    }

    // firebase.auth().createUserWithEmailAndPassword(this.state.email, this.state.password).then(function(authData){
    //     this.writeUserData(authData.uid, users_nickname);
    //   }).catch(function(error){
    //     //bad
    //   });
    
    writeUserData(uid, name) {
        // uid can also come from let userId = firebaseApp.auth().currentUser.uid;
        firebase.database().ref('users/' + uid + '/').set({
            nickname: name,
        });
      }

    onSignUpPress() {
        this.setState({ error: '', loading: true });
        const { email, password, username } = this.state;

        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then((user) => {
                // console.log('USERRR',user)
                this.setState({ error: '', loading: false });
                // this.props.navigation.navigate('Main');
                this.props.onSignUp(this.state.username)
                // add user parent of uid, email and username 
                if (user) {
                    firebase.database().ref("users").child(user.uid).set({
                        email: user.email,
                        uid : user.uid,
                        username: this.state.username
                    })
                } 
                return user.updateProfile({displayName: username})
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
        this.props.onLoginFB(this.state.userInfo)

    // add or check login info to Firebase
      const credential = firebase.auth.FacebookAuthProvider.credential(token)

     firebase.auth().signInWithCredential(credential)
      .then(() => {
        this.setState({ error: '', loading: false });
        this.props.navigation.navigate('Main');
          // save user data to firebase 
        //  if ( this.state.userInfo ) {
        //     await firebase.database().ref("users").child(userInfo.uid).set({
        //          uid : userInfo.id,
        //          username: userInfo.name,
        //          profilePicture: userInfo.picture.data.url
        //      })
        //  }
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
            { this.state.fromWalkThrough == "LOGIN" ?
            <View>
                <Button
                buttonStyle={{ backgroundColor: '#6600EC', borderRadius: 40, height: 50 }}
                onPress={this.onLoginPress.bind(this)}
                title='Login'/>
            </View> : null }

            { this.state.fromWalkThrough == "SIGNUP" ?
            <View>    
                <Button
                buttonStyle={{ backgroundColor: '#6600EC', borderRadius: 40, height: 50 }}
                onPress={this.onSignUpPress.bind(this)}
                title='Sign up'/>
            </View> : null }
           
            <Divider style={{ backgroundColor: '#C7C7C7', marginTop: 20, marginBottom: 10 }} />
            <SocialIcon
            onPress={this.loginWithFacebook.bind(this)}
            title='Connect With Facebook'
            button
            raised={false}
            type='facebook'
            />
            
        </View>

    }
    
    render() {

        return (
            <View> 
             { this.state.fromWalkThrough == "SIGNUP" ? 
                <View>
                    <FormLabel>User Name</FormLabel>
                    <FormInput
                    value = {this.state.username} 
                    onChangeText={username => this.setState({ username })}
                    placeholder='Jonny'
                    /> 
                </View>
                : null }
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

const mapStateToProps = state => {
    //const videoState = state.videoReducer;
    return state;
  }

  const mapDispatchToProps = (dispatch) => {
    return {
        onLogin: (username) => { dispatch(login(username)); },
        onLoginFB: (userInfo) => { dispatch(loginFb(userInfo)); },
        onSignUp: (username) => { dispatch(signup(username)); }
    }
}
  
  export default connect(mapStateToProps, mapDispatchToProps)(auth);
  
//   const styles = StyleSheet.create({
//     button: {
//         backgroundColor: '#6600EC',
//         // alignSelf: 'stretch',
//         // flex:1,
//       },
//   });