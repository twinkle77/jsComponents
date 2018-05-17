const path = require('path')
const chalk = require('chalk')
const fs = require('fs')

const Metalsmith = require('metalsmith')
const render = require('consolidate').handlebars.render

const async = require('async')
const ora = require('ora')

let pluginDir = process.argv[2]
let pluginDesc = process.argvp[3]
let pluginName = ''

try {
    pluginName = pluginDir.split('-')[1].split('.')[0]
} catch (error) {
    console.log(
        chalk.red('输入组件名字不符合规范。格式：01-componentName.js')
    )
    return false
}

const spinner = ora('waiting......').start()
spinner.color = 'yellow'

Metalsmith(path.join(__dirname, '../template'))
    .use()
    .clean(false)
    .source('.')
    .destination(path.join(__dirname, `../${pluginDir}`))
    .build((err, files) => {
        spinner.stop()
        console.log(
            chalk.green(`初始化成功: ${pluginDir}`)
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