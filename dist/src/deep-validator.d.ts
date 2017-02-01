import * as _ from "lodash";
export declare type Dictionary<T> = _.Dictionary<T>;
export declare class ValidatorEntry {
    args: any[];
    isHandler: boolean;
    isNested: boolean;
    isValidator: boolean;
    message: any;
    notExtendErrors: boolean;
    validator: string | ((...a: any[]) => any) | DeepValidator;
    constructor(validator: any, message?: any, args?: any[], notExtendErrors?: boolean);
}
export declare class ValidatorEntrySet {
    current: ValidatorEntrySetCurrent;
    properties: _.Dictionary<ValidatorEntrySet>;
}
export declare class ValidatorEntrySetCurrent {
    custom: any;
    def: any;
    showAs: string;
    strict: boolean;
    v: ValidatorEntry[];
}
export declare type ValidatorSubFlow = Dictionary<any> | DeepValidator;
export declare class FlowBuilder {
    flow: any[];
    default(value: any): this;
    if(checker: any, trueFlow: ValidatorSubFlow, falseFlow: ValidatorSubFlow): this;
    isExists(message?: string): this;
    isInRange(min: number, max: number, message?: string): this;
    isNegative(message?: string): this;
    isNumber(message?: string): this;
    isNumberOrNumeric(message?: string): this;
    isPositive(message?: string): this;
    isString(message?: string): this;
    required(message?: string): this;
    showAs(name: string): this;
}
export declare class Flow {
    static default(value: any): FlowBuilder;
    static if(checker: any, trueBranch: ValidatorSubFlow, falseBranch: ValidatorSubFlow): FlowBuilder;
    static isExists(message?: string): FlowBuilder;
    static isInRange(min: number, max: number, message?: string): FlowBuilder;
    static isNegative(message?: string): FlowBuilder;
    static isNumber(message?: string): FlowBuilder;
    static isNumberOrNumeric(message?: string): FlowBuilder;
    static isPositive(message?: string): FlowBuilder;
    static isString(message?: string): FlowBuilder;
    static required(message?: string): FlowBuilder;
    static showAs(name: string): FlowBuilder;
}
export declare class DeepValidator {
    static _: any;
    static isValidators: {
        contains: boolean;
        equals: boolean;
        if: boolean;
        ifCustom: boolean;
        matches: boolean;
    };
    errors: Dictionary<any>;
    passed: boolean;
    schema: any;
    protected _arrayAllow: boolean;
    protected _included: _.Dictionary<DeepValidator>;
    protected _includedPending: string[];
    protected _maxDepth: number;
    protected _maxDepthPassToNested: boolean;
    protected _messageMaxDepth: any;
    protected _messageInvalid: any;
    protected _messageMissingKey: any;
    protected _messageNotObject: any;
    protected _name: string;
    protected _nextError: any;
    protected _schema: ValidatorEntrySet;
    protected _schemaAsArray: ValidatorEntrySet;
    protected _schemaCoverAll: boolean;
    protected _strict: boolean;
    protected _translator: (message: string) => any;
    protected _tryAll: boolean;
    /**
     *
     */
    protected _addError(errors: _.Dictionary<any>, key: string, value: any, path?: string): this;
    /**
     *
     */
    protected _compile(schema: any): this;
    /**
     * Dummy translator.
     */
    protected _translate(message: string): any;
    /**
     *
     */
    protected _validate(data: any, schema: ValidatorEntrySet, tryAll?: boolean, errors?: Dictionary<any>, strict?: boolean, path?: string, root?: string, depth?: number, key?: string, ref?: any): boolean;
    static blacklist: any;
    static escape: any;
    static isAlpha: any;
    static isAlphanumeric: any;
    static isArray: any;
    static isAscii: any;
    static isBase64: any;
    static isByteLength: any;
    static isCreditCard: any;
    static isCurrency: any;
    static isDataURI: any;
    static isEmail: any;
    static isEmpty: any;
    static isEquals: any;
    static isFQDN: any;
    static isFinite: any;
    static isFullWidth: any;
    static isHalfWidth: any;
    static isHexColor: any;
    static isHexadecimal: any;
    static isIP: any;
    static isISBN: any;
    static isISIN: any;
    static isISO8601: any;
    static isIn: any;
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
    static if(value: any, filter: any[] | string, flowTrue: DeepValidator, flowFalse: DeepValidator, errors: any, key?: any, ref?: any, schema?: any): any;
    /**
     *
     */
    static ifCustom(value: any, filter: any[] | ((val: any, key: string, ref: any) => boolean), flowTrue: DeepValidator, flowFalse: DeepValidator, errors: any, key?: any, ref?: any, schema?: any): any;
    /**
     * Filter. Does not consider for duplicates.
     */
    static isContains(value: any, compare: [string]): boolean;
    /**
     * Filter.
     */
    static isDefined(value: any): boolean;
    /**
     * Filter. Does not consider for duplicates.
     */
    static isNotContains(value: any, compare: [string]): boolean;
    /**
     * Filter. Does not consider for duplicates.
     */
    static isContainsOnly(value: any, compare: [string]): boolean;
    /**
     * Filter.
     */
    static isBoolean(value: any): boolean;
    /**
     * Filter.
     */
    static isDate(value: any): boolean;
    /**
     * Filter.
     */
    static isGreater(value: any, compare: number): boolean;
    /**
     * Filter.
     */
    static isGreaterOrEquals(value: any, compare: number): boolean;
    /**
     * Filter.
     */
    static isGreaterOrEqualsToZero(value: any): boolean;
    /**
     * Filter.
     */
    static isIntOrNumeric(value: any): boolean;
    /**
     * Filter.
     */
    static isInRange(value: number, min: number, max: number): boolean;
    /**
     * Filter.
     */
    static isInsignificant(value: any): boolean;
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
    static isLessOrEquals(value: any, compare: number): boolean;
    /**
     * Filter.
     */
    static isLessOrEqualsToZero(value: any): boolean;
    /**
     * Filter. Alias of [isNumberNegative].
     */
    static isNegative(value: any): boolean;
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
     * Filter. Alias of [isNumberPositive].
     */
    static isPositive(value: any): boolean;
    /**
     * Filter.
     */
    static isSignificant(value: any): boolean;
    /**
     * Filter.
     */
    static isVoid(value: any): boolean;
    /**
     * Filter.
     */
    static isUndefined(value: any): boolean;
    /**
     * Sanitizer. Picks values (by RegExp checks strings only) by matching to a given pattern.
     *
     * @param value Value.
     * @param filter Filter RegExp or function.
     * @param objectAllow Ignore object-like values (arrays or sets).
     *
     * @returns {TResult}
     */
    static filter(value: any, filter: RegExp | ((v: string) => boolean), objectAllow?: boolean): any;
    /**
     * Sanitizer. Picks keys by matching to a given pattern.
     */
    static filterKeys(value: any, filter: string[] | RegExp | ((v: string) => boolean)): any;
    /**
     * Sanitizer. Remove all keys of MongoDb document like object starting from [$].
     */
    static filterMongoDocKeys(value: any): any;
    /**
     * Sanitizer.
     */
    static toBoolean(value: any): boolean;
    /**
     * Sanitizer.
     */
    static toDate(value: any): Date;
    /**
     * Sanitizer.
     */
    static toInt(value: any): number | void;
    /**
     * Sanitizer.
     */
    static toFloat(value: any): number | void;
    /**
     * Sanitizer.
     */
    static toMongoId(value: any): any;
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
    static toNullIfInsignificant(value: any): any;
    /**
     * Sanitizer.
     */
    static toString(value: any): string;
    /**
     * Constructor.
     *
     * @param schema Data validation schema.
     * @param rootFlow Flow to be run on the root value.
     */
    constructor(schema: Dictionary<any>, rootFlow?: any[]);
    /**
     * Get all errors of last validation.
     *
     * @returns {{}}
     */
    getErrors(asArray?: boolean): Dictionary<string>;
    /**
     * Get max depth of nested scan.
     *
     * @returns {number}
     */
    getMaxDepth(): number;
    /**
     * Get validator name.
     *
     * @returns {string}
     */
    getName(): string;
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
    setMessageInvalid(value: any): DeepValidator;
    /**
     * Set default [max  depth reached] message. Message will be set if max depth of nested scan has been reached.
     *
     * @param value Value.
     *
     * @returns {DeepValidator}
     */
    setMessageMaxDepthReached(value: any): DeepValidator;
    /**
     * Set default [missing key] message. Message will be set if [isExists] validator fails and has no self message.
     *
     * @param value Value.
     *
     * @returns {DeepValidator}
     */
    setMessageMissingKey(value: any): DeepValidator;
    /**
     * Set default [not object] message. Message will be set if [isObject] validator fails and has no self message.
     *
     * @param value Value.
     *
     * @returns {DeepValidator}
     */
    setMessageNotObject(value: any): DeepValidator;
    /**
     * Set validator name. Will be used as a alias in case of registration for reusing in another or recursively.
     *
     * @param value Value.
     *
     * @returns {DeepValidator}
     */
    setName(value: string): DeepValidator;
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
     * Register validator for reusing.
     *
     * @param validator Validator instance.
     *
     * @returns {DeepValidator}
     */
    include(validator: DeepValidator): DeepValidator;
    /**
     * Set max depth of nested scan.
     *
     * @param value Value.
     *
     * @returns {DeepValidator}
     */
    maxDepth(value: number): DeepValidator;
    /**
     * Set mode of passing incremented [depth] value to a nested validator.
     *
     * @param value Value.
     *
     * @returns {DeepValidator}
     */
    maxDepthPassToNested(value?: boolean): DeepValidator;
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
    validate(data: any[] | Dictionary<any>, arrayAllow?: boolean, errors?: any, prefix?: any, depth?: any): boolean;
}
export declare class DeepValidatorMerged extends DeepValidator {
}
export declare class Validator extends DeepValidator {
}
export declare class ValidatorMerged extends DeepValidatorMerged {
}
export declare let deepValidator: (schema: any, rootFlow?: any[]) => DeepValidator;
export declare let deepValidatorMerged: (schema: any, rootFlow?: any[]) => DeepValidatorMerged;
