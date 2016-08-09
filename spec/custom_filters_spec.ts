

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


describe("Custom filters", () => {
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
        runValidator(DeepValidator.isNotEmpty, [{a: 1}, [[1, 2, 3]], "a"], [null, 0, true, false, "", [[]], {}, void 0, Infinity, NaN]);
    });

    it("isNotEmptyArray", () => {
        runValidator(DeepValidator.isNotEmptyArray, [[[1, 2, 3]]], [null, 0, true, false, "a", [[]], {}, void 0, Infinity, NaN]);
    });

    it("isNotEmptyObject", () => {
        runValidator(DeepValidator.isNotEmptyObject, [{a: 1}], [null, 0, true, false, "a", [[]], {}, void 0, Infinity, NaN]);
    });

    it("isNumberNegative", () => {
        runValidator(DeepValidator.isNumberNegative, [- 1, - 2, - 3, - Infinity], [null, 0, true, false, "a", [[]], {}, void 0, Infinity, NaN]);
    });

    it("isNumberPositive", () => {
        runValidator(DeepValidator.isNumberPositive, [1, 2, 3, Infinity], [null, 0, true, false, "a", [[]], {}, void 0, - Infinity, NaN]);
    });

    it("isNumberOrNumeric", () => {
        runValidator(DeepValidator.isNumberOrNumeric, [0, 1, "1", NaN, Infinity], [null, true, false, "a", [[]], {}, void 0]);
    });

    it("isObject", () => {
        runValidator(DeepValidator.isObject, [{}], [null, 0, true, false, "a", [[]], void 0]);
    });

    it("isRange", () => {
        runValidator(DeepValidator.isRange, [[1, 0, 2]], [null, 0, true, false, "a", [[]], {}, [0, 1, 2], [3, 0, 2]]);
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

    it("filter", () => {
        let v = new DeepValidator({
            'a': [
                'isObject', ['filter', /x/]
            ],
            'a.b': [
                'isObject', ['filter', /y/]
            ]
        });

        let t;

        expect(v.validate(t = {a: {b: {$x: 'y', y: 2, c: []}, $x: 1, $y: 'x', z: 3}})).toBe(true);

        expect(t).toEqual({a: {b: {$x: 'y', c: []}, $y: 'x'}});

        v = new DeepValidator({
            'a': [
                'isObject', ['filter', /x/]
            ],
            'a.b': [
                'isObject', ['filter', /y/, false]
            ]
        });

        expect(v.validate(t = {a: {b: {$x: 'y', y: 2, c: []}, $x: 1, $y: 'x', z: 3}})).toBe(true);

        expect(t).toEqual({a: {b: {$x: 'y'}, $y: 'x'}});
    });

    it("filterKeys", () => {
        let v = new DeepValidator({
            'a': [
                'isObject', ['filterKeys', /x|b/]
            ],
            'a.b': [
                'isObject', ['filterKeys', /y/]
            ]
        });

        let t;

        expect(v.validate(t = {a: {b: {$x: 1, y: 2}, $x: 1, $y: 2, z: 3}})).toBe(true);

        expect(t).toEqual({a: {b: {y: 2}, $x: 1}});
    });

    it("filterMongoDocKeys", () => {
        let v = new DeepValidator({
            'a': [
                'isObject', 'filterMongoDocKeys'
            ],
            'a.b': [
                'isObject', 'filterMongoDocKeys'
            ]
        });

        let t;

        expect(v.validate(t = {a: {b: {$x: 1, y: 2}, $x: 1, $y: 2, z: 3}})).toBe(true);

        expect(t).toEqual({a: {b: {y: 2}, z: 3}});
    });
});
