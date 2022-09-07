const { lookup } = require("dns")
const { off, mainModule } = require("process")

const uncurryN = (length, fun) => {
  const call = (...rest) => {
    if (rest.length < length) {
      return (...rest1) => call(...rest, ...rest1)
    }
    return rest.slice(0, length).reduce((a, b) => a(b), fun)
  }
  return call
}

const addFour = a => b => c => d => a + b + c + d;
const uncurriedAddFour = uncurryN(4, addFour);
uncurriedAddFour(1, 2, 3, 4); //=> 10




const once = (fun) => {
  let done = false
  return (...rest) => {
    !done && (done = true, fun(...rest))
  }
}

const onceTest = once(console.log)
onceTest(123)
onceTest(321)


function curry(fun) {
  function _curry(args, length) {
    const list = [...args]
    return function (...rest) {
      // debugger
      let nextIndex = 0
      rest = rest.slice(0, length)
      for (const curr of rest) {
        nextIndex = list.indexOf(curry.__, nextIndex)
        if (nextIndex == -1) {
          list.push(curr)
          nextIndex = list.length
        } else {
          list[nextIndex] = curr
          nextIndex++
        }
      }
      if (list.length >= length && list.every(t => t !== curry.__)) {
        return fun(...list)
      }
      return _curry(list, length)
    }
  }

  return _curry([], fun.length)
}
curry.__ = Symbol('_')
four = (a, b, c, d) => [a, b, c, d];
curry(four)(curry.__, curry.__, 1, curry.__)(curry.__, 1, 2)(10)

curry(four)(curry.__, curry.__, 1, curry.__)(1, 2, 3, 4)

curry(four)(curry.__, curry.__)(1, 2, 3, 4)


var k = function () {
  console.log('k')
  return { valueOf() { console.log(1) }}
}
var kk = function () {
  console.log('kk')
  return { valueOf() { console.log(11) }}
}
k() < kk()

