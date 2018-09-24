import { Injectable } from '@angular/core';
import { NgRedux } from '@angular-redux/store';
import { IAppState } from '../../domain/store';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private _ngRedux: NgRedux<IAppState>) { }

  public checkAccessToken () {
    this._ngRedux.dispatch({type: 'ACCESS_TOKEN_FETCH'});

    const params = this.getHashParams();
    const accessToken = params.access_token;
    let storedState = localStorage.getItem('access_token');

    if (accessToken) {
      localStorage.setItem('access_token', accessToken);
      storedState = accessToken;
    }

    if (storedState) {
      this._ngRedux.dispatch({type: 'ACCESS_TOKEN_FOUND', accessToken: storedState});
    } else {
      this._ngRedux.dispatch({type: 'ACCESS_TOKEN_NOT_FOUND'});
    }
  }

  public getImplicitGrantUrl (redirectUri: string) {
    const scope = 'user-read-private, playlist-modify-public';

    let url = 'https://accounts.spotify.com/authorize';
    const state = this.generateRandomString(16);

    url += '?response_type=token';
    url += '&client_id=' + encodeURIComponent(environment.clientId);
    url += '&scope=' + encodeURIComponent(scope);
    url += '&redirect_uri=' + encodeURIComponent(redirectUri);
    url += '&state=' + encodeURIComponent(state);

    return url;
  }

  // Generates a random string containing numbers and letters for a given length
  // This is used to protect against cross-site request forgery when authenticating with spotify
  // See: https://developer.spotify.com/documentation/general/guides/authorization-guide/
  private generateRandomString(length) {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
  }

  // Returns the hash parameters in the current url.
  private getHashParams(): any {
    const hashParams = {};
    let entries;
    const regex = /([^&;=]+)=?([^&;]*)/g;
    const query = window.location.hash.substring(1);

    while ( entries = regex.exec(query)) {
       hashParams[entries[1]] = decodeURIComponent(entries[2]);
    }

    return hashParams;
  }

}
