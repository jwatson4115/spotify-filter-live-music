import { Component, OnInit, Inject } from '@angular/core';
import { NgRedux } from '@angular-redux/store';
import { IAppState } from './domain/store';
import { AuthService } from './services/auth/auth.service';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'spotify-filter-live-music';
  isLoggedIn = false;

  constructor (
    private ngRedux: NgRedux<IAppState>,
    private authService: AuthService,
    @Inject(DOCUMENT) private document: any) {

    this.ngRedux.subscribe(() => {
      this.isLoggedIn = this.ngRedux.getState().isLoggedIn;
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
}
