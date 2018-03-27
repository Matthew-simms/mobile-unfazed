import { IS_LOADING } from '../actions/types';

const INITIAL_STATE = false;

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case IS_LOADING:
      return action.payload;
    default:
      return state;
  }
};
