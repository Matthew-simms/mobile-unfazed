import React from 'react'
import { Provider } from 'react-redux';
import ReduxThunk from 'redux-thunk';
import { createStore, applyMiddleware } from 'redux';
import RootNavigation from './navigation/RootNavigation';
import { Font, AppLoading } from 'expo';
import reducers from './reducers';
import cacheAssetsAsync from './helpers/cachedAssetAsync'
import { Constants } from 'expo'


console.log(Constants.isDevice) 

export default class App extends React.Component {
  state = {
    isReady: false,
  };

    // GET assets then load before app renders
    async _loadAssetsAsync() {
      try {
        await cacheAssetsAsync({
          images: [require('./assets/images/nav-tute.png')],
          fonts: [
            { 'katanas-edge': require('./assets/fonts/katanas-edge.ttf') },
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
      const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
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
