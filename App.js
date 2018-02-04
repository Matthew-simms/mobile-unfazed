import React from 'react'
import { 
  StyleSheet, 
  Text, 
  View, 
  Dimensions, 
  ListView, 
  FlatList,
  TouchableOpacity, 
  Image,              // Renders background image
  ImageBackground,
  ActivityIndicator } from 'react-native'
import { Button} from 'react-native-elements'
import { Video, LinearGradient } from 'expo'
import axios from 'axios'
import Swiper from 'react-native-swiper'
import randomcolor from 'randomcolor'
// import Row from './components/Row'
import { AnimatedCircularProgress } from 'react-native-circular-progress'

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
      videos: [],
      eventId: null,
      selectedVenueIndex: 0,
      selectedVidIndex: 0,
      next: 1,
      isVenueLoading: true,
      displayMediaInfo: false,
      venueBefore: false,
    }
  }

  async componentDidMount() {
  
    // http://localhost:5000/v1/venues/search/uk?q=London&o=2
    // onLoad pass location data, GET first item(venue) in db with most videos
    // then pass eventId, GET videos in that event, load latest posted video
      const venueRequest = await axios.get('https://concertly-app.herokuapp.com/v1/venues/search/uk?q=London&o=0');
      console.log(venueRequest.data.payload)
    //  this.noVenueData(venueRequest)
  
      // console.log(venueRequest.data.payload[0].place.name)
      const videoRequest = await axios.get('https://concertly-app.herokuapp.com/v1/video?id=' + venueRequest.data.payload[0].eventId);
      console.log(videoRequest.data.payload[0])
  
    // this.noVideoData(videoRequest)

    // GET all events currently on in London
    const allEventsRequest = await axios.get('http://localhost:5000/v1/venues/allevents/uk?q=London');
    // console.log(allEventsRequest.data.payload)

    // GET upcoming events in London
    const upcomingEventsRequest = await axios.get('http://localhost:5000/v1/venues/upcoming/uk?q=London');
    console.log(upcomingEventsRequest.data.payload)
  
      this.setState({
        data: allEventsRequest.data.payload.concat(upcomingEventsRequest.data.payload),
        venue:  venueRequest.data.payload,
        videos: videoRequest.data.payload,
        upcomingEvents : upcomingEventsRequest.data.payload,
        selectedVenueIndex: 0,
        selectedVidIndex: 0,
        vidLink: videoRequest.data.payload[0].instaVideoLink,
        isVenueLoading: false
      });
    }
  
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

_renderRow = (eventObj) => {
  const event = eventObj
  return (
    <Row
      // Pass event object
      event={event}
      // Pass a function to handle row presses
      onPress={()=>{
        // Navigate back to Home video screen
        this.swiper.scrollBy(1)
        // pass row event id data
        this.setState({eventId: `${event.eventId}`,})
        this._handleSelectedEvent()
      }}
    />
  );
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
    
    let {selectedVidIndex, videos, selectedVenueIndex, venue, ended, noEvents, venueBefore} = this.state;
    if (this.state.isVenueLoading) {
      // loading spinner
      return (
        <View style={styles.container}>
          <ActivityIndicator size="large"/>
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
            return (
              <TouchableOpacity
              // Pass row style
              style={styles.row}
              // Call onPress function passed from List component when pressed
              onPress={()=>{
                // Navigate back to Home video screen
                this.swiper.scrollBy(1)
                // pass row event id data
                this.setState({eventId: `${rowData.eventId}`,})
                this._handleSelectedEvent()
              }}
              // Dim row a little bit when pressed
              activeOpacity={0.7}
            >
              { !rowData.upcomingEvent
                ?  <LinearGradient
                      colors={['#00249b', '#1a0057']}
                      start={[0.1,0.1]}
                      end={[0.5,0.5]}
                      style={{ padding: 10, borderRadius: 9 }}>
                    {/* Background */}
                    <View style={ styles.listBackground }>
                      {/* Title */}
                      <Text style={[styles.text, styles.title]}>{rowData.eventName.toUpperCase()}</Text>
                          {/* Venue Name */}
                          <Text style={[styles.text]}>{rowData.place.name}</Text> 
                    </View>
                    <Button
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
        <View style={this.viewStyle()}>
          <TitleText label="Bottom" />
        </View>
      </Swiper>        
      <View style={this.viewStyle()}>
        <TitleText label="Right" />
      </View>
    </Swiper>
    );
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
  }
});
