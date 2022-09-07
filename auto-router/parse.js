const { parse } = require('@vue/compiler-sfc')
const fs  = require('fs')
const { resolve } = require('path')

const template = fs.readFileSync(resolve(__dirname, './parse.vue')).toString()
const res = parse(template, { ignoreEmpty: !false })
console.log('parse', res)
