import { tassign } from 'tassign';

export interface IAppState {
  isLoggedIn: boolean;
  accessToken;
  isFetchingAccessToken;
}

export const INITIAL_STATE: IAppState = {
  isLoggedIn: false,
  isFetchingAccessToken: false,
  accessToken: null
};

export function rootReducer(state: IAppState, action): IAppState {
  switch (action.type) {
    case 'ACCESS_TOKEN_FETCH':
      return tassign(state, {isFetchingAccessToken: true, accessToken: null, isLoggedIn: false});
    case 'ACCESS_TOKEN_FOUND':
      return tassign(state, {isFetchingAccessToken: false, accessToken: action.accessToken, isLoggedIn: true});
    case 'ACCESS_TOKEN_NOT_FOUND':
      return tassign(state, {isFetchingAccessToken: false, accessToken: null, isLoggedIn: false});
  }
  return state;
}
