const path = require('path')
const chalk = require('chalk')
// 项目模板文件生成器
const Metalsmith = require('metalsmith')  
// 模板引擎整合库
const render = require('consolidate').handlebars.render
const async = require('async')
const ora = require('ora')
const fs = require('fs')

/**
 *  判断命令行参数是否正确有效
 */
let pluginDir = process.argv[2]
let description = process.argv[3]
let pluginName = ''

try {
    pluginName = pluginDir.split('-')[1].split('.')[0]
} catch (error) {
    console.log(
        chalk.red('输入组件名字不符合规范。格式：01-componentName.js')
    )
    return false
}

 
const spinner = ora('Loading unicorns').start();
spinner.color = 'yellow';
spinner.text = 'waiting...';

// const spinner = ora('Creating template');
// spinner.start();
const metalsmith = Metalsmith(path.join(__dirname, 'template')); // 阅读源文件

metalsmith
  .use(renderTemplateFiles())   // 使用插件
  .clean(true)
  .source('.')
  .destination(path.join(__dirname, pluginDir)) // 写入目标文件
  .build((err, files) => {
    spinner.stop();
    addLink();
    console.log(chalk.green('初始成功: ' + pluginDir));
    console.log(chalk.green('进入目录: cd ' + pluginDir));
    console.log(chalk.green('安装依赖: npm install'));
    console.log(chalk.green('开发模式: npm run dev'));
    console.log(chalk.green('打包发布: npm run build'));
  });

const capitalize = ([first, ...rest]) => first.toUpperCase() + rest.join('');

function renderTemplateFiles() {
  return (files, metalsmith, done) => {
    const keys = Object.keys(files) // [{ 'index.js' : { content: <Buffer 63...>, mode: '0644', ... } }]
    async.each(
      keys,
      (file, next) => {
        const str = files[file].contents.toString();
        if (!/{{([^{}]+)}}/g.test(str)) { // 如果不存在{{}}, 直接next()
          return next();
        }
        render(
          str,
          {
            name: pluginName,
            className: capitalize(pluginName),
            description: description
          },
          (err, res) => {
            if (err) {
              err.message = `[${file}] ${err.message}`;
              return next(err);
            }
            files[file].contents = new Buffer(res);
            next();
          }
        );
      },
      done
    );
  };
}

function addLink() {
  if(pluginDir === '00-test.js') return;
  const mark = '<!-- new -->';
  const newPlugin = `* [${pluginDir}(${description}插件)](https://zhw2590582.github.io/100plugins/${pluginDir}/)\n${mark}`;
  const markup = fs.readFileSync(path.join(__dirname, 'README.md'), 'utf8');
  console.log('markup', markup)
  if (!markup.includes(mark) || markup.includes(pluginDir)) {
      console.log(1)
      return
  }
  fs.writeFileSync(path.join(__dirname, 'README.md'), markup.replace(mark, newPlugin));
}

// 写好template markdown
// script.js
