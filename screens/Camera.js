import React from 'react';
import { View, Text } from 'react-native';
import { connect } from 'react-redux';
import CameraComponent from '../components/Camera';
import VideoComponent from '../components/Video';

class CameraC extends React.Component{

  constructor(props) {
    super(props);
    this.refreshMainC = this.refreshMainC.bind(this);
  }

  refreshMainC() {
    this.props.refreshMainC();
  }

  render() {
    console.log(this.props.videoReducer);
    const { videoReducer } = this.props;
    if (videoReducer === 'Camera') {
      return (
        <View style={{flex: 1}}>{<CameraComponent/>}</View>
      )
    } else if (videoReducer === 'Video') {
      return (
        <View style={{flex: 1}}>{<VideoComponent currentVenue={this.props.currentVenue} refreshMainC={this.refreshMainC} />}</View>
      )
    } else {
      return <View />
    }
  }
}

const mapStateToProps = state => {
  //const videoState = state.videoReducer;
  return state;
}

export default connect(mapStateToProps, {})(CameraC);
