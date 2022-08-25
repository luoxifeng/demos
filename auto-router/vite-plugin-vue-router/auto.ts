export function proxyCreateApp() {
  `
    export * from '${orginId}'
    import { createRouter as __createRouter } from '${orginId}'
    const createRouter = new Proxy(__createRouter, {
      apply(target, thisArg, argArray) {
        debugger

        console.log(target, thisArg, argArray, 'vue-router')
        return target.apply(thisArg, argArray)
      }
    })
    export {
      createRouter
    }
  `

}
