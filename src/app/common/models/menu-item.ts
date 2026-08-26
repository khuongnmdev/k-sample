export type MenuLevel = 'basic' | 'advanced' | 'summary';
export type MenuGroup = 'basic' | 'signal' | 'rxjs' | 'summary';

export interface MenuItem {
  name: string;
  link: string;
  // level: item background color (basic/advanced/summary); omit for neutral items (Home)
  level?: MenuLevel;
  // group: topic block on the menu (Basic / Signal / RxJS / Summary)
  group?: MenuGroup;
}

export const MenuItemEnum = {
  Home: 'Home',
  DemoChangeDetection: 'Demo Change Detection',
  ExplainReactiveImperative: 'Imperative vs Reactive',
  CorePrimitives: 'Signal Core Primitives',
  SignalComponents: 'Signal-based Components',
  RxjsInterop: 'RxJS Interoperability',
  ResourceApi: 'Resource APIs',
  SignalAdvanced: 'Signal Advanced',
  DemoSwitchMap: 'SwitchMap',
  DemoCatchError: 'CatchError Operator',
  DemoPolling: 'Demo Polling',
  DemoPollingByList: 'Demo Polling By List',
  DemoBasicMulticast: 'Unicast vs Multicast',
  DemoAdvancedMulticast: 'Multicast Advanced',
  DemoBestPracticeService: 'Service Best Practices',
  Summary: 'Key Takeaways',
};
