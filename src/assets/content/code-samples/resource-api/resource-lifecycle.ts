import {Component, resource, signal} from '@angular/core';

@Component({selector: 'app-resource-lifecycle', template: '...', standalone: true})
export class ResourceLifecycle {
  readonly query = signal('');

  readonly results = resource({
    params: () => this.query(),
    loader: async ({params, abortSignal, previous}) => {
      // previous.status: biết được lần chạy trước đang ở trạng thái nào
      // abortSignal: NHỚ truyền vào fetch - đổi params / reload() / destroy
      // là request cũ bị hủy thật sự, không chỉ bị bỏ qua kết quả
      const res = await fetch(`/api/search?q=${params}`, {signal: abortSignal});
      return (await res.json()) as string[];
    },
    defaultValue: [] as string[],
  });

  demo() {
    // Vòng đời status():
    //   'idle'      - chưa có gì để load (params trả undefined)
    //   'loading'   - đang load cho params hiện tại
    //                 (đổi params lúc đang có value cũ vẫn là 'loading')
    //   'reloading' - load lại cho CÙNG params sau khi gọi reload();
    //                 value() vẫn giữ giá trị cũ trong suốt lúc reload
    //   'resolved'  - load xong, value() sẵn sàng
    //   'error'     - loader ném lỗi -> đọc value() sẽ THROW, dùng error()
    //   'local'     - giá trị bị ghi đè cục bộ bằng set()/update()

    // reload(): chạy lại loader với params hiện tại -> status 'reloading'.
    // Lưu ý: là NO-OP khi đang 'loading'/'idle' (trả về false, không hủy gì)
    this.results.reload();

    // Ghi đè cục bộ (optimistic update) -> status chuyển 'local';
    // giá trị này sẽ bị THAY THẾ khi loader chạy lại lần sau
    this.results.set(['giá trị tạm']);

    // hasValue(): type guard - cách đọc value an toàn thay vì try/catch
    if (this.results.hasValue()) {
      console.log(this.results.value());
    }
  }
}
