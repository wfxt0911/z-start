const { program } = require('commander')
const inquirer = require('inquirer')
const figlet = require('figlet')
const chalk = require('chalk')
const fs = require('fs-extra')
const { projectDao } = require('../db/index.js')
const shell = require('shelljs')
const red = (msg) => {
    console.log(`\r\n  ${chalk.red.bold(msg)}\r\n`)
}
const green = (msg) => {
    console.log(`\r\n  ${chalk.green.bold(msg)}\r\n`)
}

const showTitle = (title = 'z-start') => {
    console.log(chalk.green.bold(figlet.textSync(title, {
        horizontalLayout: 'default',
        verticalLayout: 'default',
        width: 200,
        whitespaceBreak: true
    })));
}

const isExist = async (path) => {
    if (!path) return '目录不能为空'
    const _path = path + '/package.json'
    const pathExist = await fs.pathExists(path)
    if (!pathExist) return '目录不存在,请检查！'
    const pacjageExist = await fs.pathExists(_path)
    return pacjageExist || '该目录下没有package.json文件,无法添加'
}
const getSripts = async (path) => {
    const { scripts } = await fs.readJson(path + '/package.json')
    if (!scripts || scripts == {}) return []
    return Object.keys(scripts)
}


const create = (program, db) => {
    const promptList = [
        {
            type: 'input',
            name: 'name',
            message: '请输入项目名称',
            validate: (value) => {
                return value ? true : '项目名称不能为空'
            }
        },
        {
            type: 'input',
            name: 'path',
            message: '请输入文件夹路径',
            validate: async (value, { env }) => {
                return await isExist(value, env)
            }
        }
    ];

    program
        .command("create")
        .description("创建项目")
        .action(() => {
            inquirer.prompt(promptList).then(({ name, path }) => {

                const projectTable = new projectDao(db)
                const row = projectTable.selectByName(name)
                if (row.length > 0) {
                    red(`添加失败，${name}项目已经存了，当前环境已存在的数据如下，请核查！`)
                    const exists = projectTable.getAll()
                    exists.length > 0 && console.table(exists)
                    return
                }
                projectTable.insert(name, path)
                green('添加成功')


            }).catch(err => {
                console.log(err);
            }).finally(() => {
                db.close()
            })
        })
}

const list = (program, db, projects) => {
    program
        .command("list")
        .description("查看项目")
        .action(() => {
            if (projects.length > 0) {
                console.table(projects)
            } else {
                red("没有查到数据，请添加")
            }
            db.close()
        })
}


const remove = (program, db, projects, projectConnect) => {
    const promptList = [{
        type: 'list',
        name: 'project',
        message: '请选择一个项目',
        choices: projects.map(_pro => {
            return {
                name: _pro.name,
                value: _pro
            }
        }),
    },
    ];

    program
        .command('remove')
        .description('移除项目')
        .action(() => {
            inquirer.prompt(promptList).then(({ project }) => {
                inquirer.prompt({
                    name: "confirm",
                    type: "confirm",
                    message: `确定删除${project.name}？`,
                }).then((confirm) => {
                    if (confirm) {
                        const { changes } = projectConnect.deleteById(project.id)
                        if (changes > 0) {
                            green("删除成功")
                        }
                    }
                }).catch(err => {
                    console.log(err);
                }).finally(() => {
                    db.close()
                })
            })
        })
}


const handle = (program, db, projects) => {
    const promptList = [{
        type: 'list',
        name: 'project',
        message: '请选择一个项目',
        choices: projects.map(_pro => {
            return {
                name: _pro.name,
                value: _pro
            }
        }),
    },
    ];

    program
        .command('start')
        .description('快速开始')
        .action(() => {
            if (!projects || projects.length <= 0) {
                return red("没有查到项目，请新增")
            }
            inquirer.prompt(promptList).then(({ project }) => {
                shell.cd(project.path)
                getSripts(project.path).then((scripts) => {
                    // if (scripts.length == 0) return red('非常抱歉，该项目的package.json文件中不存在scripts脚本')
                    const vscode = '使用Visual Studio Code打开'
                    inquirer.prompt({
                        type: 'list',
                        name: 'script',
                        message: '请选择一个脚本',
                        choices: [vscode, ...scripts],
                        loop: false
                    },).then(({ script }) => {
                        if (script === vscode) {
                            shell.exec('code .')
                        } else {
                            shell.exec(`npm run ${script}`)
                        }
                    })
                })
            }).catch(err => {
                console.log(err);
            }).finally(() => {
                db.close()
            })
        })
}



const start = (db) => {
    showTitle()

    program
        .name('zwf Script')
        .description('快速启动项目脚手架')
        .version('0.8.0');

    const projectConnect = new projectDao(db)
    const projects = projectConnect.getAll()

    create(program, db,)
    list(program, db, projects)
    handle(program, db, projects)
    remove(program, db, projects, projectConnect)


    program.parse();
}

module.exports = {
    start
}