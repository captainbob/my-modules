#! /usr/bin/env node --harmony
// by yezi

const chalk = require('chalk');
const program = require('commander');
const packageJson = require('./package.json');
const { spawnSync } = require('child_process');

const pkgVersion = packageJson.version;
// master // YWRtaW46YW11Z3VhNW1kcUA= //
// 发布的环境
const devPublicConfig = "--registry http://nexus3.dianjia.io/repository/npm-alpha/";
const prodPublishConfig = "--registry http://nexus3.dianjia.io/repository/npm-local/";
// env的值是 ['dev','prod']
const INPUT_ENV = {
    dev: 'dev',
    prod: 'prod'
};

program
    .version('0.1.0')
    .command("publish <env>")
    .description("构建打包过程")
    .option("-v, --version [version]", "自定义version", '')
    .option("-h, --hotfix [version]", "自定义version", false)
    .action(function (env, options) {
        if (!checkEnv(env)) {
            console.log(chalk.red("请输入正确的环境，如 dev 或 prod"));
            process.exit(1)
        }
        console.log(chalk.cyan(`*****正在进行${env}环境的打包*****`));
        // let newPkgVersion = env == INPUT_ENV.dev ? getDevVersion(pkgVersion) : getProdVersion(pkgVersion, options.hotfix);
        let newPkgVersion = pkgVersion;
        if (options.version) {
            newPkgVersion = options.version;
        }
        if (env == INPUT_ENV.dev && !checkDevVersion(newPkgVersion)) {
            console.log(chalk.red(`*****新的版本号不符合开发环境的要求*****`));
            process.exit(1);
        }
        if (env == INPUT_ENV.prod && !checkProdVersion(newPkgVersion)) {
            console.log(chalk.red(`*****新的版本号不符合正式环境的要求*****`));
            process.exit(1);
        }

        // console.log(chalk.cyan("*****正在进行npm version 的升级"));
        // const npmAdjustVersion = spawnSync('npm', ['version', newPkgVersion], { shell: true })
        // console.log(chalk.green(npmAdjustVersion.stdout.toString()));
        // console.log(chalk.red(npmAdjustVersion.stderr.toString()));
        // if (npmAdjustVersion.status) {
        //     process.exit(1);
        // }
        // console.log(chalk.cyan("*****npm version升级完毕"));
        console.log(chalk.cyan(`*****升级版本到${newPkgVersion}*****`))

        console.log(chalk.cyan('*****正在进行gulp build*****'))
        const gulpBuild = spawnSync('gulp', ['build']);
        console.log(chalk.green(gulpBuild.stdout.toString()));
        console.log(chalk.green(gulpBuild.stderr.toString()));
        if (gulpBuild.status) {
            process.exit(1);
        }
        console.log(chalk.cyan('*****gulp build结束*****'))

        console.log(chalk.cyan("*****上传到私有库开始*****"));
        const publishConfig = env == INPUT_ENV.dev ? devPublicConfig : prodPublishConfig;
        const publishNewPackage = spawnSync('npm', ['publish', publishConfig], { shell: true, timeout: 10000 })
        console.log(chalk.green(publishNewPackage.stdout.toString()));
        console.log(chalk.red(publishNewPackage.stderr.toString()));
        if (publishNewPackage.status) {
            process.exit(1);
        }
        if (publishNewPackage.stderr.toString()) {
            process.exit(1);
        }
        console.log(chalk.cyan("*****上传到私有库完毕*****"));

    });

program.parse(process.argv);

// 检查输入的env的值是 ['dev','prod']
function checkEnv(env) {
    let values = []
    for (let i in INPUT_ENV) {
        values.push(INPUT_ENV[i]);
    }
    return values.includes(env)
}
// 解析package.json的版本
function getDevVersion(version) {
    let matchArr = version.match(/[\d.]+-[a-z]+./g);
    if (matchArr) {
        matchArr = matchArr[0];
    } else {
        console.log(chalk.red('你的版本号有问题'));
        process.exit(1);
    }
    let lastPatchNum = version.split(matchArr)[1];
    lastPatchNum = Number(lastPatchNum) + 1;
    return matchArr + lastPatchNum;
}
// 解析package.json的版本
function getProdVersion(version, hotfix) {
    let matchArr = version.split('.');
    if (hotfix) {
        matchArr[2] = Number(matchArr[2]) + 1;
    } else {
        matchArr[1] = Number(matchArr[1]) + 1;
        matchArr[2] = 0;
    }
    let newVersion = matchArr.join('.');
    return newVersion;
}
// 判断dev环境下的新的版本号
function checkDevVersion(version) {
    return /^[\d.]+-[a-z]+.[\d]+$/.test(version);
}

// 判断prod环境下的新的版本号
function checkProdVersion(version) {
    return /^[\d]+.[\d]+.[\d]+$/.test(version)
}