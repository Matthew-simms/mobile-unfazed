import { CAMERA_OR_VIDEO } from '../actions/types';

const INITIAL_STATE = "Camera";

export default (state = INITIAL_STATE, action) => {
  switch(action.type) {
    case CAMERA_OR_VIDEO:
      return action.payload;
    default:
      return state;
  }
};
