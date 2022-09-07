/**
 * 模版编译器
 */
function withContext(code) {
    return [
        'let code = ``',
        'with(data) {',
        `  code += \`${code}\``,
        '}',
        'return code'

    ].join('\n')
}
function codeGen(str) {
    let code = ''

    // 处理插值表达式
    str = str.replace(/\{\{([^\}]+)\}\}/g, ($0, $1) => {
        return '${' + $1 + '}'
    })

    // 处理js语句
    str = str.replace(/\{%\s*/g, '`\n  ').replace(/%\}\s*/g, '\n    code += `')

    code += str
    code = withContext(code)
    
    return code
}

module.exports = function compiler(str) {
    const code = codeGen(str)

    return function render(data) {
        console.log(code)
        return new Function('data', code)(data)
    }
}

