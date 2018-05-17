const path = require('path')
const chalk = require('chalk')
const fs = require('fs')

// 项目模板文件生成器
const Metalsmith = require('metalsmith')
// 模板引擎整合库
const render = require('consolidate').handlebars.render

const async = require('async')
const ora = require('ora')

/**
 *  判断命令行参数是否正确有效
 */
let pluginDir = process.argv[2]
let pluginDesc = process.argv[3]
let pluginName = ''

try {
    pluginName = pluginDir.split('.')[1]
} catch (error) {
    console.log(
        chalk.red('输入组件名字不符合规范。格式：npm run init 01-componentName 中文名')
    )
    return false
}

console.log(
    chalk.blue(`组件目录: ${pluginDir}`)
)
console.log(
    chalk.blue(`组件描述: ${pluginDesc}`)
)
console.log(
    chalk.blue(`组件名称: ${pluginName}`)
)

// 初始化时命令行的提示等待图标
const spinner = ora('waiting......').start()
spinner.color = 'yellow'

Metalsmith(path.join(__dirname, '../template')) // 阅读源文件
    .use(metalPlugin()) // 使用插件
    .clean(false)
    .source('.')
    .destination(path.join(__dirname, `../${pluginDir}`)) // 写入目标文件
    .build((err, files) => {
        spinner.stop()
        console.log(
            chalk.green(`初始成功: ${pluginDir}`)
        )
        console.log(
            chalk.green(`进入目录: cd ${pluginDir}`)
        )
        console.log(
            chalk.green('安装依赖: npm install')
        )
        console.log(
            chalk.green('开发模式: npm run dev')
        )
        console.log(
            chalk.green('打包发布: npm run build')
        )
    })

// 将字符串的第一字母转为大写
const capitalize = ([first, ...rest]) => `${first.toUpperCase()}${rest.join('')}` 

// metalplugin，官网有给出插件实例可以参考
function metalPlugin () {
    return (files, metalsmith, done) => {
        const keys = Object.keys(files) // files = [{ 'index.js' : { content: <Buffer 63...>, mode: '0644', ... } }]
        async.each(
            keys,
            (fileName, next) => {
                const str = files[fileName].contents.toString()
                if (!/{{([^{}]+)}}/g.test(str)) { // 如果不存在{{}}模板, 直接next()
                    return next()
                }
                render(
                    str,
                    {
                        name: pluginName,
                        className: capitalize(pluginName),
                        description: pluginDesc
                    },
                    (err, res) => {
                        if (err) {
                            err.message = `[${fileName}] ${err.message}`
                            return next(err)
                        }
                        files[fileName].contents = new Buffer(res) // res为模板渲染后的字符串，这里需要已Buffer形式写回去
                        next()
                    }
                )
            },
            done
        )
    }
}