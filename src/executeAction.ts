export const EXECUTE_TYPE = "EXECUTE";
export default class ExecuteAction {
  public readonly type: string = EXECUTE_TYPE;
  constructor(public execute: (store: any, next: any, action: any) => void) {}
}
