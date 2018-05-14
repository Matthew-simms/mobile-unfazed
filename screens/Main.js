import React from 'react'
import { StyleSheet, Text, View, Dimensions, ListView, FlatList, TouchableOpacity, Image, ImageBackground, ActivityIndicator, Slider, Vibration, ScrollView, SectionList, Platform, StatusBar, Modal, Linking } from 'react-native'
import { Button } from 'react-native-elements'
import { LinearGradient, Segment, Permissions, WebBrowser, Constants,  FileSystem, Font, Video, Notifications  } from 'expo'
import axios from 'axios'
import Swiper from 'react-native-swiper'
import randomcolor from 'randomcolor'
import { AnimatedCircularProgress } from 'react-native-circular-progress'
import GalleryScreen from '../components/GalleryScreen';
import RootNavigation from '../navigation/RootNavigation';
import Spinner from 'react-native-loading-spinner-overlay';
import { connect } from 'react-redux';
import * as firebase from 'firebase';
import TouchableScale from 'react-native-touchable-scale'

import { storeEventData } from '../actions';
import CameraC from './Camera';

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

class Main extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.refreshMainC = this.refreshMainC.bind(this);

    // app state
    this.state = {
      // ListView DataSource object
      dataSource: new ListView.DataSource({
        rowHasChanged: (row1, row2) => row1 !== row2,
      }),
      data: null,
      playbackInstanceDuration: null,
      venue: [{"eventName": "exception"}],
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
      playVideo: false,
      photoURL: '',
      signupModal: this.props.UserData.modal,
      cameraModal: this.props.UserData.modal,
      isBuyTicketOpened: false,
      fakeData: [],
      listColor: [
        ['rgba(0,36,155,0.8)', 'rgba(26,0,87,0.8)'],
        ['rgba(155,0,0,0.8)', 'rgba(87,0,0,0.8)'],
        ['rgba(155,0,154,0.8)', 'rgba(84,0,87,0.8)'],
        ['rgba(152,0,155,0.8)', 'rgba(0,2,92,0.8)']],
    }
  }

  async componentDidMount() {

    StatusBar.setHidden(true)

    var currentUser
    var that = this
    listener = firebase.auth().onAuthStateChanged(function (user) {
      if (user != null) {

          currentUser = user
          console.log('return user', currentUser.displayName)
          console.log('a user', currentUser.photoURL)
          that.setState({ photoURL: currentUser.photoURL });

          that.registerForPushNotificationsAsync(currentUser)
      }

      listener();
    });
    // this._notificationSubscription = Notifications.addListener(this._handleNotification);

    // Camera Permisisons
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ permissionsGranted: status === 'granted' });

    console.log(this.props.modal)

    // pause video if user has signed in
    /*
     * http://localhost:5000/v1/venues/search/uk?q=London&o=2
     * onLoad pass location data, GET first item(venue) in db with most videos
     * then pass eventId, GET videos in that event, load latest posted video
     */
    // GET all events currently on in London
    const allEventsRequest = await axios.get('https://concertly-app.herokuapp.com/v1/venues/allevents/uk?q=London')
    console.log('AllEventsRequest', allEventsRequest.data.payload);

     // GET all events currently on in London with no videos - this is for location check for camera recording
     const allEventzRequest = await axios.get('https://concertly-app.herokuapp.com/v1/venues/alleventz/uk?q=London')

    //this.noVenueData(allEventsRequest)

    // GET upcoming events in London
    const upcomingEventsRequest = await axios.get('http://localhost:5000/v1/venues/upcoming/uk?q=London')
    .catch(function(error) {
      console.log('MEE:', error.message);
      throw error;
    })
    console.log(upcomingEventsRequest.data.payload)

    let videoRequest = [];
    if(allEventsRequest.data.payload.length == 0) {
      try {
        videoRequest = await axios.get('https://concertly-app.herokuapp.com/v1/video?id=' + upcomingEventsRequest.data.payload[0].eventId)
        } catch (error) {
          console.log(error);
      }
      this.setState({
        isVenueLoading: false,
      });
    } else {
      try {
        videoRequest = await axios.get('https://concertly-app.herokuapp.com/v1/video?id=' + allEventsRequest.data.payload[0].eventId)
        } catch (error) {
          console.log(error);
      }
    }
    this.noVideoData(videoRequest);

    this.setState({
      venue: allEventsRequest.data.payload,
      locCheckData: allEventzRequest.data.payload,
      currentVenue: allEventsRequest.data.payload.length == 0 ? upcomingEventsRequest.data.payload[0] : allEventsRequest.data.payload[0],
      videos: videoRequest.data.payload,
      upcomingEvents : upcomingEventsRequest.data.payload,
      selectedVenueIndex: 0,
      selectedVidIndex: 0,
      vidLink: videoRequest.data.payload[0].instaVideoLink,
      isVenueLoading: false,
    });
    console.log('Current venue', this.state.currentVenue)
    await this.getUserFaces(allEventsRequest)
  }

  // GET fake user photos from www.uifaces.co/api add to eventsOn array
  async getUserFaces (allEventsRequest)  {
    const events =  allEventsRequest.data.payload
    const arr = []
    arr.push(events)
    // console.log(arr)
    await Promise.all(events.map(async arr => {
      let videoCount = arr.videoCount
      if (videoCount >= 8) {
        videoCount = 8
      }
      const key = '9ac222abb8fa4c2892d3dc469f679b'
      const response = axios.get('http://concertly-app.herokuapp.com/v1/venues/uifaces?q=' + videoCount)
      .then((userFaces) => {
        console.log('uifaces1', userFaces);
        { arr.uiFaces = userFaces.data;}
        })
      const user = await response
      console.log(user);
    }))
    this.setState(prevState => ({
      venue: arr,
    }))
    // console.log(this.state.data);
    await this.getEventBgImg();
  }

  // GET list background images for each event add to eventsOn array
  async getEventBgImg() {
    let bgImgLen = await this.state.venue[0].length
    console.log("bgImgLen: " + bgImgLen)
    const arr = this.state.venue[0]

    // Get all background images
    const bgImgRes = await axios.get('http://concertly-app.herokuapp.com/v1/venues/image?q=' + bgImgLen)
    let bgImgs = bgImgRes.data.payload
    console.log(bgImgs)

    // Set background image for each items
    for (i = 0; i < arr.length; i++) {
      arr[i].bg_image_link = this._handleRandomIndex(bgImgs).image_link;
      arr[i].gradient_colors = this._handleRandomIndex(this.state.listColor);
    }

    this.setState(prevState => ({
      bgImgsLoaded: true,
      venue: arr,
      data: arr.concat(this.state.upcomingEvents), // Old List data -- still used for the camera
      playVideo: true,
    }))
    this.props.storeEventData(this.state.locCheckData);
    console.log('loc check data', this.state.locCheckData)
    console.log("RAW concat data", this.state.data)
    console.log('testData', this.state)
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
    console.log('no video data', videoRequest)
    // check if there is data if none goto next venue
    if (videoRequest.data.payload.length == 0) {
      let nextVenue = null;
      let selectedVenueIndex = this.state.venue.findIndex(v => v.eventId == this.state.currentVenue.eventId);
      if (selectedVenueIndex >= 0) {
        if (selectedVenueIndex + 1 < this.state.venue.length || this.state.upcomingEvents.length == 0) {
          nextVenue = this.state.venue[(selectedVenueIndex + 1) % this.state.venue.length];
        } else {
          nextVenue = this.state.upcomingEvents[0];
        }
      }
      else {
        selectedVenueIndex = this.state.upcomingEvents.findIndex(v => v.eventId == this.state.currentVenue.eventId);
        if (selectedVenueIndex >= 0) {
          if (selectedVenueIndex + 1 < this.state.upcomingEvents.length || this.state.venue.length == 0) {
            nextVenue = this.state.upcomingEvents[(selectedVenueIndex + 1) % this.state.upcomingEvents.length];
          } else {
            nextVenue = this.state.venue[0];
          }
        }
      }

      if (!nextVenue)
        return;

      console.log("No video data: move to " + nextVenue.eventId);

      // eventId: rowData.eventId,
      // currentVenue: rowData,

      this.setState(prevState => ({
        eventId: nextVenue.eventId,
        currentVenue: nextVenue,
        isLoading: true
      }));

      // update selectedVenueIndex
      this._handleSelectedEvent(nextVenue);
    }
  }

  registerForPushNotificationsAsync = async (currentUser) => {
    const { existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
    let finalStatus = existingStatus;

    // only ask if permissions have not already been determined, because
    // iOS won't necessarily prompt the user a second time.
    if (existingStatus !== 'granted') {
        // Android remote notification permissions are granted during the app
        // install, so this will only ask on iOS
        const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
        finalStatus = status;
    }

    // Stop here if the user did not grant permissions
    if (finalStatus !== 'granted') {
        return;
    }

    // Get the token that uniquely identifies this device
    let token = await Notifications.getExpoPushTokenAsync();

    // POST the token to our backend so we can use it to send pushes from there
    var updates = {}
    updates['/expoToken'] = token
    await firebase.database().ref('/users/' + currentUser.uid).update(updates)
    //call the push notification
  }


  _onRowPress = ( rowData ) => {
    Expo.Segment.trackWithProperties('Tapped an event from list-->', {
      eventId: rowData.eventId,
      currentEvent: rowData.eventName,
      venueName: rowData.place.name
    })
  
    console.log(rowData);
    // Navigate back to Home video screen
    this.swiper.scrollBy(1)
    // pass row event id data
    this.setState(prevState => ({
      eventId: rowData.eventId,
      currentVenue: rowData,
      // selectedVenueIndex: selectedVenueIndex,
      isLoading: true
    }));

    // update selectedVenueIndex
    this._handleSelectedEvent(rowData);
  }

  async _handleSelectedEvent(data) {
    // pass eventId from selected row
    console.log(data); 
    const videoRequest = await axios.get('https://concertly-app.herokuapp.com/v1/video?id=' + data.eventId);
    console.log(videoRequest);

    // update video state with new videos
    this.setState(prevState => ({
      videos: videoRequest.data.payload,
      selectedVidIndex: 0,
      isLoading: false
    }));
    this.noVideoData(videoRequest);
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
        playbackInstancePosition:  playbackStatus.positionMillis,
        playbackInstanceDuration:  playbackStatus.durationMillis,
        playbackSeconds: Math.round(((playbackStatus.positionMillis / 1000) % 60)),
        countdown : 100 - Math.floor((this.state.playbackInstancePosition / this.state.playbackInstanceDuration)*100),
        shouldPlay: playbackStatus.shouldPlay,
        isPlaying: playbackStatus.isPlaying,
        isBuffering: playbackStatus.isBuffering,
        rate: playbackStatus.rate,
        muted: playbackStatus.isMuted,
        volume: playbackStatus.volume,
        shouldCorrectPitch: playbackStatus.shouldCorrectPitch,
        progressTime: playbackStatus.progressUpdateIntervalMillis
      });
      // console.log(this.state.progressTime)

      if (playbackStatus.didJustFinish) {
        //.
        // The player has just finished playing and will stop.
        this._nextVideo()
      }
    }
  }

  // next video function
  _nextVideo = (e) => {
    Segment.track('next video-->');
    this.setState({ isPlaying: false });

    if (this.state.selectedVidIndex == this.state.videos.length - 1)
      return;

    this.setState(prevState => ({
      selectedVidIndex: prevState.selectedVidIndex + 1,
    }));
  }

  // Map array and show UI faces in render
  UiPrinter(array) {
    if (array) {
      return array.map(function(images, index) {
        // don't put your key as index, choose other unique values as your key.
        return <Image
          key={index}
          source={{uri: images.userPhotoLink}}
          style={ styles.uiFace } />
      });
    }
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

  //To know curent index in Swiper
  onScrollEnd = (e, state) => {
    console.log('INDEX IS: ', state.index);
    if (state.index === 2 || state.index === 0) {
      Segment.track('not video screen');
      this.setState({
        playVideo: false
      });
    } else if (state.index === 1) {
      Segment.track('video screen');
      this.setState({
        playVideo: true
      });
    }
  }

  // Camera Record no permissions
  renderNoPermissions() {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 10 }}>
        <Text style={{ color: 'white' }}>
          Camera permissions not granted - cannot open camera preview.
        </Text>
      </View>
    );
  }

  // Open terms and conditions
  _handleOpenTerms() {
    Segment.track('open terms-->')
    WebBrowser.openBrowserAsync('http://unfazed.live/terms.html');
  }

   // Open terms and conditions
   _handleOpenPrivacy() {
    WebBrowser.openBrowserAsync('http://unfazed.live/privacy.html');
  }

   // Open support
   _handleOpenMail() {
    Segment.track('Opened support-->');
    Linking.openURL('mailto:matt@unfazed.live');
  }

  _handleBuyTickets(ticketLink) {
    Segment.track('Buy tickets pressed-->')
    // this.setState({ isBuyTicketOpened: true })
    WebBrowser.openBrowserAsync(ticketLink);
  }

  _handleOpenSpotify(spotifyLink) {
    Segment.track('Spotify link pressed-->')
    // this.setState({ isBuyTicketOpened: true })
    WebBrowser.openBrowserAsync(spotifyLink);
  }

  signOutUser = async () => {
    try {
        await firebase.auth().signOut();
        navigate('auth');
        Segment.track('sign out user-->')
    } catch (e) {
        console.log(e);
    }
  }

  toggleModal() {
    this.setState({
      signupModal: !this.state.signupModal,
    });
  }

  toggleCamModal() {
    this.setState({
      cameraModal: !this.state.cameraModal,
    });
  }

  async refreshMainC() {
    console.log('Called to refresh');
    await this.forceUpdate();
  }

  _renderSectionHeader = ({section}) => {
    return (
      <View>
        <Text style={styles.sectionTitle}>{section.title}</Text>
      </View>
    )
  }

  // On Now list empty state
  _renderEmpty () {
        <Text style={[styles.center]}>No events on right now, come back and check later or view some upcoming events below</Text>
  }

  // Render upcoming item
  _renderItem = ({item, section}) => (
    <TouchableScale
              // Pass row style
              style={styles.row}
              // Call onPress function passed from List component when pressed
              onPress={this._onRowPress.bind(this, item)}
              // Dim row a little bit when pressed
              activeScale={0.94}
              tension={0}
              friction={3}
            >
             <View style={ styles.elevationLow } borderRadius={9} >
                <ImageBackground source={{uri: item.upcomingArt }} borderRadius={9} style={ styles.imageBackground }>
                  <View style={[styles.listBackground, styles.paddingBg]}>
                    <Text style={[styles.text, styles.teal]}>Upcoming</Text>
                    <Text  numberOfLines={2} style={[styles.text, styles.titleUpcoming, styles.teal]}>{item.eventName}</Text>
                    <Text style={[styles.text, styles.blk]}>@ {item.place.name}</Text>
                    <Text style={[styles.text, styles.blk]}>{item.place.startDate}</Text>
                  </View>
                    <Button
                      onPress={this._onRowPress.bind(this, item)}
                      color={ "#6600EC" }
                      title={ 'Play' }
                      rounded
                      buttonStyle={[styles.button, styles.btmRightBtn, styles.pb10]}
                    />
                </ImageBackground>
              </View>
            </TouchableScale>
  )
  _renderOnNowItem = ({item, section}) => (
    section.length == 0 ? false :
    item.eventName == "exception"
    ?
    <View style={ styles.emptyRow } borderRadius={9} >
      <Text style={styles.center1}>No events on right now, come back</Text>
      <Text style={styles.center2}>and check later or view some</Text>
      <Text style={styles.center3}>upcoming events below</Text>
    </View>
    :
    <TouchableScale
              // Pass row style
              style={styles.row}
              // Call onPress function passed from List component when pressed
              onPress={this._onRowPress.bind(this, item)}
              // Dim row a little bit when pressed
              activeScale={0.94}
              tension={0}
              friction={3}
            >
              <View style={ styles.elevationLow } borderRadius={9} >
                    <ImageBackground source={{uri: item.bg_image_link }} borderRadius={9} style={ styles.imageBackground }>
                        <LinearGradient
                          colors={ !item.gradient_colors ? ["rgba(155,0,0,0.8)","rgba(87,0,0,0.8)"] : item.gradient_colors}
                          start={[0.1,0.1]}
                          end={[0.5,0.5]}
                          style={{ padding: 20, borderRadius: 9 }}>
                            <View style={ styles.listBackground }>
                            <View style={ styles.onNowBg }>
                              <Text style={[styles.text]}>On Now</Text>
                            </View>
                              <Text  numberOfLines={3} style={[styles.onNowText]}>{item.eventName}</Text>
                              <Text style={[styles.text]}>@ {item.place.name}</Text>
                                <View style={styles.imageRow}>
                                  {item.uiFaces.payload ? this.UiPrinter(item.uiFaces.payload): null}
                                  <Text style={styles.text}>{item.videoCount} Videos</Text>
                                </View>
                            </View>
                            {item.eventName != this.state.currentVenue.eventName ?
                            <Button
                              onPress={this._onRowPress.bind(this, item)}
                              color={ "#6600EC" }
                              title={ 'Play' }
                              rounded
                              buttonStyle={[styles.button, styles.btmRightBtn]}
                            />: <TouchableOpacity style={{ position: 'absolute', bottom: 30, right: 40 }}><Text style={{ color: 'white', fontSize: 18,}}>Playing</Text></TouchableOpacity>}
                        </LinearGradient>
                      </ImageBackground>
                    </View>
            </TouchableScale>
  )

  render() {
    // Camera show state
    const cameraScreenContent = this.state.permissionsGranted
    ? <CameraC
    currentVenue = {this.state.currentVenue}
    refreshMainC={this.refreshMainC}
    usernameC={this.state.username}/>
    : this.renderNoPermissions();
    const content = this.state.showGallery ? this.renderGallery() : cameraScreenContent;

    let {selectedVidIndex, videos, selectedVenueIndex, venue, ended, noEvents, currentVenue, venueBefore, hasCameraPermission, playVideo, ListData} = this.state;
    if(venue.length == 0 || venue == null) {
      venue = [{"eventName": "exception"}];
    }
    // You can uncomment below line to do test empty OnNow list
    //venue = [{"eventName": "exception"}];
    // console.log('Vene--->', venue);

    if (this.state.isVenueLoading || !this.state.bgImgsLoaded || !venue) {
      return (
        <View style={this.viewStyle()}>
          <Spinner visible={true} textContent={"Loading..."} textStyle={{color: '#FFF'}} />
         </View>
      );
    }
    return (
      // console.log('now playing', videos[selectedVidIndex].instaVideoLink),
      <Swiper
      loop={false}
      showsPagination={false}
      index={1}
      ref={(swiper) => {this.swiper = swiper;}}
      onMomentumScrollEnd={this.onScrollEnd}
      >
      <View style={this.viewStyle()}>
        <SectionList
        renderItem={this._renderItem}
        renderSectionHeader={this._renderSectionHeader}
        stickySectionHeadersEnabled={false}
              sections={[
                {
                  data: venue,
                  title: 'On Now',
                  // subtitle: 'this is a subtitle',
                  renderItem:  venue.length > 0 ? this._renderOnNowItem: this._renderEmpty,
                  keyExtractor: item => item.id,
                  ListEmptyComponent: this._renderEmpty
                },
                {
                  data: this.state.upcomingEvents,
                  title: 'Upcoming',
                  renderItem: this._renderItem,
                  keyExtractor: item => item.id,
                  // ListEmptyComponent: this._renderEmpty
                }
              ]}
             />
      </View>
      <Swiper
        horizontal={false}
        loop={false}
        showsPagination={false}
        index={1}
        ref={(swiper) => {this.swiper = swiper;}}
        onMomentumScrollEnd={this.onScrollEnd}
        >
        <View style={this.viewStyle()}>
          {/* <View style={{  flex: 1, alignItems: 'stretch'}}> */}
            <ImageBackground style={styles.profileImgBg} source={ require('../assets/images/Profile_bg.jpg') }>
            <View style={{justifyContent: 'center', alignItems: 'center', height: '100%',}}>
                { this.state.photoURL ?
                <Image style={styles.profileImg} source={{uri: this.state.photoURL}}/>
                :<Image style={styles.profileImg} source={require('../assets/images/Profile_avatar_placeholder.png')}/>}
                <Text style={[styles.profileName]}>{this.props.UserData.username}</Text>
             </View>
             <Button
                color={ "#6600EC" }
                title={ 'Log Out' }
                rounded
                buttonStyle={[styles.button, styles.btnWidth100, styles.btmRightBtn]}
                onPress={this.signOutUser.bind(this)}
                />
              <View style={{ position: 'absolute', padding: 10, alignItems: 'center', justifyContent: 'center' }}>
                <Button
                  color={ "#EEEEEE" }
                  title={ 'Terms & Conditions' }
                  rounded
                  fontSize={12}
                  buttonStyle={[ styles.privacyBtn]}
                  onPress={this._handleOpenTerms.bind(this)}
                  />
                  <Button
                  color={ "#EEEEEE" }
                  title={ 'Privacy Policy' }
                  rounded
                  fontSize={12}
                  buttonStyle={[ styles.privacyBtn]}
                  onPress={this._handleOpenPrivacy.bind(this)}
                  />
                   <Button
                  color={ "#EEEEEE" }
                  title={ 'Support' }
                  rounded
                  fontSize={12}
                  buttonStyle={[ styles.supportBtn]}
                  onPress={this._handleOpenMail.bind(this)}
                  />
                </View>
            </ImageBackground>
          {/* </View> */}
        </View>
        <View style={this.viewStyle()}>
          { !this.state.signupModal
            ? <View style={{ backgroundColor: 'rgba(0,0,0,0.8)', display: 'none'}}>
                <Text style={[styles.text]}>test</Text>
              </View>
              :
              <View style={styles.modal}>
               <Image style={{marginBottom:20}} source={ require('../assets/images/nav-tute.png') } />
              <Text style={[styles.text]}>Swipe up, down, left and right to navigate</Text>
              <Button
                onPress={this.toggleModal.bind(this)}
                color={ "#6600EC" }
                buttonStyle={{ backgroundColor: '#fff', borderWidth:1, borderColor:'#fff', borderRadius: 40, height: 50, marginTop:20 }}
                title='Okay, got it!'/>
             </View>
          }
          { videos[selectedVidIndex] ?
          <TouchableOpacity
           onPress={(e) => this._nextVideo(e, this)}
           activeOpacity={0.7}
          >
            <View style={{
              flex: 1,
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <View style={{width: width, height: 50, padding: 10, paddingLeft:20, flexDirection: 'row', position: 'absolute', zIndex: 2, }}>
                <Image style={styles.uiFace} source={{uri: videos[selectedVidIndex].userPhotoLink}}/>
                <Text style={[styles.text, styles.usernameS]}>{videos[selectedVidIndex].userName}</Text>
              </View>
              <View style={{ backgroundColor: 'rgba(255,255,255,0)',
                            position: 'absolute',
                            zIndex: 2,
                            height: 80,
                            left: 0,
                            top: height - 90,
                            width: width,
                            padding: 10,
                            overflow: 'hidden'
                            }} >
                 { !currentVenue.upcomingEvent ?
                <Text style={[styles.text, styles.red]}>On Now</Text>
              : <Text style={[styles.text, styles.teal]}>Upcoming</Text> }
                {/* Title */}
                <Text numberOfLines={1} style={[styles.title]}>{currentVenue.eventName}</Text>
                {/* Venue Name */}
                <Text style={[styles.text]}>{currentVenue.place.name}</Text>
              </View>
              <Video
                source={{ uri: videos[selectedVidIndex].instaVideoLink }}
                onPlaybackStatusUpdate={this._playbackCallback.bind(this)}
                rate={1.0}
                volume={1.0}
                resizeMode="cover"
                shouldPlay={playVideo}
                isLooping
                style={styles.VideoContainer}
              />
            </View>
          </TouchableOpacity>
          : null }
          { this.state.isBuffering ? (
            <View style={this.viewStyle()}>
              <Spinner visible={true} textContent={'Loading...'} textStyle={{color: '#FFF'}} />
            </View>
          ) : null }
        </View>
        {/* Event Details View */}
        <View style={this.viewStyle()}>
        <ScrollView>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.85)' }}>
            {/* Background */}
            <View style={[styles.detailList]}>
              {/* ON NOW event details card */}
              {!currentVenue.upcomingEvent ? 
              <ImageBackground source={{uri: currentVenue.bg_image_link}} borderRadius={9} style={ [styles.imageBackground, styles.elevationLow] }>
              <LinearGradient
                colors={ !currentVenue.gradient_colors ? ["rgba(155,0,0,0.8)","rgba(87,0,0,0.8)"] : currentVenue.gradient_colors }
                start={[0.1,0.1]}
                end={[0.5,0.5]}
                style={{ padding: 20, borderRadius: 9 }}>
              <View style={styles.listBackgroundDt}>
                <Text style={[styles.text, styles.red]}>On Now</Text>
                <Text numberOfLines={2} style={[styles.text, styles.title]}>{currentVenue.eventName}</Text>
                <Text style={[styles.text]}>@ {currentVenue.place.name}</Text>
              </View>
              </LinearGradient>
            </ImageBackground>
             /* Upcoming event details card */
            : <ImageBackground source={{uri: currentVenue.upcomingArt}} borderRadius={9} style={ [styles.imageBackground, styles.elevationLow] }>
                <View style={{ padding: 20, borderRadius: 9 }}>
                  <View style={styles.listBackgroundDt}>
                    <Text style={[styles.text, styles.teal]}>Upcoming</Text> 
                    <Text numberOfLines={2} style={[styles.text, styles.title, styles.teal]}>{currentVenue.eventName}</Text>
                    <Text style={[styles.text, styles.teal]}>@ {currentVenue.place.name}</Text>
                      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                      { currentVenue.ticketLink ?
                        <TouchableOpacity style={{ width:"100%" }} activeOpacity={0.7} onPress={this._handleBuyTickets.bind(this, currentVenue.ticketLink)}>
                          <LinearGradient
                            colors={['#4c669f', '#00F7CF']}
                            start={[0,1]}
                            end={[1,0]}
                            style={{ padding: 15, alignItems: 'center', borderRadius: 50 }}>
                            <Text
                              style={{
                                backgroundColor: 'transparent',
                                fontSize: 15,
                                fontFamily: 'opensansBold',
                                color: '#fff',
                              }}>
                              Buy Tickets
                            </Text>
                          </LinearGradient>
                        </TouchableOpacity>
                      :<View style={{ width:"100%" }} > 
                        <LinearGradient
                            colors={['#CECECE', '#CECECE']}
                            start={[0,1]}
                            end={[1,0]}
                            style={{ padding: 15, alignItems: 'center', borderRadius: 50 }}>
                            <Text
                              style={{
                                backgroundColor: 'transparent',
                                fontSize: 15,
                                fontFamily: 'opensansBold',
                                color: '#fff',
                              }}>
                              Sold Out
                            </Text>
                          </LinearGradient>
                        </View> }
                      </View>
                    </View>
                  </View>
                </ImageBackground> }
                {/* /* Spotify link for upcoming */}
              { currentVenue.upcomingEvent ?
               <TouchableOpacity
                onPress={this._handleOpenSpotify.bind(this, currentVenue.spotifyLink)}
                activeOpacity={0.7}
                >
                  <View style={{width: width, height: 20, marginTop: 30, marginLeft: 10, flexDirection: 'row', alignItems: 'center', zIndex: 2, }}>
                    <Image style={styles.uiFace} source={ require('../assets/images/spotify_logo.png') }/>
                    <View style={{flexDirection: 'column', marginLeft: 10}}>
                      <Text style={[styles.text, styles.spotifyGreen]}>Listen to on Spotify</Text>
                      <Text style={[styles.textBold, styles.spotifyGreen]}>{currentVenue.eventName}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
                : null
              }
              {/* /* both details currently playing */}
              { videos[selectedVidIndex] ?
                <View style={{width: width, height: 100, padding: 10, flexDirection: 'row', alignItems: 'center', zIndex: 2, }}>
                  <Image style={styles.uiFace} source={{uri: videos[selectedVidIndex].userPhotoLink}}/>
                  <View style={{flexDirection: 'column', marginLeft: 10}}>
                    <Text style={[styles.text, styles.blk]}>Currently playing video by</Text>
                    <Text style={[styles.textBold, styles.blk]}>{videos[selectedVidIndex].userName}</Text>
                  </View>
                </View>
                : null
              }
              {/* details description */}
            <Text style={[styles.text, styles.blk]}>{currentVenue.description}</Text>
            </View>
          </View>
        </ScrollView>
        </View>
        {/* BuyTicket Modal */}
        <Modal
          animationType="slide"
          transparent={false}
          visible={this.state.isBuyTicketOpened}
          onRequestClose={() => {
            alert('Modal has been closed.');
          }}>
        <View style={{ width: width, height: height, backgroundColor: 'white'}}>
          <View style={styles.buyTicketHeader}>
            <Text style={styles.buyTicketHeaderText}>OOPS!</Text>
          </View>
          <View style={styles.buyTicketContent}>
            <Text style={styles.center1}>We are working on our ticket</Text>
            <Text style={styles.center2}>booking feature. We will let</Text>
            <Text style={styles.center3}>you know when it's ready</Text>
          </View>
          <Button
            onPress={() => this.setState({ isBuyTicketOpened: false })}
            buttonStyle={{ backgroundColor: '#6600EC', borderRadius: 40, height: 50, marginTop: 100, marginLeft: 80, marginRight: 80,}}
            title='Okay, Got it'/>
        </View>
        </Modal>
      </Swiper>
      { !this.state.cameraModal
            ?  <View style={styles.camContainer}>{content}</View>
              :
              <View style={styles.modal}>
              <Text style={[styles.camCenterText]}>Tap and hold the record button to film when you are at a music event</Text>
              <Button
                onPress={this.toggleCamModal.bind(this)}
                color={ "#6600EC" }
                buttonStyle={{ backgroundColor: '#fff', borderWidth:1, borderColor:'#fff', borderRadius: 40, height: 50, marginTop:20 }}
                title='Awesome, got it!'/>
             </View>
          }
    </Swiper>
    )
   }
  }

  const mapStateToProps = state => {
    //const videoState = state.videoReducer;
    return state;
  }

export default connect(mapStateToProps, {storeEventData})(Main);

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  modal: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    position: 'absolute',
    height: height,
    width: width,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  view: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  camContainer: {
    flex: 1,
    backgroundColor: 'transparent',
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
    padding: 20,                   // Add padding at the bottom
    paddingBottom: 4
  },
  // Background of on now cards
  listBackground: {
    height: screen.height / 2,          // Divide screen height by 3
  },
  // Background of on now details
  listBackgroundDt: {
    height: screen.height / 5,          // Divide screen height by 3
  },
  paddingBg : {
    padding: 20,
    borderRadius: 9,
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
    width: screen.width - 40,
  },
  elevationLow: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 9, height: 7 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  // details image
  detailsImgBg:  {
    width: width
  },
   // profile imagebg
   profileImgBg:  {
    width: width,
    height: height,
    padding: 20,
  },
  detailList: {
    flex:1,
    padding: 20,
    width: width
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
    fontFamily: 'opensans',               // Change default font
  },  
  // Shared text style Bold
  textBold: {
    color: '#fff',                      // White text color
    backgroundColor: 'transparent',     // No background
    fontFamily: 'opensansBold',               // Change default font
  },
  //no data in list on Now text
  emptyRow: {
    top: 50,
    height: 150,
  },
  camCenterText: {
    color: '#fff',
    fontFamily: 'opensans',
    fontSize: 18,
    justifyContent: 'center',           // Center vertically
    alignItems: 'center',
    textAlign: 'center',
  },
  center1: {
    color: '#909090',
    fontFamily: 'opensans',
    fontSize: 18,
    justifyContent: 'center',           // Center vertically
    alignItems: 'center',
    textAlign: 'center',
  },
  center2: {
    color: '#909090',
    fontFamily: 'opensans',
    fontSize: 18,
    justifyContent: 'center',           // Center vertically
    alignItems: 'center',
    textAlign: 'center',
  },
  center3: {
    color: '#909090',
    fontFamily: 'opensans',
    fontSize: 18,
    justifyContent: 'center',           // Center vertically
    alignItems: 'center',
    textAlign: 'center',
  },
  usernameS: {
    marginTop: 'auto',
    marginBottom: 'auto',
    marginLeft: 5
  },
  // black
  blk: {
    color: 'black',                      // Black text color
  },
  darkBlue: {
    color: 'blue'
  },
  // red color
  red: {
    color: '#FF0000'
  },
  teal: {
    color: '#00F7CF'
  },
  white: {
    color: '#fff'
  },
   // spotify color
   spotifyGreen: {
    color: '#1ED760',                      // Black text color
  },
  pb10: {
    bottom: 20
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
  // title
  title: {
    fontSize: 22, 
    lineHeight: 28,                      // Bigger font size
    fontFamily: 'opensansBold',
    color: '#fff'
  },
  // on now text
  onNowText: {
    fontSize: 30,                       // Bigger font size
    fontFamily: 'opensansBold',
    lineHeight: 37,
    color: '#fff'
  },
   // upcomingtitle
   titleUpcoming: {
    fontSize: 38,                       // Bigger font size
    fontFamily: 'katanas-edge',
    color: 'red'
  },
  // section title
  sectionTitle: {
    fontSize: 32,                       // Bigger font size
    fontFamily: 'katanas-edge',
    color: '#151515',
    paddingLeft: 20,
    marginTop: 40,
  },
  // Background color text
  textBgBlue: {
    backgroundColor: 'blue',
    padding: 10,
    flexWrap: 'wrap'
  },
  profileName: {
    marginTop: 10,
    fontSize: 38,                       // Bigger font size
    fontFamily: 'katanas-edge',
    color: '#00D4EF'
  },
  // Rating row
  rating: {
    flexDirection: 'row',               // Arrange icon and rating in one line
  },
  onNowBg: {
    backgroundColor: '#C10000',
    width: 80,
    height: 30,
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center'
  },
  // center text
  cView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  button: {
    backgroundColor: '#EEEEEE',
    width: 80,
    height: 30,
  },
  //
  btmRightBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,
  },
  // button width longer
  btnWidth100: {
    width: 100,
  },
  // privacy button
  privacyBtn: {
    backgroundColor: 'transparent',
    width: 180,
    height: 30,
    marginBottom: 10,
  },
  supportBtn: {
    backgroundColor: 'transparent',
    width: 100,
    height: 30,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  // UI faces on list
  uiFace: {
    height: 34,
    width: 34,
    borderRadius: 17,
    marginLeft: -10,
  },
   // Profile image
   profileImg: {
    height: 100,
    width: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#fff'
  },
  // UI faces row
  imageRow: {
    flexDirection: 'row',
    position: "absolute",
    bottom: 0,
    right: 0,
    paddingBottom: 40
  },
  circleProgress: {
    alignSelf: 'flex-end',
    marginTop: -5,
    position: 'absolute',
    zIndex: 2,
  },
  }
);
