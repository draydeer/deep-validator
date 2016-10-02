# DeepValidator

[![Build Status](https://travis-ci.org/draydeer/validator.svg?branch=master)](https://travis-ci.org/draydeer/validator)

A library for validation of complex data structures. Uses [LoDash](https://lodash.com) and [validator.js](https://github.com/chriso/validator.js) libraries.

### Server-side

Install the library with:

```bash
$ npm install deep-validator
```

```javascript
var DeepValidator = require('deep-validator').DeepValidator;

new DeepValidator({a: "isString"}).validate({a: "123"}); // true
```

#### ES6

```javascript
import DeepValidator from 'deep-validator';
```

### Client-side

The library can be loaded as a standalone script.

```html
<script type="text/javascript" src="deep-validator.min.js"></script>
```

```javascript
var DeepValidator = window.DeepValidator;

new DeepValidator({a: "isString"}).validate({a: "123"}); // true
```

### Usage

Create validator instance with a validation schema where the schema is a plain object with keys as keys of validating data and values as lists of validators/sanitizers to be applied on corresponding values of data. Note that all nested structures paths are presented as keys.

```javascript```
var validator = new DeepValidator({
    "a": [
        "isObject:invalid"
    ],
    "a.b": [
        "isString:invalid"
    ]
});

validator.validate({a: {b: 3}}); // false
```

The result of validation will be *false*, validation flow will be stopped on first error, then the final list of errors can be retrieved by *getErrors* method.

```
validator.getErrors(); // {"a.b": "invalid"}
```

The validation flow list of each key can contain any number of entries. Each entry consists of the validator/sanitizer alias optionally provided with an error message or a translator key and up to 3 custom parameters.

```javascript```
var validator = new DeepValidator({
    "a": [
        "isExists:not exists", // 1st entry
        "isNumber:not number", // 2nd entry
        ["isInRange:invalid", 1, 2] // 3rd entry
    ]
});
```

The validation flow list can also be built with the flow builder which provides a classic fluent interface definition syntax.

```javascript```
var validator = new DeepValidator({
    "a": Flow.isExists("not exists").isNumber("not number").isInRange("invalid", 1, 2)
});
```

#### Root data validation

The validation flow can be applied to a root data in same way as to all nested values. This flow is provided as a second argument of constructor.

```javascript```
var validator = new DeepValidator({
    "a": "isString", "b": "isString"
}, [["filterKeys", /^(a|b)$/]]);

var data = {a: "abc", b: "cba", c: "cccc"};

validator.validate(data); // true, data = {a: "abc", b: "cba"}

```

#### Special flow operations

*isExists* forces the key to exist.

```javascript```
var validator = new DeepValidator({a: "isExists:not exists"});
...
validator.getErrors(); // {"a": "not exists"}
```

*default* sets a default value if the key is not defined.

```javascript```
var validator = new DeepValidator({a: [["default", 5]]});
...
// data = {a: 5}
```

*showAs* redefines a key name in the set of errors.

```javascript```
var validator = new DeepValidator({a: ["isExists:not exists", ["showAs", "aaa"]]});
...
validator.getErrors(); // {"aaa": "not exists"}
```

#### Flow control

*arrayAllow* method allows applying schema on each element of provided data array.

```javascript```
validator
    .arrayAllow()
    .validate([{a: {b: "b"}}, {a: {b: "c"}}]); // true
```

*tryAll* method forces validation of all data in despite of earlier errors.

```javascript```
validator.arrayAllow()
    .tryAll()
    .validate([{a: {b: 1}}, {a: {b: 2}}]); // {"0.a.b": "invalid", "1.a.b": "invalid"}
```

*strict* method forces checking of presence of all keys defined in schema.

```javascript```
validator.setMessageMissingKey("missing")
    .strict()
    .validate({a: {c: 1}}); // {"a.b": "missing"}
```

#### Custom validator handler

Self defined handlers can be used as custom validators in any step of the validation flow. Such handler combines role of a validator and a sanitizer in one face. The handler takes as parameters the current value, the current key and the reference to the current data context (mutable) and must return *true* on successful validation or an any value (string commonly) as a error message.

```javascript```
var validator = new DeepValidator({
    "a.b": [
        function (val, key, ref) {
            if (val === null) {
                ref[key] = 0; // modify value by reference

                return true;
            }

            return "not null";
        }
    ]
});

var data = {a: {b: null}};

validator.validate(data); // true, data = {a: {b: 0}}
```

#### Nested validator instance

Another validator instances or internally defined schemas can be used as nested validators on the corresponding value in any step of the validation flow. All errors will be merged with the calling validator errors set as paths extensions.

```javascript```
var validator = new DeepValidator({
    "a": [
        new DeepValidator({
            "b": "isNumber:not number"
        })
    ]
});

var data = {a: {b: null}};

validator.getErrors(); // {"a.b": "not number"}
```

Or more simply defined as object:

```javascript```
var validator = new DeepValidator({
    "a": [
        {
            "b": "isNumber:not number"
        }
    ]
});

var data = {a: {b: null}};

validator.getErrors(); // {"a.b": "not number"}
```

#### Sub-flows

The special flow operation *if* allows to select a one of sub-flows - "true" and "false" - by checking the current value with a provided condition checker. The selected validator will be run on the current data context.

```javascript```
var validator = new DeepValidator({
    "a": [
        [
            "if",
            "isString",
            {
                "b": "isNumber:not number"
            },
            {
                "b": "isString:not string"
            }
        ]
    ]
});

validator.validate({a: 1, b: "1"}); // true

validator.validate({a: "1", b: 1}); // true
```

All errors will be merged with the calling validator errors set.

```javascript```
var validator = new DeepValidator({
    "a": [
        [
            "if",
            "isString",
            {
                "b": "isNumber:not number"
            },
            {
                "b": "isNumber:not number"
            }
        ]
    ]
});

validator.validate({a: "1", b: "1"}); // false

validator.getErrors(); // {"b": "not number"}
```

### Available validators

- **contains(str, seed)** - [validator.js](https://github.com/chriso/validator.js#validators) - checks if the string contains the seed.
- **equals(str, comparison)** - [validator.js](https://github.com/chriso/validator.js#validators) - checks if the string matches the comparison.
- **isAfter(str [, date])** - [validator.js](https://github.com/chriso/validator.js#validators) - checks if the string is a date that's after the specified date (defaults to now).
- **isAlpha(str [, locale])** - [validator.js](https://github.com/chriso/validator.js#validators) - checks if the string contains only letters (a-zA-Z).
- **isAlphanumeric(str [, locale])** - [validator.js](https://github.com/chriso/validator.js#validators) - checks if the string contains only letters and numbers.
- **isArray(value)** - [LoDash](https://lodash.com/docs/#isArray) - checks if value is classified as an Array object.
- **isAscii(str)** - [validator.js](https://github.com/chriso/validator.js#validators) - checks if the string contains ASCII chars only.
- **isBase64(str)** - [validator.js](https://github.com/chriso/validator.js#validators) - checks if a string is base64 encoded.
- **isBefore(str [, date])** - [validator.js](https://github.com/chriso/validator.js#validators) - checks if the string is a date that's before the specified date.
- **isBoolean(str)** - [validator.js](https://github.com/chriso/validator.js#validators) - checks if a string is a boolean.
- **isByteLength(str, options)** - [validator.js](https://github.com/chriso/validator.js#validators) - checks if the string's length (in bytes) falls in a range.
- **isContains(value, compare)** - checks if the complex value contains all of values in a comparison list or set.
- **isContainsOnly(value, compare)** - checks if the complex value contains only values of a comparison list or set.
- **isCreditCard(str)** - [validator.js](https://github.com/chriso/validator.js#validators) - checks if the string is a credit card.
- **isCurrency(str, options)** - [validator.js](https://github.com/chriso/validator.js#validators) - checks if the string is a valid currency amount.
- **isDataURI(str)** - [validator.js](https://github.com/chriso/validator.js#validators) - checks if the string is a [data uri format](https://developer.mozilla.org/en-US/docs/Web/HTTP/data_URIs).
- **isDate(str)** - [validator.js](https://github.com/chriso/validator.js#validators) - checks if the string is a date.
- **isDecimal(str)** - [validator.js](https://github.com/chriso/validator.js#validators) - checks if the string represents a decimal number, such as 0.1, .3, 1.1, 1.00003, 4.0, etc.
- **isDivisibleBy(str, number)** - [validator.js](https://github.com/chriso/validator.js#validators) - checks if the string is a number that's divisible by another.
- **isEmail(str [, options])** - [validator.js](https://github.com/chriso/validator.js#validators) - checks if the string is an email.
- **isEmpty(value)** - [LoDash](https://lodash.com/docs/#isEmpty) - checks if value is an empty object, collection, map, or set.
- **isEquals(value, other)** - [LoDash](https://lodash.com/docs/#isEqual) - performs a deep comparison between two values to determine if they are equivalent.
- **isFQDN(str [, options])** - [validator.js](https://github.com/chriso/validator.js#validators) - checks if the string is a fully qualified domain name (e.g. domain.com).
- **isFinite(value)** - [LoDash](https://lodash.com/docs/#isFinite) - checks if value is a finite primitive number.
- **isFloat(str [, options])** - [validator.js](https://github.com/chriso/validator.js#validators) - checks if the string is a float.
- **isFullWidth(str)** - [validator.js](https://github.com/chriso/validator.js#validators) - checks if the string contains any full-width chars.
- **isGreater(value, compare)** - checks if the value is greater than a comparison value.
- **isGreaterOrEquals(value, compare)** - checks if the value is greater or equals to a comparison value.
- **isGreaterOrEqualsToZero(value)** - checks if the value is greater or equals to zero.
- **isHalfWidth(str)** - [validator.js](https://github.com/chriso/validator.js#validators) - checks if the string contains any half-width chars.
- **isHexColor(str)** - [validator.js](https://github.com/chriso/validator.js#validators) - checks if the string is a hexadecimal color.
- **isHexadecimal(str)** - [validator.js](https://github.com/chriso/validator.js#validators) - checks if the string is a hexadecimal number.
- **isLess(value, compare)** - checks if the value is less than a comparison value.
- **isLessOrEquals(value, compare)** - checks if the value is less or equals to a comparison value.
- **isLessOrEqualsToZero(value)** - checks if the value is less or equals to zero.
- **isIP(str [, version])** - [validator.js](https://github.com/chriso/validator.js#validators) - checks if the string is an IP (version 4 or 6).
- **isISBN(str [, version])** - [validator.js](https://github.com/chriso/validator.js#validators) - checks if the string is an ISBN (version 10 or 13).
- **isISIN(str)** - [validator.js](https://github.com/chriso/validator.js#validators) - checks if the string is an [ISIN][ISIN] (stock/security identifier).
- **isISO8601(str)** - [validator.js](https://github.com/chriso/validator.js#validators) - checks if the string is a valid [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) date.
- **isIn(str, values)** - [validator.js](https://github.com/chriso/validator.js#validators) - checks if the string is in a array of allowed values.
- **isInRange(value[, min[, max]])** - checks if the number is between min and max values.
- **isInsignificant(value)** - checks if the value **isEmpty** or equals to *false*, *0*, *""*, *null* or *undefined*.
- **isInt(str [, options])** - [validator.js](https://github.com/chriso/validator.js#validators) - checks if the string is an integer.
- **isJSON(str)** - [validator.js](https://github.com/chriso/validator.js#validators) - checks if the string is valid JSON (note: uses JSON.parse).
- **isLength(value)** - checks if the value's length falls in a range (takes property of array/string length as number or number of properties in case of object).
- **isLowercase(str)** - [validator.js](https://github.com/chriso/validator.js#validators) - checks if the string is lowercase.
- **isMACAddress(str)** - [validator.js](https://github.com/chriso/validator.js#validators) - checks if the string is a MAC address.
- **isMobilePhone(str, locale)** - [validator.js](https://github.com/chriso/validator.js#validators) - checks if the string is a mobile phone number.
- **isMongoId(str)** - [validator.js](https://github.com/chriso/validator.js#validators) - checks if the string is a valid hex-encoded representation of a [MongoDB ObjectId][mongoid].
- **isMultibyte(str)** - [validator.js](https://github.com/chriso/validator.js#validators) - checks if the string contains one or more multibyte chars.
- **isNaN(value)** - [LoDash](https://lodash.com/docs/#isNaN) - checks if value is NaN.
- **isNegative(value)** - alias of **isNumberNegative** - checks if value is a negative number (less than 0).
- **isNil(value)** - [LoDash](https://lodash.com/docs/#isNil) - checks if value is null or undefined.
- **isNotContains(value, compare)** - checks if the complex value contains no one of values in a comparison list or set.
- **isNotEmpty(value)** - negative validator of the **isEmpty**.
- **isNotEmptyObject(value)** - checks if the value is a not empty object.
- **isNotEmptyArray(value)** - checks if the value is a not empty array.
- **isNotVoid(value)** - checks if the value is a defined value (not *undefined*).
- **isNull(str)** - [validator.js](https://github.com/chriso/validator.js#validators) - checks if the string is null (has a length of zero).
- **isNumber(value)** - [LoDash](https://lodash.com/docs/#isNumber) - checks if value is classified as a Number primitive or object.
- **isNumberNegative(value)** - checks if the value is a negative number (less than 0).
- **isNumberPositive(value)** - checks if the value is a positive number (greater than 0).
- **isNumberOrNumeric(value)** - checks if the value if a valid string representation of number, number object or primitive.
- **isNumeric(str)** - [validator.js](https://github.com/chriso/validator.js#validators) - checks if the string contains only numbers.
- **isObject(value)** - checks if the value is a object like value and is not defined as an array.
- **isPositive(value)** - alias of **isNumberPositive** - checks if value is a positive number (greater than 0).
- **isSignificant(value)** - checks if the value is negative to **isInsignificant**.
- **isString(value)** - [LoDash](https://lodash.com/docs/#isString) - checks if value is classified as a String primitive or object.
- **isSurrogatePair(str)** - [validator.js](https://github.com/chriso/validator.js#validators) - checks if the string contains any surrogate pairs chars.
- **isURL(str [, options])** - [validator.js](https://github.com/chriso/validator.js#validators) - checks if the string is an URL.
- **isUUID(str [, version])** - [validator.js](https://github.com/chriso/validator.js#validators) - checks if the string is a UUID (version 3, 4 or 5).
- **isUppercase(str)** - [validator.js](https://github.com/chriso/validator.js#validators) - checks if the string is uppercase.
- **isVariableWidth(str)** - [validator.js](https://github.com/chriso/validator.js#validators) - checks if the string contains a mixture of full and half-width chars.
- **isVoid** - checks if the value is an *undefined* value.
- **isWhitelisted(str, chars)** - [validator.js](https://github.com/chriso/validator.js#validators) - checks characters if they appear in the whitelist.
- **matches(str, pattern [, modifiers])** - [validator.js](https://github.com/chriso/validator.js#validators) - checks if string matches the pattern.

### Available sanitizers

- **escape(input)** - [validator.js](https://github.com/chriso/validator.js#sanitizers) - replace *<*, *>*, *&*, *'*, *"* and */* with HTML entities.
- **filter(value, filter, [objectAllow])** - picks values (by RegExp checks strings only) by matching to a filter.
- **filterKeys(value, filter)** - picks keys by matching to a filter.
- **filterMongoDocKeys(value)** - removes all keys of MongoDb document like object starting from *$*.
- **ltrim(input [, chars])** - [validator.js](https://github.com/chriso/validator.js#sanitizers) - trim characters from the left-side of the input.
- **normalizeEmail(email [, options])** - [validator.js](https://github.com/chriso/validator.js#sanitizers) - canonicalizes an email address.
- **toArray(value)** - [LoDash](https://lodash.com/docs/#toArray) - converts value to an array.
- **toBoolean(value)** - [validator.js](https://github.com/chriso/validator.js#sanitizers) - convert the input string to a boolean.
- **toDate(value)** - [validator.js](https://github.com/chriso/validator.js#sanitizers) - convert the input string to a date, or null if the input is not a date.
- **toFinite(value)** - [LoDash](https://lodash.com/docs/#toFinite) - converts value to a finite number.
- **toInt(value)** - [validator.js](https://github.com/chriso/validator.js#sanitizers) - convert the input string to a date, or null if the input is not a date.
- **toNumber(value)** - converts string representation of a number or takes the number as-is.
- **toNullIfEmpty(value)** - converts the value to *null* value if the value **isEmpty**.
- **toNullIfInsignificant(value)** - converts the value to *null* value if the value **isEmpty** or equals to *false*, *0*, *""*, *null* or *undefined*.
- **toString(value)** - converts the value to a string taking *null* and *undefined* values as an empty string - "".
- **rtrim(input [, chars])** - [validator.js](https://github.com/chriso/validator.js#sanitizers) - trim characters from the right-side of the input.
- **stripLow(input [, keep_new_lines])** - [validator.js](https://github.com/chriso/validator.js#sanitizers) - remove characters with a numerical value < 32 and 127, mostly control characters.
- **trim(input [, chars])** - [validator.js](https://github.com/chriso/validator.js#sanitizers) - trim characters (whitespace by default) from both sides of the input.
- **unescape(input)** - [validator.js](https://github.com/chriso/validator.js#sanitizers) - replaces HTML encoded entities with *<*, *>*, *&*, *'*, *"* and */*.
- **whitelist(input, chars)** - [validator.js](https://github.com/chriso/validator.js#sanitizers) - remove characters that do not appear in the whitelist.

### Examples

#### ExpressJS route

```javascript```
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

function route(request, response) {
    if (validator.validate(request.body) !== true) {
        response.status(400).send(validator.getErrors());
    } else {
        ...
    }
}
```
