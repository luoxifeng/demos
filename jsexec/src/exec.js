const acorn = require('acorn')
const options = {
  ecmaVersion: 5,
  sourceType: 'script',
  locations: true,
};

const astProcess = {

}


class Scope {

  type

  $data = {}

  $parent

  constructor(type, parent) {
    this.type = type
    this.$parent = parent || null
  }

  $set(key, value) {
    this.$data[key] = value
  }

  $get() {
    this.$data[key]
  }
}


// function
exports.exec = function(code, api) {
  const scope = new Scope('block')

  const ast = acorn.parse(code, options)

  console.log(ast)


}
