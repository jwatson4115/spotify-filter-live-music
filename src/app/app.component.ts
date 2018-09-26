import { Component, OnInit, Inject } from '@angular/core';
import { NgRedux } from '@angular-redux/store';
import { IAppState } from './domain/store';
import { AuthService } from './services/auth/auth.service';
import { DOCUMENT } from '@angular/common';
import { FormGroup, FormBuilder } from '@angular/forms';
import { SpotifyService } from './services/spotify/spotify.service';
import { BuildState } from './domain/build-state';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'spotify-filter-live-music';
  isLoggedIn = false;
  form: FormGroup;

  constructor (
    private ngRedux: NgRedux<IAppState>,
    private authService: AuthService,
    @Inject(DOCUMENT) private document: any,
    formBuilder: FormBuilder,
    private spotifyService: SpotifyService) {

    this.ngRedux.subscribe(() => {
      this.isLoggedIn = this.ngRedux.getState().isLoggedIn;
    });

    this.form = formBuilder.group({
      artist: []
    });
  }

  ngOnInit () {
    this.authService.checkAccessToken();
  }

  authenticate() {
    const redirectUri = this.document.location.origin;
    const implicitGrantUrl = this.authService.getImplicitGrantUrl(redirectUri);
    this.document.location.href = implicitGrantUrl;
  }

  buildFilteredPlaylist() {
    const artistSearchTerm = this.form.get('artist').value;
    this.spotifyService.loadArtist(artistSearchTerm);

    this.ngRedux.subscribe(() => {
      const state = this.ngRedux.getState();

      switch (state.buildState) {
        case BuildState.FETCHING_ARTIST_SUCCESS:
          this.spotifyService.loadAlbums(state.artistId);
          break;
        case BuildState.FETCHING_ALBUMS_SUCCESS:
          this.spotifyService.loadSongs(state.albumIds);
          break;
        case BuildState.FETCHING_SONGS_SUCCESS:
          this.spotifyService.loadUser();
          break;
        case BuildState.FETCHING_USER_SUCCESS:
          this.spotifyService.createPlaylist(state.userId, state.songs);
          break;
      }
    });
  }
}
