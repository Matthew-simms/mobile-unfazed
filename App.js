import React from 'react'
import RootNavigation from './navigation/RootNavigation';
import { Font, AppLoading } from 'expo'

export default class App extends React.Component {
  state = {
    isReady: false,
  };
  
    // GET assets then load before app renders
    async _loadFontsAsync() {
      try {
        await Font.loadAsync({
          'katanas-edge': require('./assets/fonts/katanas-edge.ttf'),
        });
      } catch (e) {
        console.warn(
          'There was an error caching assets (see: main.js), perhaps due to a ' +
            'network timeout, so we skipped caching. Reload the app to try again.'
        );
        console.log(e.message);
      } finally {
        this.setState({ fontLoaded: true });
      }
    }

  render() {
    if ( !this.state.isReady ) {
      return (
        <AppLoading
          startAsync={this._loadFontsAsync}
          onFinish={() => this.setState({ isReady: true })}
          onError={console.warn}
        />
      );
    }

      return (
          <RootNavigation />
      );
    }
  }