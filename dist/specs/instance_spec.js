(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", "../src/deep-validator"], factory);
    }
})(function (require, exports) {
    var deep_validator_1 = require("../src/deep-validator");
    var v, t, f;
    describe("Instance", function () {
        describe("validation running", function () {
            it("should throw exception on pending includes", function () {
                v = new deep_validator_1.DeepValidator({
                    a: [
                        ["include", "test"],
                    ],
                });
                f = function () { return v.validate({}); };
                expect(f).toThrow(new Error("Included validator is still pending for definition: test"));
            });
            it("should fail with max depth of 3 on self referenced include", function () {
                v = new deep_validator_1.DeepValidator({
                    a: [
                        ["include", "self"],
                    ],
                    b: [
                        "required:required", "isNumber:not number",
                    ],
                }).setMessageMaxDepthReached("max depth reached").maxDepth(3);
                expect(v.validate({ a: { a: { a: { b: 4 }, b: 3 }, b: 2 }, b: 1, })).toBe(false);
                expect(v.getErrors()).toEqual({ "a.a.a.*": "max depth reached" });
            });
        });
    });
});
