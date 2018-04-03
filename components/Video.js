import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { Video, Location, Permissions, Constants } from 'expo';
import Icon from 'react-native-vector-icons/Ionicons';
import { connect } from 'react-redux';
import { RNS3 } from 'react-native-aws3';
import axios from 'axios';
import Spinner from 'react-native-loading-spinner-overlay';
import { camOrVid, startUniversalLoading, stopUniversalLoading } from '../actions';

class VideoComponent extends React.Component{

  constructor(props) {
    super(props);
    this.state = {
      location: null,
      errorMessage: null,
      isSending: false,
      playVideo: true
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
          response.body.postResponse.clientUsername = this.props.UserData.username
          const transcodeVideo = await axios.get('http://192.168.1.127:5000/v1/videoTranscoder?q=' + JSON.stringify(response.body));

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

    arr[3].place.location.longitude = location.coords.longitude;
    arr[3].place.location.latitude = location.coords.latitude;


    for (var i = 0; i < arr.length; i++) {
      if (arr[i].isEventOn) {
        //searching within 1km
        const result = isEventNear({ lng: location.coords.longitude, lat: location.coords.latitude }, { lng: arr[i].place.location.longitude, lat: arr[i].place.location.latitude }, 1);
        console.log(result);
        if (result) {
          this.props.startUniversalLoading();
          postToEvent(arr[i]);
        }
      }
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
      </View>
    )
  }
}

const mapStateToProps = state => {
  return state;
}

export default connect(mapStateToProps, { camOrVid, startUniversalLoading, stopUniversalLoading })(VideoComponent);
