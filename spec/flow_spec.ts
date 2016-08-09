

import * as _ from "lodash";
import {DeepValidator} from "../src/deep-validator";


describe("Flow", () => {
    it("Array allow", () => {
        let v = new DeepValidator({
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
        let v = new DeepValidator({
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
        let v = new DeepValidator({
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
});
