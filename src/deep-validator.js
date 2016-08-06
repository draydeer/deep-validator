var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var _ = require('lodash');
var validator = require('validator');
var DeepValidator = (function () {
    /**
     * Constructor.
     *
     * @param schema Data validation schema.
     */
    function DeepValidator(schema) {
        var _this = this;
        this._arrayAllow = false;
        this._nextError = null;
        this._messageInvalid = false;
        this._messageMissingKey = false;
        this._sarray = { '##': { s: void 0, v: [] } };
        this._schema = { '##': { s: void 0, v: [] } };
        this._strict = false;
        this._translator = null;
        this._tryAll = false;
        this.errors = {};
        this.passed = false;
        this.schema = null;
        this.schema = schema;
        _.each(schema, function (v, k) {
            var last = _this._schema, elem = _this._schema;
            k.split('.').forEach(function (v) {
                last = elem;
                elem = elem[k = v] || (elem[v] = { '##': { s: void 0, v: [] } });
                if (k === '[]') {
                    last['##'].v.push({
                        args: [],
                        isValidator: true,
                        message: void 0,
                        validator: 'isArray'
                    });
                }
            });
            (_.isArray(v) ? v : [v]).forEach(function (v) {
                _.isArray(v) || (v = [v]);
                if (_.isString(v[0])) {
                    var t = v[0].split(':');
                    if (t[0] === 'custom') {
                        last[k]['##'].custom = v[1];
                    }
                    else if (t[0] === 'default') {
                        last[k]['##'].d = v[1];
                    }
                    else if (t[0] === 'isExists') {
                        last[k]['##'].s = t[1] || false;
                    }
                    else if (t[0] === 'showAs') {
                        last[k]['##'].showAs = t[1] || false;
                    }
                    else if (Validator[t[0]] || validator[t[0]] || _[t[0]]) {
                        last[k]['##'].v.push({
                            args: v.slice(1),
                            isValidator: t[0].substr(0, 2) === 'is',
                            message: t[1],
                            validator: t[0]
                        });
                    }
                    else {
                        throw new Error('Validator is not defined: ' + t[0]);
                    }
                }
                else {
                    last[k]['##'].v.push({
                        args: v.slice(1),
                        isValidator: v[0].substr(0, 2) === 'is' || v[0] in DeepValidator._isValidators,
                        message: null,
                        validator: v[0]
                    });
                }
            });
        });
        this._sarray['[]'] = this._schema;
        this._translator = DeepValidator._translate;
    }
    /**
     * Dummy translator.
     */
    DeepValidator._translate = function (message) {
        return message;
    };
    /*
     *
     */
    DeepValidator.prototype._validate = function (data, schema, tryAll, errors, strict, message, key, ref) {
        if (schema === void 0) { schema = {}; }
        if (tryAll === void 0) { tryAll = false; }
        if (errors === void 0) { errors = {}; }
        if (strict === void 0) { strict = false; }
        if (message === void 0) { message = ''; }
        var isObject = _.isObject(data);
        // apply validators/sanitizers
        for (var i = 0, l = schema['##'].v.length; i < l; i++) {
            var entry = schema['##'].v[i];
            var isValidator = true;
            var result = true;
            // custom validator/sanitizer; sanitizer can modify data by reference (v, k <= key, d <= reference) and then must return [true]
            if (_.isFunction(entry.validator)) {
                var validator_1 = entry.validator;
                isValidator = true;
                result = entry.message = validator_1(data, key, ref);
                data = ref[key];
            }
            else {
                var validator_2 = entry.validator;
                // try [self]
                if (Validator[validator_2]) {
                    isValidator = entry.isValidator;
                    result = Validator[validator_2](data, entry.args[0], entry.args[1], entry.args[2], entry.args[3], key, ref);
                }
            }
            if (isValidator) {
                if (result !== true) {
                    errors[message] = entry.message || false;
                    return false;
                }
            }
            else {
                if (key !== void 0) {
                    data = result;
                    ref[key] = result;
                }
            }
        }
        // array/object process
        if (_.isArray(data)) {
            // go through each element if data is array
            if (schema['[]']) {
                for (var i = 0, l = data.length; i < l; i++) {
                    if (this._validate(data[i], schema['[]'], tryAll, errors, strict, message ? message + '.' + i : i.toString(), i.toString(), data) === false) {
                        return false;
                    }
                }
            }
        }
        else {
            // go through all nested in schema
            for (var k in schema) {
                var field = (schema[k]['##'] && schema[k]['##'].showAs) || k;
                var mes = message ? message + '.' + field : field;
                if (k !== '##' && k !== '[]') {
                    if (isObject) {
                        if (k in data || (schema[k]['##'].custom && schema[k]['##'].custom(k, data, k in data))) {
                            if (this._validate(data[k], schema[k], tryAll, errors, strict, mes, k, data) || tryAll) {
                                continue;
                            }
                            else {
                                return false;
                            }
                        }
                        if (schema[k]['##'].d !== void 0) {
                            data[k] = typeof schema[k]['##'].d === 'function' ? schema[k]['##'].d(k, data, k in data) : schema[k]['##'].d;
                            continue;
                        }
                    }
                    if (strict || schema[k]['##'].s !== void 0) {
                        errors[mes] = schema[k]['##'].s || this._messageMissingKey;
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
     * Filter. Does not consider for duplicates.
     */
    DeepValidator.isContains = function (value, compare) {
        var matches = 0;
        if (_.isObject(value)) {
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
     * Filter. Does not consider for duplicates.
     */
    DeepValidator.isNotContains = function (value, compare) {
        var matches = 0;
        if (_.isObject(value)) {
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
    DeepValidator.isContainsOnly = function (value, compare, strict) {
        if (strict === void 0) { strict = true; }
        var matches = 0;
        if (_.isObject(value)) {
            for (var i = 0, l = compare.length; i < l; i++) {
                if (compare[i] in value) {
                    matches++;
                }
            }
            return Object.keys(value).length === matches;
        }
        if (_.isArray(value)) {
            for (var i = 0, l = compare.length; i < l; i++) {
                if (value.indexOf(compare[i]) !== -1) {
                    matches++;
                }
            }
            return value.length === matches;
        }
        return false;
    };
    /**
     * Filter.
     */
    DeepValidator.isContainsOnlyIn = function (value, compare) {
        var matches = 0;
        if (_.isObject(value)) {
            for (var k in value) {
                if (compare.indexOf(k) === -1) {
                    return false;
                }
            }
            return true;
        }
        if (_.isArray(value)) {
            for (var i = 0, l = compare.length; i < l; i++) {
                if (compare.indexOf(value[i]) === -1) {
                    return false;
                }
            }
            return true;
        }
        return false;
    };
    /**
     * Sanitizer.
     */
    DeepValidator.toNumber = function (value) {
        return _.isString(value) ? parseInt(value) : (_.isNumber(value) ? value : NaN);
    };
    /**
     * Sanitizer.
     */
    DeepValidator.toNullIfEmpty = function (value) {
        return this.isEmpty(value) ? null : value;
    };
    /**
     * Filter.
     */
    DeepValidator.isGreater = function (value, compare) {
        return _.isNumber(value) && (value | 0) > compare;
    };
    /**
     * Filter.
     */
    DeepValidator.isGreaterOrEqual = function (value, compare) {
        return _.isNumber(value) && (value | 0) >= compare;
    };
    /**
     * Filter.
     */
    DeepValidator.isGreaterOrEqualToZero = function (value) {
        return value === 0 || Validator.isGreater(value, 0);
    };
    /**
     * Filter.
     */
    DeepValidator.isLength = function (value, min, max) {
        var length;
        if (_.isArray(value) || _.isString(value)) {
            length = value.length;
        }
        else if (_.isObject(value)) {
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
    DeepValidator.isLengthOrNull = function (value, min, max) {
        return value === null ? true : Validator.isLength(value, min, max);
    };
    /**
     * Filter.
     */
    DeepValidator.isLess = function (value, compare) {
        return _.isNumber(value) && (value | 0) < compare;
    };
    /**
     * Filter.
     */
    DeepValidator.isLessOrEqual = function (value, compare) {
        return _.isNumber(value) && (value | 0) <= compare;
    };
    /**
     * Filter.
     */
    DeepValidator.isLessOrEqualToZero = function (value) {
        return value === 0 || Validator.isLess(value, 0);
    };
    /**
     * Filter.
     */
    DeepValidator.isNotEmpty = function (value) {
        return Validator.isEmpty(value) === false;
    };
    /**
     * Filter.
     */
    DeepValidator.isNotEmptyArray = function (value) {
        return Validator.isArray(value) && Validator.isEmpty(value) === false;
    };
    /**
     * Filter.
     */
    DeepValidator.isNotEmptyObject = function (value) {
        return Validator.isObject(value) && Validator.isEmpty(value) === false;
    };
    /**
     * Filter.
     */
    DeepValidator.isArrayOrNull = function (value) {
        return value === null || _.isArray(value);
    };
    /**
     * Filter.
     */
    DeepValidator.isBooleanOrNull = function (value) {
        return value === null || _.isBoolean(value);
    };
    /**
     * Filter.
     */
    DeepValidator.isEmailOrNull = function (value) {
        return value === null || validator.isEmail(value);
    };
    /**
     * Filter.
     */
    DeepValidator.isNumberNegative = function (value) {
        return Validator.isLess(value, 0);
    };
    /**
     * Filter.
     */
    DeepValidator.isNumberPositive = function (value) {
        return Validator.isGreater(value, 0);
    };
    /**
     * Filter.
     */
    DeepValidator.isNumberOrNull = function (value) {
        return value === null || _.isNumber(value);
    };
    /**
     * Filter.
     */
    DeepValidator.isNumberOrNumeric = function (value) {
        return _.isNumber(value) || validator.isNumeric(value);
    };
    /**
     * Filter.
     */
    DeepValidator.isObjectOrNull = function (value) {
        return value === null || _.isObject(value);
    };
    /**
     * Filter.
     */
    DeepValidator.isStringOrNull = function (value) {
        return value === null || _.isString(value);
    };
    /**
     * Filter.
     */
    DeepValidator.isVoid = function (value) {
        return value === void 0;
    };
    /**
     * Filter.
     */
    DeepValidator.isNotVoid = function (value) {
        return value !== void 0;
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
     * Get next error of last validation.
     *
     * @returns {any}
     */
    DeepValidator.prototype.getNextError = function () {
        var _this = this;
        if (this._nextError === null) {
            var k = Object.keys(this.errors), i = 0;
            this._nextError = function () {
                if (i++ < k.length) {
                    return {
                        field: k[i - 1],
                        message: _this.errors[k[i - 1]]
                    };
                }
                return void 0;
            };
        }
        return this._nextError();
    };
    /**
     * Set default [data invalid] message. Message will be preset if provided data is invalid.
     *
     * @param value Value.
     *
     * @returns {Validator}
     */
    DeepValidator.prototype.setMessageInvalid = function (value) {
        this._messageInvalid = value;
        return this;
    };
    /**
     * Set default [missing key] message. Message will be preset if [isExists] validator fails and has no self message.
     *
     * @param value Value.
     *
     * @returns {Validator}
     */
    DeepValidator.prototype.setMessageMissingKey = function (value) {
        this._messageMissingKey = value;
        return this;
    };
    /**
     * Set translator function.
     *
     * @param value Value.
     *
     * @returns {Validator}
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
     * @returns {Validator}
     */
    DeepValidator.prototype.arrayAllow = function (value) {
        if (value === void 0) { value = true; }
        this._arrayAllow = value;
        return this;
    };
    /**
     * Set [strict] mode. All scope keys will be checked for presence.
     *
     * @param value Value.
     *
     * @returns {Validator}
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
     * @returns {Validator}
     */
    DeepValidator.prototype.tryAll = function (value) {
        if (value === void 0) { value = true; }
        this._tryAll = value;
        return this;
    };
    /**
     * Validate data. If returns [false] errors list can be retrieved by [getErrors] or [getNextError] iterator.
     *
     * @param data Data to be validated.
     * @param arrayAllow Allow apply schema to each element of data if data is array.
     *
     * @returns {boolean}
     */
    DeepValidator.prototype.validate = function (data, arrayAllow) {
        if (arrayAllow === void 0) { arrayAllow = false; }
        this._nextError = null;
        this.errors = {};
        if (_.isArray(data)) {
            if (this._arrayAllow === false && arrayAllow === false) {
                this.errors = {
                    '??': this._messageInvalid
                };
                return this.passed = false;
            }
            this._validate(data, this._sarray, this._tryAll, this.errors, this._strict, '');
        }
        else {
            if (_.isObject(data) === false) {
                this.errors = {
                    '??': this._messageInvalid
                };
                return this.passed = false;
            }
            this._validate(data, this._schema, this._tryAll, this.errors, this._strict, '');
        }
        return this.passed = _.isEmpty(this.errors);
    };
    DeepValidator._isValidators = {
        contain: true,
        equal: true,
        match: true
    };
    DeepValidator._ = _;
    // external filters import
    // from validator
    DeepValidator.alpha = validator.alpha;
    // from validator
    DeepValidator.blacklist = validator.blacklist;
    // from validator
    DeepValidator.contain = validator.contains;
    // from validator
    DeepValidator.equal = validator.equals;
    // from validator
    DeepValidator.escape = validator.escape;
    // from validator
    DeepValidator.isAfter = validator.isAfter;
    // from validator
    DeepValidator.isAlpha = validator.isAlpha;
    // from validator
    DeepValidator.isAlphanumeric = validator.isAlphanumeric;
    // from lodash [isArray]
    DeepValidator.isArray = _.isArray;
    // from validator
    DeepValidator.isBase64 = validator.isBase64;
    // from validator
    DeepValidator.isBefore = validator.isBefore;
    // from validator
    DeepValidator.isBoolean = validator.isBoolean;
    // from validator
    DeepValidator.isByteLength = validator.isByteLength;
    // from validator
    DeepValidator.isCreditCard = validator.isCreditCard;
    // from validator
    DeepValidator.isCurrency = validator.isCurrency;
    // from validator
    DeepValidator.isDataURI = validator.isDataURI;
    // from validator
    DeepValidator.isDate = validator.isDate;
    // from validator
    DeepValidator.isDateAfter = validator.isAfter;
    // from validator
    DeepValidator.isDateBefore = validator.isBefore;
    // from validator
    DeepValidator.isDecimal = validator.isDecimal;
    // from validator
    DeepValidator.isDivisibleBy = validator.isDivisibleBy;
    // from validator
    DeepValidator.isEmail = validator.isEmail;
    // from lodash [isEmpty], checks if value is an empty object, collection, map, or set (see docs).
    DeepValidator.isEmpty = _.isEmpty;
    // from lodash [isEqual], performs a deep comparison between two values to determine if they are equivalent (see docs).
    DeepValidator.isEqual = _.isEqual;
    // from validator
    DeepValidator.isFQDN = validator.isFQDN;
    // from validator
    DeepValidator.isFloat = validator.isFloat;
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
    DeepValidator.isInt = validator.isInt;
    // from validator
    DeepValidator.isLowercase = validator.isLowercase;
    // from validator
    DeepValidator.isMACAddress = validator.isMACAddress;
    // from validator
    DeepValidator.isMatch = validator.matches;
    // from validator
    DeepValidator.isMD5 = validator.isMD5;
    // from validator
    DeepValidator.isMobilePhone = validator.isMobilePhone;
    // from validator
    DeepValidator.isMongoId = validator.isMongoId;
    // from validator
    DeepValidator.isMultibyte = validator.isMultibyte;
    // from validator
    DeepValidator.isNull = validator.isNull;
    // from validator
    DeepValidator.isNumeric = validator.isNumeric;
    // from lodash [isObject]
    DeepValidator.isObject = _.isObject;
    // from lodash [isMatch], Performs a partial deep comparison between object and source (see docs).
    DeepValidator.isPartialEqual = _.isMatch;
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
    // from validator
    DeepValidator.toBoolean = validator.toBoolean;
    // from validator
    DeepValidator.toDate = validator.toDate;
    // from validator
    DeepValidator.toFloat = validator.toFloat;
    // from validator
    DeepValidator.toInt = validator.toInt;
    // from validator
    DeepValidator.trim = validator.trim;
    // from validator
    DeepValidator.unescape = validator.unescape;
    // from validator
    DeepValidator.whitelist = validator.whitelist;
    return DeepValidator;
})();
exports.DeepValidator = DeepValidator;
var Validator = (function (_super) {
    __extends(Validator, _super);
    function Validator() {
        _super.apply(this, arguments);
    }
    return Validator;
})(DeepValidator);
exports.Validator = Validator;
//# sourceMappingURL=deep-validator.js.map