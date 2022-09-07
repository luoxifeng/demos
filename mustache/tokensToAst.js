module.exports = function tokensToAst(tokens) {
    const root = {
        type: 'root',
        children: []
    }
    const stack = []
    let parent
    let curr

    for (let i = 0; i < tokens.length; i++) {
        parent = stack[stack.length - 1] || root
        const [type, value] = tokens[i]
        curr = {
            type,
            value,
            children: []
        }

        if (type === '#') {
            parent.children.push(curr)
            stack.push(curr)
        } else if (type === '/') {
            stack.pop()
        } else {
            parent.children.push(curr)
        }
    }
    return root
}