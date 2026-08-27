import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UserService } from '@services/user.service';
import { ProductService } from '@services/product.service';
import { filter, switchMap, EMPTY, catchError, of } from 'rxjs';

@Component({
  selector: 'app-example-catch-error',
  template: `<p>Open console to see the log</p>`,
  standalone: true,
})
export class ExampleCatchErrorComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly productService = inject(ProductService);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit() {
    console.log('Starting the error-handling flow with CatchError...');

    this.userService.isLoggedIn$
      .pipe(
        switchMap((isLoggedIn) => {
          if (!isLoggedIn) {
            console.log('1. User is not logged in.');
            return EMPTY;
          }

          // --- APPROACH ONE: Catch errors on each inner Observable ---
          // Piping catchError right inside switchMap isolates the error.
          // If the Profile API fails, the main stream still stays alive.
          return this.userService.userProfile$.pipe(
            catchError((err) => {
              console.error('❌ Error while fetching Profile:', err);
              // Return a fallback value (null) so the filter below safely blocks it
              return of(null);
            }),
          );
        }),
        filter((profile) => !!profile),
        switchMap((profile) => {
          console.log('2. Got Profile, calling the products API...');

          // Keep catching errors separately for the products API
          return this.productService.getProductByUserId(profile!.code).pipe(
            catchError((err) => {
              console.error('❌ Error while fetching Products:', err);
              // On error, return an empty array so the UI can still render (no-data state)
              return of([]);
            }),
          );
        }),
        catchError((globalErr) => {
          console.error('🚨 Global error (affects the whole stream):', globalErr);
          return of([]);
        }),
        // Auto-cancel the subscription on component destroy - prevents Memory Leak
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (products) => {
          console.log(`3. Final result:`, products);
        },
        error: (err) => {
          // This block will NEVER run if the catchError operators above return "of(...)"
          console.log('This error fell all the way down to Subscribe:', err);
        },
      });
  }
}
