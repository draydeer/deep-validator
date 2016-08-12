import * as _ from 'lodash';
import Dictionary = _.Dictionary;
export declare class FlowBuilder {
    flow: any[];
    isString(message?: string): this;
}
export declare class Flow {
    static isString(message?: string): FlowBuilder;
}
export declare class DeepValidator {
    protected static _isValidators: {
        contains: boolean;
        equals: boolean;
        if: boolean;
        matches: boolean;
    };
    protected _arrayAllow: boolean;
    protected _nextError: any;
    protected _messageInvalid: any;
    protected _messageMissingKey: any;
    protected _sarray: {
        '##': {
            strict: any;
            v: any[];
        };
    };
    protected _schema: {
        '##': {
            strict: any;
            v: any[];
        };
    };
    protected _strict: boolean;
    protected _translator: (message: string) => any;
    protected _tryAll: boolean;
    static _: any;
    errors: Dictionary<any>;
    passed: boolean;
    schema: any;
    /**
     * Dummy translator.
     */
    protected static _translate(message: string): any;
    protected _validate(data: any, schema?: Dictionary<any>, tryAll?: boolean, errors?: Dictionary<any>, strict?: boolean, message?: string, key?: string, ref?: any): boolean;
    static alpha: any;
    static blacklist: any;
    static escape: any;
    static isAfter: any;
    static isAlpha: any;
    static isAlphanumeric: any;
    static isArray: any;
    static isBase64: any;
    static isBefore: any;
    static isBoolean: any;
    static isByteLength: any;
    static isCreditCard: any;
    static isCurrency: any;
    static isDataURI: any;
    static isDate: any;
    static isDateAfter: any;
    static isDateBefore: any;
    static isDecimal: any;
    static isDivisibleBy: any;
    static isEmail: any;
    static isEmpty: any;
    static isEquals: any;
    static isFQDN: any;
    static isFinite: any;
    static isFloat: any;
    static isFullWidth: any;
    static isHalfWidth: any;
    static isHexColor: any;
    static isHexadecimal: any;
    static isIP: any;
    static isISBN: any;
    static isISIN: any;
    static isISO8601: any;
    static isIn: any;
    static isInt: any;
    static isLowercase: any;
    static isMACAddress: any;
    static isMatches: any;
    static isMD5: any;
    static isMobilePhone: any;
    static isMongoId: any;
    static isMultibyte: any;
    static isNaN: any;
    static isNil: any;
    static isNull: any;
    static isNumber: any;
    static isNumeric: any;
    static isPartialEqual: any;
    static isString: any;
    static isSubstring: any;
    static isSurrogatePair: any;
    static isURL: any;
    static isUUID: any;
    static isUppercase: any;
    static isVariableWidth: any;
    static isWhitelisted: any;
    static ltrim: any;
    static normalizeEmail: any;
    static rtrim: any;
    static stripLow: any;
    static toArray: any;
    static toBoolean: any;
    static toDate: any;
    static toFinite: any;
    static toFloat: any;
    static toInt: any;
    static trim: any;
    static unescape: any;
    static whitelist: any;
    /**
     * Clean value. Similar to [filter] but filters a given value using an active (internal) schema.
     */
    static clean(value: any, a: any, b: any, c: any, d: any, key: string, ref: any, schema: any): any;
    /**
     *
     */
    static if(value: any, filter: [string] | string, branchTrue: DeepValidator, branchFalse: DeepValidator): any;
    /**
     * Filter. Does not consider for duplicates.
     */
    static isContains(value: any, compare: [string]): boolean;
    static isContainsOrNull(value: any, compare: [string]): boolean;
    /**
     * Filter. Does not consider for duplicates.
     */
    static isNotContains(value: any, compare: [string]): boolean;
    static isNotContainsOrNull(value: any, compare: [string]): boolean;
    /**
     * Filter. Does not consider for duplicates.
     */
    static isContainsOnly(value: any, compare: [string]): boolean;
    /**
     * Filter.
     */
    static isGreater(value: any, compare: number): boolean;
    /**
     * Filter.
     */
    static isGreaterOrEqual(value: any, compare: number): boolean;
    /**
     * Filter.
     */
    static isGreaterOrEqualToZero(value: any): boolean;
    /**
     * Filter.
     */
    static isInRange(value: number, min: number, max: number): boolean;
    /**
     * Filter.
     */
    static isLength(value: any, min?: number, max?: number): boolean;
    /**
     * Filter.
     */
    static isLess(value: any, compare: number): boolean;
    /**
     * Filter.
     */
    static isLessOrEqual(value: any, compare: number): boolean;
    /**
     * Filter.
     */
    static isLessOrEqualToZero(value: any): boolean;
    /**
     * Filter.
     */
    static isNotEmpty(value: any): boolean;
    /**
     * Filter.
     */
    static isNotEmptyArray(value: any): boolean;
    /**
     * Filter.
     */
    static isNotEmptyObject(value: any): boolean;
    /**
     * Filter.
     */
    static isNotVoid(value: any): boolean;
    /**
     * Filter.
     */
    static isNumberNegative(value: any): boolean;
    /**
     * Filter.
     */
    static isNumberPositive(value: any): boolean;
    /**
     * Filter.
     */
    static isNumberOrNumeric(value: any): boolean;
    /**
     * Filter.
     */
    static isObject(value: any): boolean;
    /**
     * Filter.
     */
    static isVoid(value: any): boolean;
    /**
     * Sanitizer. Picks values (by RegExp checks strings only) by matching to given pattern.
     *
     * @param value Value.
     * @param filter Filter RegExp or function.
     * @param objectAllow Ignore object-like values (arrays or sets).
     *
     * @returns {TResult}
     */
    static filter(value: any, filter: RegExp | ((v: string) => boolean), objectAllow?: boolean): any;
    /**
     * Sanitizer. Picks keys by matching to given pattern.
     */
    static filterKeys(value: any, filter: string[] | RegExp | ((v: string) => boolean)): any;
    /**
     * Sanitizer. Remove all key starting from [$].
     */
    static filterMongoDocKeys(value: any): any;
    /**
     * Sanitizer.
     */
    static toNumber(value: any): number | void;
    /**
     * Sanitizer.
     */
    static toNullIfEmpty(value: any): any;
    /**
     * Sanitizer.
     */
    static toString(value: any): string;
    /**
     * Constructor.
     *
     * @param schema Data validation schema.
     */
    constructor(schema: Dictionary<any>);
    /**
     * Get all errors of last validation.
     *
     * @returns {{}}
     */
    getErrors(asArray?: boolean): Dictionary<string>;
    /**
     * Get next error of last validation.
     *
     * @returns {void|{}}
     */
    getNextError(): void | Dictionary<any>;
    /**
     * Set default [data invalid] message. Message will be set if provided data is invalid.
     *
     * @param value Value.
     *
     * @returns {DeepValidator}
     */
    setMessageInvalid(value: number | string): DeepValidator;
    /**
     * Set default [missing key] message. Message will be set if [isExists] validator fails and has no self message.
     *
     * @param value Value.
     *
     * @returns {DeepValidator}
     */
    setMessageMissingKey(value: number | string): DeepValidator;
    /**
     * Set translator function.
     *
     * @param value Value.
     *
     * @returns {DeepValidator}
     */
    setTranslator(value: (message: string) => any): DeepValidator;
    /**
     * Set [arrayAllow] mode. Allows applying schema to each element of data if data is array.
     *
     * @param value Value.
     *
     * @returns {DeepValidator}
     */
    arrayAllow(value?: boolean): DeepValidator;
    /**
     * Set [strict] mode. All schema keys will be checked for presence.
     *
     * @param value Value.
     *
     * @returns {DeepValidator}
     */
    strict(value?: boolean): DeepValidator;
    /**
     * Set [tryAll] mode. All scope validators will be applied in despite of earlier failures.
     *
     * @param value Value.
     *
     * @returns {DeepValidator}
     */
    tryAll(value?: boolean): DeepValidator;
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
    validate(data: any[] | Dictionary<any>, arrayAllow?: boolean, errors?: any, prefix?: any): boolean;
}
export declare class Validator extends DeepValidator {
}
export declare let deepValidator: (schema: any) => DeepValidator;
