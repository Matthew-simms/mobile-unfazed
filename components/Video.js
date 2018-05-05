import React from 'react';
import { View, Text, TouchableOpacity, Platform, Modal, Dimensions, StyleSheet } from 'react-native';
import { Button } from 'react-native-elements'
import { Video, Location, Permissions, Constants } from 'expo';
import Icon from 'react-native-vector-icons/Ionicons';
import { connect } from 'react-redux';
import { RNS3 } from 'react-native-aws3';
import axios from 'axios';
import Spinner from 'react-native-loading-spinner-overlay';
import { camOrVid, startUniversalLoading, stopUniversalLoading } from '../actions';

const { width, height } = Dimensions.get('window');
class VideoComponent extends React.Component{

  constructor(props) {
    super(props);
    this.state = {
      location: null,
      errorMessage: null,
      isSending: false,
      playVideo: true,
      notAtLoc: false,
      isNearBy: false,
    };
  }

  componentWillMount() {
    console.log("USERNAMEEEEE",this.props.UserData.username)

    if (Platform.OS === 'android' && !Constants.isDevice) {
      this.setState({
        errorMessage: 'Oops, this will not work on Sketch in an Android emulator. Try it on your device!',
      });
    } else {
      this._getLocationAsync();
    }
    console.log('Current play...', this.props.currentVenue);
  }
  _getLocationAsync = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      this.setState({
        errorMessage: 'Permission to access location was denied',
      });
    }

    let location = await Location.getCurrentPositionAsync({});
    this.setState({ location });
  };

  viewStyle() {
    return {
      flex: 1,
      backgroundColor: '#fff',
      justifyContent: 'center',
      alignItems: 'center',
    };
  }

  postVideo = () => {
    const { location } = this.state;
    console.log(location);

    if (location === null) {
      console.log('Location permissions not granted');
      return;
    }


    let uri = this.props.camDataReducer.uri;
    let lastDash = uri.lastIndexOf('/');
    let lastDot = uri.lastIndexOf('.');
    let type = uri.substr(lastDot + 1, uri.length);
    let name = uri.substr(lastDash + 1, lastDot);
    console.log(name, type);

    const arr = this.props.eventDataReducer;
    function isEventNear(checkPoint, centerPoint, km) {
      const ky = 40000 / 360;
      const kx = Math.cos(Math.PI * centerPoint.lat / 180.0) * ky;
      const dx = Math.abs(centerPoint.lng - checkPoint.lng) * kx;
      const dy = Math.abs(centerPoint.lat - checkPoint.lat) * ky;
      return Math.sqrt(dx * dx + dy * dy) <= km;
    }

    var postToEvent = (event) => {
      //console.log(event);
      const file = {
        uri,
        name,
        type: 'video/' + type
      };

      const options = {
        keyPrefix: 'trancode/',
        bucket: 'videos-to-be-transcoded-concertly',
        region: 'us-west-2',
        accessKey: 'AKIAIGZA4FARRFPR62EA',
        secretKey: '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',
        successActionStatus: 201
      };

      RNS3.put(file, options).then(async(response) => {
        if (response.status !== 201) {
            console.log(response);
        } else {

        console.log('first response', response);
        this.props.stopUniversalLoading();
        this.props.refreshMainC();
        setTimeout(() => {
          this.props.camOrVid('Camera');
        }, 3000);

          function getRandomArbitrary(min, max) {
            return Math.random() * (max - min) + min;
          }
          response.body.postResponse.clientId = getRandomArbitrary(7000, 1000000);
          response.body.postResponse.clientDate = new Date();
          response.body.postResponse.clientEventId = event.eventId;
          response.body.postResponse.EventId = event.id;
          response.body.postResponse.clientUsername = this.props.UserData.username;
          const transcodeVideo = await axios.get('https://concertly-app.herokuapp.com/v1/videoTranscoder?q=' + JSON.stringify(response.body));

          console.log('response', response);
          console.log('transcode', transcodeVideo);

          // if (response.status === 201) {
          //   this.props.stopUniversalLoading();
          //   this.props.refreshMainC();
          //   setTimeout(() => {
          //     this.props.camOrVid('Camera');
          //   }, 3000);
          // }
        }
        });
    }

    // uncomment to be able to post into 4th list event
    //arr[3].place.location.longitude = location.coords.longitude;
    //arr[3].place.location.latitude = location.coords.latitude;

    // Post video if user in location, otherwise rendering Oops screen.
    // const distanceResult = isEventNear({ lng: location.coords.longitude, lat: location.coords.latitude }, { lng: this.props.currentVenue.place.location.longitude, lat: this.props.currentVenue.place.location.latitude }, 1);
    // if ( this.props.currentVenue.isEventOn && distanceResult) {
    //   this.props.startUniversalLoading();
    //   postToEvent(this.props.currentVenue);
    //   console.log('Posted--->');
    // } else {
    //   this.setState({ isNearBy: true });
    //   console.log('Post failed due to location');
    // }
    let eventNearOn = 0;
    for (var i = 0; i < arr.length; i++) {
      if (arr[i].isEventOn) {
        //searching within 0.2km
        const result = isEventNear({ lng: location.coords.longitude, lat: location.coords.latitude }, { lng: arr[i].place.location.longitude, lat: arr[i].place.location.latitude }, 0.2);
        console.log('checking location', result);
        if (result) {
          this.props.startUniversalLoading();
          postToEvent(arr[i]);
          eventNearOn ++;
        }
        else {
          this.setState({ notAtLoc: true });
        }
      }
    }
    if (eventNearOn == 0) {
      this.setState({ isNearBy: true });
    }
    console.log('hi');
  }

  render() {

    if (this.props.universalLoadingRed) {
      return (
        <View style={this.viewStyle()}>
          <Spinner visible textContent={'Posting...'} textStyle={{ color: '#FFF' }} />
         </View>
      );
    }

    // if (this.state.notAtLoc) {
    //   return (
    //     <View style={this.viewStyle()}>
    //       <Text>Not at location</Text>
    //      </View>
    //   );
    // }

    let { playVideo } = this.state;
    let uri = this.props.camDataReducer.uri;
    const closeIcon = (<Icon name="md-close" size={50} color="white" />)

    return (
      <View>
        <Video
          source={{ uri }}
          rate={1.0}
          volume={0}
          isMuted={false}
          resizeMode="cover"
          shouldPlay={playVideo}
          isLooping
          style={{ width: '100%', height: '100%' }}
        />
        <TouchableOpacity
          onPress={() => {
            this.props.camOrVid('Camera');
          }}
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            marginTop: '5%',
            marginRight: '3%'
          }}
        >
          {closeIcon}
        </TouchableOpacity>
        <View
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          marginBottom: '5%',
          marginRight: '5%'
        }}>
          <TouchableOpacity
            onPress={this.postVideo.bind(this)}
            style={{
              borderColor: 'white',
              borderWidth: 2,
              borderRadius: 40,
              width: 120,
              height: 40,
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Text style={{color: 'white', padding: 2, alignSelf: 'center'}}>Post Video</Text>
          </TouchableOpacity>
        </View>
        <Modal
          animationType="slide"
          transparent={false}
          visible={this.state.isNearBy}
          onRequestClose={() => {
            alert('Modal has been closed.');
          }}>
        <View style={{ width: width, height: height, backgroundColor: 'white'}}>
          <View style={styles.buyTicketHeader}>
            <Text style={styles.buyTicketHeaderText}>OOPS!</Text>
          </View>
          <View style={styles.buyTicketContent}>
            <Text style={styles.center1}>You're not at a music event</Text>
            <Text style={styles.center2}>try film when you are at</Text>
            <Text style={styles.center3}>one :D</Text>
          </View>
          <Button
                onPress={() => this.setState({ isNearBy: false })}
                buttonStyle={{ backgroundColor: '#6600EC', borderRadius: 40, height: 50, marginTop: 100, marginLeft: 80, marginRight: 80,}}
                title='Okay, Got it'/>
        </View>
        </Modal>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  center1: {
    //top: 50,
    color: '#909090',
    fontFamily: 'Avenir',
    fontSize: 18,
    justifyContent: 'center',           // Center vertically
    alignItems: 'center',
    textAlign: 'center',
    paddingRight: 50,
    paddingLeft: 50,
  },
  center2: {
    //top: 50,
    color: '#909090',
    fontFamily: 'Avenir',
    fontSize: 18,
    justifyContent: 'center',           // Center vertically
    alignItems: 'center',
    textAlign: 'center',
    paddingRight: 50,
    paddingLeft: 50,
  },
  center3: {
    //top: 50,
    color: '#909090',
    fontFamily: 'Avenir',
    fontSize: 18,
    justifyContent: 'center',           // Center vertically
    alignItems: 'center',
    textAlign: 'center',
    paddingRight: 50,
    paddingLeft: 50,
  },
  // Buy Ticket Screen
  buyTicketHeader: {
    marginTop: height/3,
  },
  buyTicketHeaderText: {
    justifyContent: 'center',           // Center vertically
    alignItems: 'center',
    textAlign: 'center',
    fontSize: 28,                       // Bigger font size
    fontFamily: 'katanas-edge',
    color: 'black'
  },
  buyTicketContent: {
    marginTop: 70,
  },
  }
);

const mapStateToProps = state => {
  return state;
}

export default connect(mapStateToProps, { camOrVid, startUniversalLoading, stopUniversalLoading })(VideoComponent);
