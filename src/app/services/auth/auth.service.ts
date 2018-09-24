import { Injectable } from '@angular/core';
import { NgRedux } from '@angular-redux/store';
import { IAppState } from '../../domain/store';
import { access } from 'fs';

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
