import { Component, OnInit, Inject } from '@angular/core';
import { NgRedux } from '@angular-redux/store';
import { IAppState } from './domain/store';
import { AuthService } from './services/auth/auth.service';
import { DOCUMENT } from '@angular/common';
import { FormGroup, FormBuilder } from '@angular/forms';
import { SpotifyService } from './services/spotify/spotify.service';
import { BuildState } from './domain/build-state';
import { DomSanitizer } from '@angular/platform-browser';
import { debounceTime } from 'rxjs/operators';
import { Artist } from './domain/artist';
import { faSpinner, faMusic, faSearch } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'spotify-filter-live-music';
  isLoggedIn = false;
  isSearching = false;
  noResults = false;
  hasSearched = false;
  unknownError = false;

  buildState = BuildState.NOT_BUILDING;
  buildStateComplete = BuildState.COMPLETE;
  buildStateNotBuilding = BuildState.NOT_BUILDING;

  form: FormGroup;
  playlistUrl = '';
  searchResults: Artist[] = [];
  faSpinner = faSpinner;
  faMusic = faMusic;
  faSearch = faSearch;

  constructor (
    private ngRedux: NgRedux<IAppState>,
    private authService: AuthService,
    @Inject(DOCUMENT) private document: any,
    formBuilder: FormBuilder,
    private spotifyService: SpotifyService,
    public sanitizer: DomSanitizer) {

    this.ngRedux.subscribe(() => {
      this.isLoggedIn = this.ngRedux.getState().isLoggedIn;
      this.buildState = this.ngRedux.getState().buildState;
      this.searchResults = this.ngRedux.getState().searchResults;
      this.isSearching = this.ngRedux.getState().isSearching;
      this.hasSearched = this.ngRedux.getState().hasSearched;
      this.noResults = (!this.ngRedux.getState().searchResults || this.ngRedux.getState().searchResults.length == 0 ? true : false);
      this.unknownError = this.ngRedux.getState().unknownError;
    });

    this.form = formBuilder.group({
      artist: []
    });

    const search = this.form.controls['artist'];

    search.valueChanges
      .pipe(debounceTime(500))
      .subscribe( result => {
        if (result != "") {
          this.spotifyService.searchArtist(result);
        }
      }
      );

    this.buildFilteredPlaylist();
  }

  ngOnInit () {
    this.authService.checkAccessToken();
  }

  authenticate() {
    const redirectUri = this.document.location.origin;
    const implicitGrantUrl = this.authService.getImplicitGrantUrl(redirectUri);
    this.document.location.href = implicitGrantUrl;
  }

  // Capture enter key pressed on search.
  searchKeyPressed(keyCode) {
    const enterKeyCode = 13;

    if (keyCode == enterKeyCode) {
      this.handleSearch();
    }
  }

  handleSearch () {
    if (!this.isSearching && this.buildState == BuildState.NOT_BUILDING) {
      const searchTerm = this.form.controls['artist'].value;
      if (searchTerm && searchTerm != '') {
        this.spotifyService.searchArtist(searchTerm);
      }
    }
  }

  buildFilteredPlaylist() {
    this.ngRedux.subscribe(() => {
      const state = this.ngRedux.getState();

      switch (state.buildState) {
        case BuildState.FETCHING_ARTIST_SUCCESS:
          this.form.controls['artist'].reset();
          this.spotifyService.loadAlbums(state.artistId);
          break;
        case BuildState.FETCHING_ALBUMS_SUCCESS:
          this.spotifyService.loadSongs(state.albums);
          break;
        case BuildState.FETCHING_SONGS_SUCCESS:
          this.spotifyService.loadUser();
          break;
        case BuildState.FETCHING_USER_SUCCESS:
          this.spotifyService.createPlaylist(state.userId, state.songs, state.artistName);
          break;
        case BuildState.CREATING_PLAYLIST_SUCCESS:
          this.playlistUrl = `https://open.spotify.com/embed/playlist/${state.playlistId}`;
          this.ngRedux.dispatch({type: 'BUILD_COMPLETE'});
          break;
      }
    });
  }
}
