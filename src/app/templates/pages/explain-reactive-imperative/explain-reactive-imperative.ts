import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
import {CodePresenter} from '@components/code-presenter/code-presenter';

@Component({
  selector: 'app-explain-reactive-imperative',
  imports: [CodePresenter],
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
