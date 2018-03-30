import { combineReducers } from 'redux';
import VideoReducer from './VideoReducer';
import CamDataReducer from './CamData';
import EventData from './Event';
import UniversalLoadingRed from './Universal_Loading';

export default combineReducers({
  videoReducer: VideoReducer,
  camDataReducer: CamDataReducer,
  eventDataReducer: EventData,
  universalLoadingRed: UniversalLoadingRed
});
