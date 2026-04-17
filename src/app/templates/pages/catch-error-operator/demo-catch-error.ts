import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CodePresenter } from '@components/code-presenter/code-presenter';

@Component({
  selector: 'app-demo-catch-error',
  imports: [CodePresenter],
  templateUrl: './demo-catch-error.html',
  styleUrl: './demo-catch-error.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemoCatchError {
  protected showExplainCatchError = signal<boolean>(false);

  protected triggerExplainCatchError() {
    this.showExplainCatchError.set(true);
  }
}
