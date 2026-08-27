import {Component, inject, resource, signal} from '@angular/core';
import {rxResource} from '@angular/core/rxjs-interop';
import {httpResource} from '@angular/common/http';

@Component({selector: 'app-resource-cheatsheet', template: '...', standalone: true})
export class ResourceCheatsheet {
  private readonly productService = inject(ProductService);

  readonly userId = signal(1);

  // ===== 1. resource(): loader returns a PROMISE =====
  // A good fit for the fetch API or any async function
  readonly user = resource({
    params: () => this.userId(),
    loader: ({params: id, abortSignal}) =>
      fetch(`/api/users/${id}`, {signal: abortSignal}).then((r) => r.json()),
    defaultValue: null, // placeholder value while loading -> value() is never undefined
  });

  // ===== 2. rxResource(): stream returns an OBSERVABLE =====
  // (import from @angular/core/rxjs-interop) - a good fit when the service already returns an Observable
  readonly products = rxResource({
    params: () => this.userId(),
    stream: ({params: id}) => this.productService.getProductByUserId(String(id)),
    defaultValue: [] as Product[],
  });

  // ===== 3. httpResource(): HttpClient built in - just a reactive URL =====
  // (import from @angular/common/http) - auto-reloads whenever any signal the URL reads changes
  readonly profile = httpResource<UserProfile>(() => `/api/users/${this.userId()}/profile`);
  // - Still goes through interceptors, testable with HttpTestingController like regular HttpClient
  // - Extra dedicated signals: profile.headers(), profile.statusCode(), profile.progress()
}
