import { CAMERA_OR_VIDEO, CAMERA_DATA } from './types';


export const storeCamData = (data) => {
  console.log('hello');
  return {
    type: CAMERA_DATA,
    payload: data
  }
};

export const camOrVid = (data) => {
  return {
    type: CAMERA_OR_VIDEO,
    payload: data
  }
};
