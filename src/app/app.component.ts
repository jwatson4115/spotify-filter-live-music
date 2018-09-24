import { Component, OnInit } from '@angular/core';
import { NgRedux } from '@angular-redux/store';
import { IAppState } from './domain/store';
import { AuthService } from './services/auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'spotify-filter-live-music';
  isLoggedIn = false;

  constructor (private ngRedux: NgRedux<IAppState>, private authService: AuthService) {
    this.ngRedux.subscribe(() => {
      this.isLoggedIn = this.ngRedux.getState().isLoggedIn;
    });
  }

  ngOnInit () {
    this.authService.checkAccessToken();
  }
}
