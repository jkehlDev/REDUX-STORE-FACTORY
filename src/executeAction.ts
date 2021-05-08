import reduxStoreFactory from "./index";

export const EXECUTE_TYPE = "EXECUTE";
export default class ExecuteAction {
  public create: (
    payload: any
  ) => {
    type: string;
    execute: (store: any, next: any, action: any) => void;
    payload: any;
  } = (payload: any) => ({
    type: EXECUTE_TYPE,
    execute: this.execute,
    payload: payload,
  });
  constructor(private execute: (store: any, next: any, action: any) => void) {}
}
