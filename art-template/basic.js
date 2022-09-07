
const template = require('./lib/index')
var data = {
	title: '基本例子',
	isAdmin: true,
	list: ['文艺', '博客', '摄影', '电影', '民谣', '旅行', '吉他']
};
var str = `
{{if isAdmin}}

<h1>{{title}}</h1>
<ul>
    {{each list value i}}
        <li>索引 {{i + 1}} ：{{value.ll.ll}}</li>
    {{/each}}
</ul>

{{/if}}
{{$data}}
`
// var html = template('test', data);
const res = template.compile(str)
console.log(res(data))