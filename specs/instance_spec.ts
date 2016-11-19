
import * as _ from "lodash";
import {DeepValidator} from "../src/deep-validator";

let v, t, f;

describe("Instance", () => {
    describe("validation running", () => {
        it("should throw exception on pending includes", () => {
            v = new DeepValidator({
                a: [
                    ["include", "test"],
                ],
            });

            f = () => v.validate({});

            expect(f).toThrow(new Error("Included validator is still pending for definition: test"));
        });

        it("should fail with max depth of 3 on self referenced include", () => {
            v = new DeepValidator({
                a: [
                    ["include", "self"],
                ],
                b: [
                    "required:required", "isNumber:not number",
                ],
            }).setMessageMaxDepthReached("max depth reached").maxDepth(3);

            expect(v.validate({a: {a: {a: {b: 4}, b: 3}, b: 2}, b: 1,})).toBe(false);

            expect(v.getErrors()).toEqual({"a.a.a.*": "max depth reached"});
        });
    });
});
