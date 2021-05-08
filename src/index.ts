type Action = { type: string; resolve: (oldState?: any) => any };
type ResolveUpdate<T> = T extends Array<any> | string | number
  ? (payload: T) => Action
  : {
      [P in keyof T | "resolve"]: P extends Exclude<keyof T, "resolve">
        ? ResolveUpdate<T[P]>
        : (payload: { [Z in keyof T]?: T[Z] }) => Action;
    };
type ResolveReset<T> = T extends Array<any> | string | number
  ? () => Action
  : {
      [P in keyof T | "resolve"]: P extends Exclude<keyof T, "resolve">
        ? ResolveReset<T[P]>
        : () => Action;
    };
function buildUpdate<T>(
  path: string[],
  data: T,
  resolve: (path: string[], oldState: any, payload?: any) => any
): ResolveUpdate<T> {
  let item: any = {};
  item.resolve = (payload?: { [Z in keyof T]?: T[Z] }) => ({
    type: "",
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
          type: "",
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
    type: "",
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
          type: "",
          resolve: (oldState: any) => {
            return resolve(pathTmp, oldState);
          },
        });
      }
    }
  }
  return item as ResolveReset<T>;
}

function cleanAct(path: string[], oldState: any, initialState: any): any {
  function resolve(
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
          [pathArr[index+1]]: [initialState[pathArr[index + 1]]][0],
        };
      } else {
        return {
          ...parentObj,
          [pathArr[index + 1]]: {
            ...resolve(
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
  return resolve(path, -1, oldState, initialState);
}

function updateAct(path: string[], oldState: any, payload: any): any {
  function resolve(
    pathArr: string[],
    index: number,
    parentObj: any,
    payload: any
  ): any {
    if (pathArr.length > index + 1) {
      return {
        ...parentObj,
        [pathArr[index + 1]]: {
          ...resolve(
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
  return resolve(path, -1, oldState, payload);
}

export default class reduxStoreFactory<T> {
  public update: ResolveUpdate<T> = buildUpdate(
    [],
    this.initialState,
    (path, oldState, payload) => {
      return updateAct(path, oldState, payload);
    }
  );
  public reset: ResolveReset<T> = buildReset(
    [],
    this.initialState,
    (path, oldState) => {
      return cleanAct(path, oldState, this.initialState);
    }
  );
  constructor(public initialState: T) {}
  public reducer(oldState: T = this.initialState, action: Action): T {
    return action.resolve({ ...oldState });
  }
  public middleware(store: any) {
    return (next: any) => (action: any) => {
      next(action);
    };
  }
}

interface Data {
  plop: {
    action: string;
    action2: string;
  };
}
const data: Data = {
  plop: {
    action: "plop",
    action2: "plop2",
  },
};

const data2: Data = {
  plop: {
    action: "ZZ",
    action2: "ZZ",
  },
};

const store = new reduxStoreFactory<Data>(data);
console.log(store.update.plop.action2("hehe").resolve(store.initialState));
console.log(
  store.update.plop.resolve({ action: "hehe" }).resolve(store.initialState)
);
console.log(store.reset.plop.resolve().resolve(data2));
console.log(store.reset.plop.action2().resolve(data2));
