import React from 'react'
import { StyleSheet, Text, View, Dimensions, ListView, FlatList, TouchableOpacity, Image, ImageBackground,ActivityIndicator, Slider, Vibration, ScrollView } from 'react-native'
import { Button} from 'react-native-elements'
import { Video, LinearGradient, Camera, Permissions, Constants,  FileSystem, } from 'expo'
import axios from 'axios'
import Swiper from 'react-native-swiper'
import randomcolor from 'randomcolor'
// import Row from './components/Row'
import { AnimatedCircularProgress } from 'react-native-circular-progress'
import isIPhoneX from 'react-native-is-iphonex';
import GalleryScreen from './components/GalleryScreen';

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


// Detect screen size to calculate row height
const screen = Dimensions.get('window');
const { width, height } = Dimensions.get('window'); 

class TitleText extends React.Component {
  render() {
    return (
      <Text style={{ fontSize: 48, color: 'white' }}>
        {this.props.label}
      </Text>
    )
  }
}


export default class App extends React.Component {
  constructor(props, context) {
    super(props, context);

    // app state
    this.state = {
      // ListView DataSource object
      dataSource: new ListView.DataSource({
        rowHasChanged: (row1, row2) => row1 !== row2,
      }),
      data: null,
      playbackInstanceDuration: null,
      venue: [],
      currentVenue: [],
      videos: [],
      eventId: null,
      selectedVenueIndex: 0,
      selectedVidIndex: 0,
      next: 1,
      isVenueLoading: true,
      displayMediaInfo: false,
      venueBefore: false,
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
      permissionsGranted: false,
    }
  }

  async componentDidMount() {
    // Camera Permisisons
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ permissionsGranted: status === 'granted' });

    FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'photos').catch(e => {
      console.log(e, 'Directory exists');
    });
    /* 
     * http://localhost:5000/v1/venues/search/uk?q=London&o=2
     * onLoad pass location data, GET first item(venue) in db with most videos
     * then pass eventId, GET videos in that event, load latest posted video
     */
      // const venueRequest = await axios.get('https://concertly-app.herokuapp.com/v1/venues/search/uk?q=London&o=0')
      // .catch(function(error) {
      //   console.log(error.message);
      //     throw error;
      //   })
      // console.log('Venue' + JSON.stringify(venueRequest.data.payload))
  

      // GET all events currently on in London
      const allEventsRequest = await axios.get('https://concertly-app.herokuapp.com/v1/venues/allevents/uk?q=London')
      console.log('all events' + allEventsRequest.data.payload)
        //  this.noVenueData(allEventsRequest)
  
      // console.log(venueRequest.data.payload[0].place.name)
      const videoRequest = await axios.get('https://concertly-app.herokuapp.com/v1/video?id=' + allEventsRequest.data.payload[1].eventId)
      .catch(function(error) {
        console.log(error.message);
          throw error;
        })
      console.log(videoRequest.data.payload[0])
  
    // this.noVideoData(videoRequest)

    // GET upcoming events in London
    const upcomingEventsRequest = await axios.get('https://concertly-app.herokuapp.com/v1/venues/upcoming/uk?q=London')
    .catch(function(error) {
      console.log(error.message);
        throw error;
      })
    console.log(upcomingEventsRequest.data.payload)
  
      this.setState({
        data: allEventsRequest.data.payload.concat(upcomingEventsRequest.data.payload),
        venue:  allEventsRequest.data.payload,
        currentVenue: allEventsRequest.data.payload[0],
        videos: videoRequest.data.payload,
        upcomingEvents : upcomingEventsRequest.data.payload,
        selectedVenueIndex: 0,
        selectedVidIndex: 0,
        vidLink: videoRequest.data.payload[0].instaVideoLink,
        isVenueLoading: false
      });
      console.log(this.state.currentVenue)
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


renderGallery() {
  return <GalleryScreen onPress={this.toggleView.bind(this)} />;
}

renderNoPermissions() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 10 }}>
      <Text style={{ color: 'white' }}>
        Camera permissions not granted - cannot open camera preview.
      </Text>
    </View>
  );
}

renderCamera() {
  return (
    <Camera
      ref={ref => {
        this.camera = ref;
      }}
      style={{
        flex: 1,
      }}
      type={this.state.type}
      flashMode={this.state.flash}
      autoFocus={this.state.autoFocus}
      zoom={this.state.zoom}
      whiteBalance={this.state.whiteBalance}
      ratio={this.state.ratio}
      focusDepth={this.state.depth}>
      <View
        style={{
          flex: 0.5,
          backgroundColor: 'transparent',
          flexDirection: 'row',
          justifyContent: 'space-around',
          paddingTop: Constants.statusBarHeight / 2,
        }}>
        <TouchableOpacity style={styles.flipButton} onPress={this.toggleFacing.bind(this)}>
          <Text style={styles.flipText}> FLIP </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.flipButton} onPress={this.toggleFlash.bind(this)}>
          <Text style={styles.flipText}> FLASH: {this.state.flash} </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.flipButton} onPress={this.toggleWB.bind(this)}>
          <Text style={styles.flipText}> WB: {this.state.whiteBalance} </Text>
        </TouchableOpacity>
      </View>
      <View
        style={{
          flex: 0.4,
          backgroundColor: 'transparent',
          flexDirection: 'row',
          alignSelf: 'flex-end',
          marginBottom: -5,
        }}>
        {this.state.autoFocus !== 'on' ? (
          <Slider
            style={{ width: 150, marginTop: 15, marginRight: 15, alignSelf: 'flex-end' }}
            onValueChange={this.setFocusDepth.bind(this)}
            step={0.1}
          />
        ) : null}
      </View>
      <View
        style={{
          flex: 0.1,
          paddingBottom: isIPhoneX ? 20 : 0,
          backgroundColor: 'transparent',
          flexDirection: 'row',
          alignSelf: 'flex-end',
        }}>
        <TouchableOpacity
          style={[styles.flipButton, { flex: 0.1, alignSelf: 'flex-end' }]}
          onPress={this.zoomIn.bind(this)}>
          <Text style={styles.flipText}> + </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.flipButton, { flex: 0.1, alignSelf: 'flex-end' }]}
          onPress={this.zoomOut.bind(this)}>
          <Text style={styles.flipText}> - </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.flipButton, { flex: 0.25, alignSelf: 'flex-end' }]}
          onPress={this.toggleFocus.bind(this)}>
          <Text style={styles.flipText}> AF : {this.state.autoFocus} </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.flipButton, styles.picButton, { flex: 0.3, alignSelf: 'flex-end' }]}
          onPress={this.takePicture.bind(this)}>
          <Text style={styles.flipText}> SNAP </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.flipButton, styles.galleryButton, { flex: 0.25, alignSelf: 'flex-end' }]}
          onPress={this.toggleView.bind(this)}>
          <Text style={styles.flipText}> Gallery </Text>
        </TouchableOpacity>
      </View>
    </Camera>
  );
}
// END camera
  
// Controls view
_getMMSSFromMillis(millis) {
  const totalSeconds = millis / 1000;
  const seconds = Math.floor(totalSeconds % 60);
  const minutes = Math.floor(totalSeconds / 60);

  // console.log(totalSeconds)

  const padWithZero = number => {
    const string = number.toString();
    if (number < 10) {
      return '0' + string;
    }
    return string;
  };
  return padWithZero(minutes) + ':' + padWithZero(seconds);
}

 _onRowPress = ( rowData ) => {
  // Navigate back to Home video screen
  this.swiper.scrollBy(1)
  // pass row event id data
  this.setState(prevState => ({ 
    eventId: rowData.eventId,
    currentVenue: rowData,
    // selectedVenueIndex: rowData.index
   }))
   console.log(rowData)
   // update selectedVenueIndex
  this._handleSelectedEvent()
}

 async _handleSelectedEvent () {
    // pass eventId from selected row
    const videoRequest = await axios.get('https://concertly-app.herokuapp.com/v1/video?id=' + this.state.eventId);
    console.log(videoRequest)
    // update video state with new videos
    this.setState(prevState => ({
      videos: videoRequest.data.payload,
      selectedVidIndex: 0,
    }));
  }

    viewStyle() {
      return {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
      }
    }

    _playbackCallback(playbackStatus) {
    this.setState({
      playbackInstancePosition: playbackStatus.positionMillis,
      playbackInstanceDuration: playbackStatus.durationMillis,
      shouldPlay: playbackStatus.shouldPlay,
    });
  }
      

  render() {
    let {selectedVidIndex, videos, selectedVenueIndex, venue, ended, noEvents, currentVenue, venueBefore, hasCameraPermission} = this.state;
    if (this.state.isVenueLoading) {
      // loading spinner
      return (
        <View style={styles.container}>
          <ActivityIndicator size="large"/>
        </View>
      );
    }
    const cameraScreenContent = this.state.permissionsGranted
    ? this.renderCamera()
    : this.renderNoPermissions();
    const content = this.state.showGallery ? this.renderGallery() : cameraScreenContent;
    return (
      <Swiper
      loop={false}
      showsPagination={false}
      index={1}
      ref={(swiper) => {this.swiper = swiper;}}
      >
      <View style={this.viewStyle()}>
         <FlatList
          data={this.state.data}
          renderItem={rowParameter =>  {
          const rowData = rowParameter.item
         // console.log('rowData'+ rowData)
            return (
              <TouchableOpacity
              // Pass row style
              style={styles.row}
              // Call onPress function passed from List component when pressed
              onPress={this._onRowPress.bind(this, rowData)}
              // Dim row a little bit when pressed
              activeOpacity={0.7}
            >
              { !rowData.upcomingEvent
                ?  <LinearGradient
                      colors={['#00249b', '#1a0057']}
                      start={[0.1,0.1]}
                      end={[0.5,0.5]}
                      style={{ padding: 20, borderRadius: 9 }}>
                    {/* Background */}
                    <View style={ styles.listBackground }>
                      {/* Title */}
                      <Text style={[styles.text, styles.title]}>{rowData.eventName.toUpperCase()}</Text>
                          {/* Venue Name */}
                          <Text style={[styles.text]}>{rowData.place.name}</Text> 
                    </View>
                    <Button
                      onPress={this._onRowPress.bind(this, rowData)}
                      title={ 'Watch' }
                      rounded
                      buttonStyle={styles.button}
                    />
                  </LinearGradient>
                : <ImageBackground source={{uri: rowData.upcomingArt }} style={ styles.imageBackgroundUpcoming }>
                    <View style={ styles.bgContainer }>
                      <Button
                        title={ 'Watch most recent gig' }
                        rounded
                        buttonStyle={styles.button}
                      />
                    </View> 
                  </ImageBackground>
              }
            </TouchableOpacity>
            )
          }}
          keyExtractor={rowData => rowData.id}
        />
      </View>
      <Swiper
        horizontal={false}
        loop={false}
        showsPagination={false}
        index={1}
        ref={(swiper) => {this.swiper = swiper;}}
        >
        <View style={this.viewStyle()}>
          <TitleText label="Top" />
        </View>
        <View style={this.viewStyle()}>
        <Text>
          {this._getMMSSFromMillis(this.state.playbackInstanceDuration)}
        </Text>
        {/* <AnimatedCircularProgress
          size={120}
          width={15}
          fill={100}
          tintColor="#00e0ff"
          onAnimationComplete={() => console.log('onAnimationComplete')}
          backgroundColor="#3d5875" /> */}
        <Video
        source={{ uri: videos[selectedVidIndex].instaVideoLink }}
        onPlaybackStatusUpdate={this._playbackCallback.bind(this)}
        rate={1.0}
        volume={0.0}
        muted={true}
        resizeMode="cover"
        shouldPlay
        isLooping
        style={styles.VideoContainer}
      />
        </View>
        {/* Event Details View */}
        <View style={this.viewStyle()}>
        <ScrollView>
          <LinearGradient
            colors={['#00249b', '#1a0057']}
            start={[0.1,0.1]}
            end={[0.5,0.5]}>
          {/* Background */}
          <View style={ styles.listBackground }>
            {/* Title */}
            <Text style={[styles.text, styles.title]}>{currentVenue.eventName.toUpperCase()}</Text>
              {/* Venue Name */}
              <Text style={[styles.text]}>{currentVenue.place.name}</Text> 
          </View>
            <Text style={[styles.text]}>{currentVenue.description}</Text>
        </LinearGradient>
        </ScrollView>
        </View>
      </Swiper>        
        <View style={styles.camContainer}>{content}</View>
    </Swiper>
    )
   }
  }

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  view: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  VideoContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    height: height,
    width: width
  },
  // Row
  row: {
    padding: 5  ,                   // Add padding at the bottom
  },
  // Background image
  listBackground: {
    height: screen.height / 5,          // Divide screen height by 3
    justifyContent: 'center',           // Center vertically
    alignItems: 'center',               // Center horizontally
  },
  // container for the button for upcoming
  bgContainer: {
    position: 'absolute',
    bottom:0,
    left: 0,
    right: 0,
    paddingBottom: 10,
    borderRadius: 9,
  },
  // Background image upcoming events
  imageBackgroundUpcoming: {
    height: screen.height / 2,          // Divide screen height by 6
    justifyContent: 'center',           // Center vertically
    alignItems: 'center',               // Center horizontally
    borderRadius: 25,
  },
  // Shared text style
  text: {
    color: '#fff',                      // White text color
    backgroundColor: 'transparent',     // No background
    fontFamily: 'Avenir',               // Change default font
    fontWeight: 'bold',                 // Bold font
    // Add text shadow
    textShadowColor: '#222',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  // Movie title
  title: {
    fontSize: 22,                       // Bigger font size
  },
  // Rating row
  rating: {
    flexDirection: 'row',               // Arrange icon and rating in one line
  },
  button: {
    backgroundColor: 'blue',
    alignSelf: 'stretch',
    flex:1,
  },
  /* 
   * CAMERA STYLES
   */ 
  camContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  navigation: {
    flex: 1,
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
