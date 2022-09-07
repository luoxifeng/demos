var _tokens = [
    ["text", "<h1>我买了一个"],
    ["name", "thing"],
    ["text", "，好"],
    ["name", "mood"],
    ["text", "啊</h1>"],
    ['#', 'list'],
    ["text", "<li><div>"],
    ['name', 'name'],
    ["text", "</div><div>"],
    ['#', 'kkk'],
    ["text", "<p>"],
    ["text", "."],
    ["text", "</p>"],
    ['/', 'kkk'],
    ["text", "</div></li>"],
    ['/', 'list'],
]

class Scaner {
    constructor(str) {
        this.str = str
        this.tail = str
    }

    scan(char) {
        if (this.tail.startsWith(char)) {
            this.tail = this.tail.slice(char.length)
        }
    }

    scanUtil(char) {
        let word = ''
        while(!this.tail.startsWith(char) && !this.eos()) {
            word += this.tail[0]
            this.tail = this.tail.slice(1)
        }
        return word
    }

    eos() {
        return this.tail.length === 0
    }
}

function parseToTokens(str) {
    const tokens = []
    const scaner = new Scaner(str)
    let word = ''

    while (!scaner.eos()) {
        word = scaner.scanUtil('{{')
        if (word) {
            tokens.push({
                type: 'text',
                value: word
            })
        }
        scaner.scan('{{')

        word = scaner.scanUtil('}}')
        if (word) {
            if (word.startsWith('#')) {
                tokens.push({
                    type: '#',
                    value: word.slice(1),
                    children: []
                })
            } else if (word.startsWith('/')) {
                tokens.push({
                    type: '/',
                    value: word.slice(1)
                })
            } else {
                tokens.push({
                    type: 'name',
                    value: word
                })
            }
        }
        scaner.scan('}}')
    }

    console.log('tokens', tokens)
    return tokens
}

function tokensToAst(tokens) {
    const root = {
        type: 'root',
        value: '<!-- root -->',
        children: []
    }
    const stack = [root]
    let parent
    let curr

    for (let i = 0; i < tokens.length; i++) {
        parent = stack[stack.length - 1]
        curr = tokens[i]

        if (curr.type === '#') {
            parent.children.push(curr)
            stack.push(curr)
        } else if (curr.type === '/') {
            stack.pop()
        } else {
            parent.children.push(curr)
        }
    }

    console.log('ast:', JSON.stringify(root, null, 4))
    return root
}


function renderToStr(ast, data) {
    debugger
    let str = ''
    const { type, value, children = [] } = ast
    if (type === 'text') {
        str += value
    } else if (type === 'name') {
        str += value === '.' ? data : data[value]
    } else if (type === '#') {
        str += data[value].map((t) => {
            return children.map((_ast) => renderToStr(_ast, t)).join('')
        }).join('')
    } else {
        str += value
        str += children.map((t) => renderToStr(t, data)).join('')
    }

    return str
}

function render(str, data) {
    const tokens = parseToTokens(str) || _tokens
    const ast = tokensToAst(tokens)
    // console.log('ast:', JSON.stringify(ast, null, 4))

    const domStr = renderToStr(ast, data)

    return domStr
}

// console.log('str:', render('', {}))



