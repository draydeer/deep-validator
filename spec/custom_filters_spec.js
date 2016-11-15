(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", "lodash", "../src/deep-validator"], factory);
    }
})(function (require, exports) {
    "use strict";
    var _ = require("lodash");
    var deep_validator_1 = require("../src/deep-validator");
    var k, v, t;
    var runValidator = function (validator, ok, error, trueValue, falseValue) {
        if (trueValue === void 0) { trueValue = true; }
        if (falseValue === void 0) { falseValue = false; }
        for (var i = 0; i < ok.length; i++) {
            var val = ok[i];
            if (_.isArray(val) === false) {
                val = [val];
            }
            if (_.isFunction(trueValue)) {
                expect(trueValue(validator.apply(deep_validator_1.DeepValidator, val))).toBe(true);
            }
            else {
                expect(validator.apply(deep_validator_1.DeepValidator, val)).toBe(trueValue);
            }
        }
        for (var i = 0; i < error.length; i++) {
            var val = error[i];
            if (_.isArray(val) === false) {
                val = [val];
            }
            if (_.isFunction(falseValue)) {
                expect(falseValue(validator.apply(deep_validator_1.DeepValidator, val))).toBe(true);
            }
            else {
                falseValue === true ? expect(validator.apply(deep_validator_1.DeepValidator, val)).not.toBe(trueValue) : expect(validator.apply(deep_validator_1.DeepValidator, val)).toBe(falseValue);
            }
        }
    };
    describe("Custom filters", function () {
        it("isNumberOrNull", function () {
            runValidator(deep_validator_1.DeepValidator.isNumberOrNull, [1, null], [true, false, "", [[]], {}]);
        });
        it("isContains", function () {
            runValidator(deep_validator_1.DeepValidator.isContains, [
                [{ a: 1, b: 2, c: 3 }, ["a", "b", "c"]],
                [["a", "b", "c"], ["a", "b", "c"]]
            ], [
                [{ a: 1, b: 2, c: 3 }, ["a", "f", "g"]],
                [["a", "b", "c"], ["a", "f", "g"]],
                [true, [true]]
            ]);
        });
        it("isNotContains", function () {
            runValidator(deep_validator_1.DeepValidator.isNotContains, [
                [{ a: 1, b: 2, c: 3 }, ["e", "f", "g"]],
                [["a", "b", "c"], ["e", "f", "g"]]
            ], [
                [{ a: 1, b: 2, c: 3 }, ["a", "f", "g"]],
                [["a", "b", "c"], ["a", "f", "g"]],
                [true, [true]]
            ]);
        });
        it("isContainsOnly", function () {
            runValidator(deep_validator_1.DeepValidator.isContainsOnly, [
                [{ a: 1, b: 2, c: 3, d: 4 }, ["a", "b", "c", "d"]],
                [["a", "b", "c", "d"], ["a", "b", "c", "d"]]
            ], [
                [{ a: 1, b: 2, c: 3, d: 4 }, ["a", "b", "c"]],
                [["a", "b", "c", "d"], ["a", "b", "c"]],
                [{ a: 1, b: 2, c: 3, d: 4 }, ["a", "b", "c", "d", "e"]],
                [["a", "b", "c", "d"], ["a", "b", "c", "d", "e"]],
                [true, [true]]
            ]);
        });
        it("isGreater", function () {
            runValidator(deep_validator_1.DeepValidator.isGreater, [[1, 0]], [[0, 0], [0, 1], [false, false]]);
        });
        it("isGreaterOrEquals", function () {
            runValidator(deep_validator_1.DeepValidator.isGreaterOrEquals, [[0, 0], [1, 0]], [[0, 1], [false, false]]);
        });
        it("isGreaterOrEqualsToZero", function () {
            runValidator(deep_validator_1.DeepValidator.isGreaterOrEqualsToZero, [1, 0], [null, -1, true, false, "", [[]], {}, void 0]);
        });
        it("isLess", function () {
            runValidator(deep_validator_1.DeepValidator.isLess, [[0, 1]], [[0, 0], [1, 0], [false, false]]);
        });
        it("isLessOrEquals", function () {
            runValidator(deep_validator_1.DeepValidator.isLessOrEquals, [[0, 0], [0, 1]], [[1, 0], [false, false]]);
        });
        it("isLessOrEqualsToZero", function () {
            runValidator(deep_validator_1.DeepValidator.isLessOrEqualsToZero, [-1, 0], [null, 1, true, false, "", [[]], {}, void 0]);
        });
        it("isLength", function () {
            runValidator(deep_validator_1.DeepValidator.isLength, [
                [{ a: 1, b: 2, c: 3 }, 1, 3],
                [[1, 2, 3], 1, 3],
                ["123", 1, 3]
            ], [
                [{ a: 1, b: 2, c: 3 }, 4],
                [[1, 2, 3], 4],
                ["123", 4],
                [{ a: 1, b: 2, c: 3 }, void 0, 2],
                [[1, 2, 3], void 0, 2],
                ["123", void 0, 2],
                [null, 0, 99999999],
                [true, 0, 99999999]
            ]);
        });
        it("isNotEmpty", function () {
            runValidator(deep_validator_1.DeepValidator.isNotEmpty, [{ a: 1 }, [[1, 2, 3]], "a"], [null, 0, true, false, "", [[]], {}, void 0, Infinity, NaN]);
        });
        it("isNotEmptyArray", function () {
            runValidator(deep_validator_1.DeepValidator.isNotEmptyArray, [[[1, 2, 3]]], [null, 0, true, false, "a", [[]], {}, void 0, Infinity, NaN]);
        });
        it("isNotEmptyObject", function () {
            runValidator(deep_validator_1.DeepValidator.isNotEmptyObject, [{ a: 1 }], [null, 0, true, false, "a", [[]], {}, void 0, Infinity, NaN]);
        });
        it("isNegative", function () {
            runValidator(deep_validator_1.DeepValidator.isNegative, [-1, -2, -3, -Infinity], [null, 0, true, false, "a", [[]], {}, void 0, Infinity, NaN]);
        });
        it("isPositive", function () {
            runValidator(deep_validator_1.DeepValidator.isPositive, [1, 2, 3, Infinity], [null, 0, true, false, "a", [[]], {}, void 0, -Infinity, NaN]);
        });
        it("isNumberOrNumeric", function () {
            runValidator(deep_validator_1.DeepValidator.isNumberOrNumeric, [0, 1, "1", 1.5, "1.5", NaN, Infinity], [null, true, false, "a", [[]], {}, void 0]);
        });
        it("isObject", function () {
            runValidator(deep_validator_1.DeepValidator.isObject, [{}], [null, 0, true, false, "a", [[]], void 0]);
        });
        it("isInRange", function () {
            runValidator(deep_validator_1.DeepValidator.isInRange, [[1, 0, 2]], [null, 0, true, false, "a", [[]], {}, [0, 1, 2], [3, 0, 2]]);
        });
        it("isInsignificant", function () {
            runValidator(deep_validator_1.DeepValidator.isInsignificant, ["", [[]], {}, 0, false, null, void 0], [{ a: 1 }, ["a"], "a", 1, true]);
        });
        it("isSignificant", function () {
            runValidator(deep_validator_1.DeepValidator.isSignificant, [{ a: 1 }, ["a"], "a", 1, true], ["", [[]], {}, 0, false, null, void 0]);
        });
        it("isVoid", function () {
            runValidator(deep_validator_1.DeepValidator.isVoid, [void 0], [null, 0, true, false, "a", [[]], {}]);
        });
        it("isNotVoid", function () {
            runValidator(deep_validator_1.DeepValidator.isNotVoid, [null, 0, true, false, "a", [[]], {}], [void 0]);
        });
        it("toInt", function () {
            runValidator(deep_validator_1.DeepValidator.toInt, [1, "1", 123.5, "123.5"], [null, true, false, "", [[]], {}, { a: 1 }, ["a"], "a"], function (v) { return _.isNumber(v); }, function (v) { return isNaN(v); });
            expect(deep_validator_1.DeepValidator.toInt(123)).toBe(123);
            expect(deep_validator_1.DeepValidator.toInt("123.5")).toBe(123);
        });
        it("toFloat", function () {
            runValidator(deep_validator_1.DeepValidator.toFloat, [1, "1", 123.5, "123.5"], [null, true, false, "", [[]], {}, { a: 1 }, ["a"], "a"], function (v) { return _.isNumber(v); }, function (v) { return isNaN(v); });
            expect(deep_validator_1.DeepValidator.toFloat(123)).toBe(123);
            expect(deep_validator_1.DeepValidator.toFloat("123.5")).toBe(123.5);
        });
        it("toNullIfEmpty", function () {
            runValidator(deep_validator_1.DeepValidator.toNullIfEmpty, ["", [[]], {}], [{ a: 1 }, ["a"], "a"], null, true);
        });
        it("toNullIfInsignificant", function () {
            runValidator(deep_validator_1.DeepValidator.toNullIfInsignificant, ["", [[]], {}, 0, false, null, void 0], [{ a: 1 }, ["a"], "a", 1, true], null, true);
        });
        it("toString", function () {
            expect(deep_validator_1.DeepValidator.toString(null)).toBe('');
            expect(deep_validator_1.DeepValidator.toString(void 0)).toBe('');
            expect(deep_validator_1.DeepValidator.toString(123)).toBe('123');
        });
        it("clean", function () {
            v = new deep_validator_1.DeepValidator({
                'a': [
                    'isObject', 'clean'
                ],
                'a.b': [
                    'isObject', 'clean'
                ],
                'a.b.c': [],
                'a.c': []
            }, [
                'clean'
            ]);
            expect(v.validate(t = { a: { b: { c: 3, d: 4 }, c: { x: 1 }, d: 2 }, e: 2 })).toBe(true);
            expect(t).toEqual({ a: { b: { c: 3 }, c: { x: 1 } } });
        });
        it("filter", function () {
            v = new deep_validator_1.DeepValidator({
                'a': [
                    'isObject', ['filter', /x/]
                ],
                'a.b': [
                    'isObject', ['filter', /y/]
                ]
            }, [['filter', /q/]]);
            expect(v.validate(t = { a: { b: { $x: 'y', y: 2, c: [] }, $x: 1, $y: 'x', z: 3 }, g: 'aqa', h: 123, i: 'a' })).toBe(true);
            expect(t).toEqual({ a: { b: { $x: 'y', c: [] }, $y: 'x' }, g: 'aqa' });
        });
        it("filter with custom handler", function () {
            v = new deep_validator_1.DeepValidator({
                'a': [
                    'isObject', ['filter', function (v) { return _.isObjectLike(v) || /x/.test(v); }]
                ],
                'a.b': [
                    'isObject', ['filter', function (v) { return _.isObjectLike(v) || /y/.test(v); }]
                ]
            }, [['filter', function (v) { return _.isObjectLike(v) || /q/.test(v); }]]);
            expect(v.validate(t = { a: { b: { $x: 'y', y: 2, c: [] }, $x: 1, $y: 'x', z: 3 }, g: 'aqa', h: 123, i: 'a' })).toBe(true);
            expect(t).toEqual({ a: { b: { $x: 'y', c: [] }, $y: 'x' }, g: 'aqa' });
        });
        it("filter with no object allow", function () {
            v = new deep_validator_1.DeepValidator({
                'a': [
                    'isObject', ['filter', /x/]
                ],
                'a.b': [
                    'isObject', ['filter', /y/, false]
                ]
            });
            expect(v.validate(t = { a: { b: { $x: 'y', y: 2, c: [] }, $x: 1, $y: 'x', z: 3 } })).toBe(true);
            expect(t).toEqual({ a: { b: { $x: 'y' }, $y: 'x' } });
        });
        it("filterKeys", function () {
            v = new deep_validator_1.DeepValidator({
                'a': [
                    'isObject', ['filterKeys', /x|b/]
                ],
                'a.b': [
                    'isObject', ['filterKeys', /y/]
                ]
            }, [['filterKeys', /a/]]);
            expect(v.validate(t = { a: { b: { $x: 1, y: 2 }, $x: 1, $y: 2, z: 3 }, g: 'aqa', ha: 123, i: 'a' })).toBe(true);
            expect(t).toEqual({ a: { b: { y: 2 }, $x: 1 }, ha: 123 });
        });
        it("filterKeys with custom handler", function () {
            v = new deep_validator_1.DeepValidator({
                'a': [
                    'isObject', ['filterKeys', function (v) { return /x|b/.test(v); }]
                ],
                'a.b': [
                    'isObject', ['filterKeys', function (v) { return /y/.test(v); }]
                ]
            }, [['filterKeys', function (v) { return /a/.test(v); }]]);
            expect(v.validate(t = { a: { b: { $x: 1, y: 2 }, $x: 1, $y: 2, z: 3 }, g: 'aqa', ha: 123, i: 'a' })).toBe(true);
            expect(t).toEqual({ a: { b: { y: 2 }, $x: 1 }, ha: 123 });
        });
        it("filterMongoDocKeys", function () {
            v = new deep_validator_1.DeepValidator({
                'a': [
                    'isObject', 'filterMongoDocKeys'
                ],
                'a.b': [
                    'isObject', 'filterMongoDocKeys'
                ]
            });
            expect(v.validate(t = { a: { b: { $x: 1, y: 2 }, $x: 1, $y: 2, z: 3 } })).toBe(true);
            expect(t).toEqual({ a: { b: { y: 2 }, z: 3 } });
        });
    });
});
