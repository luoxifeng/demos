
const jj = `3[a2[ak]3[b]2[d2[j]]]`

export function smartRepeat(str) {
	let index = 0
	let curr = ''
	let res = ''
	let match
	const stack1 = []
	const stack2 = []

	while (str) {
		console.log(str, stack1, stack2)
		if (match = str.match(/^(\d+)\[/)) {
			curr = match[1]
			stack1.push(curr)
			str = str.slice(curr.length + 1)
		} else if (match = str.match(/^([a-z]+)/)) {
			curr = match[1]
			stack2.push(curr)
			str = str.slice(curr.length)
		} else {
			// debugger
			curr = stack2.pop()?.repeat(stack1.pop() || 1)
			if (stack2.length) {
				stack2[stack2.length - 1] = stack2[stack2.length - 1] + curr
			} else {
				res = curr
			}
			str = str.slice(1)
		}
		
	} 

	console.log(res, stack1, stack2)

}

smartRepeat(jj)
