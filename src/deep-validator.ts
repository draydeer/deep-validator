

import * as _ from 'lodash';
import * as validator from 'validator';
import Dictionary = _.Dictionary;


type ValidationEntry = {

    args: string;

    isValidator: boolean;

    message: string;

    validator: string|((...a: any[]) => any);

}


export class DeepValidator {

    protected static _isValidators = {
        contains: true,
        equals: true,
        matches: true,
    };

    protected _arrayAllow: boolean = false;

    protected _nextError = null;

    protected _messageInvalid: any = false;

    protected _messageMissingKey: any = false;

    protected _sarray = {'##': {s: void 0, v: []}};

    protected _schema = {'##': {s: void 0, v: []}};

    protected _strict: boolean = false;

    protected _translator: (message: string) => any = null;

    protected _tryAll: boolean = false;

    static _ = _;

    errors: Dictionary<any> = {};

    passed = false;

    schema = null;

    /*
     *
     */
    protected _validate(
        data: any,
        schema: Dictionary<any> = {},
        tryAll: boolean = false,
        errors: Dictionary<any> = {},
        strict: boolean = false,
        message: string = '',
        key?: string,
        ref?: any
    ): boolean {
        let isObject = _.isObject(data);

        // apply validators/sanitizers
        for (let i = 0, c = schema['##'].v.length; i < c; i ++) {
            let entry: ValidationEntry = schema['##'].v[i];

            let isValidator = true;

            let result = true;

            // custom validator/sanitizer; sanitizer can modify data by reference (v, k <= key, d <= reference) and then must return [true]
            if (_.isFunction(entry.validator)) {
                let validator = <(...a: any[]) => any>entry.validator;

                isValidator = true;
                result = entry.message = validator(data, key, ref);

                data = ref[key];
            } else {
                let validator = <string>entry.validator;

                // try [self]
                if (Validator[validator]) {
                    isValidator = entry.isValidator;
                    result = Validator[validator](
                        data,
                        entry.args[0],
                        entry.args[1],
                        entry.args[2],
                        entry.args[3],
                        key,
                        ref
                    );
                }
            }

            if (isValidator) {
                if (result !== true) {
                    errors[message] = entry.message || false;

                    return false;
                }
            } else {
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
                for (let i = 0, c = data.length; i < c; i ++) {
                    if (this._validate(
                            data[i],
                            schema['[]'],
                            tryAll,
                            errors,
                            strict,
                            message ? message + '.' + i : i.toString(),
                            i.toString(),
                            data
                        ) === false
                    ) {
                        return false;
                    }
                }
            }
        } else {

            // go through all nested in schema
            for (let k in schema) {
                let field = (schema[k]['##'] && schema[k]['##'].showAs) || k;

                let mes: string = message ? message + '.' + field : field;

                if (k !== '##' && k !== '[]') {
                    if (isObject) {
                        if (k in data || (schema[k]['##'].custom && schema[k]['##'].custom(k, data, k in data))) {
                            if (this._validate(data[k], schema[k], tryAll, errors, strict, mes, k, data) || tryAll) {
                                continue;
                            } else {
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
    }

    // external filters import

    // validator
    static isAfter = validator.isAfter;

    // validator
    static isAlpha = validator.isAlpha;

    // validator
    static isAlphanumeric = validator.isAlphanumeric;

    // lodash [isArray]
    static isArray = _.isArray;

    // validator
    static isBase64 = validator.isBase64;

    // validator
    static isBefore = validator.isBefore;

    // validator
    static isBoolean = validator.isBoolean;

    // validator
    static isByteLength = validator.isByteLength;

    // validator
    static isCreditCard = validator.isCreditCard;

    // validator
    static isCurrency = validator.isCurrency;

    // validator
    static isDataURI = validator.isDataURI;

    // validator
    static isDate = validator.isDate;

    // validator
    static isDateAfter = validator.isAfter;

    // validator
    static isDateBefore = validator.isBefore;

    // validator
    static isDecimal = validator.isDecimal;

    // validator
    static isDivisibleBy = validator.isDivisibleBy;

    // validator
    static isEmail = validator.isEmail;

    // lodash [isEmpty], checks if value is an empty object, collection, map, or set (see docs).
    static isEmpty = _.isEmpty;

    // lodash [isEqual], performs a deep comparison between two values to determine if they are equivalent (see docs).
    static isEqual = _.isEqual;

    // validator
    static isFQDN = validator.isFQDN;

    // validator
    static isFloat = validator.isFloat;

    // validator
    static isFullWidth = validator.isFullWidth;

    // validator
    static isHalfWidth = validator.isHalfWidth;

    // validator
    static isHexColor = validator.isHexColor;

    // validator
    static isHexadecimal = validator.isHexadecimal;

    // validator
    static isIP = validator.isIP;

    // validator
    static isISBN = validator.isISBN;

    // validator
    static isISIN = validator.isISIN;

    // validator
    static isISO8601 = validator.isISO8601;

    // validator
    static isIn = validator.isIn;

    // validator
    static isInt = validator.isInt;

    // validator
    static isLowercase = validator.isLowercase;

    // validator
    static isMACAddress = validator.isMACAddress;

    // validator
    static isMatch = validator.matches;

    // validator
    static isMD5 = validator.isMD5;

    // validator
    static isMobilePhone = validator.isMobilePhone;

    // validator
    static isMongoId = validator.isMongoId;

    // validator
    static isMultibyte = validator.isMultibyte;

    // validator
    static isNull = validator.isNull;

    // validator
    static isNumeric = validator.isNumeric;

    // lodash [isObject]
    static isObject = _.isObject;

    // lodash [isMatch], Performs a partial deep comparison between object and source (see docs).
    static isPartialEqual = _.isMatch;

    // validator
    static isSurrogatePair = validator.isSurrogatePair;

    // validator
    static isURL = validator.isURL;

    // validator
    static isUUID = validator.isUUID;

    // validator
    static isUppercase = validator.isUppercase;

    // validator
    static isVariableWidth = validator.isVariableWidth;

    // validator
    static isWhitelisted = validator.isWhitelisted;

    // validator
    static ltrim = validator.ltrim;

    // validator
    static normalizeEmail = validator.normalizeEmail;

    // validator
    static rtrim = validator.rtrim;

    // validator
    static stripLow = validator.stripLow;

    // validator
    static toBoolean = validator.toBoolean;

    // validator
    static toDate = validator.toDate;

    // validator
    static toFloat = validator.toFloat;

    // validator
    static toInt = validator.toInt;

    // validator
    static trim = validator.trim;

    // validator
    static unescape = validator.unescape;

    // validator
    static whitelist = validator.whitelist;

    /**
     * Filter. Does not consider for duplicates.
     */
    static isContains(value: any, compare: [string]): boolean {
        let matches = 0;

        if (_.isObject(value)) {
            for (let i = 0, c = compare.length; i < c; i ++) {
                if (compare[i] in value === false) {
                    return false;
                }
            }

            return true;
        }

        if (_.isArray(value)) {
            for (let i = 0, c = compare.length; i < c; i ++) {
                if (value.indexOf(compare[i]) === - 1) {
                    return false;
                }
            }

            return true;
        }

        return false;
    }

    /**
     * Filter. Does not consider for duplicates.
     */
    static isNotContains(value: any, compare: [string]): boolean {
        let matches = 0;

        if (_.isObject(value)) {
            for (let i = 0, c = compare.length; i < c; i ++) {
                if (compare[i] in value) {
                    return false;
                }
            }

            return true;
        }

        if (_.isArray(value)) {
            for (let i = 0, c = compare.length; i < c; i ++) {
                if (value.indexOf(compare[i]) !== - 1) {
                    return false;
                }
            }

            return true;
        }

        return false;
    }

    /**
     * Filter. Does not consider for duplicates.
     */
    static isContainsOnly(value: any, compare: [string], strict: boolean = true): boolean {
        let matches = 0;

        if (_.isObject(value)) {
            for (let i = 0, c = compare.length; i < c; i ++) {
                if (compare[i] in value) {
                    matches ++;
                }
            }

            return Object.keys(value).length === matches;
        }

        if (_.isArray(value)) {
            for (let i = 0, c = compare.length; i < c; i ++) {
                if (value.indexOf(compare[i]) !== - 1) {
                    matches ++;
                }
            }

            return value.length === matches;
        }

        return false;
    }

    /**
     * Filter.
     */
    static isContainsOnlyIn(value: any, compare: [string]): boolean {
        let matches = 0;

        if (_.isObject(value)) {
            for (let k in value) {
                if (compare.indexOf(k) === - 1) {
                    return false;
                }
            }

            return true;
        }

        if (_.isArray(value)) {
            for (let i = 0, c = compare.length; i < c; i ++) {
                if (compare.indexOf(value[i]) === - 1) {
                    return false;
                }
            }

            return true;
        }

        return false;
    }

    /**
     * Sanitizer
     */
    static toNumber(value: any): number|void {
        return _.isString(value) ? parseInt(value) : (_.isNumber(value) ? value : NaN);
    }

    /**
     * Sanitizer
     */
    static toNullIfEmpty(value: any) {
        return this.isEmpty(value) ? null : value;
    }

    /**
     * Filter
     */
    static isGreater(value: any, compare: number): boolean {
        return _.isNumber(value) && (value | 0) > compare;
    }

    /**
     * Filter
     */
    static isGreaterOrEqual(value: any, compare: number): boolean {
        return _.isNumber(value) && (value | 0) >= compare;
    }

    /**
     * Filter
     */
    static isGreaterOrEqualToZero(value: any): boolean {
        return value === 0 || Validator.isGreater(value, 0);
    }

    /**
     * Filter
     */
    static isLength(value: any, min: number, max: number): boolean {
        let length: number;

        if (_.isArray(value) || _.isString(value)) {
            length = value.length;
        } else if (_.isObject(value)) {
            length = Object.keys(value).length;
        } else {
            return false;
        }

        if (min !== void 0 && length < min) {
            return false;
        }

        if (max !== void 0 && length > max) {
            return false;
        }

        return true;
    }

    /**
     * Filter
     */
    static isLengthOrNull(value: any, min: number, max: number) {
        return value === null ? true : Validator.isLength(value, min, max);
    }

    /**
     * Filter
     */
    static isLess(value: any, compare: number): boolean {
        return _.isNumber(value) && (value | 0) < compare;
    }

    /**
     * Filter
     */
    static isLessOrEqual(value: any, compare: number): boolean {
        return _.isNumber(value) && (value | 0) <= compare;
    }

    /**
     * Filter
     */
    static isLessOrEqualToZero(value: any): boolean {
        return value === 0 || Validator.isLess(value, 0);
    }

    /**
     * Filter
     */
    static isNotEmpty(value: any): boolean {
        return Validator.isEmpty(value) === false;
    }

    /**
     * Filter
     */
    static isNotEmptyArray(value: any): boolean {
        return Validator.isArray(value) && Validator.isEmpty(value) === false;
    }

    /**
     * Filter
     */
    static isNotEmptyObject(value: any): boolean {
        return Validator.isObject(value) && Validator.isEmpty(value) === false;
    }

    /**
     * Filter
     */
    static isArrayOrNull(value: any): boolean {
        return value === null || _.isArray(value);
    }

    /**
     * Filter
     */
    static isBooleanOrNull(value: any): boolean {
        return value === null || _.isBoolean(value);
    }

    /**
     * Filter
     */
    static isEmailOrNull(value: any): boolean {
        return value === null || validator.isEmail(value);
    }

    /**
     * Filter
     */
    static isNumberNegative(value: any): boolean {
        return Validator.isLess(value, 0);
    }

    /**
     * Filter
     */
    static isNumberPositive(value: any): boolean {
        return Validator.isGreater(value, 0);
    }

    /**
     * Filter
     */
    static isNumberOrNull(value: any): boolean {
        return value === null || _.isNumber(value);
    }

    /**
     * Filter
     */
    static isNumberOrNumeric(value: any): boolean {
        return _.isNumber(value) || validator.isNumeric(value);
    }

    /**
     * Filter
     */
    static isObjectOrNull(value: any): boolean {
        return value === null || _.isObject(value);
    }

    /**
     * Filter
     */
    static isStringOrNull(value: any): boolean {
        return value === null || _.isString(value);
    }

    /**
     * Filter
     */
    static isVoid(value: any): boolean {
        return value === void 0;
    }

    /**
     * Filter
     */
    static isNotVoid(value: any): boolean {
        return value !== void 0;
    }

    /**
     * Constructor.
     *
     * @param schema Data validation schema.
     */
    constructor(schema: Dictionary<any>) {
        this.schema = schema;

        _.each(
            schema,
            (v, k: string) => {
                let last = this._schema,
                    elem = this._schema;

                k.split('.').forEach(
                    (v) => {
                        last = elem;
                        elem = elem[k = v] || (elem[v] = {'##': {s: void 0, v: []}});

                        if (k === '[]') {
                            last['##'].v.push({
                                args: [],
                                isValidator: true,
                                message: void 0,
                                validator: 'isArray'
                            });
                        }
                    }
                );

                (_.isArray(v) ? v : [ v ]).forEach(
                    (v) => {
                        _.isArray(v) || (v = [ v ]);

                        if (_.isString(v[0])) {
                            let t = v[0].split(':');

                            if (t[0] === 'custom') {
                                last[k]['##'].custom = v[1];
                            } else
                            if (t[0] === 'default') {
                                last[k]['##'].d = v[1];
                            } else
                            if (t[0] === 'isExists') {
                                last[k]['##'].s = t[1] || false;
                            } else
                            if (t[0] === 'showAs') {
                                last[k]['##'].showAs = t[1] || false;
                            } else
                            if (Validator[t[0]] || validator[t[0]] || _[t[0]]) {
                                last[k]['##'].v.push({
                                    args: v.slice(1),
                                    isValidator: t[0].substr(0, 2) === 'is',
                                    message: t[1],
                                    validator: t[0]
                                });
                            } else {
                                throw new Error('Validator is not defined: ' + t[0]);
                            }
                        } else {
                            last[k]['##'].v.push({
                                args: v.slice(1),
                                isValidator: v[0].substr(0, 2) === 'is' || v[0] in DeepValidator._isValidators,
                                message: null,
                                validator: v[0]
                            });
                        }
                    }
                );
            }
        );

        this._sarray['[]'] = this._schema;
    }

    /**
     * Get all errors of last validation.
     *
     * @returns {{}}
     */
    getErrors(asArray: boolean = false): Dictionary<string> {
        return asArray ? _.toArray(this.errors) : this.errors;
    }

    /**
     * Get next error of last validation.
     *
     * @returns {any}
    any getNextError(): void|{} {
        if (this._nextError === null) {
            let k = Object.keys(this.errors),
                i = 0;

            this._nextError = () => {
                if (i ++ < k.length) {
                    return {
                        field: k[i - 1],
                        message: this.errors[k[i - 1]]
                    }
                }

                return void 0;
            }
        }

        return this._nextError();
    }

    /**
     * Set default [data invalid] message. Message will be preset if provided data is invalid.
     *
     * @param value Value.
     * 
     * @returns {Validator}
     */
    setMessageInvalid(value: number|string): Validator {
        this._messageInvalid = value;

        return this;
    }

    /**
     * Set default [missing key] message. Message will be preset if [isExists] validator fails and has no self message.
     *
     * @param value Value.
     * 
     * @returns {Validator}
     */
    setMessageMissingKey(value: number|string): Validator {
        this._messageMissingKey = value;

        return this;
    }

    /**
     * Set translator function.
     *
     * @param value Value.
     *
     * @returns {Validator}
     */
    setTranslator(value: (message: string) => any): Validator {
        this._translator = value;

        return this;
    }

    /**
     * Set [arrayAllow] mode. Allows applying schema to each element of data if data is array.
     *
     * @param value Value.
     * 
     * @returns {Validator}
     */
    arrayAllow(value: boolean = true): Validator {
        this._arrayAllow = value;

        return this;
    }

    /**
     * Set [strict] mode. All scope keys will be checked for presence.
     *
     * @param value Value.
     * 
     * @returns {Validator}
     */
    strict(value: boolean = true): Validator {
        this._strict = value;

        return this;
    }

    /**
     * Set [tryAll] mode. All scope validators will be applied in despite of earlier failures.
     *
     * @param value Value.
     * 
     * @returns {Validator}
     */
    tryAll(value: boolean = true): Validator {
        this._tryAll = value;

        return this;
    }

    /**
     * Validate data. If returns [false] errors list can be retrieved by [getErrors] or [getNextError] iterator.
     *
     * @param data Data to be validated.
     * @param arrayAllow Allow apply schema to each element of data if data is array.
     * 
     * @returns {boolean}
     */
    validate(data: any[]|Dictionary<any>, arrayAllow: boolean = false): boolean {
        this._nextError = null;
        this.errors = {};

        if (_.isArray(data)) {
            if (this._arrayAllow === false && arrayAllow === false) {
                this.errors = {
                    '??': this._messageInvalid,
                };

                return this.passed = false;
            }

            this._validate(data, this._sarray, this._tryAll, this.errors, this._strict, '');
        } else {
            if (_.isObject(data) === false) {
                this.errors = {
                    '??': this._messageInvalid,
                };

                return this.passed = false;
            }

            this._validate(data, this._schema, this._tryAll, this.errors, this._strict, '');
        }

        return this.passed = _.isEmpty(this.errors);
    }
}


export class Validator extends DeepValidator {}
