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
    var fixtures = {
        default: [1],
        showAs: ["b"],
        isExists: ["not exists"],
        isInRange: [0, 1, "not in range"],
        isNegative: ["not number negative"],
        isNumber: ["not number"],
        isNumberOrNumeric: ["not number nor numeric"],
        isPositive: ["not number positive"],
        isString: ["not string"]
    };
    describe("Flow builder", function () {
        it("Common", function () {
            var list = [];
            var elem;
            _.each(fixtures, function (v, k) {
                var flow = deep_validator_1.Flow[k].apply(deep_validator_1.Flow, v);
                if (k.substr(0, 2) === 'is') {
                    expect(flow.flow).toEqual([elem = [k + ':' + v[v.length - 1]].concat(v.slice(0, v.length - 1))]);
                }
                else {
                    expect(flow.flow).toEqual([elem = [k].concat(v)]);
                }
                list.push(elem);
                if (k.substr(0, 2) === 'is') {
                    var flow_1 = deep_validator_1.Flow[k].apply(deep_validator_1.Flow, v.slice(0, v.length - 1));
                    expect(flow_1.flow).toEqual([[k].concat(v.slice(0, v.length - 1))]);
                }
            });
            var flow;
            _.each(fixtures, function (v, k) {
                if (flow === void 0) {
                    flow = deep_validator_1.Flow[k].apply(deep_validator_1.Flow, v);
                }
                else {
                    flow[k].apply(flow, v);
                }
            });
            expect(flow.flow).toEqual(list);
        });
    });
});
