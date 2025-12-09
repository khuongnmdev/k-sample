import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Observable } from 'rxjs'; // Thêm Observable cho ngữ cảnh
import { of } from 'rxjs'; // Thêm 'of' để tạo một Observable phát sinh lỗi

// Giả lập một Observable phát sinh lỗi (ví dụ: lỗi HTTP)
const someObservable$: Observable<any> = throwError(() => new Error('Lỗi gốc từ nguồn dữ liệu'));

someObservable$.pipe(
  catchError(error => {
    console.log('1. Đã bắt lỗi trong catchError:', error);

    // Ghi log xong, NÉM LẠI lỗi mới (chuyển đổi lỗi)
    // throwError tạo một Observable mới chỉ phát ra lỗi, khiến luồng kết thúc.
    return throwError(() => new Error('Lỗi đã được log và ném lại'));
  })
).subscribe({
  next: (data) => console.log('2. [Next] Dữ liệu nhận được:', data), // Sẽ KHÔNG chạy vì luồng bị lỗi
  error: (err) => console.log('3. [Error] Lỗi cuối cùng:', err),   // Sẽ chạy vì lỗi mới đã được ném lại
  complete: () => console.log('4. [Complete] Luồng đã hoàn thành') // Sẽ KHÔNG chạy
});

/*
Output dự kiến:
1. Đã bắt lỗi trong catchError: Error: Lỗi gốc từ nguồn dữ liệu
3. [Error] Lỗi cuối cùng: Error: Lỗi đã được log và ném lại
*/
