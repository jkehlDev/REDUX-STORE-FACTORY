import { ResolveAction, ResolveTypes } from "./resolveAction";

export type ResolveReset<T> = T extends Array<any> | string | number | Date
  ? () => ResolveAction<ResolveTypes.RESET>
  : {
      [P in keyof T | "resolve"]: P extends Exclude<keyof T, "resolve">
        ? ResolveReset<T[P]>
        : () => ResolveAction<ResolveTypes.RESET>;
    };

export function buildReset<T>(
  path: string[],
  data: T,
  resolve: (path: string[], oldState: any) => any,
  storeName: string
): ResolveReset<T> {
  let item: any = {};
  item.resolve = () => ({
    type: `${ResolveTypes.RESET}_${storeName.toUpperCase()}`,
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
        item[key] = buildReset(pathTmp, data[key], resolve, storeName);
      } else {
        item[key] = () => ({
          type: `${ResolveTypes.RESET}_${storeName.toUpperCase()}`,
          resolve: (oldState: any) => {
            return resolve(pathTmp, oldState);
          },
        });
      }
    }
  }
  return item as ResolveReset<T>;
}

export function reset(path: string[], oldState: any, initialState: any): any {
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
