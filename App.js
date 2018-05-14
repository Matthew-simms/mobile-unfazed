import React from 'react'
import { Provider } from 'react-redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import ReduxThunk from 'redux-thunk';
import { createStore, applyMiddleware } from 'redux';
import RootNavigation from './navigation/RootNavigation';
import { Font, AppLoading } from 'expo';
import reducers from './reducers';
import cacheAssetsAsync from './helpers/cachedAssetAsync'
import { Constants, Segment } from 'expo'


console.log(Constants.isDevice) 

export default class App extends React.Component {
  state = {
    isReady: false,
  };

    // GET assets then load before app renders
    async _loadAssetsAsync() {
      try {
        await cacheAssetsAsync({
          images: [
            require('./assets/images/nav-tute.png'),
            require('./assets/images/Profile_bg.jpg'),
            require('./assets/images/Profile_avatar_placeholder.png'),
            require('./assets/images/Slide_1_icon.png'),
            require('./assets/images/slide_2_icon.png'),
            require('./assets/images/slide_3_icon.png'),
            require('./assets/images/spotify_logo.png'),
          ],
          fonts: [
            { 'katanas-edge': require('./assets/fonts/katanas-edge.ttf') },
            { 'opensans': require('./assets/fonts/OpenSans.ttf') },
            { 'opensansBold': require('./assets/fonts/OpenSans-Bold.ttf') },
            { 'opensansLight': require('./assets/fonts/OpenSans-Light.ttf') },
          ],
        });
      } catch (e) {
        console.log({ e });
      } 
    }

    _handleLoadingError = error => {
      // In this case, you might want to report the error to your error
      // reporting service, for example Sentry
      console.warn(error);
    };
  
    _handleFinishLoading = () => {
      this.setState({ fontLoaded: true, isReady: true  });
    };
  
    componentWillMount() {
      const iosWriteKey = 'ECEf7KT3PwB6KM3M4LXPLY2BsHcYieVY';
      const androidWriteKey = 'oB4p8r06XYizIZExS4j2iHA0AIqwLxTV';
      const userId = '3WP15cvWbn';
      Segment.initialize({ androidWriteKey, iosWriteKey });
      Segment.identify(userId);
      Segment.screen('App.js');
    }
    render() {
      if ( !this.state.isReady ) {
        return (
          <AppLoading
          startAsync={this._loadAssetsAsync}
          onError={this._handleLoadingError}
          onFinish={this._handleFinishLoading}
          />
        );
      }

      if (!Constants.isDevice) {
      const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || composeWithDevTools;
      return (
        <Provider store={createStore(reducers, {}, composeEnhancers(applyMiddleware(ReduxThunk)))}>
          <RootNavigation />
        </Provider>
      )}
      return (
        <Provider store={createStore(reducers, {}, applyMiddleware(ReduxThunk))}>
          <RootNavigation />
        </Provider>
      )
    }
  }
