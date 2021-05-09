# REDUX-STORE-FACTORY

Tools library for building redux store

## HOW TO

Install package with command line : `npm install redux-store-factory`

Next get an instance of your store with :

```ts
interface Data {
  A: {
    a1: string;
    a2: string;
  };
}
const initialState: Data = {
  A: {
    a1: "a1",
    a2: "a2",
  },
};

import reduxStoreFactory from "redux-store-factory";
// Make a redux store factory instance
const store = new reduxStoreFactory<Data>(initialState, "myTestStore");

// Obtain your reducer:
const myReducer = store.reducer;

// Obtain your middlware (static) :
const myMiddleware = reduxStoreFactory.middleware;

// Try action creator for dispatcher to update A.a1:
const myActionUpdateToDispatch = store.update.A.a1("My New Value");
// OR
const anOtherActionUpdateToDispatch = store.update.A({ a1: "My New Value" });

// Try action creator for dispatcher to reset initialState on A.a1:
const myActionResetToDispatch = store.reset.A.a1();
// Try action creator for dispatcher to reset initialState on A:
const anOtherActionResetToDispatch = store.reset.A();

// Add action for middleware
import { ExecuteAction } from "redux-store-factory";
store.execute.myAction = new ExecuteAction(
  (store: any) => (next: any) => (action: any) => {
    console.log(`I do something cool : ${action.payload} !`);
  }
);

// Get action to dispatch for middleware
const myPayload = "something cool";
const myActionToDispatch = store.execute.myAction.create(myPayload);
```
