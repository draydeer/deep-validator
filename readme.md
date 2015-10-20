```javascript


import {Validator} from './lib/validator';


let validator = new Validator({
    'a.b':          [
        'isObject:must be array',
    ],
    'a.b.c':        'isObject',
    'a.d.[].e':     [
        'isExists:must be defined',
        'isString:must be text',
        'escape',
    ],
    'a.e.[].e':     [
        'isExists:must be defined',
        'isString:must be text',
        'escape',
        function(v, k, d) {
            d[k]+= '____';

            return true;
        }
    ],
    'a.f.[]':       'isObject',
    'a.g':          [ [ 'default', 5 ] ],
    'a.z':          'isExists:no!'
});

var d = {
    a: {
        b: [],
        d: [
            {
                e: "5556"
            },
            {
                e: 6
            }
        ],
        e: [
            {
                e: '&&&'
            }
        ],
        f: [ {} ]
    },
};

console.log(validator.arrayAllow().tryAll().validate([ d, d, d, d, d, d ]));

let message;

while (message = validator.getNextError()) {
    console.log(message);
}
```
