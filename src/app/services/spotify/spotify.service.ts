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

  // nextUrl: the url given by spotify to retrieve further albums
  loadAlbums(artistId: string, albums: Album[] = [], nextUrl: string = null) {
    const options = this.getOptions();

    let url = `${API_URL}/artists/${artistId}/albums?include_groups=album&limit=50`;

    if (nextUrl) {
      url = nextUrl;
    } else {
      this.ngRedux.dispatch({type: 'ALBUMS_FETCH'});
    }

    this.http.get(url, options)
      .pipe(
        map(response => response.json())
      ).subscribe(response => {
        response.items.forEach(item => {
          
          albums.push({
            name: item.name,
            id: item.id,
          });
        });

        if (response.next) {
          this.loadAlbums(artistId, albums, response.next);
        }
        else {
          albums = this.filterLiveAlbums(albums);
          albums = this.removeDuplicateAlbums(albums);

          if (albums.length == 0) {
            this.handleEmptyResult();
          } else {
            this.ngRedux.dispatch({type: 'ALBUMS_FETCH_SUCCESS', albums: albums});
          }
          
        }

      }, error => {
        this.handleError(error);
      });
  }

  loadSongs(albums: Album[], songs: Song[] = []) {
    let albumsToProcess = albums.splice(0,20);

    const options = this.getOptions();
    const albumIdList = albumsToProcess.map(x => x.id).join();

    if (!songs) {
      this.ngRedux.dispatch({type: 'SONGS_FETCH'});
    }
    
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

        if (albums && albums.length > 0) {
          this.loadSongs(albums, songs);
        } else {
          if (songs.length == 0) {
            this.handleEmptyResult();
          } else {
            this.ngRedux.dispatch({type: 'SONGS_FETCH_SUCCESS', songs: songs});
          }
        }
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
    const playlistDescription = this.getPlaylistDescription(artistName);

    this.ngRedux.dispatch({type: 'PLAYLIST_CREATE'});

    this.http.post(`${API_URL}/users/${userId}/playlists`, {
      name: playlistName,
      description: playlistDescription,      
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
    this.ngRedux.dispatch({type: 'PREP_SONG_BATCH'});
    const songArray = this.getSongArray(songs);
    this.ngRedux.dispatch({type: 'PREP_SONG_BATCH_SUCCESS', songsToAdd: songArray});
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

  private filterLiveAlbums (albums: Album[]) {
    return albums.filter(x => x.name.toLowerCase().indexOf('live') === -1);
  }

  private removeDuplicateAlbums (albums: Album[]) {
    let albumNames: string[] = []
    
    albums.forEach(album  => {
      albumNames.push(album.name);
    });

    albumNames = albumNames.filter(function(elem, index, self) {
      return index === self.indexOf(elem);
    });

    albumNames.forEach(albumName => {
      albums = albums.filter(function(elem, index, self) {
        return (elem.name != albumName || index === self.map(x => x.name).indexOf(albumName));
      });
    });

    return albums;
  }

  private getPlaylistName (artistName) {
    if (!artistName || artistName == "") {
      return 'filtered playlist';
    } else {
      return artistName + ' - No Live or Demo Tracks';
    }
  }

  private getPlaylistDescription (artistName) {
    if (!artistName || artistName == "") {
      return 'filtered playlist';
    } else {
      return artistName + ' - full discography with live and demo music filtered out. Created at ' + document.location.origin;
    }
  }

  private getSongArray (songs) {
    const songArray: string[] = [];

    songs.forEach(song => {
      songArray.push('spotify:track:' + song.id);
    });

    return songArray;
  }

  private filterLiveSongs (songs: Song[]) {
    // Filter live in title
    songs = songs.filter(x => x.name.toLowerCase().indexOf('live') === -1);
    // Filter demo in title.
    songs = songs.filter(x => x.name.toLowerCase().indexOf('demo') === -1);
    // Filter remixes
    songs = songs.filter(x => x.name.toLowerCase().indexOf('remix') === -1);
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

  private handleEmptyResult () {
    this.ngRedux.dispatch({type: 'EMPTY_PLAYLIST_ERROR'});
  }
}
