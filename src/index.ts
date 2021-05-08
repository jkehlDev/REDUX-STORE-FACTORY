enum ResolveTypes {
  UPDATE = "RESOLVE_UPDATE",
  RESET = "RESOLVE_RESET",
}

type ResolveAction<T> = {
  type: T;
  resolve: (oldState?: any) => any;
};
type ResolveUpdate<T> = T extends Array<any> | string | number | Date
  ? (payload: T) => ResolveAction<ResolveTypes.UPDATE>
  : {
      [P in keyof T | "resolve"]: P extends Exclude<keyof T, "resolve">
        ? ResolveUpdate<T[P]>
        : (
            payload: { [Z in keyof T]?: T[Z] }
          ) => ResolveAction<ResolveTypes.UPDATE>;
    };
type ResolveReset<T> = T extends Array<any> | string | number | Date
  ? () => ResolveAction<ResolveTypes.RESET>
  : {
      [P in keyof T | "resolve"]: P extends Exclude<keyof T, "resolve">
        ? ResolveReset<T[P]>
        : () => ResolveAction<ResolveTypes.RESET>;
    };
const EXECUTE_TYPE = "EXECUTE";

export class ExecuteAction {
  public readonly type: string = EXECUTE_TYPE;
  constructor(public execute: (store: any, next: any, action: any) => void) {}
}

// -------------------------------------------------
function buildUpdate<T>(
  path: string[],
  data: T,
  resolve: (path: string[], oldState: any, payload?: any) => any
): ResolveUpdate<T> {
  let item: any = {};
  item.resolve = (payload?: { [Z in keyof T]?: T[Z] }) => ({
    type: ResolveTypes.UPDATE,
    resolve: (oldState: any) => {
      return resolve([...path], oldState, payload);
    },
  });
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const obj = data[key];
      if (typeof obj === "object" && !(obj instanceof Array)) {
        const pathTmp = [...path];
        pathTmp.push(key);
        item[key] = buildUpdate(pathTmp, data[key], resolve);
      } else {
        item[key] = (payload: any) => ({
          type: ResolveTypes.UPDATE,
          resolve: (oldState: any) => {
            return resolve([...path], oldState, { [key]: payload });
          },
        });
      }
    }
  }
  return item as ResolveUpdate<T>;
}

function buildReset<T>(
  path: string[],
  data: T,
  resolve: (path: string[], oldState: any) => any
): ResolveReset<T> {
  let item: any = {};
  item.resolve = () => ({
    type: ResolveTypes.RESET,
    resolve: (oldState: any) => {
      return resolve([...path], oldState);
    },
  });
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const obj = data[key];
      const pathTmp = [...path];
      pathTmp.push(key);
      if (typeof obj === "object" && !(obj instanceof Array)) {
        item[key] = buildReset(pathTmp, data[key], resolve);
      } else {
        item[key] = () => ({
          type: ResolveTypes.RESET,
          resolve: (oldState: any) => {
            return resolve(pathTmp, oldState);
          },
        });
      }
    }
  }
  return item as ResolveReset<T>;
}

function reset(path: string[], oldState: any, initialState: any): any {
  function resolveReset(
    pathArr: string[],
    index: number,
    parentObj: any,
    initialState: any
  ): any {
    if (pathArr.length > index + 1) {
      if (
        initialState[pathArr[index + 1]] instanceof Array ||
        typeof initialState[pathArr[index + 1]] !== "object"
      ) {
        return {
          ...parentObj,
          [pathArr[index + 1]]: [initialState[pathArr[index + 1]]][0],
        };
      } else {
        return {
          ...parentObj,
          [pathArr[index + 1]]: {
            ...resolveReset(
              pathArr,
              index + 1,
              parentObj[pathArr[index + 1]],
              initialState[pathArr[index + 1]]
            ),
          },
        };
      }
    }

    return {
      ...initialState,
    };
  }
  return resolveReset(path, -1, oldState, initialState);
}

function update(path: string[], oldState: any, payload: any): any {
  function resolveUpdate(
    pathArr: string[],
    index: number,
    parentObj: any,
    payload: any
  ): any {
    if (pathArr.length > index + 1) {
      return {
        ...parentObj,
        [pathArr[index + 1]]: {
          ...resolveUpdate(
            pathArr,
            index + 1,
            parentObj[pathArr[index + 1]],
            payload
          ),
        },
      };
    }
    return {
      ...parentObj,
      ...payload,
    };
  }
  return resolveUpdate(path, -1, oldState, payload);
}

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

  constructor(public initialState: T) {}
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
