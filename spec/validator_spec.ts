

import * as _ from "lodash";
import {DeepValidator} from "../src/deep-validator";


let runValidator = (validator, ok: any[], error: any[], trueValue: any = true, falseValue: any = false) => {
    for (let i = 0; i < ok.length; i ++) {
        let val = ok[i];

        if (_.isArray(val) === false) {
            val = [val];
        }

        expect(validator.apply(DeepValidator, val)).toBe(trueValue);
    }

    for (let i = 0; i < error.length; i ++) {
        let val = error[i];

        if (_.isArray(val) === false) {
            val = [val];
        }

        falseValue === true ? expect(validator.apply(DeepValidator, val)).not.toBe(trueValue) : expect(validator.apply(DeepValidator, val)).toBe(falseValue);
    }
};


describe("Custom validators.", () => {
    it("isNumberOrNull", () => {
        runValidator(DeepValidator.isNumberOrNull, [1, null], [true, false, "", [[]], {}]);
    });

    it("isContains", () => {
        runValidator(
            DeepValidator.isContains,
            [
                [{a: 1, b: 2, c: 3}, ["a", "b", "c"]],
                [["a", "b", "c"], ["a", "b", "c"]]
            ],
            [
                [{a: 1, b: 2, c: 3}, ["a", "f", "g"]],
                [["a", "b", "c"], ["a", "f", "g"]],
                [true, [true]]
            ]
        );
    });

    it("isNotContains", () => {
        runValidator(
            DeepValidator.isNotContains,
            [
                [{a: 1, b: 2, c: 3}, ["e", "f", "g"]],
                [["a", "b", "c"], ["e", "f", "g"]]
            ],
            [
                [{a: 1, b: 2, c: 3}, ["a", "f", "g"]],
                [["a", "b", "c"], ["a", "f", "g"]],
                [true, [true]]
            ]
        );
    });

    it("isContainsOnly", () => {
        runValidator(
            DeepValidator.isContainsOnly,
            [
                [{a: 1, b: 2, c: 3, d: 4}, ["a", "b", "c", "d"]],
                [["a", "b", "c", "d"], ["a", "b", "c", "d"]]
            ],
            [
                [{a: 1, b: 2, c: 3, d: 4}, ["a", "b", "c"]],
                [["a", "b", "c", "d"], ["a", "b", "c"]],
                [{a: 1, b: 2, c: 3, d: 4}, ["a", "b", "c", "d", "e"]],
                [["a", "b", "c", "d"], ["a", "b", "c", "d", "e"]],
                [true, [true]]
            ]
        );

        runValidator(
            DeepValidator.isContainsOnly,
            [
                [{a: 1, b: 2, c: 3, d: 4}, ["a", "b", "c", "d"], false],
                [["a", "b", "c", "d"], ["a", "b", "c", "d"], false],
                [{a: 1, b: 2, c: 3, d: 4}, ["a", "b", "c"], false],
                [["a", "b", "c"], ["a", "b", "c"], false]
            ],
            [
                [{a: 1, b: 2, c: 3, d: 4}, ["a", "b", "c", "d", "e"], false],
                [["a", "b", "c", "d"], ["a", "b", "c", "d", "e"], false],
                [true, [true], false]
            ]
        );
    });

    it("isGreater", () => {
        runValidator(DeepValidator.isGreater, [[1, 0]], [[0, 0], [0, 1], [false, false]]);
    });

    it("isGreaterOrEqual", () => {
        runValidator(DeepValidator.isGreaterOrEqual, [[0, 0], [1, 0]], [[0, 1], [false, false]]);
    });

    it("isGreaterOrEqualToZero", () => {
        runValidator(DeepValidator.isGreaterOrEqualToZero, [1, 0], [null, - 1, true, false, "", [[]], {}, void 0]);
    });

    it("isLess", () => {
        runValidator(DeepValidator.isLess, [[0, 1]], [[0, 0], [1, 0], [false, false]]);
    });

    it("isLessOrEqual", () => {
        runValidator(DeepValidator.isLessOrEqual, [[0, 0], [0, 1]], [[1, 0], [false, false]]);
    });

    it("isLessOrEqualToZero", () => {
        runValidator(DeepValidator.isLessOrEqualToZero, [- 1, 0], [null, 1, true, false, "", [[]], {}, void 0]);
    });

    it("isLength", () => {
        runValidator(
            DeepValidator.isLength,
            [
                [{a: 1, b: 2, c: 3}, 1, 3],
                [[1, 2, 3], 1, 3],
                ["123", 1, 3]
            ],
            [
                [{a: 1, b: 2, c: 3}, 4],
                [[1, 2, 3], 4],
                ["123", 4],
                [{a: 1, b: 2, c: 3}, void 0, 2],
                [[1, 2, 3], void 0, 2],
                ["123", void 0, 2],
                [null, 0, 99999999],
                [true, 0, 99999999]
            ]
        );
    });

    it("isNotEmpty", () => {
        runValidator(DeepValidator.isNotEmpty, [{a: 1}, [[1, 2, 3]], "a"], [null, 0, true, false, "", [[]], {}, void 0]);
    });

    it("isNotEmptyArray", () => {
        runValidator(DeepValidator.isNotEmptyArray, [[[1, 2, 3]]], [null, 0, true, false, "a", [[]], {}, void 0]);
    });

    it("isNotEmptyObject", () => {
        runValidator(DeepValidator.isNotEmptyObject, [{a: 1}], [null, 0, true, false, "a", [[]], {}, void 0]);
    });

    it("isNumberNegative", () => {
        runValidator(DeepValidator.isNumberNegative, [- 1, - 2, - 3], [null, 0, true, false, "a", [[]], {}, void 0]);
    });

    it("isNumberPositive", () => {
        runValidator(DeepValidator.isNumberPositive, [1, 2, 3], [null, 0, true, false, "a", [[]], {}, void 0]);
    });

    it("isNumberOrNumeric", () => {
        runValidator(DeepValidator.isNumberOrNumeric, [0, 1, "1", NaN, Infinity], [null, true, false, "a", [[]], {}, void 0]);
    });

    it("isObject", () => {
        runValidator(DeepValidator.isObject, [{}], [null, 0, true, false, "a", [[]], void 0]);
    });

    it("isVoid", () => {
        runValidator(DeepValidator.isVoid, [void 0], [null, 0, true, false, "a", [[]], {}]);
    });

    it("isNotVoid", () => {
        runValidator(DeepValidator.isNotVoid, [null, 0, true, false, "a", [[]], {}], [void 0]);
    });

    it("toNumber", () => {

    });

    it("toNullIfEmpty", () => {
        runValidator(DeepValidator.toNullIfEmpty, ["", [[]], {}], [{a: 1}, ["a"], "a"], null, true);
    });
});
