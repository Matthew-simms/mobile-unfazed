import React, { Component } from 'react';
import {
  Image,              // Renders background image
  ImageBackground,
  StyleSheet,         // CSS-like styles
  Text,               // Renders text
  TouchableOpacity,   // Handles row presses
  View                // Container component
} from 'react-native';
import Dimensions from 'Dimensions';
import randomcolor from 'randomcolor'

// Detect screen size to calculate row height
const screen = Dimensions.get('window');

export default class Row extends Component {
    
      // Extract event and onPress props passed from List component
      render({ event, onPress } = this.props) {
        // Extract values from event object
        const { eventName, id, upcomingEvent } = event;
        return (
          // Row press handler
          <TouchableOpacity
            // Pass row style
            style={styles.row}
            // Call onPress function passed from List component when pressed
            onPress={onPress}
            // Dim row a little bit when pressed
            activeOpacity={0.7}
          >
            {/* Background image */}
            <ImageBackground source={{uri: 'https://www.billboard.com/articles/news/7655338/bruce-springsteen-cover-band-cancels-inauguration-performance'}} style={ !upcomingEvent ? styles.imageBackground : styles.imageBackgroundUpcoming }>
              {/* Title */}
              <Text style={[styles.text, styles.title]}>{eventName.toUpperCase()}</Text>
              {/* Rating */}
              <View style={styles.rating}>
                {/* Icon */}
                <Image
                  source={{uri: 'https://lh3.googleusercontent.com/gN6iBKP1b2GTXZZoCxhyXiYIAh8QJ_8xzlhEK6csyDadA4GdkEdIEy9Bc8s5jozt1g=w300'}}
                  style={styles.icon}
                />
                {/* Value */}
                <Text style={[styles.text, styles.value]}>{id}%</Text>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        );
      }
    }

    const styles = StyleSheet.create({
        // Row
        row: {
          paddingBottom: 4,                   // Add padding at the bottom
        },
        // Background image
        imageBackground: {
          height: screen.height / 3,          // Divide screen height by 3
          justifyContent: 'center',           // Center vertically
          alignItems: 'center',               // Center horizontally
          backgroundColor: randomcolor(),
        },
        // Background image upcoming events
        imageBackgroundUpcoming: {
          height: screen.height / 6,          // Divide screen height by 6
          justifyContent: 'center',           // Center vertically
          alignItems: 'center',               // Center horizontally
          backgroundColor: randomcolor(),
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
        // Certified fresh icon
        icon: {
          width: 22,                          // Set width
          height: 22,                         // Set height
          marginRight: 5,                     // Add some margin between icon and rating
        },
        // Rating value
        value: {
          fontSize: 16,                       // Smaller font size
        },
      });