<p align="center"><a href="http://mpvue.com" target="_blank" rel="noopener noreferrer"><img width="100" src="http://mpvue.com/assets/logo.png" alt="mpvue logo"></a></p>
<p align="center">
   <a href="https://www.npmjs.com/package/mpvue"><img src="https://img.shields.io/npm/v/mpvue.svg?style=flat" alt="npm"></a>
   <a href="https://www.npmjs.com/package/mpvue"><img src="https://img.shields.io/npm/dm/mpvue.svg?style=flat" alt="npm"></a>
 </p>

# mpvue
> Vue.js 小程序版, fork 自 [vuejs/vue@2.4.1](https://github.com/vuejs/vue)，保留了 vue runtime 能力，添加了小程序平台的支持。


`mpvue` 是一个使用 [Vue.js](https://vuejs.org) 开发小程序的前端框架，目前支持 `微信小程序`、`百度只能小程序`，`头条小程序` 和 `支付宝小程序`。 框架基于 `Vue.js`，修改了的运行时框架 runtime 和代码编译器 compiler 实现，使其可运行在小程序环境中，从而为小程序开发引入了 `Vue.js` 开发体验。

## mpvue 2.0

mpvue 2.0 开始正式支持 **百度智能小程序**、**头条小程序** 和 **支付宝小程序**，使用 `mpvue-quickstart` 项目模板新创建的项目，将默认升级到 2.0。老项目可继续使用原有版本。详情请参见 [**mpvue 2.0 升级指南**](https://github.com/Meituan-Dianping/mpvue/releases/tag/2.0.0)

<div style="color:red;font-weight:bold;">
新版本的问题或建议，有请各位关注者及时反馈，mpvue 2.0 祝大家节日快乐~ 2019.02.14
</div>

[mpvue 文档](http://mpvue.com)

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
    <img src="https://user-images.githubusercontent.com/5443058/42999490-9022a4dc-8c50-11e8-9e90-96bbc1bbbc8e.jpg" width="100" title="牛津阅读树点读版"/>
    <img src="https://camo.githubusercontent.com/c47426c0e0ad542f6399de4129682fed1f2b475c/68747470733a2f2f73312e617831782e636f6d2f323031382f30372f32312f50386f7368442e6a7067" width="100" title="花笙美妆"/>
    <img src="https://camo.githubusercontent.com/64ce4dd31ab2edc9f3a2f6f7dc943bd1dfaefa21/687474703a2f2f7063397034717362322e626b742e636c6f7564646e2e636f6d2f77782d6769746875622e6a7067" width="100" title="gitHub01"/>
    <img src="https://user-images.githubusercontent.com/15187909/43053228-29e08738-8e5e-11e8-8f91-377a28dcf771.jpg" width="100" title="极客教程"/>
    <img src="https://user-images.githubusercontent.com/7599915/43298816-425635f4-918a-11e8-9f0f-380dca9401dd.jpg" width="100" title="gitee工具"/>
    <img src="https://camo.githubusercontent.com/25a919d9549feb0b713ad86472c09e9c3f46aa83/687474703a2f2f696d616765732e70616e64616f6d656e672e636f6d2f32346665333339666662333936636662656238633136306435336261313539342e6a7067" width="100" title="销售神器"/>
    <img src="https://user-images.githubusercontent.com/17445000/43376242-3715ce48-93ec-11e8-90be-a59fe9788a98.jpg" width="100" title="360旗下-南瓜屋"/>
    <img src="https://user-images.githubusercontent.com/25244009/43445236-76c224be-94d8-11e8-9901-1ff399db7b70.jpg" width="100" title="地图小程序"/>
    <img src="https://user-images.githubusercontent.com/1448308/43559485-cbd41390-9640-11e8-848e-69b662be8da7.jpg" width="100" title="微工具书"/>
    <img src="https://user-images.githubusercontent.com/19870533/43562575-eed086f8-964f-11e8-8c39-20e604fd84fa.jpg" width="100" title="选课精灵"/>
    <img src="https://user-images.githubusercontent.com/13146991/43621850-f1df6730-970b-11e8-9d07-4db4f2c4c52f.png" width="100" title="京东云技术新知"/>
    <img src="https://user-images.githubusercontent.com/1627874/43621865-0df3a314-970c-11e8-8f1b-30cfdf6a9a47.jpg" width="100" title="运个货-互联网内贸集装箱海运物流平台"/>
    <img src="https://user-images.githubusercontent.com/4090027/44255554-0e352680-a239-11e8-96fe-8316a1fb22f8.jpg" width="100" title="小桔有车违章查询"/>
    <img src="https://user-images.githubusercontent.com/26808622/44326326-e1c61800-a48d-11e8-958f-d50ef7f45d62.png" width="100" title="餐饮，商超小程序"/>
    <img src="https://camo.githubusercontent.com/6f1b397785cd88ec260509e2768f10604b5711b9/687474703a2f2f7777772e77636c696d622e736974652f63646e2f7863782e6a7065673f763d31" width="100" title="妹子趣图"/>
    <img src="https://user-images.githubusercontent.com/12904977/44563258-02dd8000-a790-11e8-961d-fb50c4f27ba1.png" width="100" title="记工无忧"/>
    <img src="https://user-images.githubusercontent.com/22048131/44619692-5994a800-a8bd-11e8-98f0-b2337ef49b35.png" width="100" title="北美省钱快报App"/>
    <img src="https://user-images.githubusercontent.com/3882370/45558053-8bbc7880-b871-11e8-9b03-901f27f4e7d3.png" width="100" title="抽奖工具" />
    <img src="https://user-images.githubusercontent.com/16730031/45584645-e99c9f00-b909-11e8-853b-1f19b9cd76fd.jpg" width="100" title="盯事清单" />
    <img src="https://user-images.githubusercontent.com/18476675/45791542-adc45980-bcbc-11e8-803f-9c45c55c784b.png" width="100" title="微目标小程序" />
    <img src="https://user-images.githubusercontent.com/23513387/46054832-93d2bd00-c17b-11e8-9197-d5aa0c764ddb.jpg" width="100" title="微厅小程序" />
    <img src="https://i.loli.net/2018/10/11/5bbef01a68773.jpg" width="100" title="逗猫神器" />
    <img src="https://user-images.githubusercontent.com/16631463/46907861-eb2ea680-cf4b-11e8-92a2-0a8917417325.jpg" width="100" title="前端最火框架排行榜" />
    <img src="https://user-images.githubusercontent.com/16631463/46907868-187b5480-cf4c-11e8-8302-dcc722430b6d.jpg" width="100" title="猜谜语" />
    <img src="https://user-images.githubusercontent.com/38179236/47001679-9ebab500-d15d-11e8-99df-27b61e53c652.jpg" width="100" title="旅游大巴" />
    <img src="https://user-images.githubusercontent.com/20639676/47198055-a9af5880-d39c-11e8-8b1c-fcd4ba0ea57b.png" width="100" title="云鲜社区生鲜购" />
    <img src="https://user-images.githubusercontent.com/8544120/47279097-4114e580-d601-11e8-8a95-2d7dcc165d6b.jpg" width="100" title="闲停扯乎" />
    <img src="https://user-images.githubusercontent.com/22420/47401062-5bba9c00-d772-11e8-9717-d7c468d9b939.jpg" width="100" title="狗脸识别" />
    <img src="https://user-images.githubusercontent.com/31442077/47412617-c97cbd00-d79e-11e8-9002-7a0614d6ad1b.jpg" width="100" title="思政云" />
    <img src="https://user-images.githubusercontent.com/17083284/47612128-0b23a580-dac8-11e8-9582-70db2889e698.jpg" width="100" title="澳洲U站" />
    <img src="https://user-images.githubusercontent.com/16513510/47947846-8faa7400-df5f-11e8-8ee8-63c1a9fb6eac.jpg" width="100" title="莴聚" />
    <img src="https://user-images.githubusercontent.com/22372095/48299143-b6d6e780-e503-11e8-963a-4789e54f57d7.jpg" width="100" title="百世集团供应链TNET" />
    <img src="https://user-images.githubusercontent.com/15187909/48299710-c5290180-e50b-11e8-8cb5-339be1531608.jpg" width="100" />
    <img src="https://user-images.githubusercontent.com/1715463/49988179-d0f76000-ffb0-11e8-8a69-cd57d6e54890.jpeg" width="100" title="漂流小情书"/>
    <img src="https://user-images.githubusercontent.com/1715568/48662132-6b4eab80-eab8-11e8-95de-c1e21786b2d9.jpg" width="100" title="绿芽找房"/>
    <img src="http://jiankang.juwu168.com/blog/wp-content/uploads/2018/10/gh_36a0a852bf6f_258-1.jpg" width="100" title="慕课网" />
    <img src="https://user-images.githubusercontent.com/14272879/49424002-38085e00-f7d4-11e8-8242-13ddda18cec3.jpg" width="100" title="一人宴" />
    <img src="https://upload-images.jianshu.io/upload_images/3356839-59bfd93deb76afca.jpg" width="100" title="惠动平台">
    <!-- 非标准小程序码 -->
    <img src="https://user-images.githubusercontent.com/1176855/41755510-62b9fc90-760a-11e8-89be-b6ddbee08e63.jpg" width="100" title="暖茶阿妈的占卜小屋"/>
    <img src="https://user-images.githubusercontent.com/22720942/40184432-da33291c-5a22-11e8-966c-c836d1dc8078.png" width="100" />
    <img src="https://camo.githubusercontent.com/25b2636179cd939461975ada9f996c77d15c4d2a/68747470733a2f2f7778342e73696e61696d672e636e2f6d773639302f373032643563616167793166746e323975797a38666a323037363038367439612e6a7067" width="100" title="扫域名的小程序，米农帮"/>
</div>

[贡献方法](./.github/CONTRIBUTING.md)

[更多项目征集](https://github.com/Meituan-Dianping/mpvue/issues/21)

[分享交流群](https://github.com/Meituan-Dianping/mpvue/issues/14)
