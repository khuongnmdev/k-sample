import {MenuItem, MenuItemEnum} from '@models/menu-item';

export const DEFAULT_MENU_LIST: MenuItem[] = [
  {
    name: MenuItemEnum.Home,
    link: '/home',
  },
  {
    name: MenuItemEnum.DemoChangeDetection,
    link: '/demo-change-detection',
  },
  {
    name: MenuItemEnum.ExplainReactiveImperative,
    link: '/explain-reactive-vs-imperative',
  },
  {
    name: MenuItemEnum.DemoSwitchMap,
    link: '/demo-switch-map',
  },
  {
    name: MenuItemEnum.DemoCatchError,
    link: '/demo-catch-error',
  },
  {
    name: MenuItemEnum.DemoPolling,
    link: '/demo-polling',
  },
  {
    name: MenuItemEnum.DemoPollingByList,
    link: '/demo-polling-by-list',
  },
  {
    name: MenuItemEnum.DemoBasicMulticast,
    link: '/demo-multicast',
  },
  {
    name: MenuItemEnum.CorePrimitives,
    link: '/core-primitives',
  },
  {
    name: MenuItemEnum.SignalComponents,
    link: '/signal-components',
  },
  {
    name: MenuItemEnum.DemoBestPracticeService,
    link: '/best-practice-service',
  },
  {
    name: MenuItemEnum.Summary,
    link: '/summary',
  },
];
