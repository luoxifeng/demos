const State = {
  INIT: 'INIT',

  NEWLINE: 'NEWLINE',

  LINE_START: 'LINE_START',

  FIELD_KEY: 'FIELD_KEY',

  FIELD_SLICE: 'FIELD_SLICE',

  FIELD_VALUE: 'FIELD_VALUE',

  COMMENT_START: 'COMMENT_START',

  COMMENT_END: 'COMMENT_END'
}

function parseComments(js: string, options?: any) {
  options = options || {}
  js = js.replace(/\r\n/gm, '\n')

  var comments = [],
    skipSingleStar = options.skipSingleStar,
    comment,
    buf = '',
    ignore,
    withinMultiline = false,
    withinSingle = false,
    withinString = false,
    code,
    linterPrefixes = options.skipPrefixes || ['jslint', 'jshint', 'eshint'],
    skipPattern = new RegExp(
      '^' + (options.raw ? '' : '<p>') + '(' + linterPrefixes.join('|') + ')'
    ),
    lineNum = 1,
    lineNumStarting = 1,
    parentContext,
    withinEscapeChar,
    currentStringQuoteChar

  for (var i = 0, len = js.length; i < len; ++i) {
    withinEscapeChar = withinString && !withinEscapeChar && js[i - 1] == '\\'

    // start comment
    if (
      !withinMultiline &&
      !withinSingle &&
      !withinString &&
      '/' == js[i] &&
      '*' == js[i + 1] &&
      (!skipSingleStar || js[i + 2] == '*')
    ) {
      lineNumStarting = lineNum
      // code following the last comment
      if (buf.trim().length) {
      }
      buf = '/*'
      comment = {
        start: i
      }
      i += 2
      withinMultiline = true
      if (' ' !== js[i] && '\n' !== js[i] && '\t' !== js[i] && '!' !== js[i])
        i--

      // end comment
    } else if (
      withinMultiline &&
      !withinSingle &&
      '*' == js[i] &&
      '/' == js[i + 1]
    ) {
      buf += '*/'
      i += 2
      comment.end = i
      comment.line = lineNumStarting
      comment.content = buf
      comments.push(comment)
      withinMultiline = false
      buf = ''
    } else if (
      !withinSingle &&
      !withinMultiline &&
      !withinString &&
      '/' == js[i] &&
      '/' == js[i + 1]
    ) {
      withinSingle = true
      buf += js[i]
    } else if (withinSingle && !withinMultiline && '\n' == js[i]) {
      withinSingle = false
      buf += js[i]
    } else if (
      !withinSingle &&
      !withinMultiline &&
      !withinEscapeChar &&
      ("'" == js[i] || '"' == js[i] || '`' == js[i])
    ) {
      if (withinString) {
        if (js[i] == currentStringQuoteChar) {
          withinString = false
        }
      } else {
        withinString = true
        currentStringQuoteChar = js[i]
      }

      buf += js[i]
    } else {
      buf += js[i]
    }

    if ('\n' == js[i]) {
      lineNum++
    }
  }

  return comments
}

class ParseComment {
  raw = ''

  offset = 0

  local = -1

  buffer = ''

  tokens: any[] = []

  tags: any[] = []

  _state = State.INIT

  get state() {
    return this._state
  }

  set state(state) {
    if (state !== State.FIELD_VALUE && this._state === State.FIELD_VALUE) {
      this.currentToken.content = this.buffer
      this.currentToken.end = this.local
      this.buffer = ''
      this._state = State.INIT
    }
    this._state = state
  }

  constructor(raw: string, offset = 0) {
    this.raw = raw
    this.offset = offset
    this.process()
    this.pair()
  }

  pair() {
    const stack = [] as any[]
    let lastToken: any
    let currToken
    let values: string[] = []

    console.log(this.tokens)

    const tokens = this.tokens.filter(t =>
      [State.FIELD_KEY, State.FIELD_VALUE].includes(t.type)
    )
    const appendTag = () => {
      if (lastToken) {
        this.tags.push({
          key: lastToken.content.replace(/^@/, ''),
          value: values.filter(Boolean).join('\n')
        })
        values = []
      }
      stack.pop()
    }

    console.log(tokens)

    while (tokens.length) {
      currToken = tokens.shift()
      if (currToken.type === State.FIELD_KEY) {
        appendTag()
        stack.push(currToken)
      } else if (lastToken) {
        values.push(currToken.content.trim())
      }
      lastToken = stack[stack.length - 1]
    }

    appendTag()
  }

  get char() {
    return this.raw[this.local]
  }

  get nextChar() {
    return this.raw[this.local + 1]
  }

  get nextRaw() {
    return this.raw.slice(this.local)
  }

  get currentToken() {
    return this.tokens[this.tokens.length - 1]
  }

  processLineStart() {
    if ([State.COMMENT_START, State.NEWLINE].includes(this.state)) {
      const res = /^([\s\t]*?\*[\s\t]*|[\s\t]+)/.exec(this.nextRaw)
      if (res) {
        const content = res[1]
        const end = this.local + content.length - 1
        this.appendtoken(
          State.LINE_START,
          end,
          content,
          () => (this.local = end)
        )
        return true
      }
    }
    return false
  }

  process() {
    this.local++
    if (this.local >= this.raw.length) return
    if (this.char === '/') {
      if (this.nextChar === '*') {
        this.appendtoken(
          State.COMMENT_START,
          this.local,
          '/*',
          () => this.local++
        )
        return
      }
    } else if (this.char === '*') {
      // 结束标记
      if (this.nextChar === '/') {
        this.appendtoken(
          State.COMMENT_END,
          this.local + 2,
          '*/',
          () => this.local++
        )
        return
      }
      // 一行的开头
      const res = this.processLineStart()
      if (res) return
    } else if (this.char === '\n') {
      this.appendtoken(State.NEWLINE, this.local, this.char)
      return
    } else if (this.char === ' ' || this.char === '\t') {
      // 一行的开头
      const res = this.processLineStart()
      if (res) return

      if (this.state === State.FIELD_KEY) {
        // debugger
        const res = /^([ \t]*?)/.exec(this.nextRaw)
        if (res) {
          const content = res[1]
          const end = this.local + content.length - 1
          this.appendtoken(
            State.FIELD_SLICE,
            end,
            content,
            () => (this.local = end)
          )
          return true
        }
      }
    } else if (this.char === '@') {
      if (
        [State.COMMENT_START, State.NEWLINE, State.LINE_START].includes(
          this.state
        )
      ) {
        const res = /^(@.+?)(?:\s|\*\/)/.exec(this.nextRaw)
        if (res) {
          const content = res[1]
          const end = this.local + content.length - 1
          this.appendtoken(
            State.FIELD_KEY,
            end,
            content,
            () => (this.local = end)
          )
          return
        }
      }
    }

    this.buffer += this.char
    if (this.state != State.FIELD_VALUE) {
      this.appendtoken(State.FIELD_VALUE)
    } else {
      this.process()
    }
  }

  appendtoken(
    state: string,
    end = this.local,
    content = '',
    before = () => {}
  ) {
    this.state = state
    this.tokens.push({
      type: state,
      start: this.local,
      offset: this.offset,
      end,
      content
    })
    before()
    this.process()
  }
}

export default class Parse {
  raw = ''

  comments: any[]

  children: ParseComment[] = []

  tags: any[] = []

  constructor(str: string) {
    this.raw = str.replace(/\r\n/gm, '\n')
    this.comments = parseComments(this.raw) as any
  }

  parse() {
    this.comments.forEach(t => {
      const tt = new ParseComment(t.content, t.start)
      this.children.push(tt)
      this.tags.push(tt.tags)
    })
  }
}
