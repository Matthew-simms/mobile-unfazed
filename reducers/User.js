import { LOGIN_DATA } from '../actions/types';

const INITIAL_STATE = 
{
    username: '',
    userInfo:'',
};

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case 'LOGIN': 
            return Object.assign({}, state, { 
                isLoggedIn: true,
                username: action.username,
            });
        case 'LOGINFB': 
            return Object.assign({}, state, { 
                isLoggedIn: true,
                userInfo: action.userInfo,
            }); 
    default:
      return state;
  }
};
