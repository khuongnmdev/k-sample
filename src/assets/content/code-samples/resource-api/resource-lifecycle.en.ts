import {Component, resource, signal} from '@angular/core';

@Component({selector: 'app-resource-lifecycle', template: '...', standalone: true})
export class ResourceLifecycle {
  readonly query = signal('');

  readonly results = resource({
    params: () => this.query(),
    loader: async ({params, abortSignal, previous}) => {
      // previous.status: tells you what state the previous run was in
      // abortSignal: REMEMBER to pass it to fetch - so a params change / reload() / destroy
      // truly cancels the old request instead of just ignoring its result
      const res = await fetch(`/api/search?q=${params}`, {signal: abortSignal});
      return (await res.json()) as string[];
    },
    defaultValue: [] as string[],
  });

  demo() {
    // status() lifecycle:
    //   'idle'      - nothing to load yet (params returned undefined)
    //   'loading'   - loading for the current params
    //                 (changing params while an old value exists is still 'loading')
    //   'reloading' - reloading for the SAME params after calling reload();
    //                 value() keeps the old value throughout the reload
    //   'resolved'  - load done, value() is ready
    //   'error'     - loader threw -> reading value() will THROW, use error()
    //   'local'     - value locally overridden via set()/update()

    // reload(): re-run the loader with the current params -> status 'reloading'.
    // Note: it is a NO-OP while 'loading'/'idle' (returns false, cancels nothing)
    this.results.reload();

    // Local override (optimistic update) -> status becomes 'local';
    // this value will be REPLACED the next time the loader runs
    this.results.set(['temporary value']);

    // hasValue(): type guard - the safe way to read value instead of try/catch
    if (this.results.hasValue()) {
      console.log(this.results.value());
    }
  }
}
