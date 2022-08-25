


/*** @就解决 对对对
 * @f13_pcc
 * @/*name Dialog工厂
 * @img dialog.png
 * @desc 这是Dialog工厂，使用此工厂可以快速创建通用的dialog
 * @tag 弹窗
 * @author guoying
 */
const State = {
  INIT: 'init',

  NEWLINE: 'NEWLINE',

  LINE_START: 'LINE_START',

  FIELD_KEY: 'FIELD_KEY',

  FIELD_SLICE: 'FIELD_SLICE',

  FIELD_VALUE: 'FIELD_VALUE',

  COMMENT_START: 'COMMENT_START',

  COMMENT_END: 'COMMENT_END'
}

export default class Parse {

  raw = ''

  local = -1

  char = ''

  group = ''

  tokens: any[] = []

  started = false

  _state = State.INIT

  get state() {
    return this._state
  }

  set state(state) {
    if (state !== State.FIELD_VALUE && this._state === State.FIELD_VALUE) {
      // this.local += this.group.length - 1
      this.currentToken.content = this.group
      this.currentToken.end = this.local
      this.resetState()
    }
    this._state = state
  }

  offset = 1

  constructor(raw: string) {
    this.raw = raw.replace(/\r\n/gm, '\n')
  }

  parse() {
    this.process()
    const tokens = this.tokens.filter(t => {
      return ![State.NEWLINE, State.LINE_START, State.FIELD_SLICE].includes(t.type)
    })
    console.log(tokens)
  }

  resetState() {
    this.group = ''
    this._state = State.INIT
  }

  get preChar() {
    return this.raw[this.local - 1]
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
      const res = /^(\s*?\*\s*|\s+)/.exec(this.nextRaw)
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
      /**
       * 未处理过注释开始的字符，从而此位置就是注释开始的地方
       */
      if (this.nextChar === '*' && !this.started) {
        this.started = true
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
        this.started = false
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
    } else if (this.char === ' ') {
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
    this.local += this.offset
    this.offset = 1
    this.char = this.raw[this.local]
  }

  



}

function parseComment(str, options) {
  str = str.trim();
  options = options || {};

  var comment = { tags: [] } as any
    , raw = options.raw
    , description = {} as any
    , tags = str.split(/\n\s*@/);

  // A comment has no description
  if (tags[0].charAt(0) === '@') {
    tags.unshift('');
  }

  // parse comment body
  description.full = tags[0];
  description.summary = description.full.split('\n\n')[0];
  description.body = description.full.split('\n\n').slice(1).join('\n\n');
  comment.description = description;

  // parse tags
  if (tags.length) {
    comment.tags = tags.slice(1).map(exports.parseTag);
    comment.isPrivate = comment.tags.some(function(tag){
      return 'private' == tag.visibility;
    });
    comment.isConstructor = comment.tags.some(function(tag){
      return 'constructor' == tag.type || 'augments' == tag.type;
    });
    comment.isClass = comment.tags.some(function(tag){
      return 'class' == tag.type;
    });
    comment.isEvent = comment.tags.some(function(tag){
      return 'event' == tag.type;
    });

    if (!description.full || !description.full.trim()) {
      comment.tags.some(function(tag){
        if ('description' == tag.type) {
          description.full = tag.full;
          description.summary = tag.summary;
          description.body = tag.body;
          return true;
        }
      });
    }
  }

  // markdown
  if (!raw) {
    description.full = markdown.render(description.full).trim();
    description.summary = markdown.render(description.summary).trim();
    description.body = markdown.render(description.body).trim();
    comment.tags.forEach(function (tag) {
      if (tag.description) tag.description = markdown.render(tag.description).trim();
      else tag.html = markdown.render(tag.string).trim();
    });
  }

  return comment;
};

export function parseComments(js: string, options?: any){
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
        comment = comments[comments.length - 1];
        if(comment) {
          // Adjust codeStart for any vertical space between comment and code
          comment.codeStart += buf.match(/^(\s*)/)[0].split('\n').length - 1;
          comment.code = code = exports.trimIndentation(buf).trim();
          comment.ctx = exports.parseCodeContext(code, parentContext);

          if (comment.isConstructor && comment.ctx){
              comment.ctx.type = "constructor";
          }

          // starting a new namespace
          if (comment.ctx && (comment.ctx.type === 'prototype' || comment.ctx.type === 'class')){
            parentContext = comment.ctx;
          }
          // reasons to clear the namespace
          // new property/method in a different constructor
          else if (!parentContext || !comment.ctx || !comment.ctx.constructor || !parentContext.constructor || parentContext.constructor !== comment.ctx.constructor){
            parentContext = null;
          }
        }
        buf = '';
      }
      i += 2;
      withinMultiline = true;
      ignore = '!' == js[i];

      // if the current character isn't whitespace and isn't an ignored comment,
      // back up one character so we don't clip the contents
      if (' ' !== js[i] && '\n' !== js[i] && '\t' !== js[i] && '!' !== js[i]) i--;

    // end comment
    } else if (withinMultiline && !withinSingle && '*' == js[i] && '/' == js[i+1]) {
      i += 2;
      buf = buf.replace(/^[ \t]*\* ?/gm, '');
      comment = parseComment(buf, options);
      comment.ignore = ignore;
      comment.line = lineNumStarting;
      comment.codeStart = lineNum + 1;
      if (!comment.description.full.match(skipPattern)) {
        comments.push(comment);
      }
      withinMultiline = ignore = false;
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

  if (comments.length === 0) {
    comments.push({
      tags: [],
      description: {full: '', summary: '', body: ''},
      isPrivate: false,
      isConstructor: false,
      line: lineNumStarting
    });
  }

  // trailing code
  if (buf.trim().length) {
    comment = comments[comments.length - 1];
    // Adjust codeStart for any vertical space between comment and code
    comment.codeStart += buf.match(/^(\s*)/)[0].split('\n').length - 1;
    comment.code = code = exports.trimIndentation(buf).trim();
    comment.ctx = exports.parseCodeContext(code, parentContext);
  }

  return comments;
};
