

import {DeepValidator} from "../src/deep-validator";


let fixtures = {
    a: {
        a: 1,
        b: "1",
        c: false,
        d: {
            a: 2,
            b: [
                "test"
            ]
        }
    }
};


describe("Custom validators.", () => {
    it("isContainsOrNull", () => {
        expect(DeepValidator.isContainsOrNull(null, ["a", "b", "c"])).toBe(true);

        expect(DeepValidator.isContainsOrNull(true, ["a", "b", "c"])).toBe(false);
    });

    it("isContains", () => {
        expect(DeepValidator.isContains(fixtures.a, ["a", "b", "c"])).toBe(true);

        expect(DeepValidator.isContains(fixtures.a, ["a", "b", "e"])).toBe(false);
    });

    it("isNotContains", () => {
        expect(DeepValidator.isNotContains(fixtures.a, ["e", "f", "g"])).toBe(true);

        expect(DeepValidator.isNotContains(fixtures.a, ["a", "b", "e"])).toBe(false);
    });

    it("isContainsOnly", () => {
        expect(DeepValidator.isContainsOnly(fixtures.a, ["a", "b", "c", "d"])).toBe(true);

        expect(DeepValidator.isContainsOnly(fixtures.a, ["a", "b", "e"])).toBe(false);
    });

    it("isGreater", () => {
        expect(DeepValidator.isGreater(0, 0)).toBe(false);

        expect(DeepValidator.isGreater(1, 0)).toBe(true);

        expect(DeepValidator.isGreater(0, 1)).toBe(false);

        expect(DeepValidator.isGreater("1", 0)).toBe(false);
    });

    it("isGreaterOrEqual", () => {
        expect(DeepValidator.isGreaterOrEqual(0, 0)).toBe(true);

        expect(DeepValidator.isGreaterOrEqual(1, 0)).toBe(true);

        expect(DeepValidator.isGreaterOrEqual(0, 1)).toBe(false);

        expect(DeepValidator.isGreaterOrEqual("1", 0)).toBe(false);
    });

    it("isLess", () => {
        expect(DeepValidator.isLess(0, 0)).toBe(false);

        expect(DeepValidator.isLess(1, 0)).toBe(false);

        expect(DeepValidator.isLess(0, 1)).toBe(true);

        expect(DeepValidator.isLess("0", 1)).toBe(false);
    });

    it("isLessOrEqual", () => {
        expect(DeepValidator.isLessOrEqual(0, 0)).toBe(true);

        expect(DeepValidator.isLessOrEqual(1, 0)).toBe(false);

        expect(DeepValidator.isLessOrEqual(0, 1)).toBe(true);

        expect(DeepValidator.isLessOrEqual("0", 1)).toBe(false);
    });
});
