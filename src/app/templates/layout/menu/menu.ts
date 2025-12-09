import {Component, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {MenuItem} from '@models/menu-item';
import {DEFAULT_MENU_LIST} from '@mock-data/menu-list';

@Component({
  selector: 'app-menu',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './menu.html',
  styleUrl: './menu.scss',
})
export class Menu {
  menuList = signal<MenuItem[]>(DEFAULT_MENU_LIST);
}
