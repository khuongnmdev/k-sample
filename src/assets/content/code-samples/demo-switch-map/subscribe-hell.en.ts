import {Component, inject, OnInit} from '@angular/core';
import {UserService} from '@services/user.service';
import {ProductService} from '@services/product.service';

@Component({
  selector: 'app-example-subscribe-hell',
  template: `<p>Open console to see the log</p>`,
  standalone: true,
})
export class ExampleSubscribeHellComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly productService = inject(ProductService);

  ngOnInit() {
    // Level 1: Subscribe to listen for the login state
    this.userService.isLoggedIn$.subscribe((isLoggedIn) => {
      if (isLoggedIn) {
        // Level 2: Subscribe to get the Profile info (if logged in)
        this.userService.userProfile$.subscribe((profile) => {
          if (profile) {
            console.log('2. Got Profile, code:', profile.code);

            // Level 3: Subscribe using the Profile's code to call the API for the product list
            this.productService.getProductByUserId(profile.code).subscribe((products) => {
              console.log(`3. Successfully fetched ${products.length} products for the user.`);
            });
          }
        });
      } else {
        console.log('1. User is not logged in.');
      }
    });
  }
}
