import React from 'react';
import { StyleSheet, View, Text, Platform, ImageBackground,
         Dimensions, SectionList, TouchableOpacity, Image,
         ActivityIndicator } from 'react-native';
import { Button } from 'react-native-elements';
import { connect } from 'react-redux';
import { LinearGradient } from 'expo';
import TouchableScale from 'react-native-touchable-scale';

const screen = Dimensions.get('window');

class EventsComponent extends React.Component {
  // Map array and show UI faces in render
  UiPrinter(array) {
    if (array) {
      return array.map((images, index) => {
        // don't put your key as index, choose other unique values as your key.
        return (
          <Image
            key={index}
            source={{ uri: images.userPhotoLink }}
            style={styles.uiFace}
          />
        );
      });
    }
  }

  _onRowPress = (rowData) => {
    Expo.Segment.trackWithProperties('Tapped an event from list-->', {
      eventId: rowData.eventId,
      currentEvent: rowData.eventName,
      venueName: rowData.place.name
    });

    console.log(rowData);

    this.props.eventsOnRowPress(
      {
        eventId: rowData.eventId,
        currentVenue: rowData,
        isLoading: true,
        rowData
      }
    );
  }

  // On Now list empty state
  _renderEmpty() {
    return (
      <Text style={[styles.center]}>
        No events on right now, come back and check later or view some upcoming events below
      </Text>
    );
  }

  // Render section header
  _renderSectionHeader = ({ section }) => {
    return (
      <View>
        <Text style={styles.sectionTitle}>{section.title}</Text>
      </View>
    );
  }

  //Render on Now
  _renderOnNowItem = ({ item, section }) => (
     section.length === 0 ? false :
     item.eventName === 'exception'
     ?
     <View style={styles.emptyRow} borderRadius={9} >
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
     <View style={styles.elevationLow} borderRadius={9} >
       <ImageBackground
         source={{ uri: item.bg_image_link }}
         borderRadius={9}
         style={styles.imageBackground}
       >
         <LinearGradient
           colors={!item.gradient_colors ? ['rgba(155,0,0,0.8)","rgba(87,0,0,0.8)']
           : item.gradient_colors}
           start={[0.1, 0.1]}
           end={[0.5, 0.5]}
           style={{ padding: 20, borderRadius: 9 }}
         >
             <View style={styles.listBackground}>
             <View style={styles.onNowBg}>
               <Text style={[styles.text]}>On Now</Text>
             </View>
               <Text numberOfLines={3} style={[styles.onNowText]}>{item.eventName}</Text>
               <Text style={[styles.text]}>@ {item.place ? item.place.name : ''}</Text>
                 <View style={styles.imageRow}>
                   { item.uiFaces ? item.uiFaces.payload ?
                     this.UiPrinter(item.uiFaces.payload) : null : null }
                   <Text style={styles.text}>{item.videoCount} Videos</Text>
                 </View>
             </View>
             {item.eventName !== this.props.currentVenueEventName ?
             <Button
               onPress={this._onRowPress.bind(this, item)}
               color={'#6600EC'}
               title={'Play'}
               rounded
               buttonStyle={[styles.button, styles.btmRightBtn]}
             />
             :
             <TouchableOpacity
               style={{ position: 'absolute', bottom: 30, right: 40 }}
             >
               <Text style={{ color: 'white', fontSize: 18 }}>
                 Playing
               </Text>
             </TouchableOpacity>}
         </LinearGradient>
       </ImageBackground>
     </View>
   </TouchableScale>
  )

  // Render item
  _renderItem = ({ item, section }) => (
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
      <View style={styles.elevationLow} borderRadius={9}>
        <ImageBackground
          source={{ uri: item.upcomingArt }}
          borderRadius={9} style={styles.imageBackground}
        >
          <View style={[styles.listBackground, styles.paddingBg]}>
            <Text style={[styles.text, styles.teal]}>Upcoming</Text>
            <Text
              numberOfLines={2}
              style={[styles.text, styles.titleUpcoming, styles.teal]}>{item.eventName}
            </Text>
            <Text style={[styles.text, styles.blk]}>@ {item.place ? item.place.name : ''}</Text>
            <Text style={[styles.text, styles.blk]}>{item.place.startDate}</Text>
          </View>
          <Button
            onPress={this._onRowPress.bind(this, item)}
            color={'#6600EC'}
            title={'Play'}
            rounded
            buttonStyle={[styles.button, styles.btmRightBtn, styles.pb10]}
          />
        </ImageBackground>
      </View>
    </TouchableScale>
  )

  render() {
    console.log(this.props.upcomingEvents);

    let loadingUpcomingOrNot;
    if (this.props.eventsCUpcomingLoading) {
      loadingUpcomingOrNot = (
        <View style={[styles.container, styles.horizontal]}>
          <ActivityIndicator size="small" color="#00ff00" />
        </View>
      );
    } else {
      loadingUpcomingOrNot = <View />;
    }
    return (
      <View style={{ flex: 1 }}>
        <SectionList
          renderItem={this._renderItem}
          renderSectionHeader={this._renderSectionHeader}
          stickySectionHeadersEnabled={false}
          sections={[
            {
              data: this.props.venue,
              title: 'On Now',
              // subtitle: 'this is a subtitle',
              renderItem: this.props.venue.length > 0 ? this._renderOnNowItem: this._renderEmpty,
              keyExtractor: item => item.id,
              ListEmptyComponent: this._renderEmpty
            },
            {
              data: this.props.upcomingEvents,
              title: 'Upcoming',
              renderItem: this._renderItem,
              keyExtractor: item => item.id,
              // ListEmptyComponent: this._renderEmpty
            }
          ]}
          refreshing={this.props.eventsCLoading}
          onRefresh={() => {
            this.props.toggleEventsCLoading();
            this.props.refreshEvents();
            console.log('Refreshing');
          }}
          onEndReachedThreshold={0.8}
          onEndReached={(info) => {
            console.log(info, this.props.upcomingEvents);
            this.props.toggleEventsCUpcomingLoading();
            this.props.loadMoreUpcoming();
          }}
        />
        {loadingUpcomingOrNot}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center'
  },
  horizontal: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10
  },
  row: {
    padding: 20,                   // Add padding at the bottom
    paddingBottom: 4
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
  imageBackground: {
    width: screen.width - 40,
  },
  onNowBg: {
    backgroundColor: '#C10000',
    width: 80,
    height: 30,
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center'
  },
  // on now text
  onNowText: {
    fontSize: 30,                       // Bigger font size
    fontFamily: 'opensansBold',
    lineHeight: 37,
    color: '#fff'
  },
  pb10: {
    bottom: 20
  },
  titleUpcoming: {
   fontSize: 38,                       // Bigger font size
   fontFamily: 'katanas-edge',
   color: 'red'
 },
 teal: {
   color: '#00F7CF'
 },
 //no data in list on Now text
 emptyRow: {
   top: 50,
   height: 150,
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
 // UI faces row
 imageRow: {
   flexDirection: 'row',
   position: 'absolute',
   bottom: 0,
   right: 0,
   paddingBottom: 40
 },
 // section title
 sectionTitle: {
   fontSize: 32,                       // Bigger font size
   fontFamily: 'katanas-edge',
   color: '#151515',
   paddingLeft: 20,
   marginTop: 40,
 },
 paddingBg: {
   padding: 20,
   borderRadius: 9,
 },
 button: {
   backgroundColor: '#EEEEEE',
   width: 80,
   height: 30,
 },
 blk: {
   color: 'black',                      // Black text color
 },
 //
 btmRightBtn: {
   position: 'absolute',
   bottom: 0,
   right: 0,
 },
 // UI faces on list
 uiFace: {
   height: 34,
   width: 34,
   borderRadius: 17,
   marginLeft: -10,
 },
 listBackground: {
   height: screen.height / 2,          // Divide screen height by 3
 },
 text: {
   color: '#fff',                      // White text color
   backgroundColor: 'transparent',     // No background
   fontFamily: 'opensans',               // Change default font
 },
});

export default connect(null, {})(EventsComponent);
