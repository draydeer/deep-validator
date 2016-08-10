

import * as _ from "lodash";
import {DeepValidator} from "../src/deep-validator";


let v, t;


describe("Flow", () => {
    it("Array allow", () => {
        v = new DeepValidator({
            a: [
                "isString:not string"
            ],
            b: [
                "isNumber:not number"
            ]
        });

        expect(v.setMessageInvalid("invalid").validate([{a: 5}])).toBe(false);

        expect(v.getErrors()).toEqual({"??": "invalid"});

        v.arrayAllow();

        expect(v.validate([{a: 5}])).toBe(false);

        expect(v.getErrors()).toEqual({"0.a": "not string"});

        v.arrayAllow(false);

        expect(v.setMessageInvalid("invalid ...").validate([{a: 5}])).toBe(false);

        expect(v.getErrors()).toEqual({"??": "invalid ..."});
    });

    it("Single, tryAll", () => {
        v = new DeepValidator({
            a: [
                "isString:not string"
            ],
            b: [
                "isNumber:not number"
            ]
        });

        expect(v.validate({a: 5, b: "5"})).toBe(false);

        expect(v.getErrors()).toEqual({a: "not string"});

        v.tryAll();
        
        expect(v.validate({a: 5, b: "5"})).toBe(false);
        
        expect(v.getErrors()).toEqual({a: "not string", b: "not number"});

        v.tryAll(false);

        expect(v.validate({a: 5, b: "5"})).toBe(false);

        expect(v.getErrors()).toEqual({a: "not string"});
    });

    it("Strict", () => {
        v = new DeepValidator({
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

        expect(v.getErrors()).toEqual({a: "is missing"});

        v.strict(false);

        expect(v.validate({})).toBe(true);

        expect(v.getErrors()).toEqual({});
    });

    it("Nested [DeepValidator] error messages combination", () => {
        v = new DeepValidator({
            a: [
                new DeepValidator({
                    b: [
                        "isString:not string"
                    ]
                })
            ],
            b: [
                "isNumber:not number"
            ]
        });

        expect(v.tryAll().validate({a: {b: 5}, b: 5})).toBe(false);

        expect(v.getErrors()).toEqual({"a.b": "not string"});
    });

    it("Custom validator/sanitizer", () => {
        v = new DeepValidator({
            a: [
                (v, k, d) => {
                    d[k] = 321;

                    return "error";
                }
            ],
        });

        expect(v.validate({a: 123})).toBe(false);

        expect(v.getErrors()).toEqual({"a": "error"});

        v = new DeepValidator({
            a: [
                (v, k, d) => {
                    d[k] = 321;

                    return true;
                }
            ],
        });

        expect(v.validate(t = {a: 123})).toBe(true);

        expect(t).toEqual({a: 321});
    });

    it("If", () => {
        v = new DeepValidator({
            a: [
                ['if', 'isString', new DeepValidator({a: ['isNumber:not number']}), new DeepValidator({a: ['isString:not string']})]
            ],
        });

        expect(v.validate({a: {a: 1}})).toBe(false);

        expect(v.getErrors()).toEqual({"a.a": "not string"});

        v = new DeepValidator({
            a: [
                ['if', 'isObject', new DeepValidator({a: ['isNumber:not number']}), new DeepValidator({a: ['isString:not string']})]
            ],
        });

        expect(v.validate({a: {a: 1}})).toBe(true);

        expect(v.getErrors()).toEqual({});
    });
});
