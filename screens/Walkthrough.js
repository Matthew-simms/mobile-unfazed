import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View, Text, Image, Dimensions, TouchableOpacity } from 'react-native';
import { LinearGradient, Font } from 'expo';
import AppIntroSlider from 'react-native-app-intro-slider';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    key: 'somethun',
    title: 'Browse events that are happening right now',
    image: require('../assets/images/Slide_1_icon.png'),
    colors: ['#FFFFFF', '#FFFFFF'],
  },
  {
    key: 'somethun1',
    title: 'Watch live videos from the best nightclubs and music venues',
    image: require('../assets/images/slide_2_icon.png'),
    colors: ['#FFFFFF', '#FFFFFF'],
  },
  {
    key: 'somethun2',
    title: 'Goto the event and film to contribute for friends and others to see!',
    image: require('../assets/images/slide_3_icon.png'),
    colors: ['#FFFFFF', '#FFFFFF'],
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
    <View>
      <Text style={styles.title}>{props.title}</Text>
      {/* <Text style={styles.text}>{props.text}</Text> */}
    </View>
    <Image style={styles.image} source={props.image}/>
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
             <Text style={{ fontSize: 16, fontFamily: 'opensans', fontWeight: 'bold', color: 'rgba(141,0,143,100)', backgroundColor: 'rgba(255,255,255,0)' }}>Signup</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              /* 1. Navigate to the Auth route with params */
              this.props.navigation.navigate('Login', {
                fromWalkThrough: 'LOGIN',
              });
            }} >
            <View style={ styles.secondaryBtn }>
            <Text style={{ fontSize: 16, fontFamily: 'opensans', fontWeight: 'bold', color: 'rgba(141,0,143,100)', backgroundColor: 'rgba(255,255,255,0)' }}>Login</Text>
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
          activeDotColor='rgba(187, 187, 187, 100)'
          dotColor='rgba(216, 216, 216, 100)'
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
  image: {
    width: 310,
    height: 320,
    marginBottom: 40,
  },
  text: {
    color: 'rgba(255, 255, 255, 0.8)',
    backgroundColor: 'transparent',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 20,
    color: 'rgba(44, 44, 44, 100)',
    backgroundColor: 'transparent',
    textAlign: 'center',
    padding: 30,
    fontFamily: 'opensans',
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
    backgroundColor: 'rgba(237,237,237,100)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
  },
  secondaryBtn: {
    width: width/2 -10,
    zIndex: 3,
    marginRight: 5,
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
  }
});