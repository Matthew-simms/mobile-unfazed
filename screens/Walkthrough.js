import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View, Text, Image, Dimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo';
import AppIntroSlider from 'react-native-app-intro-slider';

const { width, height } = Dimensions.get('window');

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
  }
});

const slides = [
  {
    key: 'somethun',
    title: 'Quick setup, good defaults',
    text: 'React-native-app-intro-slider is easy to setup with a small footprint and no dependencies. And it comes with good default layouts!',
    icon: 'ios-images-outline',
    colors: ['#63E2FF', '#B066FE'],
  },
  {
    key: 'somethun1',
    title: 'Super customizable',
    text: 'The component is also super customizable, so you can adapt it to cover your needs and wants.',
    icon: 'ios-options-outline',
    colors: ['#A3A1FF', '#3A3897'],
  },
  {
    key: 'somethun2',
    title: 'No need to buy me beer',
    text: 'Usage is all free',
    icon: 'ios-beer-outline',
    colors: ['#29ABE2', '#4F00BC'],
  },
];

export default class Walk extends React.Component {
  _handleDone = (e) => {
    this.props.navigation.navigate('Login');
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
        <View style={{   
                    position: 'absolute', 
                      zIndex: 2,
                      height: 80,
                      left: 0, 
                      top: height - 80, 
                      width: width,
                      padding: 10,
                      flexDirection: 'row', }}>
          <TouchableOpacity
          onPress={(e) => this._handleDone(e, this)} >
            <View style={{
                        width: width/2 -10,
                        zIndex: 3,
                        marginRight: 5,
                        flex: 1,
                        borderWidth: 2,
                        borderColor: 'white',
                        justifyContent: 'center',
                        alignItems: 'center',
                        }}>
            <Text style={{ color: 'white', backgroundColor: 'rgba(255,255,255,0)' }}>Signup</Text>
            </View>
          </TouchableOpacity>
          <View style={{backgroundColor: 'green',     
                      width: width/2 -20,
                      zIndex: 3,
                      marginLeft: 5,
                       }}>
          </View>
      </View>
        <AppIntroSlider
          slides={slides}
          renderItem={this._renderItem}
          bottomButton
          hidePrevButton
          hideSkipButton
          onDone={(e) => this._handleDone(e, this)}
          hideNextButton
          hideDoneButton
          onSkip={() => console.log("skipped")}
        />
      </View>
    );
  }
}