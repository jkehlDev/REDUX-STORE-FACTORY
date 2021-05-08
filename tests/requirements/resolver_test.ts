import ExecuteAction from "../../src/executeAction";
import reduxStoreFactory from "../../src/index";

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
store.execute.getUser = new ExecuteAction(
  (store: any, next: any, action: any) => {
    console.log("plopplop");
  }
);

store.middleware({})((act: any) => {
  console.log(act);
})(store.execute.getUser);

console.log(store.update.plop.action2("hehe").resolve(store.initialState));
console.log(
  store.update.plop.resolve({ action: "hehe" }).resolve(store.initialState)
);
console.log(store.reset.plop.resolve().resolve(data2));
console.log(store.reset.plop.action2().resolve(data2));
