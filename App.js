import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Video } from 'expo';
import axios from 'axios'



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
    //  https://concertly-app.herokuapp.com/v1/venues/search?q=VIC&o=0
    // onLoad pass location data, GET first item(venue) in db with most videos
    // then pass eventId, GET videos in that event, load latest posted video
    // querying VIC will only return melbourne events as data returned is only scraped via gis location of melbourne region
      const venueRequest = await axios.get('https://concertly-app.herokuapp.com/v1/venues/search?q=NSW&o=0');
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
      <View style={styles.container}>
       <Video
        source={{ uri: videos[selectedVidIndex].instaVideoLink }}
        rate={1.0}
        volume={1.0}
        muted={false}
        resizeMode="cover"
        shouldPlay
        isLooping
        style={{ width: 300, height: 300 }}
      />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
