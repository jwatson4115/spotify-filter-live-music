# Filter live and demo music on Spotify

Web application which is designed to filter live and demo tracks on Spotify for a given artist's full discography, and then generate a playlist for the user.

**Current live site**: https://spotify-filter.firebaseapp.com

## Branches 
* master: Current live site.
* dev/enhancements: Miscellaneous small enhancements.

## Build Steps

This project is built using Angular. Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Additional Steps
### Redux
The project also uses Redux and assumes the user is using Redux dev tools for development. 
Link for download: https://github.com/zalmoxisus/redux-devtools-extension 

If you are not using redux dev tools change the following line in app.module.ts:

```javascript
    // original
    const enhancers = isDevMode() ? [devTools.enhancer()] : [];
    // New 
    const enhancers = [];
```

### Spotify Client ID
In environment.ts and environment.prod.ts You may need to change the clientId to match a different spotify client ID.

## Build / Deployment

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.
