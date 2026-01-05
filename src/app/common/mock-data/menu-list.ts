import {MenuItem, MenuItemEnum} from '@models/menu-item';

export const DEFAULT_MENU_LIST: MenuItem[] = [
  {
    name: MenuItemEnum.Home,
    link: '/home'
  },
  {
    name: MenuItemEnum.DemoChangeDetection,
    link: '/demo-change-detection'
  },
  {
    name: MenuItemEnum.DemoSwitchMap,
    link: '/demo-switch-map'
  },
  {
    name: MenuItemEnum.DemoMulticast,
    link: '/demo-multicast'
  },
  {
    name: MenuItemEnum.DemoPolling,
    link: '/demo-polling'
  },
  {
    name: MenuItemEnum.DemoPollingByList,
    link: '/demo-polling-by-list'
  }
];
