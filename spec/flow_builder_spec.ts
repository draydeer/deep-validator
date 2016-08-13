

import * as _ from "lodash";
import {DeepValidator, Flow} from "../src/deep-validator";


let v, t, f;


describe("Flow builder", () => {
    it("Common", () => {
        expect(Flow.default(2).flow).toEqual([["default", 2]]);
        expect(Flow.showAs("b").flow).toEqual([["showAs", "b"]]);
        expect(Flow.isExists("not exists").flow).toEqual(["isExists:not exists"]);
        expect(Flow.isInRange(0, 1, "not in range").flow).toEqual([["isInRange:not in range", 0, 1]]);
        expect(Flow.isString("not string").flow).toEqual(["isString:not string"]);

        let flow = Flow
            .default(1)
            .showAs("b")
            .isExists("not exists")
            .isExists()
            .isInRange(0, 1, "not in range")
            .isInRange(0, 1)
            .isString("not string")
            .isString();

        expect(
            flow.flow
        ).toEqual([
            ["default", 1],
            ["showAs", "b"],
            "isExists:not exists",
            "isExists",
            ["isInRange:not in range", 0, 1],
            ["isInRange", 0, 1],
            "isString:not string",
            "isString"
        ]);
    });
});
