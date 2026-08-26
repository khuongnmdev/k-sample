import {Component, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {MenuGroup, MenuItem, MenuLevel} from '@models/menu-item';
import {DEFAULT_MENU_LIST} from '@mock-data/menu-list';
import {FormsModule} from '@angular/forms';
import {CommonService} from '@services/common.service';

const GROUP_TITLES: Record<MenuGroup, string> = {
  basic: 'Basic',
  signal: 'Signal',
  rxjs: 'RxJS',
  summary: 'Summary',
};

const LEVEL_TOOLTIPS: Record<MenuLevel, string> = {
  basic: 'Basic - dành cho junior, đọc theo thứ tự từ trên xuống',
  advanced: 'Advanced - đọc khi đã vững trang basic liên quan ngay phía trên',
  summary: 'Tổng kết toàn bộ nội dung - ôn nhanh trước khi present',
};

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

  // Insert a topic block label (Basic / Signal / RxJS / Summary) at the FIRST item of each group
  protected showBlockLabel(index: number): boolean {
    const list = this.menuList();
    const group = list[index].group;
    return !!group && group !== list[index - 1]?.group;
  }

  protected groupTitle(group: MenuGroup | undefined): string {
    return group ? GROUP_TITLES[group] : '';
  }

  protected levelTooltip(level: MenuLevel | undefined): string {
    return level ? LEVEL_TOOLTIPS[level] : '';
  }
}
