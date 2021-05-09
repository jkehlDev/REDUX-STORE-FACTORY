import reduxStoreFactory from "../../src/index";

import { expect } from "chai";
describe("REQUIREMENT - RESOLVER", () => {
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
  const store = new reduxStoreFactory<Data>(data, "test");
  describe("RESOLVER UPDATE", () => {
    it(`It should return : { plop: { action: 'plop', action2: 'hehe' } } when update only plop.action2 object directly`, () => {
      expect(
        store.update.plop.action2("hehe").resolve(store.initialState)
      ).to.deep.equals({ plop: { action: "plop", action2: "hehe" } });
    });
    it(`It should return : { plop: { action: 'hehe', action2: 'hehe' } } when update all plop object`, () => {
      expect(
        store.update.plop
          .resolve({ action: "hehe", action2: "hehe" })
          .resolve(store.initialState)
      ).to.deep.equals({ plop: { action: "hehe", action2: "hehe" } });
    });
  });

  const data2: Data = {
    plop: {
      action: "ZZ",
      action2: "ZZ",
    },
  };
  describe("RESOLVER RESET", () => {
    it(`It should return : { plop: { action: 'plop', action2: 'plop2' } } when reset all plop object`, () => {
      expect(store.reset.plop.resolve().resolve(data2)).to.deep.equals({
        plop: { action: "plop", action2: "plop2" },
      });
    });
    it(`It should return : { plop: { action: 'ZZ', action2: 'plop2' } } when reset only plop.action2 object`, () => {
      expect(store.reset.plop.action2().resolve(data2)).to.deep.equals({
        plop: { action: "ZZ", action2: "plop2" },
      });
    });
  });
  interface Data2 {
    A: {
      a1: () => string;
      a2: any[];
    };
  }
  const data3: Data2 = {
    A: {
      a1: () => {
        return "hello";
      },
      a2: ["item1", "item2"],
    },
  };
  const store2 = new reduxStoreFactory<Data2>(data3, "test2");
  describe("RESOLVER UPDATE WITH FUNCTION OBJECT", () => {
    it(`It should return : { A: { a1: ()=>{console.log("bye")}, a2: ["item1", "item2"] } } when A.a1 updated`, () => {
      expect(
        store2.update.A.a1(() => {
          return "bye";
        })
          .resolve(store2.initialState)
          .A.a1()
      ).to.deep.equals("bye");
    });
  });
});
