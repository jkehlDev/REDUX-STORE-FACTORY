export enum ResolveTypes {
  UPDATE = "RESOLVE_UPDATE",
  RESET = "RESOLVE_RESET",
}

export type ResolveAction<T> = {
  type: T;
  resolve: (oldState?: any) => any;
};
