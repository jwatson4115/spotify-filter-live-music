import { tassign } from 'tassign';
import { BuildState } from './build-state';
import { Song } from './song';
import { Artist } from './artist';

export interface IAppState {
  isLoggedIn: boolean;
  isSearching: false;
  accessToken: string;
  isFetchingAccessToken: boolean;
  artistId: string;
  buildState: BuildState;
  albumIds: string[];
  songs: Song[];
  userId: string;
  playlistId: string;
  searchResults: Artist[];
}

export const INITIAL_STATE: IAppState = {
  isLoggedIn: false,
  isFetchingAccessToken: false,
  isSearching: false,
  accessToken: null,
  artistId: null,
  buildState: BuildState.NOT_BUILDING,
  albumIds: [],
  songs: [],
  userId: null,
  playlistId: null,
  searchResults: [],
};

export function rootReducer(state: IAppState, action): IAppState {
  switch (action.type) {
    case 'ACCESS_TOKEN_FETCH':
      return tassign(state, {isFetchingAccessToken: true, accessToken: null, isLoggedIn: false});
    case 'ACCESS_TOKEN_FOUND':
      return tassign(state, {isFetchingAccessToken: false, accessToken: action.accessToken, isLoggedIn: true});
    case 'ACCESS_TOKEN_NOT_FOUND':
      return tassign(state, {isFetchingAccessToken: false, accessToken: null, isLoggedIn: false});
    case 'ARTIST_SEARCH_FETCH':
      return tassign(state, {isSearching: true});
    case 'ARTIST_SEARCH_FETCH_SUCCESS':
      return tassign(state, {isSearching: false, searchResults: action.artists});
    case 'ARTIST_FETCH':
      return tassign(state, {buildState: BuildState.FETCHING_ARTIST, artistId: null});
    case 'ARTIST_FETCH_SUCCESS':
      return tassign(state, {buildState: BuildState.FETCHING_ARTIST_SUCCESS, artistId: action.artistId});
    case 'ALBUMS_FETCH':
      return tassign(state, {buildState: BuildState.FETCHING_ALBUMS, albumIds: null});
    case 'ALBUMS_FETCH_SUCCESS':
      return tassign(state, {buildState: BuildState.FETCHING_ALBUMS_SUCCESS, albumIds: action.albumIds});
    case 'SONGS_FETCH':
      return tassign(state, {buildState: BuildState.FETCHING_SONGS, songs: null});
    case 'SONGS_FETCH_SUCCESS':
      return tassign(state, {buildState: BuildState.FETCHING_SONGS_SUCCESS, songs: action.songs});
    case 'USER_FETCH':
      return tassign(state, {buildState: BuildState.FETCHING_USER, userId: null});
    case 'USER_FETCH_SUCCESS':
      return tassign(state, {buildState: BuildState.FETCHING_USER_SUCCESS, userId: action.userId});
    case 'PLAYLIST_CREATE':
      return tassign(state, {buildState: BuildState.CREATING_PLAYLIST, userId: null});
    case 'PLAYLIST_CREATE_SUCCESS':
      return tassign(state, {buildState: BuildState.CREATING_PLAYLIST_SUCCESS, playlistId: action.playlistId});
    case 'BUILD_COMPLETE':
      return tassign(state, {buildState: BuildState.COMPLETE});
  }
  return state;
}
