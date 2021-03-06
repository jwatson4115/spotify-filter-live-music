import { tassign } from 'tassign';
import { BuildState } from './build-state';
import { Song } from './song';
import { Artist } from './artist';
import { Album } from "src/app/domain/album";

export interface IAppState {
  isLoggedIn: boolean;
  isSearching: false;
  hasSearched: boolean;
  accessToken: string;
  isFetchingAccessToken: boolean;
  artistId: string;
  artistName: string;
  buildState: BuildState;
  albums: Album[];
  albumsToProcess: Album[];
  songs: Song[];
  songsToAdd: string[];
  userId: string;
  playlistId: string;
  searchResults: Artist[];
  isEmptyPlaylist: boolean;
  unknownError: boolean;
}

export const INITIAL_STATE: IAppState = {
  isLoggedIn: false,
  isFetchingAccessToken: false,
  isSearching: false,
  hasSearched: false,
  accessToken: null,
  artistId: null,
  artistName: null,
  buildState: BuildState.NOT_BUILDING,
  albums: [],
  albumsToProcess: [],
  songs: [],
  songsToAdd: [],
  userId: null,
  playlistId: null,
  unknownError: false,
  isEmptyPlaylist: false,
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
    case 'ACCESS_TOKEN_EXPIRED':
      return tassign(state, {isFetchingAccessToken: false, accessToken: null, isLoggedIn: false, hasSearched: false, isSearching: false});
    case 'ARTIST_SEARCH_FETCH':
      return tassign(state, {isSearching: true, unknownError: false, isEmptyPlaylist: false});
    case 'ARTIST_SEARCH_FETCH_SUCCESS':
      return tassign(state, {isSearching: false, hasSearched: true, searchResults: action.artists});
    case 'ARTIST_FETCH':
      return tassign(state, {buildState: BuildState.FETCHING_ARTIST, artistId: null});
    case 'ARTIST_FETCH_SUCCESS':
      return tassign(state, {buildState: BuildState.FETCHING_ARTIST_SUCCESS, artistId: action.artistId, artistName: action.artistName});
    case 'ALBUMS_FETCH':
      return tassign(state, {buildState: BuildState.FETCHING_ALBUMS, albums: null});
    case 'ALBUMS_FETCH_SUCCESS':
      return tassign(state, {buildState: BuildState.FETCHING_ALBUMS_SUCCESS, albums: action.albums});
    case 'SONGS_FETCH':
      return tassign(state, {buildState: BuildState.FETCHING_SONGS, songs: null});
    case 'SONGS_FETCH_SUCCESS':
      return tassign(state, {buildState: BuildState.FETCHING_SONGS_SUCCESS, songs: action.songs});
    case 'USER_FETCH':
      return tassign(state, {buildState: BuildState.FETCHING_USER, userId: null});
    case 'USER_FETCH_SUCCESS':
      return tassign(state, {buildState: BuildState.FETCHING_USER_SUCCESS, userId: action.userId});
    case 'PLAYLIST_CREATE':
      return tassign(state, {buildState: BuildState.CREATING_PLAYLIST});
    case 'PLAYLIST_CREATE_SUCCESS':
      return tassign(state, {buildState: BuildState.CREATING_PLAYLIST_SUCCESS, playlistId: action.playlistId});
    case 'PREP_SONG_BATCH':
      return tassign(state, {buildState: BuildState.PREP_SONG_BATCH});
    case 'PREP_SONG_BATCH_SUCCESS':
      return tassign(state, {buildState: BuildState.PREP_SONG_BATCH_SUCCESS, songsToAdd: action.songsToAdd});  
    case 'ADD_SONG_BATCH':
      return tassign(state, {buildState: BuildState.ADD_SONG_BATCH});
    case 'ADD_SONG_BATCH_SUCCESS':
      return tassign(state, {buildState: BuildState.ADD_SONG_BATCH_SUCCESS, songsToAdd: action.songsToAdd});
    case 'BUILD_COMPLETE':
      return tassign(state, {buildState: BuildState.COMPLETE});
    case 'UNKNOWN_ERROR':
      return tassign(state, {buildState: BuildState.NOT_BUILDING, unknownError: true, isFetchingAccessToken: false, hasSearched: false, isSearching: false, searchResults: null});
    case 'EMPTY_PLAYLIST_ERROR':
      return tassign (state, {buildState: BuildState.NOT_BUILDING, isEmptyPlaylist: true, unknownError: false,  isFetchingAccessToken: false, hasSearched: false, isSearching: false, searchResults: null});
  }
  return state;
}
