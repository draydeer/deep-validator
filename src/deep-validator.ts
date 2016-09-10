

import * as _ from 'lodash';
import * as validator from 'validator';
import Dictionary = _.Dictionary;


type ValidatorEntry = {

    args: string;

    isValidator: boolean;

    message: string;

    notExtendErrors: boolean;

    validator: string|((...a: any[]) => any)|DeepValidator;

}


type ValidatorSubFlow = Dictionary<any>|DeepValidator;


export class FlowBuilder {

    flow: any[] = [];

    default(value: any) {
        this.flow.push(['default', value]);

        return this;
    }

    if(checker: any, trueFlow: ValidatorSubFlow, falseFlow: ValidatorSubFlow) {
        this.flow.push(['if', checker, trueFlow, falseFlow]);

        return this;
    }

    isExists(message?: string) {
        this.flow.push([message ? 'isExists:' + message : 'isExists']);

        return this;
    }

    isInRange(min: number, max: number, message?: string) {
        this.flow.push([message ? 'isInRange:' + message : 'isInRange', min, max]);

        return this;
    }

    isNegative(message?: string) {
        this.flow.push([message ? 'isNegative:' + message : 'isNegative']);

        return this;
    }

    isNumber(message?: string) {
        this.flow.push([message ? 'isNumber:' + message : 'isNumber']);

        return this;
    }

    isNumberOrNumeric(message?: string) {
        this.flow.push([message ? 'isNumberOrNumeric:' + message : 'isNumberOrNumeric']);

        return this;
    }

    isPositive(message?: string) {
        this.flow.push([message ? 'isPositive:' + message : 'isPositive']);

        return this;
    }

    isString(message?: string) {
        this.flow.push([message ? 'isString:' + message : 'isString']);

        return this;
    }

    showAs(name: string) {
        this.flow.push(['showAs', name]);

        return this;
    }

}


export class Flow {

    static default(value: any) {
        return new FlowBuilder().default(value);
    }

    static if(checker: any, trueBranch: ValidatorSubFlow, falseBranch: ValidatorSubFlow) {
        return new FlowBuilder().if(checker, trueBranch, falseBranch);
    }

    static isExists(message?: string) {
        return new FlowBuilder().isExists(message);
    }

    static isInRange(min: number, max: number, message?: string) {
        return new FlowBuilder().isInRange(min, max, message);
    }

    static isNegative(message?: string) {
        return new FlowBuilder().isNegative(message);
    }

    static isNumber(message?: string) {
        return new FlowBuilder().isNumber(message);
    }

    static isNumberOrNumeric(message?: string) {
        return new FlowBuilder().isNumberOrNumeric(message);
    }

    static isPositive(message?: string) {
        return new FlowBuilder().isPositive(message);
    }

    static isString(message?: string) {
        return new FlowBuilder().isString(message);
    }

    static showAs(name: string) {
        return new FlowBuilder().showAs(name);
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

    protected _maxDepth: number = 99999999;

    protected _maxDepthPassToNested: boolean = true;

    protected _messageMaxDepth: any = false;

    protected _messageInvalid: any = false;

    protected _messageMissingKey: any = false;

    protected _nextError = null;

    protected _sarray = {'##': {strict: void 0, v: []}};

    protected _schema = {'##': {strict: void 0, v: []}};

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
    protected static _addError(errors: _.Dictionary<any>, key: string, value: any, path?: string): DeepValidator {
        errors[path ? path + '.' + key : key] = value;
    }

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
        path: string = '',
        root: string = '',
        depth: number = 0,
        key?: string,
        ref?: any
    ): boolean {
        if (this._maxDepth <= depth) {
            DeepValidator._addError(errors, '*', this._messageMaxDepth, path);

            return false;
        }

        let isObject = _.isObject(data);

        // apply validators/sanitizers
        for (let i = 0, l = schema['##'].v.length; i < l; i ++) {
            let entry: ValidatorEntry = schema['##'].v[i];

            let isValidator: boolean = true;

            let result: any = true;

            // if nested validator
            if (entry.validator instanceof DeepValidator) {
                let validator: DeepValidator = <DeepValidator>entry.validator;

                let oldMaxDepth: number = validator.getMaxDepth();

                if (this._maxDepthPassToNested) {
                    validator.maxDepth(this._maxDepth);
                }

                result = validator.validate(
                    data,
                    true,
                    void 0,
                    void 0,
                    this._maxDepthPassToNested ? depth : 0
                );

                if (this._maxDepthPassToNested) {
                    validator.maxDepth(oldMaxDepth);
                }

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
                            errors,
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
                        if (entry.notExtendErrors) {
                            _.each(result, (v, k: string) => {
                                DeepValidator._addError(errors, k, v, root);
                            });
                        } else {
                            _.each(result, (v, k: string) => {
                                DeepValidator._addError(errors, k, v, path);
                            });
                        }
                    } else {
                        DeepValidator._addError(errors, path, entry.message || false);
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
                            path ? path + '.' + i : i.toString(),
                            path,
                            depth + 1,
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
                if (k !== '##' && k !== '[]') {
                    let entry = schema[k]['##'];

                    let field = (entry && entry.showAs) || k;

                    let pathField: string = path ? path + '.' + field : field;

                    if (isObject) {
                        if (k in data) {
                            if (this._validate(
                                data[k],
                                schema[k],
                                tryAll,
                                errors,
                                strict,
                                pathField,
                                path,
                                depth + 1,
                                k,
                                data
                            ) || tryAll) {
                                continue;
                            } else {
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
                        DeepValidator._addError(errors, pathField, entry.strict || this._messageMissingKey);

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
        filter: any[]|string,
        branchTrue: DeepValidator,
        branchFalse: DeepValidator,
        errors: any,
        key?,
        ref?,
        schema?
    ): any {
        if (_.isArray(filter) === false) {
            filter = [<string>filter];
        }

        let result: boolean;

        if (DeepValidator[filter[0]](value, filter[1], filter[2], filter[3])) {
            result = branchTrue.validate(ref);

            if (result === false) {
                return branchTrue.getErrors();
            }
        } else {
            result = branchFalse.validate(ref);

            if (result === false) {
                return branchFalse.getErrors();
            }
        }

        return true;
    }

    /**
     *
     */
    static ifCustom(
        value: any,
        filter: any[]|((val: any, key: string, ref: any) => boolean),
        branchTrue: DeepValidator,
        branchFalse: DeepValidator,
        errors: any,
        key?,
        ref?,
        schema?
    ): any {
        if (_.isArray(filter) === false) {
            filter = [<(val: any, key: string, ref: any) => boolean>filter];
        }

        let result: boolean;

        if (filter[0](value, key, ref)) {
            result = branchTrue.validate(ref);

            if (result === false) {
                return branchTrue.getErrors();
            }
        } else {
            result = branchFalse.validate(ref);

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
     * Filter. Alias of [isNumberNegative].
     */
    static isNegative(value: any): boolean {
        return this.isNumberNegative(value);
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
     * Filter. Alias of [isNumberPositive].
     */
    static isPositive(value: any): boolean {
        return this.isNumberPositive(value);
    }

    /**
     * Filter.
     */
    static isVoid(value: any): boolean {
        return value === void 0;
    }

    /**
     * Sanitizer. Picks values (by RegExp checks strings only) by matching to a given pattern.
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
            filter instanceof RegExp
                ? (v: any) => _.isString(v) ? validator.matches(v, filter) : objectAllow !== false && _.isObjectLike(v)
                : <((v: string) => boolean)>filter
        );
    }

    /**
     * Sanitizer. Picks keys by matching to a given pattern.
     */
    static filterKeys(value: any, filter: string[]|RegExp|((v: string) => boolean)): any {
        return _.pickBy(
            value,
            filter instanceof RegExp
                ? (v, k) => validator.matches(k, filter)
                : <((v: string) => boolean)>filter
        );
    }

    /**
     * Sanitizer. Remove all keys of MongoDb document like object starting from [$].
     */
    static filterMongoDocKeys(value: any): any {
        return this.filterKeys(value, /^([^\$].*){1,}$/);
    }

    /**
     * Sanitizer.
     */
    static toNumber(value: any): number|void {
        return this.isNumberOrNumeric(value) ? Number(value) : NaN;
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
        return value === void 0 || value === null ? '' : String(value);
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
                                notExtendErrors: v[0] instanceof DeepValidatorMerged,
                                validator: v[0]
                            });
                        } else if (_.isString(v[0])) {
                            let pair = v[0].split(':');

                            if (pair[0] === 'custom') {
                                if (_.isFunction(v[1])) {
                                    last[k]['##'].custom = v[1];
                                } else {
                                    throw new Error('Validator of [custom] must be a function.');
                                }
                            } else if (pair[0] === 'default') {
                                last[k]['##'].def = v[1];
                            } else if (pair[0] === 'isExists') {
                                last[k]['##'].strict = pair[1] || false;
                            } else if (pair[0] === 'showAs') {
                                last[k]['##'].showAs = pair[1] || false;
                            } else if (DeepValidator[pair[0]]) {
                                let notExtendErrors: boolean = false;

                                // special for [if]
                                if (pair[0] === 'if') {
                                    if (v.length !== 4) {
                                        throw new Error('Validator of [if] must contain a condition checker and sub-flows.');
                                    }

                                    let cond = _.isArray(v[1]) ? v[1][0] : v[1];

                                    if (_.isString(cond) === false && _.isFunction(cond) === false) {
                                        throw new Error('Validator of [if] must define a valid condition checker.');
                                    }

                                    if (! (v[2] instanceof DeepValidator)) {
                                        if (DeepValidator.isObject(v[2])) {
                                            v[2] = new DeepValidator(v[2]);
                                        } else {
                                            throw new Error('Validator of [if] must define a valid sub-flows instances of [DeepValidator].');
                                        }
                                    }

                                    if (! (v[3] instanceof DeepValidator)) {
                                        if (DeepValidator.isObject(v[3])) {
                                            v[3] = new DeepValidator(v[3]);
                                        } else {
                                            throw new Error('Validator of [if] must define a valid sub-flows instances of [DeepValidator].');
                                        }
                                    }

                                    if (_.isFunction(cond) === false) {
                                        if (cond in DeepValidator && cond.substr(0, 2) === 'is') {

                                        } else {
                                            throw new Error('Condition checker is not defined or invalid: ' + cond);
                                        }
                                    } else {
                                        last[k]['##'].v.push({
                                            args: v.slice(1),
                                            isValidator: true,
                                            message: pair[1],
                                            notExtendErrors: true,
                                            validator: 'ifCustom'
                                        });

                                        return;
                                    }

                                    notExtendErrors = true;
                                }

                                last[k]['##'].v.push({
                                    args: v.slice(1),
                                    isValidator: pair[0].substr(0, 2) === 'is' || v[0] in DeepValidator._isValidators,
                                    message: pair[1],
                                    notExtendErrors: notExtendErrors,
                                    validator: pair[0]
                                });
                            } else {
                                throw new Error('Validator is not defined: ' + pair[0]);
                            }
                        } else if (DeepValidator.isObject(v[0])) {
                            last[k]['##'].v.push({
                                args: [],
                                isValidator: true,
                                message: null,
                                notExtendErrors: v[0] instanceof DeepValidatorMerged,
                                validator: new DeepValidator(v[0])
                            });
                        } else {
                            throw new Error('Invalid value: ' + String(v[0]));
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
     * Get max depth of nested scan.
     *
     * @returns {number}
     */
    getMaxDepth(): number {
        return this._maxDepth;
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
     * Set default [max  depth reached] message. Message will be set if max depth of nested scan has been reached.
     *
     * @param value Value.
     *
     * @returns {DeepValidator}
     */
    setMessageMaxDepthReached(value: number|string): DeepValidator {
        this._messageMaxDepth = value;

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
     * Set max depth of nested scan.
     *
     * @param value Value.
     *
     * @returns {DeepValidator}
     */
    maxDepth(value: number): DeepValidator {
        this._maxDepth = value;

        return this;
    }

    /**
     * Set mode of passing incremented [depth] value to a nested validator.
     *
     * @param value Value.
     *
     * @returns {DeepValidator}
     */
    maxDepthPassToNested(value: boolean = true): DeepValidator {
        this._maxDepthPassToNested = value;

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
    validate(data: any[]|Dictionary<any>, arrayAllow: boolean = false, errors?, prefix?, depth?): boolean {
        this._nextError = null;
        this.errors = {};

        if (_.isArray(data)) {
            if (this._arrayAllow === false && arrayAllow === false) {
                this.errors = {
                    '??': this._messageInvalid,
                };

                return this.passed = false;
            }

            this._validate(
                data,
                this._sarray,
                this._tryAll,
                errors || this.errors,
                this._strict,
                prefix || '',
                prefix || '',
                depth
            );
        } else {
            if (_.isObject(data) === false) {
                this.errors = {
                    '??': this._messageInvalid,
                };

                return this.passed = false;
            }

            this._validate(
                data,
                this._schema,
                this._tryAll,
                errors || this.errors,
                this._strict,
                prefix || '',
                prefix || '',
                depth
            );
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


export class DeepValidatorMerged extends DeepValidator {}


export class Validator extends DeepValidator {}


export class ValidatorMerged extends DeepValidatorMerged {}


export let deepValidator = (schema: Dictionary<any>): DeepValidator => new DeepValidator(schema);


export let deepValidatorMerged = (schema: Dictionary<any>): DeepValidatorMerged => new DeepValidatorMerged(schema);
