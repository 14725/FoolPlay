
# 傻瓜弹曲

使用公元前 1980 年的人工智障技术制造的一个输入简谱并且能够带伴奏与歌词播放的APP。

这个项目的[主页](https://asdfqw.gitee.io/foolplay)（本仓库的 `index.html`）
对大众来说是更好的自述文件，所以我要说些别的（省得我同时维护两份文档）。

## 不联网运行

不需要 Node.js 等神奇东西。 `build.htm` 不是对编译的解释，而是运行于浏览器的单文件打包器。

您可以克隆这个项目或者“下载zip”得到本程序的一份副本。您需要一个本地服务器来完整地运行本程序。

据说如果您装了 Python （大多数的 Linux 发行版），这件事会很容易（然后访问 http://localhost:8000/）。

Python 3
```
python -m http.server
```
Python 2
```
python -m SimpleHTTPServer
```

至于 Windows 用户，大家八仙过海吧。因为诸如 HTTPSASM 之类都比 Python 的自带服务器好，因为它开包即用，无需安装。

## 文件（部分）...
```
edit.htm ------------ 本程序主程序
FAIL.htm ------------ 无 blob 下载功能浏览器的测试错误页面
faq.html ------------ 常见问题解答
favicon.ico --------- 地址栏图标
index.css ----------- 文档类页面的样式表（water.css）
index.html ---------- 主页/关于页
jpfont-nds.otf ------ （未引用，内嵌于style.css）怒独僧简谱字体
LICENSE ------------- 许可证以及版权声明
manifest.json ------- PWA 配置文件
README.md ----------- 我！
SerWork.js ---------- Service Worker 离线脚本
style.css ----------- edit.htm 的样式表
+data --------------- 声音数据文件夹
+-- inf.d ----------- 音源标注
+-- pianosap.mp3 ---- 钢琴采样
+-- voice.jpg ------- 音源数据（MP3或任意压缩格式）
+-- voice.png ------- 音源数据（未压缩 16bit/44100Hz PCM）
images/1024x1024.png  PWA 头像
+img ---------------- 歌谱记号图片(见文件名知意)
+-- coda.svg
+-- segno.svg
+js ----------------- 程序主要逻辑
+-- mespeak --------- mespeak
+---+-- en.json ----- MeSpeak 英文字典
+---+-- mespeak-core.js （被修改过）
+---+-- mespeak.js
+---+-- mespeak.zip - 源码压缩
+---+-- README.md --- 改了什么？
+---+-- transplant.js 用MeSpeak合成音源的胶水
+-- Chord.js -------- 和弦生成器
+-- eruda.js -------- 网页控制台
+-- Music.js -------- 主逻辑（包含PopuoWindow, Util, Music, UI）
+-- Player.js ------- 播放器（人声和钢琴）
+-- TinyPY.js ------- 迷你拼音生成器
+-- touchShim.js ---- 触摸屏初步支持
+-- yux-storage.js -- IndexedDB 封装
+music -------------- 示例文件
+-- （略）
+pack --------------- 单文件打包器
+-- build.htm
+-- readme.md
+-- terser.js ------- JS 压缩

```

## 浏览器

*   最新的桌面浏览器（对于Chr***系列，从55开始）应该都能工作；
*   介意ES6语法的浏览器不能工作。当然，如果（如果我不懒，）把程序翻译到ES5并打上Polyfill，可以在更多浏览器上、如Chrome 49（和WinXP!）上工作。
*   有严重的性能问题，但暂时不会得到解决。

## 计划

本人很懒，无心更新，下面的计划压根不会执行。在放寒暑假的时候可能会动一动。

*   加入对反复记号以及弱起的支持；
*   简化以及去除各 JS 文件内的多余代码；
*   美化歌谱及编辑器
*   解决浏览器打印不分页问题
*   AI调教 （大佬救救我）
*   ……

## 不多的帮助

*   `数字` ->简谱音符表示
*   `+（或者!）` ->普通音高或低八度
*   `*` ->普通音高或高八度
*   `-` ->延长音符（加时线）
*   `_` （`Shift + -` ） ->缩短音符（减时线）
*   `^` ->在光标前面的音符的前面画一条延音线/圆滑线（两个音的圆滑线？）
*   `` ` `` \->延长前一个音符
*   `Ctrl + ↑|↓` ->切换编辑歌谱以及歌词（不支持多段，因为无法播放）。
    *   用鼠标点击音符下方的空白区域也可以

## 鸣谢

你还是看 index.htm 吧，我写不动了。