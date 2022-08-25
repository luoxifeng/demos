import { parse } from '@vue/compiler-sfc';
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

function parseComments(js: string, options?: any){
  options = options || {};
  js = js.replace(/\r\n/gm, '\n');

  var comments = []
    , skipSingleStar = options.skipSingleStar
    , comment
    , buf = ''
    , ignore
    , withinMultiline = false
    , withinSingle = false
    , withinString = false
    , code
    , linterPrefixes = options.skipPrefixes || ['jslint', 'jshint', 'eshint']
    , skipPattern = new RegExp('^' + (options.raw ? '' : '<p>') + '('+ linterPrefixes.join('|') + ')')
    , lineNum = 1
    , lineNumStarting = 1
    , parentContext
    , withinEscapeChar
    , currentStringQuoteChar;


  for (var i = 0, len = js.length; i < len; ++i) {
    withinEscapeChar = withinString && !withinEscapeChar && js[i - 1] == '\\';

    // start comment
    if (!withinMultiline && !withinSingle && !withinString &&
        '/' == js[i] && '*' == js[i+1] && (!skipSingleStar || js[i+2] == '*')) {
      lineNumStarting = lineNum;
      // code following the last comment
      if (buf.trim().length) {
      }
      buf = '/*';
      // debugger
      comment = {
        start: i,
      }
      i += 2;
      withinMultiline = true;
      if (' ' !== js[i] && '\n' !== js[i] && '\t' !== js[i] && '!' !== js[i]) i--;
    
    // end comment
    } else if (withinMultiline && !withinSingle && '*' == js[i] && '/' == js[i+1]) {
      buf += '*/'
      i += 2;
      comment.end = i
      comment.line = lineNumStarting;
      comment.content = buf
      comments.push(comment)
      withinMultiline = false
      buf = '';
    } else if (!withinSingle && !withinMultiline && !withinString && '/' == js[i] && '/' == js[i+1]) {
      withinSingle = true;
      buf += js[i];
    } else if (withinSingle && !withinMultiline && '\n' == js[i]) {
      withinSingle = false;
      buf += js[i];
    } else if (!withinSingle && !withinMultiline && !withinEscapeChar && ('\'' == js[i] || '"' == js[i] || '`' == js[i])) {
      if(withinString) {
        if(js[i] == currentStringQuoteChar) {
          withinString = false;
        }
      } else {
        withinString = true;
        currentStringQuoteChar = js[i];
      }

      buf += js[i];
    } else {
      buf += js[i];
    }

    if('\n' == js[i]) {
      lineNum++;
    }
  }

  return comments;
};

class ParseComment {

  raw = ''

  offset = 0

  local = -1

  char = ''

  group = ''

  tokens: any[] = []

  _state = State.INIT

  get state() {
    return this._state
  }

  set state(state) {
    if (state !== State.FIELD_VALUE && this._state === State.FIELD_VALUE) {
      this.currentToken.content = this.group
      this.currentToken.end = this.local
      this.group = ''
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
    const tokens = this.tokens.filter(t => {
      return ![State.NEWLINE, State.LINE_START, State.FIELD_SLICE].includes(t.type)
    })
    console.log(tokens)
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
      // debugger
      const res = /^([\s\t]*?\*[\s\t]*|[\s\t]+)/.exec(this.nextRaw)
      if (res) {
        const t = res[1]
        this.state = State.LINE_START
        const end = this.local + t.length - 1
        this.tokens.push({
          type: this.state,
          start: this.local,
          end,
          content: t
        })
        this.local = end
        this.process()
        return true
      }
    }
    return false
  }

  process() {
    // debugger
    this.next()
    if (this.local >= this.raw.length) return
    if (this.char === '/') {
      if (this.nextChar === '*') {
        this.state = State.COMMENT_START
        this.tokens.push({
          type: this.state,
          start: this.local,
          end: this.local + 2,
          content: '/*'
        })
        this.local++
        this.process()
        return
      }
    } else if (this.char === '*') {
      // 结束标记
      if (this.nextChar === '/') {
        this.state = State.COMMENT_END
        this.tokens.push({
          type: this.state,
          start: this.local,
          end: this.local + 2,
          content: '*/'
        })
        this.local++
        this.process()
        return
      }
      // 一行的开头
      const res = this.processLineStart()
      if (res) return
    } else if (this.char === '\n') {
      // debugger
      this.state = State.NEWLINE
      this.tokens.push({
        type: this.state,
        start: this.local,
        end: this.local,
        content: '\n'
      })
      this.process()
      return
    } else if (this.char === ' ' || this.char === '\t') {
      // 一行的开头
      const res = this.processLineStart()
      if (res) return

      if (this.state === State.FIELD_KEY) {
        const res = /^(\s*)/.exec(this.nextRaw)
        if (res) {
          const t = res[1]
          this.state = State.FIELD_SLICE
          const end = this.local + t.length - 1
          this.tokens.push({
            type: this.state,
            start: this.local,
            end,
            content: t
          })
          this.local = end
          this.process()
          return true
        }

      }
    } else if (this.char === '@') {
      // debugger
      if ([State.COMMENT_START, State.NEWLINE, State.LINE_START].includes(this.state)) {
        const res = /^(@[a-zA-Z0-9_]+)\b/.exec(this.nextRaw)
        if (res) {
          const t = res[1]
          this.state = State.FIELD_KEY
          const end = this.local + t.length - 1
          this.tokens.push({
            type: this.state,
            start: this.local,
            end,
            content: t
          })
          this.local = end
          this.process()
          return
        }
      }
    }
    
    // debugger
    if (this.state != State.FIELD_VALUE) {
      this.state = State.FIELD_VALUE
      this.tokens.push({
        type: this.state,
        start: this.local,
      })
    }
    this.group += this.char

    this.process()
  }

  next() {
    this.local++
    this.char = this.raw[this.local]
  }

}

export default class Parse {
  
  raw = ''

  private children: ParseComment[] = []

  comments: any[]

  constructor(str: string) {
    this.raw = str.replace(/\r\n/gm, '\n')
    this.comments = parseComments(this.raw) as any
  }

  parse() {
    this.children = this.comments.map(t => {
      return new ParseComment(t.content, t.start)
    })
    console.log('comments', this.children, this.raw.slice(this.comments[0].start, this.comments[0].end))
  }

}



