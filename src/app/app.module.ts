import { BrowserModule } from '@angular/platform-browser';
import { NgModule, isDevMode } from '@angular/core';
import { AppComponent } from './app.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

// Redux
import { NgRedux, NgReduxModule, DevToolsExtension } from '@angular-redux/store';
import { rootReducer, INITIAL_STATE, IAppState } from './domain/store';

// Services
import { AuthService } from './services/auth/auth.service';
import { SpotifyService } from './services/spotify/spotify.service';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    NgReduxModule,
    ReactiveFormsModule,
    FormsModule,
    HttpModule,
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
