import { Injectable } from '@angular/core';
import { Http, RequestOptions, Headers } from '@angular/http';
import { NgRedux } from '@angular-redux/store';
import { IAppState } from '../../domain/store';
import { map } from 'rxjs/operators';
import { Song } from '../../domain/song';
import { Artist } from '../../domain/artist';
import { Image } from '../../domain/image';

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
      });
  }

  loadAlbums(artistId: string) {
    const options = this.getOptions();

    this.ngRedux.dispatch({type: 'ALBUMS_FETCH'});

    this.http.get(`${API_URL}/artists/${artistId}/albums?include_groups=album`, options)
      .pipe(
        map(response => response.json())
      ).subscribe(response => {
        const albumIds: string[] = [];
        response.items.forEach(item => {
          albumIds.push(item.id);
        });
        this.ngRedux.dispatch({type: 'ALBUMS_FETCH_SUCCESS', albumIds: albumIds});
      }, error => {
      });
  }

  loadSongs(albumIds: string[]) {
    const options = this.getOptions();
    const albumIdList = albumIds.join();
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
      });
  }

  createPlaylist(userId: string, songs: Song[]) {
    const options = this.getOptions();

    this.ngRedux.dispatch({type: 'PLAYLIST_CREATE'});

    this.http.post(`${API_URL}/users/${userId}/playlists`, {
      name: 'test-playlist-6000'
    }, options)
      .pipe(
        map(res => res.json())
      ).subscribe(response => {
        const playlistId = response.id;
        const songArray = this.getSongArray(songs);

        this.http.post(`${API_URL}/playlists/${playlistId}/tracks`, {
          uris: songArray
        }, options).pipe(
          map(res => res.json())
        ).subscribe(() => {
          this.ngRedux.dispatch({type: 'PLAYLIST_CREATE_SUCCESS', playlistId: playlistId});
        });
      });
  }

  private getSongArray (songs) {
    if (songs.length > 100) {
      songs = songs.slice(0, 100);
    }

    const songArray: string[] = [];

    songs.forEach(song => {
      songArray.push('spotify:track:' + song.id);
    });

    return songArray;
  }

  private filterLiveSongs (songs: Song[]) {
    return songs.filter(x => x.name.toLowerCase().indexOf('live') === -1);
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
}
