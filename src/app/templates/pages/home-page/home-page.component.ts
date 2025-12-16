import {Component, signal} from '@angular/core';
import {CodePresenter} from '@components/code-presenter/code-presenter';
import {CodePresenterObservable} from '@components/code-presenter-observable/code-presenter-observable';
import {CodePresenterOld} from '@components/code-presenter-old/code-presenter-old';

@Component({
  selector: 'app-home',
  imports: [
    CodePresenterOld,
    CodePresenterObservable,
    CodePresenter
  ],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
})
export class HomePage {
  currentFile = signal('demo.ts');
  randomValue = signal(0);
  explain = signal(false);

  triggerRandomChange() {
    this.randomValue.set(Math.random());
  }
  triggerExplain() {
    this.explain.set(true);
  }
}
