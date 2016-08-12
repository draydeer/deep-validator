# DeepValidator

A library for validation of complex structures. Uses [LoDash](https://lodash.com) and [validator.js](https://github.com/chriso/validator.js) libraries.

### Server-side

Install the library with `npm install deep-validator`

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

The validation flow list of each key can contain any number of entries. Each entry consists of the validator/sanitizer alias optionally provided with an error message or a translator key and up to 4 custom parameters.

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
                ref[key] = 0; // change value by reference

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

Another validators instance can be used as nested validators on the corresponding value in any step of the validation flow. All errors will be merged with the calling validator as paths extensions.

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

#### Special flow entries

*isExists* forces the key to exist

```javascript```
var validator = new DeepValidator({a: "isExists:not exists"});
...
validator.getErrors(); // {"a": "not exists"}
```

*default* sets default value if the key is not defined

```javascript```
var validator = new DeepValidator({a: ["default", 5]});
...
// data = {a: 5}
```

*showAs* redefines key name in the set of errors

```javascript```
var validator = new DeepValidator({a: ["isExists:not exists", ["showAs", "aaa"]]});
...
validator.getErrors(); // {"aaa": "not exists"}
```
