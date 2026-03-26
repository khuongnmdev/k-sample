import {Component, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {MenuItem} from '@models/menu-item';
import {DEFAULT_MENU_LIST} from '@mock-data/menu-list';
import {FormsModule} from '@angular/forms';
import {CommonService} from '@services/common.service';

@Component({
  selector: 'app-menu',
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './menu.html',
  styleUrl: './menu.scss',
  standalone: true
})
export class Menu {
  protected readonly commonService = inject(CommonService);
  protected readonly menuList = signal<MenuItem[]>(DEFAULT_MENU_LIST);
}
