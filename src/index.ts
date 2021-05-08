import ExecuteAction, { EXECUTE_TYPE } from "./executeAction";
import { ResolveAction, ResolveTypes } from "./resolveAction";
import { buildReset, reset, ResolveReset } from "./resolveReset";
import { buildUpdate, ResolveUpdate, update } from "./resolveUpdate";

export default class reduxStoreFactory<T> {
  public readonly update: ResolveUpdate<T> = buildUpdate(
    [],
    this.initialState,
    (path, oldState, payload) => {
      return update(path, oldState, payload);
    },
    this.storeName.toUpperCase()
  );

  public readonly reset: ResolveReset<T> = buildReset(
    [],
    this.initialState,
    (path, oldState) => {
      return reset(path, oldState, this.initialState);
    },
    this.storeName.toUpperCase()
  );

  public execute: { [P: string]: ExecuteAction } = {};
  public reducer: (oldState: T, action: any) => T;
  public static middleware: (
    store: any
  ) => (next: any) => (action: any) => void = (store: any) => (next: any) => (
    action: any
  ) => {
    if (action.type === EXECUTE_TYPE) {
      action.execute(store, next, action);
    } else {
      next(action);
    }
  };

  constructor(
    public readonly initialState: T,
    public readonly storeName: string
  ) {
    this.reducer = (oldState: T = this.initialState, action: any): T => {
      if (
        action.type ===
          `${ResolveTypes.UPDATE}_${this.storeName.toUpperCase()}` ||
        action.type === `${ResolveTypes.RESET}_${this.storeName.toUpperCase()}`
      ) {
        return (action as ResolveAction<any>).resolve({ ...oldState });
      }
      return { ...oldState };
    };
  }
}
export { default as ExecuteAction, EXECUTE_TYPE } from "./executeAction";
