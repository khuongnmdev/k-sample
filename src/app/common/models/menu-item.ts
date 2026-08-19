export interface MenuItem {
  name: string;
  link: string;
}

export const MenuItemEnum = {
  Home: 'Home',
  DemoChangeDetection: 'Demo Change Detection',
  ExplainReactiveImperative: 'Imperative vs Reactive',
  DemoSwitchMap: 'Subscribe Hell → switchMap',
  DemoCatchError: 'CatchError Operator',
  DemoPolling: 'Demo Polling',
  DemoPollingByList: 'Demo Polling By List',
  DemoBasicMulticast: 'Unicast vs Multicast',
  CorePrimitives: 'Signal Core Primitives',
  SignalComponents: 'Signal-based Components',
  RxjsInterop: 'RxJS Interoperability',
  DemoBestPracticeService: 'Service Best Practices',
  Summary: 'Key Takeaways',
};
