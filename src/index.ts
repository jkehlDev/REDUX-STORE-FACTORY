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
    }
  );

  public readonly reset: ResolveReset<T> = buildReset(
    [],
    this.initialState,
    (path, oldState) => {
      return reset(path, oldState, this.initialState);
    }
  );

  public execute: { [P: string]: ExecuteAction } = {};

  constructor(public readonly initialState: T) {}

  public reducer(oldState: T = this.initialState, action: any): T {
    if (
      action.type === ResolveTypes.RESET ||
      action.type === ResolveTypes.UPDATE
    ) {
      return (action as ResolveAction<any>).resolve({ ...oldState });
    }
    return { ...oldState };
  }
  
  public middleware(store: any) {
    return (next: any) => (action: any) => {
      if (action.type === EXECUTE_TYPE) {
        action.execute(store, next, action);
      } else {
        next(action);
      }
    };
  }
}
