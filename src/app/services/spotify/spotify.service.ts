import { Injectable } from '@angular/core';
import { Http, RequestOptions, Headers } from '@angular/http';
import { NgRedux } from '@angular-redux/store';
import { IAppState } from '../../domain/store';
import { map } from 'rxjs/operators';
import { Song } from '../../domain/song';
import { Artist } from '../../domain/artist';
import { Image } from '../../domain/image';
import { Album } from "src/app/domain/album";

const API_URL = 'https://api.spotify.com/v1';

@Injectable({
  providedIn: 'root'
})
export class SpotifyService {

  constructor(private ngRedux: NgRedux<IAppState>, private http: Http) {
  }

  searchArtist(searchQuery: string) {
    const options = this.getOptions();
    this.ngRedux.dispatch({type: 'ARTIST_SEARCH_FETCH'});

    this.http.get(`${API_URL}/search?q=${searchQuery}&type=artist`, options)
      .pipe(
        map(response => response.json())
      ).subscribe(response => {
        let artists = this.getArtistArray(response.artists.items);
        artists = artists.slice(0, 5);
        this.ngRedux.dispatch({type: 'ARTIST_SEARCH_FETCH_SUCCESS', artists: artists});
      }, error => {
        this.handleError(error);
      });
  }

  loadAlbums(artistId: string) {
    const options = this.getOptions();

    this.ngRedux.dispatch({type: 'ALBUMS_FETCH'});

    this.http.get(`${API_URL}/artists/${artistId}/albums?include_groups=album`, options)
      .pipe(
        map(response => response.json())
      ).subscribe(response => {
        const albums: Album[] = [];
        response.items.forEach(item => {
          
          albums.push({
            name: item.name,
            id: item.id,
          });
        });
        this.ngRedux.dispatch({type: 'ALBUMS_FETCH_SUCCESS', albums: albums});
      }, error => {
        this.handleError(error);
      });
  }

  loadSongs(albums: Album[]) {
    
    const options = this.getOptions();
    albums = this.filterLiveAlbums(albums);
    const albumIdList = albums.map(x => x.id).join();

    let songs: Song[] = [];

    this.ngRedux.dispatch({type: 'SONGS_FETCH'});

    this.http.get(`${API_URL}/albums/?ids=${albumIdList}`, options)
      .pipe(
        map(response => response.json())
      ).subscribe(response => {
        response.albums.forEach(album => {
          album.tracks.items.forEach(item => {
            songs.push({
              name: item.name,
              id: item.id
            });
          });
        });

        songs = this.filterLiveSongs(songs);

        this.ngRedux.dispatch({type: 'SONGS_FETCH_SUCCESS', songs: songs});
      }, error => {
        this.handleError(error);
      });
  }

  loadUser() {
    const options = this.getOptions();

    this.ngRedux.dispatch({type: 'USER_FETCH'});

    this.http.get(`${API_URL}/me/`, options)
      .pipe(
        map(response => response.json())
      ).subscribe(response => {
        this.ngRedux.dispatch({type: 'USER_FETCH_SUCCESS', userId: response.id});
      }, error => {
        this.handleError(error);
      });
  }

  createPlaylist(userId: string, songs: Song[], artistName) {
    const options = this.getOptions();
    const playlistName = this.getPlaylistName(artistName);

    this.ngRedux.dispatch({type: 'PLAYLIST_CREATE'});

    this.http.post(`${API_URL}/users/${userId}/playlists`, {
      name: playlistName
    }, options)
      .pipe(
        map(res => res.json())
      ).subscribe(response => {
        const playlistId = response.id;
        this.ngRedux.dispatch({type: 'PLAYLIST_CREATE_SUCCESS', playlistId: playlistId});
      }, error => {
        this.handleError(error);
      });
  }

  prepSongsToAdd(songs: Song[]) {
    // console.log(songs);
    this.ngRedux.dispatch({type: 'PREP_SONG_BATCH'});
    const songArray = this.getSongArray(songs);
    this.ngRedux.dispatch({type: 'PREP_SONG_BATCH_SUCCESS', songsToAdd: songArray});
    // console.log(songArray);
  }
  
  addSongBatch(songsToAdd: string[], playlistId: string) {
    this.ngRedux.dispatch({type: 'ADD_SONG_BATCH'});

    const options = this.getOptions();
    const songBatch = songsToAdd.splice(0, 100);

    this.http.post(`${API_URL}/playlists/${playlistId}/tracks`, {
      uris: songBatch
    }, options).pipe(
      map(res => res.json())
    ).subscribe(() => {
      this.ngRedux.dispatch({type: 'ADD_SONG_BATCH_SUCCESS', songsToAdd: songsToAdd});
    }, error => {
      this.handleError(error);
    });
  }

  private getPlaylistName (artistName) {
    if (!artistName || artistName == "") {
      return 'filtered playlist';
    } else {
      return artistName + ' Filtered';
    }
  }

  private getSongArray (songs) {
    const songArray: string[] = [];

    songs.forEach(song => {
      songArray.push('spotify:track:' + song.id);
    });

    console.log(songArray);
    return songArray;
  }

  private filterLiveAlbums (albums: Album[]) {
    return albums.filter(x => x.name.toLowerCase().indexOf('live') === -1);
  }

  private filterLiveSongs (songs: Song[]) {
    // Filter live in title
    songs = songs.filter(x => x.name.toLowerCase().indexOf('live') === -1);
    // Filter demo in title.
    songs = songs.filter(x => x.name.toLowerCase().indexOf('demo') === -1);
    // Filter instrumentals
    songs = songs.filter(x => x.name.toLowerCase().search(/\- .*Instrumental?.*/) === -1);
    // Filter mixes (e.g. "song name - 2019 Mix")
    songs = songs.filter(x => x.name.toLowerCase().search(/\- .*mix/) === -1);
    // Filter alternate takes (e.g. "song name - Take 7)
    songs = songs.filter(x => x.name.toLowerCase().search(/\- .*take(s)?.*/) === -1);
    songs = songs.filter(x => x.name.toLowerCase().search(/\(.*Take.*\)/) === -1);
    songs = songs.filter(x => x.name.toLowerCase().search(/\- .*early.*version/) === -1);
    songs = songs.filter(x => x.name.toLowerCase().search(/\- .*alternate/) === -1);

    return songs;
  }

  private getOptions () {
    const headers = new Headers ({
      'Authorization': 'Bearer ' + this.ngRedux.getState().accessToken,
      'Content-Type': 'application/json'
    });

    const options = new RequestOptions({
      headers: headers
    });

    return options;
  }

  private getArtistArray (items) {
    const artists: Artist[] = [];

    items.forEach(item => {

      const images = this.getImagesArray(item.images);

      artists.push({
        name: item.name,
        id: item.id,
        images: images,
      });
    });

    return artists;
  }
  private getImagesArray (images) {
    const imageArray: Image[] = [];

    images.forEach(image => {
      imageArray.push({
        width: image.width,
        height: image.height,
        url: image.url,
      });
    });

    return imageArray;
  }

  private handleError(error) {
    if (error.status == 401) {
      this.ngRedux.dispatch({type: 'ACCESS_TOKEN_EXPIRED'});
    } else {
      this.ngRedux.dispatch({type: 'UNKNOWN_ERROR'});
    }
  }
}
