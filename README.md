## Serial_Communication_CRX简介
Chrome串口通讯插件
## 文件说明
- EW_CHR_SRI_001.crx : 插件，可直接安装。
- CHR/example.html : 测试网页，由于插件需要配置可访问IP，本地测试的话需要用Tomcat部署在本地以后打开
- CHR/serial_port.js : API文件
## 使用说明
- 安装chrome插件：打开chrome,在地址栏输入chrome://extensions/,将.CRX结尾的插件文件拖入并安装。
- 配置接口文件：将接口文件serial_port.js引入网页开发环境 ：<script src='serial_port.js'></script>
## 注意事项
- 插件仅可在有限的网站中被使用，被允许使用的网站如下：
- 以localhost为域名的本地服务器
- 符合域名*://10.3.154.86/*的所有网站
- 若使用时已经安装插件，却始终提醒插件并未被安装，可打开chrome，访问chrome://extensions/，勾选“开发者模式”，找到电子秤读取插件，复制ID栏的值，并将serial_port.js中的变量extensionId修改为该值。
