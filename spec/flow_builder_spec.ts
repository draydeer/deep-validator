

import * as _ from "lodash";
import {DeepValidator, Flow} from "../src/deep-validator";


let v, t, f;


describe("Flow builder", () => {
    it("Common", () => {
        v = new DeepValidator({
            a: Flow.isString('Invalid.')
        });

        expect(v.strict().validate({a: "123"})).toBe(true);
    });
});
