

import * as _ from 'lodash';
import * as validator from 'validator';
import Dictionary = _.Dictionary;


type ValidatorEntry = {

    args: string;

    isValidator: boolean;

    message: string;

    validator: string|((...a: any[]) => any)|DeepValidator;

}


export class FlowBuilder {

    flow: any[] = [];

    isExists(message: string = void 0) {
        this.flow.push(message ? 'isExists:' + message : 'isExists');

        return this;
    }

    isInRange(message: string = void 0, min: number, max: number) {
        this.flow.push(message ? 'isExists:' + message : 'isExists');

        return this;
    }

    isString(message: string = void 0) {
        this.flow.push(message ? 'isString:' + message : 'isString');

        return this;
    }

}


export class Flow {

    static isExists(message: string = void 0) {
        return new FlowBuilder().isExists(message);
    }

    static isInRange(message: string = void 0, min: number, max: number) {
        return new FlowBuilder().isInRange(message, min, max);
    }

    static isString(message: string = void 0) {
        return new FlowBuilder().isString(message);
    }

}


export class DeepValidator {

    protected static _isValidators = {
        contains: true,
        equals: true,
        if: true,
        matches: true,
    };

    protected _arrayAllow: boolean = false;

    protected _nextError = null;

    protected _messageInvalid: any = false;

    protected _messageMissingKey: any = false;

    protected _sarray = {'##': {strict: void 0, v: []}};

    protected _schema = {'##': {strict: void 0, v: []}};

    protected _strict: boolean = false;

    protected _translator: (message: string) => any = null;

    protected _tryAll: boolean = false;

    static _ = _;

    errors: Dictionary<any> = {};

    passed = false;

    schema = null;

    /**
     * Dummy translator.
     */
    protected static _translate(message: string): any {
        return message;
    }

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
        for (let i = 0, l = schema['##'].v.length; i < l; i ++) {
            let entry: ValidatorEntry = schema['##'].v[i];

            let isValidator: boolean = true;

            let result: any = true;

            // if nested validator
            if (entry.validator instanceof DeepValidator) {
                result = (<DeepValidator>entry.validator).validate(data, true);

                if (result !== true) {
                    result = (<DeepValidator>entry.validator).getErrors();
                }
            } else {

                // custom validator/sanitizer; sanitizer can modify data by reference (v, k <= key, d <= reference) and then must return [true]
                if (_.isFunction(entry.validator)) {
                    let validator = <(...a:any[]) => any>entry.validator;

                    result = entry.message = validator(data, key, ref);

                    data = ref[key];
                } else {
                    let validator = <string>entry.validator;

                    // try [self]
                    if (DeepValidator[validator]) {
                        isValidator = entry.isValidator;
                        result = DeepValidator[validator](
                            data,
                            entry.args[0],
                            entry.args[1],
                            entry.args[2],
                            entry.args[3],
                            key,
                            ref,
                            schema
                        );
                    }
                }
            }

            if (isValidator) {
                if (result !== true) {
                    if (DeepValidator.isObject(result)) {

                        // extend errors object with set of messages
                        _.each(result, (v, k: string) => {
                            errors[message ? message + '.' + k : k] = v;
                        });
                    } else {
                        errors[message] = entry.message || false;
                    }

                    return false;
                }
            } else {
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
            if (schema['[]']) {
                for (let i = 0, l = data.length; i < l; i ++) {
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

                        if (schema[k]['##'].def !== void 0) {
                            data[k] = typeof schema[k]['##'].def === 'function' ?
                                schema[k]['##'].def(k, data, k in data) :
                                schema[k]['##'].def;

                            continue;
                        }
                    }

                    if (strict || schema[k]['##'].strict !== void 0) {
                        errors[mes] = schema[k]['##'].strict || this._messageMissingKey;

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

    // from validator
    static alpha = validator.alpha;

    // from validator
    static blacklist = validator.blacklist;

    // from validator
    static escape = validator.escape;

    // from validator
    static isAfter = validator.isAfter;

    // from validator
    static isAlpha = validator.isAlpha;

    // from validator
    static isAlphanumeric = validator.isAlphanumeric;

    // from lodash [isArray]
    static isArray = _.isArray;

    // from validator
    static isBase64 = validator.isBase64;

    // from validator
    static isBefore = validator.isBefore;

    // from validator
    static isBoolean = validator.isBoolean;

    // from validator
    static isByteLength = validator.isByteLength;

    // from validator
    static isCreditCard = validator.isCreditCard;

    // from validator
    static isCurrency = validator.isCurrency;

    // from validator
    static isDataURI = validator.isDataURI;

    // from validator
    static isDate = validator.isDate;

    // from validator
    static isDateAfter = validator.isAfter;

    // from validator
    static isDateBefore = validator.isBefore;

    // from validator
    static isDecimal = validator.isDecimal;

    // from validator
    static isDivisibleBy = validator.isDivisibleBy;

    // from validator
    static isEmail = validator.isEmail;

    // from lodash [isEmpty], checks if value is an empty object, collection, map, or set (see docs).
    static isEmpty = _.isEmpty;

    // from lodash [isEqual], performs a deep comparison between two values to determine if they are equivalent (see docs).
    static isEquals = _.isEqual;

    // from validator
    static isFQDN = validator.isFQDN;

    // from lodash [isFinite]
    static isFinite = _.isFinite;

    // from validator
    static isFloat = validator.isFloat;

    // from validator
    static isFullWidth = validator.isFullWidth;

    // from validator
    static isHalfWidth = validator.isHalfWidth;

    // from validator
    static isHexColor = validator.isHexColor;

    // from validator
    static isHexadecimal = validator.isHexadecimal;

    // from validator
    static isIP = validator.isIP;

    // from validator
    static isISBN = validator.isISBN;

    // from validator
    static isISIN = validator.isISIN;

    // from validator
    static isISO8601 = validator.isISO8601;

    // from validator
    static isIn = validator.isIn;

    // from validator
    static isInt = validator.isInt;

    // from validator
    static isLowercase = validator.isLowercase;

    // from validator
    static isMACAddress = validator.isMACAddress;

    // from validator
    static isMatches = validator.matches;

    // from validator
    static isMD5 = validator.isMD5;

    // from validator
    static isMobilePhone = validator.isMobilePhone;

    // from validator
    static isMongoId = validator.isMongoId;

    // from validator
    static isMultibyte = validator.isMultibyte;

    // from lodash [isNaN]
    static isNaN = _.isNaN;

    // from lodash [isNil]
    static isNil = _.isNil;

    // from validator
    static isNull = validator.isNull;

    // from validator
    static isNumber = _.isNumber;

    // from validator
    static isNumeric = validator.isNumeric;

    // from lodash [isMatch], performs a partial deep comparison between object and source (see docs).
    static isPartialEqual = _.isMatch;

    // from lodash [isString]
    static isString = _.isString;

    // from validator
    static isSubstring = validator.contains;

    // from validator
    static isSurrogatePair = validator.isSurrogatePair;

    // from validator
    static isURL = validator.isURL;

    // from validator
    static isUUID = validator.isUUID;

    // from validator
    static isUppercase = validator.isUppercase;

    // from validator
    static isVariableWidth = validator.isVariableWidth;

    // from validator
    static isWhitelisted = validator.isWhitelisted;

    // from validator
    static ltrim = validator.ltrim;

    // from validator
    static normalizeEmail = validator.normalizeEmail;

    // from validator
    static rtrim = validator.rtrim;

    // from validator
    static stripLow = validator.stripLow;

    // from lodash [toArray]
    static toArray = _.toArray;

    // from validator
    static toBoolean = validator.toBoolean;

    // from validator
    static toDate = validator.toDate;

    // from lodash [toFinite]
    static toFinite = _.toFinite;

    // from validator
    static toFloat = validator.toFloat;

    // from validator
    static toInt = validator.toInt;

    // from validator
    static trim = validator.trim;

    // from validator
    static unescape = validator.unescape;

    // from validator
    static whitelist = validator.whitelist;

    /**
     * Clean value. Similar to [filter] but filters a given value using an active (internal) schema.
     */
    static clean(value: any, a, b, c, d, key: string, ref: any, schema: any): any {
        return _.pick(value, Object.keys(schema));
    }

    /**
     *
     */
    static if(
        value: any,
        filter: [string]|string,
        branchTrue: DeepValidator,
        branchFalse: DeepValidator
    ): any {
        if (_.isArray(filter) === false) {
            filter = [<string>filter];
        }

        let result: boolean;

        if (DeepValidator[filter[0]](value, filter[1], filter[2], filter[3], filter[4])) {
            result = branchTrue.validate(value);

            if (result === false) {
                return branchTrue.getErrors();
            }
        } else {
            result = branchFalse.validate(value);

            if (result === false) {
                return branchFalse.getErrors();
            }
        }

        return true;
    }

    /**
     * Filter. Does not consider for duplicates.
     */
    static isContains(value: any, compare: [string]): boolean {
        let matches = 0;

        if (DeepValidator.isObject(value)) {
            for (let i = 0, l = compare.length; i < l; i ++) {
                if (compare[i] in value === false) {
                    return false;
                }
            }

            return true;
        }

        if (_.isArray(value)) {
            for (let i = 0, l = compare.length; i < l; i ++) {
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

        if (DeepValidator.isObject(value)) {
            for (let i = 0, l = compare.length; i < l; i ++) {
                if (compare[i] in value) {
                    return false;
                }
            }

            return true;
        }

        if (_.isArray(value)) {
            for (let i = 0, l = compare.length; i < l; i ++) {
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
    static isContainsOnly(value: any, compare: [string]): boolean {
        let matches = 0;

        if (DeepValidator.isObject(value)) {
            for (let i = 0, l = compare.length; i < l; i ++) {
                if (compare[i] in value) {
                    matches ++;
                }
            }

            return compare.length === matches && Object.keys(value).length === matches;
        }

        if (_.isArray(value)) {
            for (let i = 0, l = compare.length; i < l; i ++) {
                if (value.indexOf(compare[i]) !== - 1) {
                    matches ++;
                }
            }

            return compare.length === matches && value.length === matches;
        }

        return false;
    }

    /**
     * Filter.
     */
    static isGreater(value: any, compare: number): boolean {
        return _.isNumber(value) && value > compare;
    }

    /**
     * Filter.
     */
    static isGreaterOrEqual(value: any, compare: number): boolean {
        return _.isNumber(value) && value >= compare;
    }

    /**
     * Filter.
     */
    static isGreaterOrEqualToZero(value: any): boolean {
        return value === 0 || this.isGreater(value, 0);
    }

    /**
     * Filter.
     */
    static isInRange(value: number, min: number, max: number): boolean {
        return _.isNumber(value) && value >= min && value <= max;
    }

    /**
     * Filter.
     */
    static isLength(value: any, min?: number, max?: number): boolean {
        let length: number;

        if (_.isArray(value) || _.isString(value)) {
            length = value.length;
        } else if (this.isObject(value)) {
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
     * Filter.
     */
    static isLess(value: any, compare: number): boolean {
        return _.isNumber(value) && value < compare;
    }

    /**
     * Filter.
     */
    static isLessOrEqual(value: any, compare: number): boolean {
        return _.isNumber(value) && value <= compare;
    }

    /**
     * Filter.
     */
    static isLessOrEqualToZero(value: any): boolean {
        return value === 0 || this.isLess(value, 0);
    }

    /**
     * Filter.
     */
    static isNotEmpty(value: any): boolean {
        return this.isEmpty(value) === false;
    }

    /**
     * Filter.
     */
    static isNotEmptyArray(value: any): boolean {
        return _.isArray(value) && this.isEmpty(value) === false;
    }

    /**
     * Filter.
     */
    static isNotEmptyObject(value: any): boolean {
        return this.isObject(value) && this.isEmpty(value) === false;
    }

    /**
     * Filter.
     */
    static isNotVoid(value: any): boolean {
        return value !== void 0;
    }

    /**
     * Filter.
     */
    static isNumberNegative(value: any): boolean {
        return this.isLess(value, 0);
    }

    /**
     * Filter.
     */
    static isNumberPositive(value: any): boolean {
        return this.isGreater(value, 0);
    }

    /**
     * Filter.
     */
    static isNumberOrNumeric(value: any): boolean {
        return _.isNumber(value) || (_.isString(value) && validator.isNumeric(value));
    }

    /**
     * Filter.
     */
    static isObject(value: any): boolean {
        return _.isObjectLike(value) && (value instanceof Array) === false;
    }

    /**
     * Filter.
     */
    static isVoid(value: any): boolean {
        return value === void 0;
    }

    /**
     * Sanitizer. Picks values (by RegExp checks strings only) by matching to given pattern.
     *
     * @param value Value.
     * @param filter Filter RegExp or function.
     * @param objectAllow Ignore object-like values (arrays or sets).
     *
     * @returns {TResult}
     */
    static filter(value: any, filter: RegExp|((v: string) => boolean), objectAllow?: boolean): any {
        return _.pickBy(
            value,
            filter instanceof RegExp ?
                (v: any) => _.isString(v) ? validator.matches(v, filter) : objectAllow !== false && _.isObjectLike(v) :
                <((v: string) => boolean)>filter
        );
    }

    /**
     * Sanitizer. Picks keys by matching to given pattern.
     */
    static filterKeys(value: any, filter: string[]|RegExp|((v: string) => boolean)): any {
        return _.pickBy(
            value,
            filter instanceof RegExp ?
                (v, k) => validator.matches(k, filter) :
                <((v: string) => boolean)>filter
        );
    }

    /**
     * Sanitizer. Remove all key starting from [$].
     */
    static filterMongoDocKeys(value: any): any {
        return this.filterKeys(value, /^([^\$].*){1,}$/);
    }

    /**
     * Sanitizer.
     */
    static toNumber(value: any): number|void {
        return this.isNumberOrNumeric(value) ? Number(value) : (_.isNumber(value) ? value : NaN);
    }

    /**
     * Sanitizer.
     */
    static toNullIfEmpty(value: any) {
        return this.isEmpty(value) ? null : value;
    }

    /**
     * Sanitizer.
     */
    static toString(value: any) {
        return value === void 0 ? '' : String(value);
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

                if (v instanceof FlowBuilder) {
                    v = v.flow;
                }

                (_.isArray(v) ? v : [v]).forEach(
                    (v) => {
                        _.isArray(v) || (v = [v]);

                        if (v[0] instanceof DeepValidator || _.isFunction(v[0])) {
                            last[k]['##'].v.push({
                                args: v.slice(1),
                                isValidator: true,
                                message: null,
                                validator: v[0]
                            });
                        } else if (_.isString(v[0])) {
                            let pair = v[0].split(':');

                            if (pair[0] === 'custom') {
                                last[k]['##'].custom = v[1];
                            } else if (pair[0] === 'default') {
                                last[k]['##'].def = v[1];
                            } else if (pair[0] === 'isExists') {
                                last[k]['##'].strict = pair[1] || false;
                            } else if (pair[0] === 'showAs') {
                                last[k]['##'].showAs = pair[1] || false;
                            } else if (DeepValidator[pair[0]]) {

                                // special for [if]
                                if (pair[0] === 'if') {
                                    if (v.length !== 4) {
                                        throw new Error('Validator of [if] must contain condition checker and branches.');
                                    }

                                    let cond = _.isArray(v[1]) ? v[1][0] : v[1];

                                    if (_.isString(cond) === false) {
                                        throw new Error('Validator of [if] must define valid condition checker.');
                                    }

                                    if (v[2] instanceof DeepValidator && v[3] instanceof DeepValidator) {

                                    } else {
                                        throw new Error('Validator of [if] must define valid branch instances of [DeepValidator].');
                                    }

                                    if (cond in DeepValidator && cond.substr(0, 2) === 'is') {

                                    } else {
                                        throw new Error('Condition checker is not defined or invalid: ' + cond);
                                    }
                                }

                                last[k]['##'].v.push({
                                    args: v.slice(1),
                                    isValidator: pair[0].substr(0, 2) === 'is' || v[0] in DeepValidator._isValidators,
                                    message: pair[1],
                                    validator: pair[0]
                                });
                            } else {
                                throw new Error('Validator is not defined: ' + pair[0]);
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

        this._translator = DeepValidator._translate;
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
     * @returns {void|{}}
     */
    getNextError(): void|Dictionary<any> {
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
     * Set default [data invalid] message. Message will be set if provided data is invalid.
     *
     * @param value Value.
     *
     * @returns {DeepValidator}
     */
    setMessageInvalid(value: number|string): DeepValidator {
        this._messageInvalid = value;

        return this;
    }

    /**
     * Set default [missing key] message. Message will be set if [isExists] validator fails and has no self message.
     *
     * @param value Value.
     *
     * @returns {DeepValidator}
     */
    setMessageMissingKey(value: number|string): DeepValidator {
        this._messageMissingKey = value;

        return this;
    }

    /**
     * Set translator function.
     *
     * @param value Value.
     *
     * @returns {DeepValidator}
     */
    setTranslator(value: (message: string) => any): DeepValidator {
        this._translator = value;

        return this;
    }

    /**
     * Set [arrayAllow] mode. Allows applying schema to each element of data if data is array.
     *
     * @param value Value.
     *
     * @returns {DeepValidator}
     */
    arrayAllow(value: boolean = true): DeepValidator {
        this._arrayAllow = value;

        return this;
    }

    /**
     * Set [strict] mode. All schema keys will be checked for presence.
     *
     * @param value Value.
     *
     * @returns {DeepValidator}
     */
    strict(value: boolean = true): DeepValidator {
        this._strict = value;

        return this;
    }

    /**
     * Set [tryAll] mode. All scope validators will be applied in despite of earlier failures.
     *
     * @param value Value.
     *
     * @returns {DeepValidator}
     */
    tryAll(value: boolean = true): DeepValidator {
        this._tryAll = value;

        return this;
    }

    /**
     * Validate data. If returns [false] errors list can be retrieved by [getErrors] or [getNextError] iterator.
     *
     * @param data Data to be validated.
     * @param arrayAllow Allow apply schema to each element of data if data is array.
     * @param errors Internal usage.
     * @param prefix Internal usage.
     *
     * @returns {boolean}
     */
    validate(data: any[]|Dictionary<any>, arrayAllow: boolean = false, errors?, prefix?): boolean {
        this._nextError = null;
        this.errors = {};

        if (_.isArray(data)) {
            if (this._arrayAllow === false && arrayAllow === false) {
                this.errors = {
                    '??': this._messageInvalid,
                };

                return this.passed = false;
            }

            this._validate(data, this._sarray, this._tryAll, errors || this.errors, this._strict, prefix || '');
        } else {
            if (_.isObject(data) === false) {
                this.errors = {
                    '??': this._messageInvalid,
                };

                return this.passed = false;
            }

            this._validate(data, this._schema, this._tryAll, errors || this.errors, this._strict, prefix || '');
        }

        return this.passed = _.isEmpty(this.errors);
    }
}


// [OrNull] patch
_.each(DeepValidator, (v: any, k: string) => {
    if (DeepValidator.hasOwnProperty(k) && _.isFunction(v) && k.substr(0, 2) === 'is') {
        DeepValidator[k + 'OrNull'] = function (value) {
            return value === null || DeepValidator[k].apply(DeepValidator, arguments);
        };
    }
});


export class Validator extends DeepValidator {}


export let deepValidator = (schema: Dictionary<any>): DeepValidator => new DeepValidator(schema);
