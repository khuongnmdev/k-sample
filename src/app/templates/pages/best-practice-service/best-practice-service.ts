import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CodePresenter } from '@components/code-presenter/code-presenter';

@Component({
  selector: 'app-best-practice-service',
  imports: [CodePresenter],
  templateUrl: './best-practice-service.html',
  styleUrl: './best-practice-service.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BestPracticeService {}
