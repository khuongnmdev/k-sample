import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CodePresenter } from '@components/code-presenter/code-presenter';

@Component({
  selector: 'app-demo-switch-map',
  imports: [CodePresenter],
  templateUrl: './demo-switch-map.html',
  styleUrl: './demo-switch-map.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemoSwitchMap {
  protected showExplainSubscribeHell = signal<boolean>(false);

  protected triggerExplainSubscribeHell() {
    this.showExplainSubscribeHell.set(true);
  }
}
