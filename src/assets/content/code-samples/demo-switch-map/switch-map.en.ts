import {Component, DestroyRef, inject, OnInit} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {UserService} from '@services/user.service';
import {ProductService} from '@services/product.service';
import {filter, switchMap, EMPTY} from 'rxjs';

@Component({
  selector: 'app-example-switch-map',
  template: `<p>Open console to see the log</p>`,
  standalone: true,
})
export class ExampleSwitchMapComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly productService = inject(ProductService);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit() {
    // Use ONLY ONE subscribe at the very end
    this.userService.isLoggedIn$
      .pipe(
        // 1. Switch level 1: if logged in, switch to the Profile stream,
        //    otherwise return EMPTY - cut the stream, nothing flows downstream
        switchMap((isLoggedIn) => (isLoggedIn ? this.userService.userProfile$ : EMPTY)),
        // 2. Gate: only let through when profile data actually exists
        filter((profile) => !!profile),
        // 3. Switch level 2: use the Profile's code to call the API for the Product list
        switchMap((profile) => {
          console.log('2. Got Profile, code:', profile.code);
          return this.productService.getProductByUserId(profile.code);
        }),
        // 4. Auto-cancel the subscription on component destroy - prevents Memory Leak
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((products) => {
        // The final result comes from getProductByUserId
        console.log(`3. Successfully fetched ${products.length} products for the user.`);
      });
  }
}
