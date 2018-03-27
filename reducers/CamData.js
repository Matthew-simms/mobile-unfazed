import { CAMERA_DATA } from '../actions/types';

const INITIAL_STATE = {uri: ''};

export default (state = INITIAL_STATE, action) => {
  switch(action.type) {
    case CAMERA_DATA:
      return action.payload;
    default:
      return state;
  }
};
