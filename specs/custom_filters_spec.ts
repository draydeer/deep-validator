
import * as _ from "lodash";
import {DeepValidator} from "../src/deep-validator";

let k, v, t;

let runValidator = (validator, ok: any[], error: any[], trueValue: any = true, falseValue: any = false) => {
    for (let i = 0; i < ok.length; i ++) {
        let val = ok[i];

        if (_.isArray(val) === false) {
            val = [val];
        }

        if (_.isFunction(trueValue)) {
            expect(trueValue(validator.apply(DeepValidator, val))).toBe(true)
        } else {
            expect(validator.apply(DeepValidator, val)).toBe(trueValue);
        }
    }

    for (let i = 0; i < error.length; i ++) {
        let val = error[i];

        if (_.isArray(val) === false) {
            val = [val];
        }

        if (_.isFunction(falseValue)) {
            expect(falseValue(validator.apply(DeepValidator, val))).toBe(true)
        } else {
            falseValue === true ? expect(validator.apply(DeepValidator, val)).not.toBe(trueValue) : expect(validator.apply(DeepValidator, val)).toBe(falseValue);
        }
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

    // [- 1, 0, 1, - 0.5, 0.5, NaN, Infinity, - Infinity, "-1", "0", "1", "-0.5", "0.5", true, false, null, void 0, "true", "false", "null", [[]], {}]

    it("isBoolean", () => {
        runValidator(
            DeepValidator.isBoolean,
            ["0", "1", true, false, "true", "false"],
            [- 1, 0, 1, - 0.5, 0.5, NaN, Infinity, - Infinity, "-1", "-0.5", "0.5", null, void 0, "null", [[]], {}]
        );
    });

    it("isDate", () => {
        runValidator(
            DeepValidator.isDate,
            [new Date(), "2016-01-01"],
            [- 1, 0, 1, - 0.5, 0.5, NaN, Infinity, - Infinity, true, false, null, void 0, "true", "false", "null", [[]], {}]
        );
    });

    it("isGreater", () => {
        runValidator(
            DeepValidator.isGreater,
            [[1, 0]],
            [[0, 0], [0, 1], [false, false]]
        );
    });

    it("isGreaterOrEquals", () => {
        runValidator(
            DeepValidator.isGreaterOrEquals,
            [[0, 0], [1, 0]],
            [[0, 1], [false, false]]
        );
    });

    it("isGreaterOrEqualsToZero", () => {
        runValidator(
            DeepValidator.isGreaterOrEqualsToZero,
            [0, 1, 0.5, Infinity],
            [- 1, - 0.5, NaN, - Infinity, true, false, null, void 0, "true", "false", "null", [[]], {}]
        );
    });

    it("isLess", () => {
        runValidator(
            DeepValidator.isLess,
            [[0, 1]],
            [[0, 0], [1, 0], [false, false]]
        );
    });

    it("isLessOrEquals", () => {
        runValidator(
            DeepValidator.isLessOrEquals,
            [[0, 0], [0, 1]],
            [[1, 0], [false, false]]
        );
    });

    it("isLessOrEqualsToZero", () => {
        runValidator(
            DeepValidator.isLessOrEqualsToZero,
            [- 1, 0],
            [null, 1, true, false, "", [[]], {}, void 0]
        );
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

    it("isNegative", () => {
        runValidator(DeepValidator.isNegative, [- 1, - 2, - 3, - Infinity], [null, 0, true, false, "a", [[]], {}, void 0, Infinity, NaN]);
    });

    it("isPositive", () => {
        runValidator(DeepValidator.isPositive, [1, 2, 3, Infinity], [null, 0, true, false, "a", [[]], {}, void 0, - Infinity, NaN]);
    });

    it("isNumberOrNumeric", () => {
        runValidator(DeepValidator.isNumberOrNumeric, [0, 1, "1", 1.5, "1.5", NaN, Infinity], [null, true, false, "a", [[]], {}, void 0]);
    });

    it("isObject", () => {
        runValidator(DeepValidator.isObject, [{}], [null, 0, true, false, "a", [[]], void 0]);
    });

    it("isIntOrNumeric", () => {
        runValidator(DeepValidator.isIntOrNumeric, [1, '1'], [null, true, false, NaN, Infinity, "a", [[]], {}, 0.1, '0.1']);
    });

    it("isInRange", () => {
        runValidator(DeepValidator.isInRange, [[1, 0, 2]], [null, 0, true, false, "a", [[]], {}, [0, 1, 2], [3, 0, 2]]);
    });

    it("isInsignificant", () => {
        runValidator(DeepValidator.isInsignificant, ["", [[]], {}, 0, false, null, void 0], [{a: 1}, ["a"], "a", 1, true]);
    });

    it("isSignificant", () => {
        runValidator(DeepValidator.isSignificant, [{a: 1}, ["a"], "a", 1, true], ["", [[]], {}, 0, false, null, void 0]);
    });

    it("isVoid", () => {
        runValidator(DeepValidator.isVoid, [void 0], [null, 0, true, false, "a", [[]], {}]);
    });

    it("isNotVoid", () => {
        runValidator(DeepValidator.isNotVoid, [null, 0, true, false, "a", [[]], {}], [void 0]);
    });

    it("toBoolean", () => {
        runValidator(DeepValidator.toBoolean, [true, 1, "1", "true"], [null, false, "", [[]], {}, 0, {a: 1}, ["a"], "a", "false"], (v) => v === true, (v) => v === false);
    });

    it("toDate", () => {
        runValidator(DeepValidator.toDate, [new Date(), "2016", "2016/01/01 01:01:01"], [null, true, false, "", [[]], {}, {a: 1}, ["a"], "a"], (v) => v instanceof Date, (v) => v === null);
    });

    it("toFloat", () => {
        runValidator(DeepValidator.toFloat, [1, "1", 123.5, "123.5"], [null, true, false, "", [[]], {}, {a: 1}, ["a"], "a"], (v) => _.isNumber(v), (v) => isNaN(v));

        expect(DeepValidator.toFloat(123)).toBe(123);

        expect(DeepValidator.toFloat("123.5")).toBe(123.5);
    });

    it("toInt", () => {
        runValidator(DeepValidator.toInt, [1, "1", 123.5, "123.5"], [null, true, false, "", [[]], {}, {a: 1}, ["a"], "a"], (v) => _.isNumber(v), (v) => isNaN(v));

        expect(DeepValidator.toInt(123)).toBe(123);

        expect(DeepValidator.toInt("123.5")).toBe(123);
    });

    it("toMongoId", () => {
        let ObjectID = require("mongodb").ObjectID;

        expect(DeepValidator.toMongoId("123456654321") instanceof ObjectID).toBe(true);
    });

    it("toNullIfEmpty", () => {
        runValidator(DeepValidator.toNullIfEmpty, ["", [[]], {}], [{a: 1}, ["a"], "a"], null, true);
    });

    it("toNullIfInsignificant", () => {
        runValidator(DeepValidator.toNullIfInsignificant, ["", [[]], {}, 0, false, null, void 0], [{a: 1}, ["a"], "a", 1, true], null, true);
    });

    it("toString", () => {
        expect(DeepValidator.toString(null)).toBe('');

        expect(DeepValidator.toString(void 0)).toBe('');

        expect(DeepValidator.toString(123)).toBe('123');
    });

    it("clean", () => {
        v = new DeepValidator(
            {
                'a': [
                    'isObject', 'clean'
                ],
                'a.b': [
                    'isObject', 'clean'
                ],
                'a.b.c': [

                ],
                'a.c': [

                ]
            },
            [
                'clean'
            ]
        );

        expect(v.validate(t = {a: {b: {c: 3, d: 4}, c: {x: 1}, d: 2}, e: 2})).toBe(true);

        expect(t).toEqual({a: {b: {c: 3}, c: {x: 1}}});
    });

    it("filter", () => {
        v = new DeepValidator({
            'a': [
                'isObject', ['filter', /x/]
            ],
            'a.b': [
                'isObject', ['filter', /y/]
            ]
        }, [['filter', /q/]]);

        expect(v.validate(t = {a: {b: {$x: 'y', y: 2, c: []}, $x: 1, $y: 'x', z: 3}, g: 'aqa', h: 123, i: 'a'})).toBe(true);

        expect(t).toEqual({a: {b: {$x: 'y', c: []}, $y: 'x'}, g: 'aqa'});
    });

    it("filter with custom handler", () => {
        v = new DeepValidator({
            'a': [
                'isObject', ['filter', (v) => _.isObjectLike(v) || /x/.test(v)]
            ],
            'a.b': [
                'isObject', ['filter', (v) => _.isObjectLike(v) || /y/.test(v)]
            ]
        }, [['filter', (v) => _.isObjectLike(v) || /q/.test(v)]]);

        expect(v.validate(t = {a: {b: {$x: 'y', y: 2, c: []}, $x: 1, $y: 'x', z: 3}, g: 'aqa', h: 123, i: 'a'})).toBe(true);

        expect(t).toEqual({a: {b: {$x: 'y', c: []}, $y: 'x'}, g: 'aqa'});
    });
    
    it("filter with no object allow", () => {
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
        v = new DeepValidator({
            'a': [
                'isObject', ['filterKeys', /x|b/]
            ],
            'a.b': [
                'isObject', ['filterKeys', /y/]
            ]
        }, [['filterKeys', /a/]]);

        expect(v.validate(t = {a: {b: {$x: 1, y: 2}, $x: 1, $y: 2, z: 3}, g: 'aqa', ha: 123, i: 'a'})).toBe(true);

        expect(t).toEqual({a: {b: {y: 2}, $x: 1}, ha: 123});
    });

    it("filterKeys with custom handler", () => {
        v = new DeepValidator({
            'a': [
                'isObject', ['filterKeys', (v) => /x|b/.test(v)]
            ],
            'a.b': [
                'isObject', ['filterKeys', (v) => /y/.test(v)]
            ]
        }, [['filterKeys', (v) => /a/.test(v)]]);

        expect(v.validate(t = {a: {b: {$x: 1, y: 2}, $x: 1, $y: 2, z: 3}, g: 'aqa', ha: 123, i: 'a'})).toBe(true);

        expect(t).toEqual({a: {b: {y: 2}, $x: 1}, ha: 123});
    });

    it("filterMongoDocKeys", () => {
        v = new DeepValidator({
            'a': [
                'isObject', 'filterMongoDocKeys'
            ],
            'a.b': [
                'isObject', 'filterMongoDocKeys'
            ]
        });

        expect(v.validate(t = {a: {b: {$x: 1, y: 2}, $x: 1, $y: 2, z: 3}})).toBe(true);

        expect(t).toEqual({a: {b: {y: 2}, z: 3}});
    });
});
