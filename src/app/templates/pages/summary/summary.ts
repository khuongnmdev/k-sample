import {ChangeDetectionStrategy, Component} from '@angular/core';
import {CodePresenter} from '@components/code-presenter/code-presenter';

@Component({
  selector: 'app-summary',
  imports: [CodePresenter],
  templateUrl: './summary.html',
  styleUrl: './summary.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Summary {}
