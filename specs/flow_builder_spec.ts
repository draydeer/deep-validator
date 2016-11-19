
import * as _ from "lodash";
import {DeepValidator, Flow} from "../src/deep-validator";

let fixtures = {
    default: [1],
    isExists: ["not exists"],
    isInRange: [0, 1, "not in range"],
    isNegative: ["not number negative"],
    isNumber: ["not number"],
    isNumberOrNumeric: ["not number nor numeric"],
    isPositive: ["not number positive"],
    isString: ["not string"],
    required: ["required"],
    showAs: ["b"],
};

describe("Flow builder", () => {
    it("should construct flow", () => {
        let list = [];

        let elem;

        _.each(fixtures, (v, k) => {
            let flow = Flow[k].apply(Flow, v);

            if (k.substr(0, 2) === "is" || k === "required") {
                expect(flow.flow).toEqual([elem = [k + ":" + v[v.length - 1]].concat(v.slice(0, v.length - 1))]);
            } else {
                expect(flow.flow).toEqual([elem = [k].concat(v)]);
            }

            list.push(elem);

            if (k.substr(0, 2) === "is") {
                let flow = Flow[k].apply(Flow, v.slice(0, v.length - 1));

                expect(flow.flow).toEqual([[k].concat(v.slice(0, v.length - 1))]);
            }
        });

        let flow;

        _.each(fixtures, (v, k) => {
            if (flow === void 0) {
                flow = Flow[k].apply(Flow, v);
            } else {
                flow[k].apply(flow, v);
            }
        });

        expect(flow.flow).toEqual(list);
    });
});
