// console.log(1);

// setTimeout(() => {
//   console.log(2);
//   process.nextTick(() => {
//     console.log(3);
//   });
//   new Promise((resolve) => {
//     console.log(4);
//     resolve();
//   }).then(() => {
//     console.log(5);
//   });
// });

// new Promise((resolve) => {
//   console.log(7);
//   resolve();
// }).then(() => {
//   console.log(8);
// });

// process.nextTick(() => {
//   console.log(6);
// });

// setTimeout(() => {
//   console.log(9);
//   process.nextTick(() => {
//     console.log(10);
//   });
//   new Promise((resolve) => {
//     console.log(11);
//     resolve();
//   }).then(() => {
//     console.log(12);
//   });
// });


// console.log(1);
// setTimeout(() => {
//   console.log(2);
// });
// process.nextTick(() => {
//   console.log(3);
// });
// setImmediate(() => {
//   console.log(4);
// });
// new Promise((resolve) => {
//   console.log(5);
//   resolve();
//   console.log(6);
// }).then(() => {
//   console.log(7);
// });
// Promise.resolve().then(() => {
//   console.log(8);
//   process.nextTick(() => {
//     console.log(9);
//   });
// });

// const arr = [{
//   id: 2,
//   name: '部门B',
//   parentId: 0
// },
// {
//   id: 3,
//   name: '部门C',
//   parentId: 1
// },
// {
//   id: 1,
//   name: '部门A',
//   parentId: 2
// },
// {
//   id: 4,
//   name: '部门D',
//   parentId: 1
// },
// {
//   id: 5,
//   name: '部门E',
//   parentId: 2
// },
// {
//   id: 6,
//   name: '部门F',
//   parentId: 3
// },
// {
//   id: 7,
//   name: '部门G',
//   parentId: 2
// },
// {
//   id: 8,
//   name: '部门H',
//   parentId: 4
// }
// ]

// function totree(arr) {
//   const root = {
//     id: 2,
//     name: 'root',
//     parentId: 0
//   }

//   const map = {

//   }

//   arr.forEach(t => {
//     if (map[t.parentId]) {
//       map[t.parentId].children.push(t)
//     } else {
//       map[t.parentId] = {
//         children: [t],
//       }
//     }
//     t.children = []
//     if (map[t.id]) {
//       t.children = (map[t.id].children || [])
//     }
//     map[t.id] = t
//   })
//   console.log(map[0])
// }

// totree(arr)



// “ababac” —— “ababa”
// “aaabbbcceeff” —— “aaabbb”

// function hh(str) {
//   const map = {}
//   for (let i = 0; i < str.length; i++) {
//     const s = str[i]
//     map[s] = (map[s] || 0) + 1
//   }
//   const min = Math.min(...Object.values(map))
//   // debugger
//   const t = Object.entries(map).filter(([k, v]) => v === min).map(n => n[0])
//   console.log( t)
//   return str.replace(new RegExp(t.join('|'), 'g'), '')
// }

// function trans(num) {
//   const zhongwen = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九']
//   const commom = u => v => {
//     if (v === '零') {
//       if (zore) return ''
//       return '零'
//     } else {
//       return v + u
//     }
//   }
//   const unit = [
//     commom(''),
//     commom('十'),
//     commom('百'),
//     commom('千'),
//     v => v === '零' ? '万' : v + '万',
//     commom('十'),
//     commom('百'),
//     commom('千'),
//     v => v === '零' ? '亿' : v + '亿',
//     commom('十'),
//     commom('百'),
//     commom('千'),
//     v => v === '零' ? '万' : v + '万',
//   ]
//   const nums = String(num).split('').reverse()
//   let str = ''
//   let zore = true
//   nums.forEach((v, i) => {
//     str = unit[i](zhongwen[v]) + str
//     zore = v == 0
//   })
//   return str
// }

// trans(123456)
// trans(100010001)


// pre = 'abcde123'
// now = '1abc123'
// function diff(pre, now) {
//   let buffer = null
//   let last = ''
//   for(let t of pre) {
//     let i = now.indexOf(t)
//     if (i === -1) {
//       if (buffer) {
//         buffer.value += t
//       } else {
//         buffer =  {
//           pre: last,
//           value: t
//         }
//       }
//     } else {
//       // debugger
//       if (buffer) {
//         console.log(buffer.pre + '后面删除了' + buffer.value)
//       }
//       buffer = null
//       if (i === 0) {
//         now = now.slice(1)
//       } else {
//         console.log(t + '前面添加了' + now.slice(0, i))
//         now = now.slice(i + 1)
//       }
//     }
//     last = t
//   }
//   if (buffer) {
//     console.log(buffer.pre + '后面删除了' + buffer.value)
//   }

//   if (now) {
//     console.log('最后面添加了' + now)
//   }
// }
// // diff('abcde123', '1abc123')
// diff('9abcde123', '1a5bc132')

// let middleware = []
// middleware.push((next) => {
//     console.log(1)
//     next()
//     console.log(1.1)
// })
// middleware.push((next) => {
//     console.log(2)
//     next()
//     console.log(2.1)
// })
// middleware.push((next) => {
//     console.log(3)
//     next()
//     console.log(3.1)
// })

// let fn = compose(middleware)
// fn()


/*
1
2
3
3.1
2.1
1.1
*/

//实现compose函数
// function compose(middlewares) {
//   function next(index = 0) {
//     const middleware = middlewares[index]
//     middleware ? middleware(next.bind(null, index + 1)) : null
//   }
//   return next
// }

// function compare(str1, str2) {
//   function dealStr(str) {
//     while(str.includes('<-')) {
//       let i = str.indexOf('<-')
//       str = str.slice(0, Math.max(i - 1, 0)) + str.slice(i + 2)
//     }
//     return str
//   }
//   str1 = dealStr(str1)
//   str2 = dealStr(str2)

//   dealStr(str1) === dealStr(str2)
//   console.log(str1, str2, str1 === str2)
// }
// compare("a<-b<-", "c<-d<-")

// compare("<-<-ab<-", "<-<-<-<-a")

// compare("<-<ab<-c", "<<-<a<-<-c")

// function createRepeat(fn, repeat, interval) {
//   const loop = (arg) => {
//     if (repeat--) {
//       setTimeout(() => {
//         fn(arg)
//         loop(arg)
//       }, interval * 1000)
//     }
//   }

//   return loop
// }

// const fn = createRepeat(console.log, 3, 3);
// fn('helloWorld');


// class LRU {
//   map = new Map()

//   get(key) {
//     this.map.get(key)?.value
//   }

//   set(key, value) {
//     if (this.map.has(key)) {
//       this.map.set(key, {
//         time: Date.now(),
//         key,
//         value
//       })
//       return
//     }
//     debugger
//     if (this.map.size > 3) {
//       const min = [...this.map.values()].sort((a, b) => a.time - b.time)[0]
//       this.map.delete(min.key)
//     }

//     this.map.set(key, {
//       time: Date.now(),
//       key,
//       value
//     })

//   }
// }

// lru  = new LRU

// lru.set('a', '1')
// lru.set('b', '2')
// lru.set('c', '3')
// lru.set('5', '4')

// function pailie(arr) {
//   const _arr = arr.map(t => {
//     const a = Array.from({ length: arr.length })
//     a[0] = t
//     return a
//   })

//   let res =_arr.shift()
//   let curr
//   while(curr = _arr.shift()) {
//     res = res.map(t => curr.map(tt => {
//       // if (t === undefined && tt === undefined) {
//       //   return undefined
//       // }
//       return [].concat(t, tt)
//     })).flat()
//   }
//   return res
// }

// console.log(pailie( [1,2, 3]))


// function pail(arr, r = []) {
//   const res = []
//   for (let i = 0; i < arr.length;i++) {
//     res.push(r.concat(arr[i]))
//     res.push(...pail(arr.slice(i + 1), r.concat(arr[i])))
//   }
//   return res
// }
// console.log(pail([1,2, 3, 4, 5, 6]).sort((a, b) => a.length - b.length))

function getIndex(s, t) {
  let n = s.length;
  let m = t.length;
  for (let i = 0; i < n; i++) {
    let j = 0
    let ii = i
    if (s[ii] === t[j]) {
      while(ii < n && j < m) {
        if (s[ii] === t[j]) {
          j++
          ii++
        } else {
          break
        }
      }
      if (j === m) return i;
    }
  }
  return -1

}
