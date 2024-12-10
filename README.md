# formulaic

A very, _very_ naive excel-_like_ formula engine that uses "clever" regex search replace to create a (hopefully) sandboxed JS script that is then eval'd.

## Quick Start

```js
import * as F from 'formulaic'

const { transformed, compiled, dependencies } = 
    F.compile('A1 + sum(A:C)')

const answer = 
    compiled({
        addr(cellReference) {
            return 4
        },
        range(cellRange) {
            return [1,2,3,4]
        },
        sum(xs){
            return xs.reduce((p,n) => p + n, 0)
        }
    })

answer //=> 14
transformed //=>'fn.addr("A1") + fn.sum(fn.range("A:C"))'
dependencies //=> { addr: ['A1'], range: ['A:C'] }
```

## Why is it?

I was working on a UI library.  To verify it works well I was implementing the [7GUI](https://eugenkiss.github.io/7guis/) tasks.  The final task is to implement a spreadsheet with efficient change propagation.

In order to generate the stream graph, I would need to know the dependencies, in order to know the dependencies I would need to parse the formula.  Writing a formula parser felt like a bridge too far in the house of cards that is my side projects.  So normalizing the input and then using regex to extract ranges and cells seemed like the next best thing.

## FAQ

### How does it differ from a simple eval?

Many years ago there was a really cool post [Make a spreadsheet in 30 lines of JS](https://news.ycombinator.com/item?id=6725387)

While super cool, this solution does allow you to run literally any JS you like inside the cell formula.

This library tries (foolishly) to sanitize the input using some clever regex.

First it uses an allow list that (hopefully) makes it not possible to do clever exploits in JS.  For example no square brackets, so no dynamic keys.  And no use of `.` except in floating point numbers, so no property access.

We then replace cell references with calls to `fn.addr(...)` and `fn.range(...)`, and finally namespace any function calls with a `fn.` prefix.

So `A1 + sum(A:C)` becomes `fn.addr("A1") + fn.sum(fn.range("A:C"))`.  The thinking is, you can provide any functions you like as the `fn` context and there is (again hopefully) no way to escape the sandbox and dynamic reach the global object via prototype jumping.

It's probably not secure at all.  This is all just highly theoretical and I nerd sniped myself.