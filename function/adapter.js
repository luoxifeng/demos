const spreadOver = fn => argsArr => fn(...argsArr)


const isSorted = arr => {
  const comp = (a, b) => a >= b ? 1 : -1
  let direction = comp(arr[1], arr[0])
  let temp = 0
  for (let i = 2; i < arr.length; i++) {
    temp = comp(arr[i], arr[i - 1])
    if (direction != 0 && direction !== temp) {
      return 0
    }
    direction = temp
  }
  return direction
};


class EventListener {
  listeners = {};
  on(name, fn) {
      (this.listeners[name] || (this.listeners[name] = [])).push(fn)
  }
  once(name, fn) {
      let tem = (...args) => {
          this.removeListener(name, tem)
          fn(...args)
      }
      this.on(name, tem)
  }
  removeListener(name, fn) {
      if (this.listeners[name]) {
          this.listeners[name] = this.listeners[name].filter(listener => (listener != fn && listener != fn.fn))
      }
  }
  removeAllListeners(name) {
      if (name && this.listeners[name]) delete this.listeners[name]
      this.listeners = {}
  }
  emit(name, ...args) {
      if (this.listeners[name]) {
          this.listeners[name].forEach(fn => fn.call(this, ...args))
      }
  }
}

var bus = EventListener()

bus.once('a', console.log)

bus.emit('a', 1)

