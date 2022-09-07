const fs = require('fs')
const compiler = require('./compiler')

const html = fs.readFileSync('./src.html', 'utf8')

const render = compiler(html)

const data = {
    name: 123,
    show: !true,
    list: [
        {
            label: '年龄',
            value: '123'
        },
        {
            label: '年龄',
            value: '123564'
        }
    ]
}

console.log(html)
console.log('++++++++')
console.log(render.toString())
console.log('++++++++')
console.log('结果\n', render(data))
/*

code + = `
<div>123</div>

` 
if (show) { 
    code +=`
        <div>{{ name + 'IF' }}</div>
    {% } esle { %}
        <div>{{ name + 'ELSE' }}</div>
    {% } %}



`

    */