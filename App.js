import React from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import { Video } from 'expo';
import axios from 'axios'

const { width, height } = Dimensions.get('window'); 

export default class App extends React.Component {
  constructor(props, context) {
    super(props, context);

    // app state
    this.state = {
      venue: [],
      videos: [],
      selectedVenueIndex: 0,
      selectedVidIndex: 0,
      next: 1,
      city: {},
      countryState: {},
      isVenueLoading: true,
      displayMediaInfo: false,
      venueBefore: false,
    }
  }
  async componentDidMount() {
  
    //  http://localhost:5000/v1/venues/search?q=
    // http://localhost:5000/v1/venues/search/uk?q=London&o=2
    // onLoad pass location data, GET first item(venue) in db with most videos
    // then pass eventId, GET videos in that event, load latest posted video
    // querying VIC will only return melbourne events as data returned is only scraped via gis location of melbourne region
      const venueRequest = await axios.get('https://concertly-app.herokuapp.com/v1/venues/search/uk?q=London&o=0');
      console.log(venueRequest.data.payload)
  
    //  this.noVenueData(venueRequest)
  
      // console.log(venueRequest.data.payload[0].place.name)
      const videoRequest = await axios.get('https://concertly-app.herokuapp.com/v1/video?id=' + venueRequest.data.payload[0].eventId);
      console.log(videoRequest.data.payload[0])
  
    // this.noVideoData(videoRequest)
  
      this.setState({
        venue:  venueRequest.data.payload,
        videos: videoRequest.data.payload,
        selectedVenueIndex: 0,
        selectedVidIndex: 0,
       // city: this.props.location.state.city,
       // countryState: this.props.location.state.countryState,
        vidLink: videoRequest.data.payload[0].instaVideoLink,
        isVenueLoading: false
      });
    }

  render() {
    
    let {selectedVidIndex, videos, selectedVenueIndex, venue, ended, noEvents, venueBefore} = this.state;
    if (this.state.isVenueLoading) {
      // add in loading spinner
      return (
      <View>
        <Text>Loadong...</Text>
       </View>
      );
    }
    return (
       <Video
        source={{ uri: videos[selectedVidIndex].instaVideoLink }}
        rate={1.0}
        volume={0.0}
        muted={true}
        resizeMode="cover"
        shouldPlay
        isLooping
        style={styles.VideoContainer}
        //style={{ width: Dimension.get('window').width, height: Dimensions.get('window').height }}
      />
    );
  }
}

const styles = StyleSheet.create({
  VideoContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    height: height,
    width: width

  },
});
