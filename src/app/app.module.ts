import { BrowserModule } from '@angular/platform-browser';
import { NgModule, isDevMode } from '@angular/core';
import { AppComponent } from './app.component';

// Redux
import { NgRedux, NgReduxModule, DevToolsExtension } from '@angular-redux/store';
import { rootReducer, INITIAL_STATE, IAppState } from './domain/store';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    NgReduxModule,
  ],
  providers: [],
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
