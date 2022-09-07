const { exec } = require('./exec')

const code = `
  var a = 1
  var b = 2
  console.log(a + b)
`

const res = exec(code, {

})

console.log(res)
