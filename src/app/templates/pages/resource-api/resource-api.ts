import {
  ChangeDetectionStrategy,
  Component,
  inject,
  PLATFORM_ID,
  resource,
  signal,
} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';
import {httpResource} from '@angular/common/http';
import {CodePresenter} from '@components/code-presenter/code-presenter';
import {SWAPI_BASE_URL, SwapiPerson} from '@services/swapi.service';

interface DemoUser {
  name: string;
  code: string;
}

const FAKE_DB: Record<number, DemoUser> = {
  1: {name: 'Tèo', code: 'A'},
  2: {name: 'Tý', code: 'B'},
  3: {name: 'Na', code: 'C'},
};

const FAKE_DELAY = 800;

@Component({
  selector: 'app-resource-api',
  imports: [CodePresenter],
  templateUrl: './resource-api.html',
  styleUrl: './resource-api.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResourceApi {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  protected showExplainResource = signal<boolean>(false);
  protected showResourceNotes = signal<boolean>(false);

  // params: signal đầu vào - đổi giá trị là loader TỰ chạy lại
  protected readonly userId = signal(1);

  // resource: "async data dưới dạng signal" - value/status/error/isLoading gói sẵn
  protected readonly user = resource({
    params: () => this.userId(),
    loader: ({params: id, abortSignal}) => this.fetchUser(id, abortSignal),
  });

  // ===== httpResource với API THẬT (swapi.info) =====
  protected readonly personId = signal(1);

  // URL là hàm reactive: personId đổi -> request MỚI tự bắn, request cũ tự hủy.
  // Trả về undefined lúc SSR/prerender -> resource ở trạng thái idle, không gọi API lúc build.
  protected readonly person = httpResource<SwapiPerson>(() =>
    this.isBrowser ? `${SWAPI_BASE_URL}/people/${this.personId()}` : undefined,
  );

  protected selectPerson(id: number) {
    this.personId.set(id);
  }

  protected selectUser(id: number) {
    this.userId.set(id);
  }

  protected reload() {
    this.user.reload();
  }

  // Giả lập API ~800ms; id không tồn tại -> reject để demo trạng thái error
  private fetchUser(id: number, abortSignal: AbortSignal): Promise<DemoUser> {
    // SSR/prerender: trả ngay để server không phải chờ giả lập 800ms
    if (!this.isBrowser) {
      return Promise.resolve({name: '', code: ''});
    }

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        const found = FAKE_DB[id];
        if (found) {
          resolve(found);
        } else {
          reject(new Error(`Không tìm thấy user có id = ${id}`));
        }
      }, FAKE_DELAY);

      // Đổi params / reload() / destroy -> Angular abort request cũ
      abortSignal.addEventListener('abort', () => clearTimeout(timer));
    });
  }

  protected triggerExplainResource() {
    this.showExplainResource.set(true);
  }

  protected triggerResourceNotes() {
    this.showResourceNotes.set(true);
  }
}
