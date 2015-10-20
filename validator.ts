/// <reference path="../typings/tsd.d.ts" />


import _ = require('underscore');
import validator = require('validator');


export class Validator
{

    protected
        _nextError = null;

    protected
        _schema = { '##': { s: void 0, v: [] } };

    protected
        _strict: boolean = false;

    protected
        _tryAll: boolean = false;

    public
        errors = {};

    public
        passed = false;

    protected _validate(
        data: any,
        schema: {},
        tryAll: boolean = false,
        errors: {} = {},
        strict: boolean = false,
        messagePrefix: string = '',
        key?: string,
        ref?: any
    ): boolean
    {
        if (_.isArray(data) && schema['[]']) {
            for (let i = 0, c = data.length; i < c; i ++) {
                if (this._validate(
                        data[i],
                        schema['[]'],
                        tryAll,
                        errors,
                        strict,
                        messagePrefix ? messagePrefix + '.' + i : i.toString(),
                        i.toString(),
                        data
                    ) === false
                ) {
                    return false;
                }
            }
        } else {
            let _isObject = _.isObject(data);

            for (let i = 0, c = schema['##'].v.length; i < c; i ++) {
                let _isValidator = true,
                    _result = true,
                    _e = schema['##'].v[i];

                if (_.isFunction(_e.v)) {
                    _isValidator = true;
                    _result = _e.m = _e.v(data, key, ref);
                } else {
                    if (validator[_e.v]) {
                        _isValidator = _e.v.substr(0, 2) === 'is';
                        _result = validator[_e.v](data, _e.a[0], _e.a[1], _e.a[2], _e.a[3]);
                    } else
                    if (_[_e.v]) {
                        _isValidator = _e.v.substr(0, 2) === 'is';
                        _result = _[_e.v](data, _e.a[0], _e.a[1], _e.a[2], _e.a[3]);
                    }
                }

                if (_isValidator) {
                    if (_result !== true) {
                        errors[messagePrefix] = _e.m || false;

                        return false;
                    }
                } else {
                    key !== void 0 ? ref[key] = _result : null;
                }
            }

            for (let k in schema) {
                let _message = messagePrefix ? messagePrefix + '.' + k : k;

                if (k !== '##' && k !== '[]') {
                    if (_isObject) {
                        if (data[k]) {
                            if (this._validate(data[k], schema[k], tryAll, errors, strict, _message, k, data) || tryAll) {
                                continue;
                            } else {
                                return false;
                            }
                        }

                        if (schema[k]['##'].d !== void 0) {
                            data[k] = schema[k]['##'].d;

                            continue;
                        }
                    }

                    if (strict || schema[k]['##'].s !== void 0) {
                        errors[_message] = schema[k]['##'].s || false;

                        if (tryAll === false) {
                            return false;
                        }
                    }
                }
            }
        }

        return true;
    }

    /**
     * Constructor.
     *
     * @param schema
     *      Data validation schema.
     */
    constructor(
        schema: {}
    )
    {
        _.each(
            schema,
            (v, k) => {
                let _last = this._schema,
                    _elem = this._schema;

                k.split('.').forEach(
                    (v) => {
                        _last = _elem;
                        _elem = _elem[k = v] || (_elem[k = v] = { '##': { s: void 0, v: [] } });

                        if (k === '[]') {
                            _last['##'].v.push({
                                a: [],
                                m: void 0,
                                v: 'isArray'
                            })
                        }
                    }
                );

                (_.isArray(v) ? v : [ v ]).forEach(
                    (v) => {
                        _.isArray(v) || (v = [ v ]);

                        if (_.isString(v[0])) {
                            let t = v[0].split(':');

                            if (t[0] === 'isExists') {
                                _last[k]['##'].s = t[1];
                            } else
                            if (t[0] === 'default') {
                                _last[k]['##'].d = v[1];
                            }

                            _last[k]['##'].v.push({
                                a: v.slice(1),
                                m: t[1],
                                v: t[0]
                            });
                        } else {
                            _last[k]['##'].v.push({
                                a: v.slice(1),
                                m: null,
                                v: v[0]
                            });
                        }
                    }
                );
            }
        );
    }

    /**
     * Get all errors of last validation.
     *
     * @returns {{}}
     */
    getErrors(

    ): {}
    {
        return this.errors;
    }

    /**
     * Get next error of last validation.
     *
     * @returns {any}
     */
    getNextError(

    ): void|{}
    {
        if (this._nextError === null) {
            let k = Object.keys(this.errors),
                i = 0;

            this._nextError = () => {
                if (i ++ < k.length) {
                    return {
                        k: k[i - 1],
                        m: this.errors[k[i - 1]]
                    }
                }

                return void 0;
            }
        }

        return this._nextError();
    }

    /**
     * Set [strict] mode. All scope keys will be checked for presence.
     *
     * @param value
     *      Value.
     * @returns {Validator}
     */
    strict(
        value: boolean = true
    ): Validator
    {
        this._strict = value;

        return this;
    }

    /**
     * Set [tryAll] mode. All scope validators will be applied in despite of earlier failures.
     *
     * @param value
     *      Value.
     * @returns {Validator}
     */
    tryAll(
        value: boolean = true
    ): Validator
    {
        this._tryAll = value;

        return this;
    }

    /**
     * Validate. If returns [false] errors list can be retrieved by [getErrors] or [getNextError] iterator.
     *
     * @param data
     *      Data to be validated.
     * @returns {boolean}
     */
    validate(
        data: {}|any[]
    ): boolean
    {
        this._nextError = null;
        this.errors = {};

        this._validate(data, this._schema, this._tryAll, this.errors, this._strict, '');

        return this.passed = _.isEmpty(this.errors);
    }
}
