(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", "../src/deep-validator"], factory);
    }
})(function (require, exports) {
    "use strict";
    var deep_validator_1 = require("../src/deep-validator");
    var validator = new deep_validator_1.DeepValidator({
        "firstName": [
            "isExists:not provided", "isString:invalid", ["isLength:invalid length", 1, 20]
        ],
        "lastName": [
            "isExists:not provided", "isString:invalid", ["isLength:invalid length", 1, 20]
        ],
        "middleName": [
            "isString:invalid", ["isLength:invalid length", 1, 20]
        ],
        "birthday": [
            "isExists:not provided", "isDate:invalid", "toDate", function (val) {
                if (val.getTime() < Date.now()) {
                    return true;
                }
                return "invalid";
            }
        ],
        "contacts": [
            "isArray:invalid", ["isLength:invalid length", 1]
        ],
        "contacts.[]": [
            "isEmail:invalid"
        ]
    });
    exports.route = function (request, response) {
        if (validator.validate(request.body) !== true) {
            response.status(400).send(validator.getErrors());
        }
        else {
            response.status(200).send("ok");
        }
    };
});
