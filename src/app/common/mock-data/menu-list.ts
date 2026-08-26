import {MenuItem, MenuItemEnum} from '@models/menu-item';

// Order = learning path grouped by TOPIC:
// advanced pages sit right below their related basic pages (item colors indicate the level)
export const DEFAULT_MENU_LIST: MenuItem[] = [
  {
    name: MenuItemEnum.Home,
    link: '/home',
  },

  // --- Foundation ---
  {
    name: MenuItemEnum.DemoChangeDetection,
    group: 'basic',
    link: '/demo-change-detection',
    level: 'basic',
  },
  {
    name: MenuItemEnum.ExplainReactiveImperative,
    group: 'basic',
    link: '/explain-reactive-vs-imperative',
    level: 'basic',
  },

  // --- Signals ---
  {
    name: MenuItemEnum.CorePrimitives,
    group: 'signal',
    link: '/core-primitives',
    level: 'basic',
  },
  {
    name: MenuItemEnum.SignalComponents,
    group: 'signal',
    link: '/signal-components',
    level: 'basic',
  },
  {
    name: MenuItemEnum.RxjsInterop,
    group: 'signal',
    link: '/rxjs-interop',
    level: 'advanced',
  },
  {
    name: MenuItemEnum.ResourceApi,
    group: 'signal',
    link: '/resource-api',
    level: 'advanced',
  },
  {
    name: MenuItemEnum.SignalAdvanced,
    group: 'signal',
    link: '/signal-advanced',
    level: 'advanced',
  },

  // --- RxJS ---
  {
    name: MenuItemEnum.DemoSwitchMap,
    group: 'rxjs',
    link: '/demo-switch-map',
    level: 'basic',
  },
  {
    name: MenuItemEnum.DemoCatchError,
    group: 'rxjs',
    link: '/demo-catch-error',
    level: 'basic',
  },
  {
    name: MenuItemEnum.DemoPolling,
    group: 'rxjs',
    link: '/demo-polling',
    level: 'basic',
  },
  {
    name: MenuItemEnum.DemoPollingByList,
    group: 'rxjs',
    link: '/demo-polling-by-list',
    level: 'advanced',
  },
  {
    name: MenuItemEnum.DemoBasicMulticast,
    group: 'rxjs',
    link: '/demo-multicast',
    level: 'basic',
  },
  {
    name: MenuItemEnum.DemoAdvancedMulticast,
    group: 'rxjs',
    link: '/demo-multicast-advanced',
    level: 'advanced',
  },

  // --- Wrap-up ---
  {
    name: MenuItemEnum.DemoBestPracticeService,
    group: 'summary',
    link: '/best-practice-service',
    level: 'summary',
  },
  {
    name: MenuItemEnum.Summary,
    group: 'summary',
    link: '/summary',
    level: 'summary',
  },
];
