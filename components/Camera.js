import React from 'react'
import { StyleSheet, Text, View, Dimensions, TouchableOpacity, Vibration, } from 'react-native'
import { Button } from 'react-native-elements'
import { Video, Camera, Permissions, Constants,  FileSystem, Font } from 'expo'
import GalleryScreen from './GalleryScreen';
import isIPhoneX from 'react-native-is-iphonex';
import { connect } from 'react-redux';
import { storeCamData, camOrVid } from '../actions';

/*
* This is a test camera component
*
*/

// Camera settings
const landmarkSize = 2;

const flashModeOrder = {
  off: 'on',
  on: 'auto',
  auto: 'torch',
  torch: 'off',
};

const wbOrder = {
  auto: 'sunny',
  sunny: 'cloudy',
  cloudy: 'shadow',
  shadow: 'fluorescent',
  fluorescent: 'incandescent',
  incandescent: 'auto',
};

class CameraComponent extends React.Component {
  constructor(props, context) {
     super(props, context);
     this.state = {
      // Camera state
      flash: 'off',
      zoom: 0,
      autoFocus: 'on',
      depth: 0,
      type: 'back',
      whiteBalance: 'auto',
      ratio: '16:9',
      ratios: [],
      photoId: 1,
      showGallery: false,
      photos: [],
      faces: [],
      displayRec: 'none',
      hasCameraPermission: null,
      bC: 'white',
      cameraRunning: false
    }
  }

  async componentWillMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === 'granted' });
  }

  // Camera
  getRatios = async () => {
    const ratios = await this.camera.getSupportedRatios();
    return ratios;
  };

  toggleView() {
    this.setState({
      showGallery: !this.state.showGallery,
    });
  }

  toggleFacing() {
    this.setState({
      type: this.state.type === 'back' ? 'front' : 'back',
    });
  }

  toggleFlash() {
    this.setState({
      flash: flashModeOrder[this.state.flash],
    });
  }

  setRatio(ratio) {
    this.setState({
      ratio,
    });
  }

  toggleWB() {
    this.setState({
      whiteBalance: wbOrder[this.state.whiteBalance],
    });
  }

  toggleFocus() {
    this.setState({
      autoFocus: this.state.autoFocus === 'on' ? 'off' : 'on',
    });
  }

  zoomOut() {
    this.setState({
      zoom: this.state.zoom - 0.1 < 0 ? 0 : this.state.zoom - 0.1,
    });
  }

  zoomIn() {
    this.setState({
      zoom: this.state.zoom + 0.1 > 1 ? 1 : this.state.zoom + 0.1,
    });
  }

  setFocusDepth(depth) {
    this.setState({
      depth,
    });
  }

  takePicture = async function() {
    if (this.camera) {
      this.camera.takePictureAsync().then(data => {
        FileSystem.moveAsync({
          from: data.uri,
          to: `${FileSystem.documentDirectory}photos/Photo_${this.state.photoId}.jpg`,
        }).then(() => {
          this.setState({
            photoId: this.state.photoId + 1,
          });
          Vibration.vibrate();
        });
      });
    }
  };

  startCounting() {
    setTimeout(() => {
      if (this.state.cameraRunning === true) {
        if (this.camera === null) {
          //do nothing, already moved off component
        } else {
          this.camera.stopRecording();
          this.setState({
            bC: 'white',
            displayRec: 'none',
            cameraRunning: false
          });
          this.props.camOrVid('Video');
        }
      } else {
        console.log('Camera already stopped');
      }
    }, 90000);
  }

  toggleCamera = async () => {
    const { bC } = this.state;
    if(bC === 'white') {
      this.setState({
        bC: 'red',
        displayRec: 'flex',
        cameraRunning: true
      });
      this.startCounting();
      this.camera.recordAsync().then(data => {
        console.log(data);
        this.props.storeCamData(data);
      });
    } else {
      this.camera.stopRecording();
      this.setState({
        bC: 'white',
        displayRec: 'none',
        cameraRunning: false
      });
      this.props.camOrVid('Video');
      console.log('Stopped recording');
    }
  }

  renderGallery() {
    return <GalleryScreen onPress={this.toggleView.bind(this)} />;
  }

  render() {
    const { hasCameraPermission, bC } = this.state;
    console.log('hasCameraPermission:', hasCameraPermission);
    if (hasCameraPermission === null) {
      return <View />;
    } else if (hasCameraPermission === false) {
      return <Text>Please grant access to camera in settings</Text>;
    } else {
    return (
      <View style={{ flex: 1 }}>
        <Camera
          ref={ref => { this.camera = ref; }}
          style={{ flex: 1 }}
          type={this.state.type}
        >
          <View
            style={styles.mainView}
          >
            <View
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                marginRight: '5%',
                marginTop: '7%',
                flexDirection: 'row',
                display: this.state.displayRec
              }}
            >
              <View style={styles.recSmallButton}/>
              <Text style={styles.recText}>
                Rec
              </Text>
            </View>
            <TouchableOpacity
              style={{
                flex: 1,
                alignSelf: 'flex-end',
                alignItems: 'center',
               }}
              onPress={() => {
                this.toggleCamera();
              }}>
              <View
                style={{
                  borderWidth: 4,
                  borderColor: bC,
                  width: 70,
                  height: 70,
                  backgroundColor: 'red',
                  borderRadius: 70,
                }}
              />
            </TouchableOpacity>
          </View>
        </Camera>
      </View>
    );
  }
  }
}
  // END camera

export default connect(null, {storeCamData, camOrVid})(CameraComponent);

  const styles = StyleSheet.create({
    /*
     * CAMERA STYLES
     */
    navigation: {
      flex: 1,
    },
    mainView: {
      flex: 1,
      backgroundColor: 'transparent',
      flexDirection: 'row'
    },
    recSmallButton: {
      borderWidth: 0,
      width: 5,
      height: 5,
      backgroundColor: 'red',
      borderRadius: 5,
      marginTop: 10
    },
    recText: {
      color: 'red',
      marginLeft: 3
    },
    gallery: {
      flex: 1,
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    flipButton: {
      flex: 0.3,
      height: 40,
      marginHorizontal: 2,
      marginBottom: 10,
      marginTop: 20,
      borderRadius: 8,
      borderColor: 'white',
      borderWidth: 1,
      padding: 5,
      alignItems: 'center',
      justifyContent: 'center',
    },
    flipText: {
      color: 'white',
      fontSize: 15,
    },
    item: {
      margin: 4,
      backgroundColor: 'indianred',
      height: 35,
      width: 80,
      borderRadius: 5,
      alignItems: 'center',
      justifyContent: 'center',
    },
    picButton: {
      backgroundColor: 'darkseagreen',
    },
    galleryButton: {
      backgroundColor: 'indianred',
    },
    camRow: {
      flexDirection: 'row',
      },
    }
  );
