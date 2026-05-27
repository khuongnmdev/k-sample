import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CodePresenter } from '@components/code-presenter/code-presenter';
import { CodePresenterObservable } from '@components/code-presenter-observable/code-presenter-observable';
import { CodePresenterOld } from '@components/code-presenter-old/code-presenter-old';

@Component({
  selector: 'app-explain-reactive-imperative',
  imports: [CodePresenter, CodePresenterObservable, CodePresenterOld],
  templateUrl: './explain-reactive-imperative.html',
  styleUrl: './explain-reactive-imperative.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExplainReactiveImperative {
  protected readonly showExplanation = signal(false);

  protected triggerExplanation() {
    this.showExplanation.update((v) => !v);
  }
}
