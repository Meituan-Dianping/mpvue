<p align="center"><a href="http://mpvue.com" target="_blank" rel="noopener noreferrer"><img width="100" src="http://mpvue.com/assets/logo.png" alt="mpvue logo"></a></p>
<p align="center">
   <a href="https://www.npmjs.com/package/mpvue"><img src="https://img.shields.io/npm/v/mpvue.svg?style=flat" alt="npm"></a>
   <a href="https://www.npmjs.com/package/mpvue"><img src="https://img.shields.io/npm/dm/mpvue.svg?style=flat" alt="npm"></a>
 </p>

# mpvue
> Vue.js 小程序版, fork 自 [vuejs/vue@2.4.1](https://github.com/vuejs/vue)，保留了 vue runtime 能力，添加了小程序平台的支持。


`mpvue` 是一个使用 [Vue.js](https://vuejs.org) 开发小程序的前端框架。框架基于 `Vue.js` 核心，`mpvue` 修改了 `Vue.js` 的 runtime 和 compiler 实现，使其可以运行在小程序环境中，从而为小程序开发引入了整套 `Vue.js` 开发体验。

## 文档

[mpvue 文档](http://mpvue.com)

## 实践案例

美团旗下小程序：`美团火车票12306抢票`、`美团汽车票` 和 `美团充电`，此外，正有一大批小程序正在接入中。

## 快速开始

我们精心准备了一个简单的 [五分钟上手教程](http://mpvue.com/mpvue/quickstart) 方便你快速体验到 `mpvue` 带来的开发乐趣。

## 名称由来
- `mp`：mini program 的缩写
- `mpvue`：Vue.js in mini program

## 主要特性
使用 `mpvue` 开发小程序，你将在小程序技术体系的基础上获取到这样一些能力：

- 彻底的组件化开发能力：提高代码复用性
- 完整的 `Vue.js` 开发体验
- 方便的 `Vuex` 数据管理方案：方便构建复杂应用
- 快捷的 `webpack` 构建机制：自定义构建策略、开发阶段 hotReload
- 支持使用 npm 外部依赖
- 使用 `Vue.js` 命令行工具 vue-cli 快速初始化项目
- H5 代码转换编译成小程序目标代码的能力

其它特性正在等着你去探索。

### H5 和小程序如何复用代码
[先来看一段视频](http://mpvue.com/assets/20170810-022809-HD.mp4)
<video src="http://mpvue.com/assets/20170810-022809-HD.mp4" width="863" height="480" controls="controls"></video>

在左侧为已经上线的 H5 页面，右侧为同代码的小程序页面，其中只需要更改小部分平台差异代码和更新下 webpack 的建构配置就可以直接运行。

在未来最理想的状态是，可以一套代码可以直接跑在多端：WEB、小程序（微信和支付宝）、Native（借助weex）。

当然从产品的层面，我们不建议这么做，各个端有自己的差异性，我们期望的只是开发和调试体验一致。

## 配套设施
`mpvue` 作为小程序版本的 `Vue.js`，在框架 SDK 之外，完整的技术体系还包括如下设施。

- [mpvue-loader](http://mpvue.com/build/mpvue-loader) 提供 webpack 版本的加载器
- [mpvue-webpack-target](http://mpvue.com/build/mpvue-webpack-target) webpack 构建目标
- [postcss-mpvue-wxss](http://mpvue.com/build/postcss-mpvue-wxss) 样式代码转换预处理工具
- [px2rpx-loader](http://mpvue.com/build/px2rpx-loader) 样式转化插件
- [mpvue-quickstart](http://mpvue.com/mpvue/quickstart) mpvue-quickstart
- [mpvue-simple](http://mpvue.com/mpvue/simple) 辅助 mpvue 快速开发 Page / Component 级小程序页面的工具
- 其它

## 使用 mpvue 的项目

<div>
    <img src="https://user-images.githubusercontent.com/1715463/42300198-c79e41ac-8041-11e8-9bf4-569901bc8c5d.jpeg" width="100" title="享物说"/>
    <img src="https://user-images.githubusercontent.com/13334618/38455900-d608df44-3ab0-11e8-94db-a5b7ac782612.jpg" width="100" />
    <img src="https://camo.githubusercontent.com/d0fe641cc98e6dcdff3b3e28f3f46ed47a3b5777/68747470733a2f2f7773312e73696e61696d672e636e2f6c617267652f36313134353733386c7931667139723334316a33356a323037363037363735392e6a7067" width="100" />
    <img src="https://user-images.githubusercontent.com/26051070/39106618-75ed54b4-46ef-11e8-834d-faf2629c218b.jpg" width="100" />
    <img src="https://user-images.githubusercontent.com/12172868/39176660-e973d0de-47df-11e8-88c2-fbd36b14caed.jpg" width="100" />
    <img src="https://user-images.githubusercontent.com/8087694/39505682-93727596-4e06-11e8-8978-6075d6b03742.jpg" width="100" />
    <img src="https://user-images.githubusercontent.com/16408246/40176958-ac78023a-5a0f-11e8-85bf-0ff56426f202.jpg" width="100" />
    <img src="https://user-images.githubusercontent.com/7871813/39956784-b3b978c0-5619-11e8-9bc4-658c8f2907e6.png" width="100" />
    <img src="https://user-images.githubusercontent.com/8219610/40181466-b8e1f204-5a1b-11e8-9c39-545226b354b6.jpg" width="100" />
    <img src="https://user-images.githubusercontent.com/8426097/40212791-72744312-5a84-11e8-819d-654057def4a2.jpg" width="100" />
    <img src="https://user-images.githubusercontent.com/22385741/40222981-fd28501e-5ab3-11e8-8558-79447270e118.png" width="100" />
    <img src="https://user-images.githubusercontent.com/28003460/40229157-017bcc24-5ac6-11e8-921a-f424a70724dd.jpg" width="100" />
    <img src="https://user-images.githubusercontent.com/20151096/40263981-a4072682-5b4d-11e8-95aa-292da6ee9228.png" width="100" />
    <img src="https://user-images.githubusercontent.com/652171/40602836-a064ab44-628c-11e8-962c-c5c75455c1c8.jpg" width="100" />
    <img src="https://camo.githubusercontent.com/735d3be145d2632dd010b5fe6e047bc1f5d1b56d/68747470733a2f2f692e6c6f6c692e6e65742f323031382f30362f30342f356231346536616634633537322e6a7067" width="100" />
    <img src="https://user-images.githubusercontent.com/5120505/41412484-ba85a04e-7012-11e8-9833-3ed4762073ea.png" width="100" />
    <img src="https://user-images.githubusercontent.com/2733269/41572435-5a1700d6-73aa-11e8-84fa-6ab95f8276fa.jpg" width="100" title="大智慧行情"/>
    <img src="https://user-images.githubusercontent.com/16707486/41587965-0b984daa-73e3-11e8-8fee-c3a516733262.jpg" width="100" title="小亿买房"/>
    <img src="https://github.com/Hzy0913/hanlibrary/raw/master/xcx.jpg" width="100" title="小程序日历组件"/>
    <img src="https://user-images.githubusercontent.com/18204304/41755130-3edd141c-7608-11e8-9e20-596fd0c30262.jpg" width="100" title="速算练习小程序"/>
    <img src="https://user-images.githubusercontent.com/26002161/41972348-3798cbca-7a44-11e8-82ec-0dfd1c16c946.jpg" width="100" title="逗图Lite （表情包小程序）"/>
    <img src="https://user-images.githubusercontent.com/14872348/42489167-29c4cae2-843c-11e8-8b28-b704907497a3.jpg" width="100" title="童学云校微海报"/>
    <img src="https://user-images.githubusercontent.com/1220971/42721673-3bbd3080-8771-11e8-91dd-73622d9115cd.jpg" width="100" title="内涵段子Lite"/>
    <img src="https://user-images.githubusercontent.com/2350193/42740747-00714598-88de-11e8-817d-3b91ca33003c.jpg" width="100" title="SINA诊股"/>
    <img src="https://user-images.githubusercontent.com/2350193/42740748-00a6e2fc-88de-11e8-8642-2d73709fdb26.jpg" width="100" title="SINA资讯"/>
    <img src="https://user-images.githubusercontent.com/2350193/42740749-00e0808e-88de-11e8-90a0-09f412f54e86.jpg" width="100" title="SINA行情"/>
    <img src="https://user-images.githubusercontent.com/2350193/42801721-1fb5cabe-89d3-11e8-986b-a7e2a8b6f330.jpg" width="100" title="SINA课堂"/>
    <img src="https://user-images.githubusercontent.com/2350193/42871520-21c125e4-8aad-11e8-8b8c-5ff98698069f.jpg" width="100" title="SINA视觉"/>
    <img src="https://user-images.githubusercontent.com/2350193/42740746-00379c4e-88de-11e8-8958-c4c75d90ac36.jpg" width="100" title="我看涨"/>
    <img src="https://user-images.githubusercontent.com/6629280/42795085-e5fae9f8-89b4-11e8-9514-7764428be788.jpg" width="100" title="义乌购优选"/>
    <img src="https://camo.githubusercontent.com/9103a160806c94ed0e5787ee3b197159b3ba9f80/687474703a2f2f792e70686f746f2e71712e636f6d2f696d673f733d6a4456653262784862266c3d792e6a7067" width="100" title="熊猫斗图助手"/>
    <img src="https://user-images.githubusercontent.com/5915245/42990083-437e3072-8c34-11e8-8f6a-69ea58522be8.jpg" width="100" title="SPC运动宝"/>
    <!-- 非标准小程序码 -->
    <img src="https://user-images.githubusercontent.com/1176855/41755510-62b9fc90-760a-11e8-89be-b6ddbee08e63.jpg" width="100" title="暖茶阿妈的占卜小屋"/>
    <img src="https://user-images.githubusercontent.com/22720942/40184432-da33291c-5a22-11e8-966c-c836d1dc8078.png" width="100" />
</div>

[贡献方法](./.github/CONTRIBUTING.md)

[更多项目征集](https://github.com/Meituan-Dianping/mpvue/issues/21)

[分享交流群](https://github.com/Meituan-Dianping/mpvue/issues/14)
