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

const store = new reduxStoreFactory<Data>(data, "test");
import { expect } from "chai";
describe("REQUIREMENT - RESOLVER", () => {
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
});
