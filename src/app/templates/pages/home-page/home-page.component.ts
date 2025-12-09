import { Component } from '@angular/core';
import {CodePresenter} from '@components/code-presenter/code-presenter';

@Component({
  selector: 'app-home',
  imports: [
    CodePresenter
  ],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
})
export class HomePage {

}
