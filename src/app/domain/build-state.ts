export enum BuildState {
  NOT_BUILDING = 0,
  FETCHING_ARTIST = 1,
  FETCHING_ARTIST_SUCCESS = 2,
  FETCHING_ALBUMS = 3,
  FETCHING_ALBUMS_SUCCESS = 4,
  FETCHING_SONGS = 5,
  FETCHING_SONGS_SUCCESS = 6,
  FETCHING_USER = 7,
  FETCHING_USER_SUCCESS = 8,
  CREATING_PLAYLIST = 9,
  CREATING_PLAYLIST_SUCCESS = 10,
  PREP_SONG_BATCH = 11,
  PREP_SONG_BATCH_SUCCESS = 12,
  ADD_SONG_BATCH = 13,
  ADD_SONG_BATCH_SUCCESS = 14,
  COMPLETE = 15,
}
