module.exports = {
    printWidth: 120, // 换行字符串阈值
    tabWidth: 2, // 设置工具每一个水平缩进的空格数
    useTabs: false,
    semi: false, // 句末是否加分号
    vueIndentScriptAndStyle: true,//缩进Vue文件中的脚本和样式标签
    singleQuote: true, // 用单引号
    trailingComma: 'none', // 最后一个对象元素符加逗号
    bracketSpacing: true,//括号空格 { foo:bar }
    arrowParens: 'always', // 为单行箭头函数的参数添加圆括号
    insertPragma: false, // 不需要在文件的顶部插入一个 @format的特殊注释，以表明改文件已经被Prettier格式化过了
    endOfLine:'auto'//行尾风格，保持现有行尾风格
  }
  