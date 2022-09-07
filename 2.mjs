// index.js
console.log('running index.js', sum);
import { sum } from './1.mjs';
console.log(sum(1, 2));


function countFn() {
  const arr = [2, 1]
  return () => console.log(arr.reverse()[0])
}



function find(arr) {
  const res = []
  for (let i = 0; i < arr.length; i++) {
    res[i] = -1
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] < arr[j]) {
        res[i] = arr[j]
        break
      }
    }
  }
  return res
}
find([2,6,3,8,10,9])
