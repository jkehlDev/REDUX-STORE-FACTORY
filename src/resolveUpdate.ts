import { ResolveAction, ResolveTypes } from "./resolveAction";

export type ResolveUpdate<T> = T extends Array<any> | string | number | Date
  ? (payload: T) => ResolveAction<ResolveTypes.UPDATE>
  : {
      [P in keyof T | "resolve"]: P extends Exclude<keyof T, "resolve">
        ? ResolveUpdate<T[P]>
        : (
            payload: { [Z in keyof T]?: T[Z] }
          ) => ResolveAction<ResolveTypes.UPDATE>;
    };

export function buildUpdate<T>(
  path: string[],
  data: T,
  resolve: (path: string[], oldState: any, payload?: any) => any,
  storeName: string
): ResolveUpdate<T> {
  let item: any = {};
  item.resolve = (payload?: { [Z in keyof T]?: T[Z] }) => ({
    type: `${ResolveTypes.UPDATE}_${storeName.toUpperCase}`,
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
        item[key] = buildUpdate(pathTmp, data[key], resolve, storeName);
      } else {
        item[key] = (payload: any) => ({
          type: `${ResolveTypes.UPDATE}_${storeName.toUpperCase}`,
          resolve: (oldState: any) => {
            return resolve([...path], oldState, { [key]: payload });
          },
        });
      }
    }
  }
  return item as ResolveUpdate<T>;
}

export function update(path: string[], oldState: any, payload: any): any {
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
