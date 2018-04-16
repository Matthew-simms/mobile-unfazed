import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View, Text, Image, Dimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo';
import AppIntroSlider from 'react-native-app-intro-slider';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    key: 'somethun',
    title: 'Browse events that are happening right now',
    text: 'View events that are currently on in London and the best upcoming gigs',
    icon: 'ios-images-outline',
    colors: ['rgba(0,36,155,0.8)', 'rgba(26,0,87,0.8)'],
  },
  {
    key: 'somethun1',
    title: 'Watch live videos',
    text: 'From your favourite club nights and music events',
    icon: 'ios-options-outline',
    colors: ['#A3A1FF', '#3A3897'],
  },
  {
    key: 'somethun2',
    title: 'See what interests you',
    text: 'After seeing a gig you like, you can go to the venue and experience the what you just watched on your phone!',
    icon: 'ios-beer-outline',
    colors: ['#29ABE2', '#4F00BC'],
  },
  {
    key: 'somethun3',
    title: 'Film and contribute',
    text: 'While at a gig film parts of the show to share with everyone',
    icon: 'ios-beer-outline',
    colors: ['#29ABE2', '#4F00BC'],
  },
];

export default class Walk extends React.Component {

  _handleSignupDone = (e) => {
    this.props.navigation.navigate('Login'), { name: 'adam'};
  }

  _handleLoginDone = (e) => {
    this.props.navigation.navigate('Login', { name: 'jake'});
  }

  _renderItem = props => (
    <LinearGradient
      style={[styles.mainContent, {
        paddingTop: props.topSpacer,
        paddingBottom: props.bottomSpacer,
        width: props.width,
        height: props.height,
      }]}
      colors={props.colors}
      start={{x: 0, y: .1}} end={{x: .1, y: 1}}
    >
      <Ionicons style={{ backgroundColor: 'transparent' }} name={props.icon} size={200} color="white" />
      <View>
        <Text style={styles.title}>{props.title}</Text>
        <Text style={styles.text}>{props.text}</Text>
      </View>
    </LinearGradient>
  );

  render() {
    return (
      <View style={{
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        <View style={ style=styles.buttonRow }>

          <TouchableOpacity
            onPress={() => {
              /* 1. Navigate to the Auth route with params */
              this.props.navigation.navigate('Login', {
                fromWalkThrough: 'SIGNUP',
              });
            }} >
            <View style={ styles.outlineBtnWhite  }>
             <Text style={{ color: 'white', backgroundColor: 'rgba(255,255,255,0)' }}>Signup</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              /* 1. Navigate to the Auth route with params */
              this.props.navigation.navigate('Login', {
                fromWalkThrough: 'LOGIN',
              });
            }} >
            <View style={ styles.outlineBtnWhite }>
            <Text style={{ color: 'white', backgroundColor: 'rgba(255,255,255,0)' }}>Login</Text>
            </View>
          </TouchableOpacity>

      </View>
        <AppIntroSlider
          slides={slides}
          renderItem={this._renderItem}
          bottomButton
          hidePrevButton
          hideSkipButton
          onDone={(e) => this._handleLoginDone(e, this)}
          hideNextButton
          hideDoneButton
          onSkip={() => console.log("skipped")}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  imageWalkThrough: {
    width: 320,
    height: 320,
  },
  text: {
    color: 'rgba(255, 255, 255, 0.8)',
    backgroundColor: 'transparent',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 22,
    color: 'white',
    backgroundColor: 'transparent',
    textAlign: 'center',
    marginBottom: 16,
  },
  buttonRow: {
    position: 'absolute', 
    zIndex: 2,
    height: 80,
    left: 0, 
    top: height - 80, 
    width: width,
    padding: 10,
    flexDirection: 'row',
  },
  outlineBtnWhite: {
    width: width/2 -10,
    zIndex: 3,
    marginRight: 5,
    flex: 1,
    borderWidth: 2,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  }
});