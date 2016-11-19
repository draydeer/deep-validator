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
    var v, t, f;
    describe("Flow", function () {
        describe("include", function () {
            it("should initiate self reference", function () {
                v = new deep_validator_1.DeepValidator({
                    a: [
                        ["include", "self"]
                    ]
                });
                expect(v._includedPending.length).toBe(0);
                expect(v._schema.properties.a.current.v[0].validator).toBe(v);
            });
            it("should pend for external", function () {
                v = new deep_validator_1.DeepValidator({
                    a: [
                        ["include", "test"]
                    ]
                });
                expect(v._includedPending.length).toBe(1);
                expect(v._includedPending[0]).toBe("test");
            });
            it("should link external on definition", function () {
                v = new deep_validator_1.DeepValidator({
                    a: [
                        ["include", "test"]
                    ]
                });
                t = new deep_validator_1.DeepValidator({}).setName("test");
                v.include(t);
                expect(v._includedPending.length).toBe(0);
                expect(v._schema.properties.a.current.v[0].validator).toBe(t);
            });
        });
        it("isExists, default, showAs, custom", function () {
            v = new deep_validator_1.DeepValidator({
                a: [
                    "isExists:not exists", "showAs:aaa",
                ],
            });
            expect(v.validate({})).toBe(false);
            expect(v.getErrors()).toEqual({ "aaa": "not exists" });
            v = new deep_validator_1.DeepValidator({
                a: [
                    "required:not exists", "showAs:aaa",
                ],
            });
            expect(v.validate({})).toBe(false);
            expect(v.getErrors()).toEqual({ "aaa": "not exists" });
            v = new deep_validator_1.DeepValidator({
                a: [
                    ["default", 1],
                ],
            });
            expect(v.validate(t = {})).toBe(true);
            expect(t).toEqual({ a: 1 });
            v = new deep_validator_1.DeepValidator({
                a: [
                    "isNumber", ["default", 1],
                ],
            });
            expect(v.validate(t = { a: 5 })).toBe(true);
            expect(t).toEqual({ a: 5 });
            v = new deep_validator_1.DeepValidator({
                b: [
                    [
                        "custom",
                        function (key, ref) {
                            return "c" in ref;
                        }
                    ]
                ]
            });
            expect(v.validate(t = { a: 5 })).toBe(true);
            expect(t).toEqual({ a: 5 });
            f = function () { return new deep_validator_1.DeepValidator({ a: [["custom", null]] }); };
            expect(f).toThrow(new Error("Validator of [custom] must be a function."));
        });
        it("Errors iterator", function () {
            v = new deep_validator_1.DeepValidator({
                a: [
                    "isExists:not exists"
                ],
                b: [
                    "isString:not string"
                ]
            });
            expect(v.tryAll().validate({ b: 1 })).toBe(false);
            expect(v.getNextError()).toEqual({ field: "a", message: "not exists" });
            expect(v.getNextError()).toEqual({ field: "b", message: "not string" });
            expect(v.getNextError()).toBe(void 0);
        });
        it("Errors", function () {
            f = function () { return new deep_validator_1.DeepValidator({ a: ["dummy"] }); };
            expect(f).toThrow(new Error("Validator is not defined: dummy"));
            f = function () { return new deep_validator_1.DeepValidator({ a: [["if"]] }); };
            expect(f).toThrow(new Error("Validator of [if] must contain a condition checker and sub-flows."));
            f = function () { return new deep_validator_1.DeepValidator({ a: [["if", "dummy", new deep_validator_1.DeepValidator({}), new deep_validator_1.DeepValidator({})]] }); };
            expect(f).toThrow(new Error("Condition checker is not defined or invalid: dummy"));
            f = function () { return new deep_validator_1.DeepValidator({ a: [["if", "dummy", 1, 2]] }); };
            expect(f).toThrow(new Error("Validator of [if] must define a valid sub-flows instances of [DeepValidator]."));
            f = function () { return new deep_validator_1.DeepValidator({ a: [["if", "dummy", {}, 2]] }); };
            expect(f).toThrow(new Error("Validator of [if] must define a valid sub-flows instances of [DeepValidator]."));
        });
        it("Array allow", function () {
            v = new deep_validator_1.DeepValidator({
                a: [
                    "isString:not string"
                ],
                b: [
                    "isNumber:not number"
                ]
            });
            expect(v.setMessageInvalid("invalid").validate([{ a: 5 }])).toBe(false);
            expect(v.getErrors()).toEqual({ "??": "invalid" });
            v.arrayAllow();
            expect(v.validate([{ a: 5 }])).toBe(false);
            expect(v.getErrors()).toEqual({ "0.a": "not string" });
            v.arrayAllow(false);
            expect(v.setMessageInvalid("invalid ...").validate([{ a: 5 }])).toBe(false);
            expect(v.getErrors()).toEqual({ "??": "invalid ..." });
        });
        it("Single, tryAll", function () {
            v = new deep_validator_1.DeepValidator({
                a: [
                    "isString:not string"
                ],
                b: [
                    "isNumber:not number"
                ]
            });
            expect(v.validate({ a: 5, b: "5" })).toBe(false);
            expect(v.getErrors()).toEqual({ a: "not string" });
            v.tryAll();
            expect(v.validate({ a: 5, b: "5" })).toBe(false);
            expect(v.getErrors()).toEqual({ a: "not string", b: "not number" });
            v.tryAll(false);
            expect(v.validate({ a: 5, b: "5" })).toBe(false);
            expect(v.getErrors()).toEqual({ a: "not string" });
        });
        it("Strict", function () {
            v = new deep_validator_1.DeepValidator({
                a: [
                    "isString:not string"
                ],
                b: [
                    "isNumber:not number"
                ]
            });
            expect(v.validate({})).toBe(true);
            expect(v.getErrors()).toEqual({});
            v.strict().setMessageMissingKey("is missing");
            expect(v.validate({})).toBe(false);
            expect(v.getErrors()).toEqual({ a: "is missing" });
            v.strict(false);
            expect(v.validate({})).toBe(true);
            expect(v.getErrors()).toEqual({});
        });
        it("Nested [DeepValidator] error messages combination", function () {
            v = new deep_validator_1.DeepValidator({
                a: [
                    new deep_validator_1.DeepValidator({
                        b: [
                            "isString:not string"
                        ]
                    })
                ],
                b: [
                    "isNumber:not number"
                ]
            });
            expect(v.tryAll().validate({ a: { b: 5 }, b: 5 })).toBe(false);
            expect(v.getErrors()).toEqual({ "a.b": "not string" });
            v = new deep_validator_1.DeepValidator({
                a: [
                    {
                        b: [
                            "isString:not string"
                        ]
                    }
                ],
                b: [
                    "isNumber:not number"
                ]
            });
            expect(v.tryAll().validate({ a: { b: 5 }, b: 5 })).toBe(false);
            expect(v.getErrors()).toEqual({ "a.b": "not string" });
        });
        it("Custom validator/sanitizer", function () {
            v = new deep_validator_1.DeepValidator({
                a: [
                    function (v, k, d) {
                        d[k] = 321;
                        return "error";
                    }
                ],
            });
            expect(v.validate({ a: 123 })).toBe(false);
            expect(v.getErrors()).toEqual({ "a": "error" });
            v = new deep_validator_1.DeepValidator({
                a: [
                    function (v, k, d) {
                        d[k] = 321;
                        return true;
                    }
                ],
            });
            expect(v.validate(t = { a: 123 })).toBe(true);
            expect(t).toEqual({ a: 321 });
        });
        it("If", function () {
            v = new deep_validator_1.DeepValidator({
                "a.b": [
                    [
                        'if',
                        'isString',
                        new deep_validator_1.DeepValidator({ b: ['isNumber:not number'] }),
                        new deep_validator_1.DeepValidator({ b: ['isString:not string'] })
                    ]
                ],
            });
            expect(v.validate({ a: { b: 1 } })).toBe(false);
            expect(v.getErrors()).toEqual({ "a.b": "not string" });
            v = new deep_validator_1.DeepValidator({
                "a.b": [
                    [
                        'if',
                        'isString',
                        { b: ['isString:not string'] },
                        { b: ['isNumber:not number'] }
                    ]
                ],
            });
            expect(v.validate({ a: { b: 1 } })).toBe(true);
            expect(v.getErrors()).toEqual({});
            v = new deep_validator_1.DeepValidator({
                "a.b": [
                    [
                        'if',
                        function (val) { return _.isString(val); },
                        { b: ['isString:not string'] },
                        { b: ['isNumber:not number'] }
                    ]
                ],
            });
            expect(v.validate({ a: { b: 1 } })).toBe(true);
            expect(v.getErrors()).toEqual({});
        });
        it("List", function () {
            v = new deep_validator_1.DeepValidator({
                a: [
                    ['isArray:not array']
                ],
                'a.[]': [
                    'isString:not string'
                ]
            });
            expect(v.validate({ a: ["a", "b", 1] })).toBe(false);
            expect(v.getErrors()).toEqual({ "a.2": "not string" });
            expect(v.validate({ a: ["a", "b", "c"] })).toBe(true);
            expect(v.getErrors()).toEqual({});
        });
        it("Max depth", function () {
            v = new deep_validator_1.DeepValidator({
                a: [
                    'isExists:required'
                ],
                'a.b': [
                    'isExists:required'
                ],
                'a.b.c': [
                    'isExists:required'
                ]
            }).setMessageMaxDepthReached('max depth reached').maxDepth(2);
            expect(v.validate({ a: { b: { c: 1 } } })).toBe(false);
            expect(v.getErrors()).toEqual({ 'a.b.*': 'max depth reached' });
            v = new deep_validator_1.DeepValidator({
                a: [
                    'isExists:required',
                    {
                        'b': [
                            'isExists:required'
                        ],
                        'b.c': [
                            'isExists:required'
                        ]
                    }
                ]
            }).setMessageMaxDepthReached('max depth reached').maxDepth(2);
            expect(v.validate({ a: { b: { c: 1 } } })).toBe(false);
            expect(v.getErrors()).toEqual({ 'a.b.*': false });
            v = new deep_validator_1.DeepValidator({
                a: [
                    'isExists:required',
                    {
                        'b': [
                            'isExists:required'
                        ],
                        'b.c': [
                            'isExists:required'
                        ]
                    }
                ]
            }).setMessageMaxDepthReached('max depth reached').maxDepthPassToNested(false).maxDepth(2);
            expect(v.validate({ a: { b: { c: 1 } } })).toBe(true);
        });
        it("Translator", function () {
            var mes = {
                _not_exists: 'not exists'
            };
            v = new deep_validator_1.DeepValidator({
                a: [
                    "isExists:_not_exists"
                ],
                b: [
                    "isString:_not_string"
                ]
            }).setTranslator(function (message) {
                return mes[message] || message;
            }).tryAll();
            expect(v.validate({ b: 123 })).toBe(false);
            expect(v.getErrors()).toEqual({ a: "not exists", b: "_not_string" });
        });
    });
});
