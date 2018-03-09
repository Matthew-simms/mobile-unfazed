import React from 'react'
import { StyleSheet, Text, View, Dimensions, ListView, FlatList, TouchableOpacity, Image, ImageBackground, ActivityIndicator, Slider, Vibration, ScrollView } from 'react-native'
import { Button } from 'react-native-elements'
import { Video, LinearGradient, Camera, Permissions, Constants,  FileSystem, Font } from 'expo'
import axios from 'axios'
import Swiper from 'react-native-swiper'
import randomcolor from 'randomcolor'
import { AnimatedCircularProgress } from 'react-native-circular-progress'
import isIPhoneX from 'react-native-is-iphonex';
import GalleryScreen from '../components/GalleryScreen';
import RootNavigation from '../navigation/RootNavigation';
import Spinner from 'react-native-loading-spinner-overlay';

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


export default class Main extends React.Component {
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
      shouldPlay: false,
      isPlaying: false,
      isBuffering: false,
      isLoading: true,
      fontLoaded: false,
      bgImgsLoaded: false,
      listColor: [
        ['rgba(0,36,155,0.8)', 'rgba(26,0,87,0.8)'],
        ['rgba(155,0,0,0.8)', 'rgba(87,0,0,0.8)']],
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
      // GET all events currently on in London
      const allEventsRequest = await axios.get('https://concertly-app.herokuapp.com/v1/venues/allevents/uk?q=London')
      console.log(allEventsRequest.data.payload)
      this.noVenueData(allEventsRequest)
  
      // console.log(venueRequest.data.payload[0].place.name)
      const videoRequest = await axios.get('https://concertly-app.herokuapp.com/v1/video?id=' + allEventsRequest.data.payload[1].eventId)
      .catch(function(error) {
        console.log(error.message);
          throw error;
        })
      console.log(videoRequest.data.payload[0])
      this.noVideoData(videoRequest)

    // GET upcoming events in London
    const upcomingEventsRequest = await axios.get('https://concertly-app.herokuapp.com/v1/venues/upcoming/uk?q=London')
    .catch(function(error) {
      console.log(error.message);
        throw error;
      })
    console.log(upcomingEventsRequest.data.payload)

      this.setState({
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
      await this.getUserFaces(allEventsRequest)
    }

  // GET fake user photos from www.uifaces.co/api add to eventsOn array
  async getUserFaces (allEventsRequest)  {
    const events =  allEventsRequest.data.payload
    const arr = []
    arr.push(events)
    // console.log(arr)
    await Promise.all(events.map(async arr => {
      console.log(arr.videoCount); 
      let videoCount = arr.videoCount
      if (videoCount >= 8) {
        videoCount = 8
      }
      const response = axios.get('http://uifaces.co/api?limit=' + videoCount + '&random')
      .then((userFaces) => {
        { arr.uiFaces = userFaces.data;}
        })
      const user = await response
      console.log(user);
    }))
    this.setState(prevState => ({
      venue: arr,
    }))
    // console.log(this.state.data);
    await this.getEventBgImg()
  }

  // GET list background images for each event add to eventsOn array
  async getEventBgImg() {
    let bgImgLen = await this.state.venue[0].length
    console.log(bgImgLen)
    const arr = this.state.venue[0]
    const bgImgRes = await axios.get('http://localhost:5000/v1/venues/image?q=' + bgImgLen)
    bgImg = bgImgRes.data.payload
    console.log(bgImg)
    arr.forEach(function(itm){
      { itm.bgImgs = bgImg;}
     });
     this.setState(prevState => ({
      bgImgsLoaded: true,
      venue: arr,
      data: arr.concat(this.state.upcomingEvents)
    }))
    console.log(this.state.venue)
    console.log(this.state.data)
  }

    // method to check if there is venue data
noVenueData(allEventsRequest) {
  if (allEventsRequest.data.payload.length == 0) {
    this.setState(prevState => ({
      isVenueLoading: false,
    }))
    return;
  }
}

noVideoData(videoRequest) {
  // check if there is data if none goto next venue
  if (videoRequest.data.payload.length == 0) {
   this.setState(prevState => ({
     isVenueLoading: false,
     selectedVenueIndex: 1,
   }))
   this._ToggleNextVenue()
   return;
 }
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
    this.noVideoData(videoRequest)
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
      if (playbackStatus.isLoaded) {
        this.setState({
          playbackInstancePosition: playbackStatus.positionMillis,
          playbackInstanceDuration: playbackStatus.durationMillis,
          shouldPlay: playbackStatus.shouldPlay,
          isPlaying: playbackStatus.isPlaying,
          isBuffering: playbackStatus.isBuffering,
          rate: playbackStatus.rate,
          muted: playbackStatus.isMuted,
          volume: playbackStatus.volume,
          shouldCorrectPitch: playbackStatus.shouldCorrectPitch,
        });

        if (playbackStatus.didJustFinish) {
          // The player has just finished playing and will stop.
          this._nextVideo()
        }
      }
  }

  // next video function
  _nextVideo = (e) => {
      if (this.state.selectedVidIndex == this.state.videos.length - 1)
        return;
          this.setState(prevState => ({
          selectedVidIndex: prevState.selectedVidIndex + 1,
        }))
    }

    // Map array and show UI faces in render
    UiPrinter(array) {
      return array.map(function(images, index) {
        // don't put your key as index, choose other unique values as your key.
        return <Image
          key={index}
          source={{uri: images.photo}}
          style={ styles.uiFace } />
      })
    }

    // function to choose a random index in an array
    _handleRandomIndex(arr) {
      return arr[Math.floor(Math.random() * arr.length)]
    }

    // Date Time converter to local
    _convertUTCDateToLocalDate(UTCdate) {
      var newDate = new Date(UTCdate);
      return newDate;
      console.log(newDate)  
    }
      
  render() {
    // Camera show state
    const cameraScreenContent = this.state.permissionsGranted
    ? this.renderCamera()
    : this.renderNoPermissions();
    const content = this.state.showGallery ? this.renderGallery() : cameraScreenContent;

    let {selectedVidIndex, videos, selectedVenueIndex, venue, ended, noEvents, currentVenue, venueBefore, hasCameraPermission} = this.state;

    if (this.state.isVenueLoading || !this.state.bgImgsLoaded) {
      return (
        <View style={this.viewStyle()}>
          <Spinner visible={true} textContent={"Loading..."} textStyle={{color: '#FFF'}} />
         </View>
      );
    }

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
                ? <ImageBackground source={{uri: this._handleRandomIndex(rowData.bgImgs).image_link }} borderRadius={9} style={ styles.imageBackground }> 
                    <LinearGradient
                          colors={ this._handleRandomIndex(this.state.listColor) }
                          start={[0.1,0.1]}
                          end={[0.5,0.5]}
                          style={{ padding: 20, borderRadius: 9 }}>
                        {/* Background */}
                        <View style={ styles.listBackground }>
                          {/* onNow */}
                          <Text style={[styles.text, styles.red]}>On Now</Text> 
                          {/* Title */}
                          <Text style={[styles.text, styles.title]}>{rowData.eventName.toUpperCase()}</Text>
                          {/* Venue Name */}
                          <Text style={[styles.text]}>@ {rowData.place.name}</Text> 
                        </View>
                        <View style={styles.imageRow}>
                          {this.UiPrinter(rowData.uiFaces)}
                        </View> 
                        <Button
                          onPress={this._onRowPress.bind(this, rowData)}
                          title={ 'Watch' }
                          rounded
                          buttonStyle={styles.button}
                        />
                     </LinearGradient>
                   </ImageBackground> 
                : <ImageBackground source={{uri: rowData.upcomingArt }} borderRadius={9} style={ styles.imageBackgroundUpcoming }>
                    <View style={ styles.bgContainer }>
                      {/* Background */}
                      <View style={ styles.listBackground }>
                        {/* up coming */}
                        <Text style={[styles.text]}>Upcoming</Text>
                        {/* Title */}
                        <Text style={[styles.text, styles.title]}>{rowData.eventName.toUpperCase()}</Text>
                        {/* Venue Name */}
                        <Text style={[styles.text]}>@ {rowData.place.name} { [this._convertUTCDateToLocalDate(rowData.startTime).toString()] }</Text> 
                      </View> 
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
          <TouchableOpacity
           onPress={(e) => this._nextVideo(e, this)}
           activeOpacity={0.7}
          >
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
        </TouchableOpacity>
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
            <Text style={[styles.title]}>{currentVenue.eventName.toUpperCase()}</Text>
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
  // Background 
  listBackground: {
    height: screen.height / 5,          // Divide screen height by 3
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
  // list bg image
  imageBackground: {
    width: screen.width - 10,
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
  },
  // red color
  red: {
    color: '#FF0000'
  },
  // Movie title
  title: {
    fontSize: 22,                       // Bigger font size
    fontFamily: 'katanas-edge',
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
  // UI faces on list
  uiFace: {
    height: 34,
    width: 34,
    borderRadius: 17,
    marginLeft: -10,  
  },
  // UI faces row
  imageRow: {
    flexDirection: 'row',
    paddingBottom: 10,
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
