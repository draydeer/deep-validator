
import {DeepValidator} from "../src/deep-validator";

var validator = new DeepValidator({
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
        "isExists:not provided", "isDate:invalid", "toDate", (val): any => {
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

export let route = (request, response) => {
    if (validator.validate(request.body) !== true) {
        response.status(400).send(validator.getErrors());
    } else {
        response.status(200).send("ok");
    }
};
