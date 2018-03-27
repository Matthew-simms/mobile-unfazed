import React from 'react'
import { Provider } from 'react-redux';
import ReduxThunk from 'redux-thunk';
import { createStore, applyMiddleware } from 'redux';
import RootNavigation from './navigation/RootNavigation';
import { Font, AppLoading } from 'expo';
import reducers from './reducers';

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
        <Provider store={createStore(reducers, {}, applyMiddleware(ReduxThunk))}>
          <RootNavigation />
        </Provider>
      );
    }
  }
