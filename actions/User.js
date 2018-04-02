import {  LOGIN_DATA } from './types';

export const login = (username) => {
    return {
        type: 'LOGIN',
        username: username,
    };
};

export const loginFb = (userInfo) => {
    return {
        type: 'LOGINFB',
        userInfo: userInfo
    };
};

export const signup = (username) => {
    return {
        type: 'SIGNUP',
        userInfo: username
    };
};