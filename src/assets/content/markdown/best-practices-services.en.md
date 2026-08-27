# Angular Service Best Practices

Clearly separating responsibilities between the **Component** (presentation layer) and the **Service** (logic layer) is the key to keeping a project maintainable and scalable.

---

### ✅ 1. What SHOULD a Service contain?

| Category                | Details                                                                                         |
| :---------------------- | :--------------------------------------------------------------------------------------------- |
| **Business logic**      | Calculations, data filtering, or complex data transformations.                                  |
| **API calls (HTTP)**    | All interactions with the backend through `HttpClient`.                                         |
| **State management**    | Use `Signal`, `BehaviorSubject` to store shared data (user profile, shopping cart...).          |
| **Component communication** | Acts as an intermediary passing messages between components with no direct relationship.    |
| **Utility functions**   | Date formatting, project-specific string handling.                                              |
| **Mapper**              | Transforms data from the API (DTO) into the Model used by the UI.                               |
| **Browser API wrapper** | Wraps APIs like `localStorage`, `window` for easy mocking in tests or running on SSR.           |

---

### ❌ 2. What should a Service NOT contain?

| Category                | Reason                                                                                                        |
| :---------------------- | :------------------------------------------------------------------------------------------------------------ |
| **DOM manipulation**    | Never use `document.getElementById` or modify CSS. That is the job of a Component/Directive.                  |
| **Display logic (UI)**  | Example: dropdown open/close state, button colors...                                                          |
| **Local data**          | If data is used by exactly one Component, don't push it into a Service.                                       |
| **Component lifecycle** | Avoid putting logic tightly coupled to a Component's `OnInit`/`OnDestroy` into a Service (easily causes Memory Leaks). |

---

### 💡 Real-world example: Controlling a Global Dialog

One of the most common situations is when an action in Component A (e.g. a "Login" button on the Home page) needs to open a Dialog that lives in Component B (e.g. `AppRoot` or `MenuLayout`).

**Solution:** Put the state (open/closed) into a Service.

```typescript
// global-dialog.service.ts
@Injectable({ providedIn: 'root' })
export class GlobalDialogService {
  // Manage internal state with a Signal
  private _isOpen = signal<boolean>(false);

  // Readonly signal for other components to observe
  readonly isOpen = this._isOpen.asReadonly();

  open() {
    this._isOpen.set(true);
  }
  close() {
    this._isOpen.set(false);
  }
  toggle() {
    this._isOpen.update((v) => !v);
  }
}
```

**Usage:**

1. **In the trigger Component (the button):** Inject the Service and call `dialogService.open()`.
2. **In the display Component (the layout):** Inject the Service and use `service.isOpen()` in the template to show/hide the Dialog.

---

### 💡 About Mapper functions (data mapping)

A **Mapper** separates the backend's data shape (**DTO**) from the **Model** the UI uses.
The backend renamed a field or changed the date format? You only have to fix ONE place: the mapper.

A complete mapper has 2 directions:

- **`fromDTO`**: DTO → Model. Called right when data ENTERS the app (in the Service's `pipe(map(...))`).
- **`toDTO`**: Model → DTO. Called right before data LEAVES the app (body of POST/PUT).

```typescript
// user.mapper.ts

// DTO: the BACKEND's data shape (snake_case, dates as strings...)
export interface UserDTO {
  user_id: number;
  full_name: string;
  birth_date: string; // '1995-08-26'
  vip_level: number;
}

// Model: the shape the UI wants (camelCase, correct types, derived fields)
export interface User {
  id: number;
  fullName: string;
  birthDate: Date;
  vipLevel: number;
  isVip: boolean; // derived field for the UI - the backend does NOT have this field
}

// DTO -> Model: rename fields, parse types, precompute derived fields
export function fromDTO(dto: UserDTO): User {
  return {
    id: dto.user_id,
    fullName: dto.full_name,
    birthDate: new Date(dto.birth_date),
    vipLevel: dto.vip_level,
    isVip: dto.vip_level >= 3,
  };
}

// Model -> DTO: return exactly the format the backend expects,
// derived fields (isVip) are DROPPED - never sent back to the server
export function toDTO(user: User): UserDTO {
  return {
    user_id: user.id,
    full_name: user.fullName,
    birth_date: user.birthDate.toISOString().slice(0, 10),
    vip_level: user.vipLevel,
  };
}
```

Used inside the Service - the component never sees the DTO:

```typescript
// user.service.ts
getUser(id: number): Observable<User> {
  return this.http.get<UserDTO>(`/api/users/${id}`).pipe(map(fromDTO));
}

updateUser(user: User): Observable<void> {
  return this.http.put<void>(`/api/users/${user.id}`, toDTO(user));
}
```

Accompanying rules:

- A mapper is a **pure function**: input in - output out, no side effects. Unit testing is trivial.
- Map right at the app's **boundary** (in the Service). DTOs must not leak deep into components/templates.
- Derived fields: keep the original field (`vipLevel`) so round-tripping works; the derived field (`isVip`) is added for the UI only.
- Small project: the mapper can be a function inside the Service. Large project: split it into its own `*.mapper.ts` file.

---

### 💡 Who should be the one to `subscribe`?

This is one of the most important architecture questions: **In most cases, the Service should only return an Observable (or Signal), and the Component is the one who `subscribe`s.**

- **Service:** Designs the "water pipes" (Observable) and the filters (Operators). The Service doesn't know when the UI needs data, so it only provides "the ability to fetch data".
- **Component:** Is the one who "opens the tap" (Subscribe). The Component manages its own lifecycle, so it knows when to stop consuming data to avoid a Memory Leak.
- **Tip from the Multicast lesson:** If a stream in a Service is subscribed to by many components (config, categories, user profile...), attach `share()` / `shareReplay(1)` right inside the Service — every component "opens the tap" as usual, but the server receives exactly **1** request.

---

### 💡 The "Golden" Rule

> **"The Component decides WHAT is displayed, while the Service decides HOW data is fetched and processed."**

If you find your Component packed with array-processing code, nested API calls, or computation logic, don't hesitate to move them into a Service!
