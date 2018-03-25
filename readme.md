**********************************************************************************************************************
*   dev主要用于djmodules库的开发，djmodules和dev的集成查看dev/src／menu/menu-demo, 配置查看dev/dihog.json,
*   dev集成mock功能，可以自己mock json数据, 例子可以查看dev/src/default／default-demo, 数据配置查看
**********************************************************************************************************************
注意事项：
如果有djmodules-utils组件报错，就执行yarn install

进入 dev
    1 yarn install dihog -g             (首次)
    2 yarn install                        (首次)
    3 yarn start 

进入根目录
    1 yarn install gulp -g                (首次)
    2 yarn install                        (首次)
    3 gulp watch 开发模式

发布
开发版本  命令  npm run dev-publish
正式版本  命令  npm run prod-publish
hotfix版本命令 npm run hotfix-publish

