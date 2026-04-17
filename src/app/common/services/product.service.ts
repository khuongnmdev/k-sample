import { Injectable } from '@angular/core';
import { DEFAULT_PRODUCT_LIST, DEFAULT_PRODUCT_LIST_2 } from '@mock-data/product-list';
import { Product } from '@models/product';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  constructor() {}

  getProductByUserId(code: string): Observable<Product[]> {
    if (code === 'A') {
      return of(DEFAULT_PRODUCT_LIST);
    } else if (code === 'B') {
      return of(DEFAULT_PRODUCT_LIST_2);
    } else {
      return of([]);
    }
  }
}
