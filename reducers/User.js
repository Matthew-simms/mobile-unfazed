import { LOGIN_DATA } from '../actions/types';

const INITIAL_STATE = 
{
    username: '',
    userInfo:'',
    modal: false,
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
        case 'SIGNUP': 
        return Object.assign({}, state, { 
            isLoggedIn: true,
            modal: true,
            username: action.username,
        }); 
    default:
      return state;
  }
};
