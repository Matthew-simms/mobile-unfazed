import { IS_LOADING } from './types';

export const startUniversalLoading = () => {
  return {
    type: IS_LOADING,
    payload: true
  };
};

export const stopUniversalLoading = () => {
  return {
    type: IS_LOADING,
    payload: false
  };
};
