import { BrowserModule } from '@angular/platform-browser';
import { NgModule, isDevMode } from '@angular/core';
import { AppComponent } from './app.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { CookieModule } from 'ngx-cookie';

// Redux
import { NgRedux, NgReduxModule, DevToolsExtension } from '@angular-redux/store';
import { rootReducer, INITIAL_STATE, IAppState } from './domain/store';

// Font Awesome
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

// Services
import { AuthService } from './services/auth/auth.service';
import { SpotifyService } from './services/spotify/spotify.service';
import { SearchResultComponent } from './search-result/search-result.component';

@NgModule({
  declarations: [
    AppComponent,
    SearchResultComponent
  ],
  imports: [
    BrowserModule,
    NgReduxModule,
    ReactiveFormsModule,
    FormsModule,
    HttpModule,
    CookieModule.forRoot(),
    FontAwesomeModule,
  ],
  providers: [AuthService, SpotifyService],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor (ngRedux: NgRedux<IAppState>, devTools: DevToolsExtension) {

    // Allows debugging using Redux DevTools. Disable this if not using the extension.
    const enhancers = isDevMode() ? [devTools.enhancer()] : [];

    // Initialize Redux
    ngRedux.configureStore(rootReducer, INITIAL_STATE, [], enhancers);
  }
}
