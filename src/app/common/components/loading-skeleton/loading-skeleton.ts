import {Component} from '@angular/core';

@Component({
  selector: 'app-loading-skeleton',
  imports: [],
  templateUrl: './loading-skeleton.html',
  styleUrl: './loading-skeleton.scss',
  standalone: true
})
export class LoadingSkeleton {
  public lines = new Array(5);
}
