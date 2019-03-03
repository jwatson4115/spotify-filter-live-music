import { Component, OnInit, Input } from '@angular/core';
import { Artist } from '../domain/artist';
import { NgRedux } from '@angular-redux/store';
import { IAppState } from '../domain/store';

@Component({
  selector: 'app-search-result',
  templateUrl: './search-result.component.html',
  styleUrls: ['./search-result.component.css']
})
export class SearchResultComponent implements OnInit {

  @Input() artist: Artist;

  constructor(private ngRedux: NgRedux<IAppState>) { }

  ngOnInit() {
  }

  getThumbnailUrl (artist: Artist) {
    if (!artist.images.length) {
      // random placeholder if no thumbnail found
      return 'https://cdn1.iconfinder.com/data/icons/modifiers-add-on-1-1/48/Sed-24-512.png';
    } else {
      // The smallest spotify image is always the last in the array
      return artist.images[artist.images.length - 1].url;
    }
  }

  buildFilteredPlaylist(artistId) {
    this.ngRedux.dispatch({type: 'ARTIST_FETCH_SUCCESS', artistId: artistId});
  }
}
