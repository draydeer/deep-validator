var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", "lodash", "validator"], factory);
    }
})(function (require, exports) {
    "use strict";
    var _ = require("lodash");
    var validator = require("validator");
    var ValidatorEntry = (function () {
        function ValidatorEntry(validator, message, args, notExtendErrors) {
            this.args = args || [];
            this.isHandler = _.isFunction(validator);
            this.isNested = validator instanceof DeepValidator;
            this.isValidator = this.isHandler ||
                (validator instanceof DeepValidator) ||
                (_.isString(validator)
                    ? (validator.substr(0, 2) === "is" || validator in DeepValidator.isValidators)
                    : false);
            this.message = message !== void 0 ? message : null;
            this.notExtendErrors = notExtendErrors === true || (validator instanceof DeepValidatorMerged);
            this.validator = validator;
        }
        return ValidatorEntry;
    }());
    exports.ValidatorEntry = ValidatorEntry;
    var ValidatorEntrySet = (function () {
        function ValidatorEntrySet() {
            // current key validation flow
            this.current = new ValidatorEntrySetCurrent();
            // validators on sub properties
            this.properties = {};
        }
        return ValidatorEntrySet;
    }());
    exports.ValidatorEntrySet = ValidatorEntrySet;
    var ValidatorEntrySetCurrent = (function () {
        function ValidatorEntrySetCurrent() {
            // validation flow descriptors list
            this.v = [];
        }
        return ValidatorEntrySetCurrent;
    }());
    exports.ValidatorEntrySetCurrent = ValidatorEntrySetCurrent;
    var FlowBuilder = (function () {
        function FlowBuilder() {
            this.flow = [];
        }
        FlowBuilder.prototype.default = function (value) {
            this.flow.push(["default", value]);
            return this;
        };
        FlowBuilder.prototype.if = function (checker, trueFlow, falseFlow) {
            this.flow.push(["if", checker, trueFlow, falseFlow]);
            return this;
        };
        FlowBuilder.prototype.isExists = function (message) {
            this.flow.push([message ? "isExists:" + message : "isExists"]);
            return this;
        };
        FlowBuilder.prototype.isInRange = function (min, max, message) {
            this.flow.push([message ? "isInRange:" + message : "isInRange", min, max]);
            return this;
        };
        FlowBuilder.prototype.isNegative = function (message) {
            this.flow.push([message ? "isNegative:" + message : "isNegative"]);
            return this;
        };
        FlowBuilder.prototype.isNumber = function (message) {
            this.flow.push([message ? "isNumber:" + message : "isNumber"]);
            return this;
        };
        FlowBuilder.prototype.isNumberOrNumeric = function (message) {
            this.flow.push([message ? "isNumberOrNumeric:" + message : "isNumberOrNumeric"]);
            return this;
        };
        FlowBuilder.prototype.isPositive = function (message) {
            this.flow.push([message ? "isPositive:" + message : "isPositive"]);
            return this;
        };
        FlowBuilder.prototype.isString = function (message) {
            this.flow.push([message ? "isString:" + message : "isString"]);
            return this;
        };
        FlowBuilder.prototype.required = function (message) {
            this.flow.push([message ? "required:" + message : "required"]);
            return this;
        };
        FlowBuilder.prototype.showAs = function (name) {
            this.flow.push(["showAs", name]);
            return this;
        };
        return FlowBuilder;
    }());
    exports.FlowBuilder = FlowBuilder;
    var Flow = (function () {
        function Flow() {
        }
        Flow.default = function (value) {
            return new FlowBuilder().default(value);
        };
        Flow.if = function (checker, trueBranch, falseBranch) {
            return new FlowBuilder().if(checker, trueBranch, falseBranch);
        };
        Flow.isExists = function (message) {
            return new FlowBuilder().isExists(message);
        };
        Flow.isInRange = function (min, max, message) {
            return new FlowBuilder().isInRange(min, max, message);
        };
        Flow.isNegative = function (message) {
            return new FlowBuilder().isNegative(message);
        };
        Flow.isNumber = function (message) {
            return new FlowBuilder().isNumber(message);
        };
        Flow.isNumberOrNumeric = function (message) {
            return new FlowBuilder().isNumberOrNumeric(message);
        };
        Flow.isPositive = function (message) {
            return new FlowBuilder().isPositive(message);
        };
        Flow.isString = function (message) {
            return new FlowBuilder().isString(message);
        };
        Flow.required = function (message) {
            return new FlowBuilder().required(message);
        };
        Flow.showAs = function (name) {
            return new FlowBuilder().showAs(name);
        };
        return Flow;
    }());
    exports.Flow = Flow;
    var validatorIfInvalidConditionCheckerError = new Error("Validator of [if] must define a valid condition checker.");
    var validatorIfInvalidError = new Error("Validator of [if] must contain a condition checker and sub-flows.");
    var validatorIfInvalidSubFlowError = new Error("Validator of [if] must define a valid sub-flows instances of [DeepValidator].");
    var DeepValidator = (function () {
        /**
         * Constructor.
         *
         * @param schema Data validation schema.
         * @param rootFlow Flow to be run on the root value.
         */
        function DeepValidator(schema, rootFlow) {
            this.errors = {};
            this.passed = false;
            this.schema = null;
            this._arrayAllow = false;
            this._included = {};
            this._includedPending = [];
            this._maxDepth = 99999999;
            this._maxDepthPassToNested = true;
            this._messageMaxDepth = false;
            this._messageInvalid = false;
            this._messageMissingKey = false;
            this._messageNotObject = false;
            this._name = "included";
            this._nextError = null;
            this._schema = new ValidatorEntrySet();
            this._schemaAsArray = new ValidatorEntrySet();
            this._schemaCoverAll = false;
            this._strict = false;
            this._translator = null;
            this._tryAll = false;
            if (rootFlow) {
                this._schemaCoverAll = true;
                schema = _.fromPairs(_.map(schema, function (v, k) { return ["$." + k, v]; }));
                schema["$"] = rootFlow;
            }
            this._compile(schema);
            this._translator = this._translate;
        }
        /**
         *
         */
        DeepValidator.prototype._addError = function (errors, key, value, path) {
            path = path ? path + "." + key : key;
            // root flow extension
            if (path.substr(0, 2) === "$.") {
                path = path.substr(2);
            }
            errors[path] = this._translator(value);
            return this;
        };
        /**
         *
         */
        DeepValidator.prototype._compile = function (schema) {
            var _this = this;
            this._includedPending = [];
            this.schema = schema;
            _.each(schema, function (op, k) {
                var elem = _this._schema;
                var last = _this._schema;
                k.split(".").forEach(function (v) {
                    last = elem;
                    if (elem.properties[k = v] === void 0) {
                        elem = elem.properties[v] = new ValidatorEntrySet();
                    }
                    else {
                        elem = elem.properties[v];
                    }
                    if (k === "[]") {
                        last.current.v.push(new ValidatorEntry("isArray"));
                    }
                });
                if (op instanceof FlowBuilder) {
                    op = op.flow;
                }
                var es = last.properties[k];
                (_.isArray(op) ? op : [op]).forEach(function (v) {
                    _.isArray(v) || (v = [v]);
                    if (v[0] instanceof DeepValidator) {
                        es.current.v.push(new ValidatorEntry(new Validator(v[0].schema)));
                    }
                    else if (_.isFunction(v[0])) {
                        es.current.v.push(new ValidatorEntry(v[0]));
                    }
                    else if (_.isString(v[0])) {
                        var pair = v[0].split(":");
                        if (pair[0] === "custom") {
                            if (_.isFunction(v[1])) {
                                es.current.custom = v[1];
                            }
                            else {
                                throw new Error("Validator of [custom] must be a function.");
                            }
                        }
                        else if (pair[0] === "default") {
                            es.current.def = v[1];
                        }
                        else if (pair[0] === "include" || pair[0] === "self") {
                            if (pair[0] === "self") {
                                v[1] = pair[0];
                            }
                            if (false === (v[1] in _this._included) && v[1] !== "self") {
                                _this._includedPending.push(v[1]);
                            }
                            else {
                                es.current.v.push(new ValidatorEntry(v[1] === "self" ? _this : _this._included[v[1]], null, v.slice(2)));
                            }
                        }
                        else if (pair[0] === "isExists" || pair[0] === "required") {
                            es.current.strict = pair[1] || false;
                        }
                        else if (pair[0] === "showAs") {
                            es.current.showAs = pair[1] || false;
                        }
                        else if (DeepValidator[pair[0]]) {
                            var notExtendErrors = false;
                            // special for [if]
                            if (pair[0] === "if") {
                                if (v.length !== 4) {
                                    throw validatorIfInvalidError;
                                }
                                var cond = _.isArray(v[1]) ? v[1][0] : v[1];
                                if (_.isString(cond) === false && _.isFunction(cond) === false) {
                                    throw validatorIfInvalidConditionCheckerError;
                                }
                                if (!(v[2] instanceof DeepValidator)) {
                                    if (DeepValidator.isObject(v[2])) {
                                        v[2] = new DeepValidator(v[2]);
                                    }
                                    else {
                                        throw validatorIfInvalidSubFlowError;
                                    }
                                }
                                if (!(v[3] instanceof DeepValidator)) {
                                    if (DeepValidator.isObject(v[3])) {
                                        v[3] = new DeepValidator(v[3]);
                                    }
                                    else {
                                        throw validatorIfInvalidSubFlowError;
                                    }
                                }
                                if (_.isFunction(cond) === false) {
                                    if (cond in DeepValidator && cond.substr(0, 2) === "is") {
                                    }
                                    else {
                                        throw new Error("Condition checker is not defined or invalid: " + cond);
                                    }
                                }
                                else {
                                    es.current.v.push(new ValidatorEntry("ifCustom", null, v.slice(1), true));
                                    return;
                                }
                                notExtendErrors = true;
                            }
                            es.current.v.push(new ValidatorEntry(pair[0], pair[1], v.slice(1), notExtendErrors));
                        }
                        else {
                            throw new Error("Validator is not defined: " + pair[0]);
                        }
                    }
                    else if (DeepValidator.isObject(v[0])) {
                        es.current.v.push(new ValidatorEntry(new DeepValidator(v[0])));
                    }
                    else {
                        throw new Error("Invalid value: " + String(v[0]));
                    }
                });
            });
            this._schemaAsArray.properties["[]"] = this._schema;
            return this;
        };
        /**
         * Dummy translator.
         */
        DeepValidator.prototype._translate = function (message) {
            return message;
        };
        /**
         *
         */
        DeepValidator.prototype._validate = function (data, schema, tryAll, errors, strict, path, root, depth, key, ref) {
            var _this = this;
            if (tryAll === void 0) { tryAll = false; }
            if (errors === void 0) { errors = {}; }
            if (strict === void 0) { strict = false; }
            if (path === void 0) { path = ""; }
            if (root === void 0) { root = ""; }
            if (depth === void 0) { depth = 0; }
            if (this._maxDepth < depth) {
                this._addError(errors, "*", this._messageMaxDepth, root);
                return false;
            }
            var isObject = _.isObject(data);
            // apply validators/sanitizers
            for (var i = 0, l = schema.current.v.length; i < l; i++) {
                var entry = schema.current.v[i];
                var entryValidator = entry.validator;
                var isValidator = true;
                var result = true;
                // if nested validator
                if (entry.isNested) {
                    var validator_1 = entryValidator;
                    var oldMaxDepth = validator_1.getMaxDepth();
                    if (this._maxDepthPassToNested) {
                        validator_1.maxDepth(this._maxDepth);
                    }
                    var nestedErrors = {};
                    result = validator_1.validate(data, true, nestedErrors, void 0, this._maxDepthPassToNested ? depth : 0);
                    if (this._maxDepthPassToNested) {
                        validator_1.maxDepth(oldMaxDepth);
                    }
                    if (result !== true) {
                        result = nestedErrors;
                    }
                }
                else {
                    // custom validator/sanitizer
                    // sanitizer can modify data by reference (v, k <= key, d <= reference) and then must return [true]
                    if (entry.isHandler) {
                        var validator_2 = entry.validator;
                        result = entry.message = validator_2(data, key, ref);
                        data = ref[key];
                    }
                    else {
                        var validator_3 = entry.validator;
                        isValidator = entry.isValidator;
                        result = DeepValidator[validator_3](data, entry.args[0], entry.args[1], entry.args[2], errors, key, ref, schema, depth);
                    }
                }
                if (isValidator) {
                    if (result !== true) {
                        if (DeepValidator.isObject(result)) {
                            // extend errors object with set of messages
                            if (entry.notExtendErrors) {
                                _.each(result, function (v, k) {
                                    _this._addError(errors, k, v, root);
                                });
                            }
                            else {
                                _.each(result, function (v, k) {
                                    _this._addError(errors, k, v, path);
                                });
                            }
                        }
                        else {
                            this._addError(errors, path, entry.message || false);
                        }
                        return false;
                    }
                }
                else {
                    if (key !== void 0) {
                        data = result;
                        if (result !== void 0) {
                            ref[key] = result;
                        }
                    }
                }
            }
            // array/object process
            if (_.isArray(data)) {
                // go through each element if data is array
                if (schema.properties["[]"]) {
                    for (var i = 0, l = data.length; i < l; i++) {
                        if (this._validate(data[i], schema.properties["[]"], tryAll, errors, strict, path ? path + "." + i : i.toString(), path, depth + 1, i.toString(), data) === false) {
                            return false;
                        }
                    }
                }
            }
            else {
                // go through all nested in schema
                for (var k in schema.properties) {
                    if (k !== "[]") {
                        var entry = schema.properties[k].current;
                        var field = (entry && entry.showAs) || k;
                        var pathField = path ? path + "." + field : field;
                        if (isObject) {
                            if (k in data) {
                                if (this._validate(data[k], schema.properties[k], tryAll, errors, strict, pathField, path, depth + 1, k, data) || tryAll) {
                                    continue;
                                }
                                else {
                                    return false;
                                }
                            }
                            if (entry.custom && entry.custom(k, data)) {
                            }
                            if (entry.def !== void 0) {
                                data[k] = _.isFunction(entry.def) ?
                                    entry.def(k, data, k in data) :
                                    entry.def;
                                continue;
                            }
                        }
                        if (strict || entry.strict !== void 0) {
                            this._addError(errors, pathField, entry.strict || this._messageMissingKey);
                            if (tryAll === false) {
                                return false;
                            }
                        }
                    }
                }
            }
            return true;
        };
        /**
         * Clean value. Similar to [filter] but filters a given value using an active (internal) schema.
         */
        DeepValidator.clean = function (value, a, b, c, d, key, ref, schema) {
            _.each(value, function (v, k) {
                if (!(k in schema.properties)) {
                    delete value[k];
                }
            });
            return value;
        };
        /**
         *
         */
        DeepValidator.if = function (value, filter, flowTrue, flowFalse, errors, key, ref, schema) {
            if (_.isArray(filter) === false) {
                filter = [filter];
            }
            var result;
            if (DeepValidator[filter[0]](value, filter[1], filter[2], filter[3])) {
                result = flowTrue.validate(ref);
                if (result === false) {
                    return flowTrue.getErrors();
                }
            }
            else {
                result = flowFalse.validate(ref);
                if (result === false) {
                    return flowFalse.getErrors();
                }
            }
            return true;
        };
        /**
         *
         */
        DeepValidator.ifCustom = function (value, filter, flowTrue, flowFalse, errors, key, ref, schema) {
            if (_.isArray(filter) === false) {
                filter = [filter];
            }
            var result;
            if (filter[0](value, key, ref)) {
                result = flowTrue.validate(ref);
                if (result === false) {
                    return flowTrue.getErrors();
                }
            }
            else {
                result = flowFalse.validate(ref);
                if (result === false) {
                    return flowFalse.getErrors();
                }
            }
            return true;
        };
        /**
         * Filter. Does not consider for duplicates.
         */
        DeepValidator.isContains = function (value, compare) {
            var matches = 0;
            if (DeepValidator.isObject(value)) {
                for (var i = 0, l = compare.length; i < l; i++) {
                    if (compare[i] in value === false) {
                        return false;
                    }
                }
                return true;
            }
            if (_.isArray(value)) {
                for (var i = 0, l = compare.length; i < l; i++) {
                    if (value.indexOf(compare[i]) === -1) {
                        return false;
                    }
                }
                return true;
            }
            return false;
        };
        /**
         * Filter.
         */
        DeepValidator.isDefined = function (value) {
            return value !== void 0;
        };
        /**
         * Filter. Does not consider for duplicates.
         */
        DeepValidator.isNotContains = function (value, compare) {
            var matches = 0;
            if (DeepValidator.isObject(value)) {
                for (var i = 0, l = compare.length; i < l; i++) {
                    if (compare[i] in value) {
                        return false;
                    }
                }
                return true;
            }
            if (_.isArray(value)) {
                for (var i = 0, l = compare.length; i < l; i++) {
                    if (value.indexOf(compare[i]) !== -1) {
                        return false;
                    }
                }
                return true;
            }
            return false;
        };
        /**
         * Filter. Does not consider for duplicates.
         */
        DeepValidator.isContainsOnly = function (value, compare) {
            var matches = 0;
            if (DeepValidator.isObject(value)) {
                for (var i = 0, l = compare.length; i < l; i++) {
                    if (compare[i] in value) {
                        matches++;
                    }
                }
                return compare.length === matches && Object.keys(value).length === matches;
            }
            if (_.isArray(value)) {
                for (var i = 0, l = compare.length; i < l; i++) {
                    if (value.indexOf(compare[i]) !== -1) {
                        matches++;
                    }
                }
                return compare.length === matches && value.length === matches;
            }
            return false;
        };
        /**
         * Filter.
         */
        DeepValidator.isBoolean = function (value) {
            return _.isBoolean(value) || (_.isString(value) && validator.isBoolean(value));
        };
        /**
         * Filter.
         */
        DeepValidator.isDate = function (value) {
            return (value instanceof Date) || (_.isString(value) && validator.isDate(value));
        };
        /**
         * Filter.
         */
        DeepValidator.isGreater = function (value, compare) {
            return _.isNumber(value) && value > compare;
        };
        /**
         * Filter.
         */
        DeepValidator.isGreaterOrEquals = function (value, compare) {
            return _.isNumber(value) && value >= compare;
        };
        /**
         * Filter.
         */
        DeepValidator.isGreaterOrEqualsToZero = function (value) {
            return value === 0 || this.isGreater(value, 0);
        };
        /**
         * Filter.
         */
        DeepValidator.isIntOrNumeric = function (value) {
            return _.isInteger(value) || (_.isString(value) && validator.isInt(value));
        };
        /**
         * Filter.
         */
        DeepValidator.isInRange = function (value, min, max) {
            return _.isNumber(value) && value >= min && value <= max;
        };
        /**
         * Filter.
         */
        DeepValidator.isInsignificant = function (value) {
            return _.isObject(value) ? this.isLength(value, 1) === false : !!value === false;
        };
        /**
         * Filter.
         */
        DeepValidator.isLength = function (value, min, max) {
            var length;
            if (_.isArray(value) || _.isString(value)) {
                length = value.length;
            }
            else if (this.isObject(value)) {
                length = Object.keys(value).length;
            }
            else {
                return false;
            }
            if (min !== void 0 && length < min) {
                return false;
            }
            if (max !== void 0 && length > max) {
                return false;
            }
            return true;
        };
        /**
         * Filter.
         */
        DeepValidator.isLess = function (value, compare) {
            return _.isNumber(value) && value < compare;
        };
        /**
         * Filter.
         */
        DeepValidator.isLessOrEquals = function (value, compare) {
            return _.isNumber(value) && value <= compare;
        };
        /**
         * Filter.
         */
        DeepValidator.isLessOrEqualsToZero = function (value) {
            return value === 0 || this.isLess(value, 0);
        };
        /**
         * Filter. Alias of [isNumberNegative].
         */
        DeepValidator.isNegative = function (value) {
            return this.isNumberNegative(value);
        };
        /**
         * Filter.
         */
        DeepValidator.isNotEmpty = function (value) {
            return this.isEmpty(value) === false;
        };
        /**
         * Filter.
         */
        DeepValidator.isNotEmptyArray = function (value) {
            return _.isArray(value) && this.isEmpty(value) === false;
        };
        /**
         * Filter.
         */
        DeepValidator.isNotEmptyObject = function (value) {
            return this.isObject(value) && this.isEmpty(value) === false;
        };
        /**
         * Filter.
         */
        DeepValidator.isNotVoid = function (value) {
            return this.isDefined(value);
        };
        /**
         * Filter.
         */
        DeepValidator.isNumberNegative = function (value) {
            return this.isLess(value, 0);
        };
        /**
         * Filter.
         */
        DeepValidator.isNumberPositive = function (value) {
            return this.isGreater(value, 0);
        };
        /**
         * Filter.
         */
        DeepValidator.isNumberOrNumeric = function (value) {
            return _.isNumber(value) || (_.isString(value) && validator.isFloat(value));
        };
        /**
         * Filter.
         */
        DeepValidator.isObject = function (value) {
            return _.isObjectLike(value) && (value instanceof Array) === false;
        };
        /**
         * Filter. Alias of [isNumberPositive].
         */
        DeepValidator.isPositive = function (value) {
            return this.isNumberPositive(value);
        };
        /**
         * Filter.
         */
        DeepValidator.isSignificant = function (value) {
            return this.isInsignificant(value) === false;
        };
        /**
         * Filter.
         */
        DeepValidator.isVoid = function (value) {
            return this.isUndefined(value);
        };
        /**
         * Filter.
         */
        DeepValidator.isUndefined = function (value) {
            return value === void 0;
        };
        /**
         * Sanitizer. Picks values (by RegExp checks strings only) by matching to a given pattern.
         *
         * @param value Value.
         * @param filter Filter RegExp or function.
         * @param objectAllow Ignore object-like values (arrays or sets).
         *
         * @returns {TResult}
         */
        DeepValidator.filter = function (value, filter, objectAllow) {
            if (filter instanceof RegExp) {
                _.each(value, function (v, k) {
                    if (!(_.isString(v) ? validator.matches(v, filter) : objectAllow !== false && _.isObjectLike(v))) {
                        delete value[k];
                    }
                });
            }
            else {
                _.each(value, function (v, k) {
                    if (!filter(v)) {
                        delete value[k];
                    }
                });
            }
            return value;
        };
        /**
         * Sanitizer. Picks keys by matching to a given pattern.
         */
        DeepValidator.filterKeys = function (value, filter) {
            if (filter instanceof RegExp) {
                _.each(value, function (v, k) {
                    if (!validator.matches(k, filter)) {
                        delete value[k];
                    }
                });
            }
            else {
                _.each(value, function (v, k) {
                    if (!filter(k)) {
                        delete value[k];
                    }
                });
            }
            return value;
        };
        /**
         * Sanitizer. Remove all keys of MongoDb document like object starting from [$].
         */
        DeepValidator.filterMongoDocKeys = function (value) {
            return this.filterKeys(value, /^([^\$].*){1,}$/);
        };
        /**
         * Sanitizer.
         */
        DeepValidator.toBoolean = function (value) {
            if (_.isBoolean(value)) {
                return value;
            }
            if (_.isString(value)) {
                return value === "true" || value === "1";
            }
            return value === 1;
        };
        /**
         * Sanitizer.
         */
        DeepValidator.toDate = function (value) {
            if (value instanceof Date) {
                return value;
            }
            if (_.isString(value)) {
                return validator.toDate(value);
            }
            return null;
        };
        /**
         * Sanitizer.
         */
        DeepValidator.toInt = function (value) {
            return this.isNumberOrNumeric(value) ? _.toInteger(value) : NaN;
        };
        /**
         * Sanitizer.
         */
        DeepValidator.toFloat = function (value) {
            return this.toNumber(value);
        };
        /**
         * Sanitizer.
         */
        DeepValidator.toMongoId = function (value) {
            var ObjectID = require("mongodb").ObjectID;
            var method = this.toMongoId = function (value) { return value instanceof ObjectID ? value : ObjectID(value); };
            return method(value);
        };
        /**
         * Sanitizer.
         */
        DeepValidator.toNumber = function (value) {
            return this.isNumberOrNumeric(value) ? Number(value) : NaN;
        };
        /**
         * Sanitizer.
         */
        DeepValidator.toNullIfEmpty = function (value) {
            return this.isEmpty(value) ? null : value;
        };
        /**
         * Sanitizer.
         */
        DeepValidator.toNullIfInsignificant = function (value) {
            return this.isInsignificant(value) ? null : value;
        };
        /**
         * Sanitizer.
         */
        DeepValidator.toString = function (value) {
            return (value === void 0 || value === null) ? "" : String(value);
        };
        /**
         * Get all errors of last validation.
         *
         * @returns {{}}
         */
        DeepValidator.prototype.getErrors = function (asArray) {
            if (asArray === void 0) { asArray = false; }
            return asArray ? _.toArray(this.errors) : this.errors;
        };
        /**
         * Get max depth of nested scan.
         *
         * @returns {number}
         */
        DeepValidator.prototype.getMaxDepth = function () {
            return this._maxDepth;
        };
        /**
         * Get validator name.
         *
         * @returns {string}
         */
        DeepValidator.prototype.getName = function () {
            return this._name;
        };
        /**
         * Get next error of last validation.
         *
         * @returns {void|{}}
         */
        DeepValidator.prototype.getNextError = function () {
            var _this = this;
            if (this._nextError === null) {
                var k_1 = Object.keys(this.errors), i_1 = 0;
                this._nextError = function () {
                    if (i_1++ < k_1.length) {
                        return {
                            field: k_1[i_1 - 1],
                            message: _this.errors[k_1[i_1 - 1]]
                        };
                    }
                    return void 0;
                };
            }
            return this._nextError();
        };
        /**
         * Set default [data invalid] message. Message will be set if provided data is invalid.
         *
         * @param value Value.
         *
         * @returns {DeepValidator}
         */
        DeepValidator.prototype.setMessageInvalid = function (value) {
            this._messageInvalid = value;
            return this;
        };
        /**
         * Set default [max  depth reached] message. Message will be set if max depth of nested scan has been reached.
         *
         * @param value Value.
         *
         * @returns {DeepValidator}
         */
        DeepValidator.prototype.setMessageMaxDepthReached = function (value) {
            this._messageMaxDepth = value;
            return this;
        };
        /**
         * Set default [missing key] message. Message will be set if [isExists] validator fails and has no self message.
         *
         * @param value Value.
         *
         * @returns {DeepValidator}
         */
        DeepValidator.prototype.setMessageMissingKey = function (value) {
            this._messageMissingKey = value;
            return this;
        };
        /**
         * Set default [not object] message. Message will be set if [isObject] validator fails and has no self message.
         *
         * @param value Value.
         *
         * @returns {DeepValidator}
         */
        DeepValidator.prototype.setMessageNotObject = function (value) {
            this._messageNotObject = value;
            return this;
        };
        /**
         * Set validator name. Will be used as a alias in case of registration for reusing in another or recursively.
         *
         * @param value Value.
         *
         * @returns {DeepValidator}
         */
        DeepValidator.prototype.setName = function (value) {
            this._name = value;
            return this;
        };
        /**
         * Set translator function.
         *
         * @param value Value.
         *
         * @returns {DeepValidator}
         */
        DeepValidator.prototype.setTranslator = function (value) {
            this._translator = value;
            return this;
        };
        /**
         * Set [arrayAllow] mode. Allows applying schema to each element of data if data is array.
         *
         * @param value Value.
         *
         * @returns {DeepValidator}
         */
        DeepValidator.prototype.arrayAllow = function (value) {
            if (value === void 0) { value = true; }
            this._arrayAllow = value;
            return this;
        };
        /**
         * Register validator for reusing.
         *
         * @param validator Validator instance.
         *
         * @returns {DeepValidator}
         */
        DeepValidator.prototype.include = function (validator) {
            this._included[validator.getName()] = validator;
            return this._compile(this.schema);
        };
        /**
         * Set max depth of nested scan.
         *
         * @param value Value.
         *
         * @returns {DeepValidator}
         */
        DeepValidator.prototype.maxDepth = function (value) {
            this._maxDepth = value;
            return this;
        };
        /**
         * Set mode of passing incremented [depth] value to a nested validator.
         *
         * @param value Value.
         *
         * @returns {DeepValidator}
         */
        DeepValidator.prototype.maxDepthPassToNested = function (value) {
            if (value === void 0) { value = true; }
            this._maxDepthPassToNested = value;
            return this;
        };
        /**
         * Set [strict] mode. All schema keys will be checked for presence.
         *
         * @param value Value.
         *
         * @returns {DeepValidator}
         */
        DeepValidator.prototype.strict = function (value) {
            if (value === void 0) { value = true; }
            this._strict = value;
            return this;
        };
        /**
         * Set [tryAll] mode. All scope validators will be applied in despite of earlier failures.
         *
         * @param value Value.
         *
         * @returns {DeepValidator}
         */
        DeepValidator.prototype.tryAll = function (value) {
            if (value === void 0) { value = true; }
            this._tryAll = value;
            return this;
        };
        /**
         * Validate data. If returns [false] then errors list can be retrieved by [getErrors] or [getNextError] iterator.
         *
         * @param data Data to be validated.
         * @param arrayAllow Allow apply schema to each element of data if data is array.
         * @param errors Internal usage.
         * @param prefix Internal usage.
         * @param depth Internal usage.
         *
         * @returns {boolean}
         */
        DeepValidator.prototype.validate = function (data, arrayAllow, errors, prefix, depth) {
            if (arrayAllow === void 0) { arrayAllow = false; }
            if (this._includedPending.length) {
                throw new Error("Included validator is still pending for definition: " + this._includedPending[0]);
            }
            if (!errors) {
                this._nextError = null;
                this.errors = {};
            }
            if (_.isArray(data)) {
                if (this._arrayAllow === false && arrayAllow === false) {
                    this._addError(errors || this.errors, "??", this._messageInvalid);
                    return this.passed = false;
                }
                this._validate(this._schemaCoverAll ? { $: data } : data, this._schemaAsArray, this._tryAll, errors || this.errors, this._strict, prefix || "", prefix || "", depth);
            }
            else {
                if (_.isObject(data) === false) {
                    this._addError(errors || this.errors, "??", this._messageInvalid);
                    return this.passed = false;
                }
                this._validate(this._schemaCoverAll ? { $: data } : data, this._schema, this._tryAll, errors || this.errors, this._strict, prefix || "", prefix || "", depth);
            }
            return this.passed = _.isEmpty(errors || this.errors);
        };
        DeepValidator._ = _;
        DeepValidator.isValidators = {
            contains: true,
            equals: true,
            if: true,
            ifCustom: true,
            matches: true,
        };
        // external filters import
        // from validator
        DeepValidator.blacklist = validator.blacklist;
        // from validator
        DeepValidator.escape = validator.escape;
        // from validator
        DeepValidator.isAlpha = validator.isAlpha;
        // from validator
        DeepValidator.isAlphanumeric = validator.isAlphanumeric;
        // from lodash [isArray]
        DeepValidator.isArray = _.isArray;
        // from validator
        DeepValidator.isAscii = validator.isAscii;
        // from validator
        DeepValidator.isBase64 = validator.isBase64;
        // from validator
        DeepValidator.isByteLength = validator.isByteLength;
        // from validator
        DeepValidator.isCreditCard = validator.isCreditCard;
        // from validator
        DeepValidator.isCurrency = validator.isCurrency;
        // from validator
        DeepValidator.isDataURI = validator.isDataURI;
        // from validator
        DeepValidator.isEmail = validator.isEmail;
        // from lodash [isEmpty], checks if value is an empty object, collection, map, or set (see docs).
        DeepValidator.isEmpty = _.isEmpty;
        // from lodash [isEqual], performs a deep comparison between two values to determine if they are equivalent (see docs).
        DeepValidator.isEquals = _.isEqual;
        // from validator
        DeepValidator.isFQDN = validator.isFQDN;
        // ffrom lodash [isFinite]
        DeepValidator.isFinite = _.isFinite;
        // from validator
        DeepValidator.isFullWidth = validator.isFullWidth;
        // from validator
        DeepValidator.isHalfWidth = validator.isHalfWidth;
        // from validator
        DeepValidator.isHexColor = validator.isHexColor;
        // from validator
        DeepValidator.isHexadecimal = validator.isHexadecimal;
        // from validator
        DeepValidator.isIP = validator.isIP;
        // from validator
        DeepValidator.isISBN = validator.isISBN;
        // from validator
        DeepValidator.isISIN = validator.isISIN;
        // from validator
        DeepValidator.isISO8601 = validator.isISO8601;
        // from validator
        DeepValidator.isIn = validator.isIn;
        // from validator
        DeepValidator.isLowercase = validator.isLowercase;
        // from validator
        DeepValidator.isMACAddress = validator.isMACAddress;
        // from validator
        DeepValidator.isMatches = validator.matches;
        // from validator
        DeepValidator.isMD5 = validator.isMD5;
        // from validator
        DeepValidator.isMobilePhone = validator.isMobilePhone;
        // from validator
        DeepValidator.isMongoId = validator.isMongoId;
        // from validator
        DeepValidator.isMultibyte = validator.isMultibyte;
        // from lodash [isNaN]
        DeepValidator.isNaN = _.isNaN;
        // from lodash [isNil]
        DeepValidator.isNil = _.isNil;
        // from validator
        DeepValidator.isNull = validator.isNull;
        // from validator
        DeepValidator.isNumber = _.isNumber;
        // from validator
        DeepValidator.isNumeric = validator.isNumeric;
        // from lodash [isMatch], performs a partial deep comparison between object and source (see docs).
        DeepValidator.isPartialEqual = _.isMatch;
        // from lodash [isString]
        DeepValidator.isString = _.isString;
        // from validator
        DeepValidator.isSubstring = validator.contains;
        // from validator
        DeepValidator.isSurrogatePair = validator.isSurrogatePair;
        // from validator
        DeepValidator.isURL = validator.isURL;
        // from validator
        DeepValidator.isUUID = validator.isUUID;
        // from validator
        DeepValidator.isUppercase = validator.isUppercase;
        // from validator
        DeepValidator.isVariableWidth = validator.isVariableWidth;
        // from validator
        DeepValidator.isWhitelisted = validator.isWhitelisted;
        // from validator
        DeepValidator.ltrim = validator.ltrim;
        // from validator
        DeepValidator.normalizeEmail = validator.normalizeEmail;
        // from validator
        DeepValidator.rtrim = validator.rtrim;
        // from validator
        DeepValidator.stripLow = validator.stripLow;
        // from lodash [toArray]
        DeepValidator.toArray = _.toArray;
        // from validator
        DeepValidator.trim = validator.trim;
        // from validator
        DeepValidator.unescape = validator.unescape;
        // from validator
        DeepValidator.whitelist = validator.whitelist;
        return DeepValidator;
    }());
    exports.DeepValidator = DeepValidator;
    // [OrNull] patch
    _.each(DeepValidator, function (v, k) {
        if (DeepValidator.hasOwnProperty(k) && _.isFunction(v) && (k.substr(0, 2) === "is" || k.substr(0, 2) === "to")) {
            DeepValidator[k + "OrNull"] = function (value) {
                return value === null || DeepValidator[k].apply(DeepValidator, arguments);
            };
        }
    });
    var DeepValidatorMerged = (function (_super) {
        __extends(DeepValidatorMerged, _super);
        function DeepValidatorMerged() {
            _super.apply(this, arguments);
        }
        return DeepValidatorMerged;
    }(DeepValidator));
    exports.DeepValidatorMerged = DeepValidatorMerged;
    var Validator = (function (_super) {
        __extends(Validator, _super);
        function Validator() {
            _super.apply(this, arguments);
        }
        return Validator;
    }(DeepValidator));
    exports.Validator = Validator;
    var ValidatorMerged = (function (_super) {
        __extends(ValidatorMerged, _super);
        function ValidatorMerged() {
            _super.apply(this, arguments);
        }
        return ValidatorMerged;
    }(DeepValidatorMerged));
    exports.ValidatorMerged = ValidatorMerged;
    exports.deepValidator = function (schema, rootFlow) {
        return new DeepValidator(schema, rootFlow);
    };
    exports.deepValidatorMerged = function (schema, rootFlow) {
        return new DeepValidatorMerged(schema, rootFlow);
    };
});
