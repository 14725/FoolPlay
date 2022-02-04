
# 傻瓜弹曲

使用公元前 1980 年的人工智障技术制造的一个输入简谱并且能够带伴奏与歌词播放的APP。

[傻瓜弹曲程序入口>>>](https://asdfqw.gitee.io/foolplay/edit.htm)

警告：有大量浏览器不能正确保存文件。如果您用手机编辑乐谱，请先测试保存功能能否正常工作，以防数据丢失。

[《心愿》](https://asdfqw.gitee.io/foolplay/edit.htm#music=xy) | [《踏浪》](https://asdfqw.gitee.io/foolplay/edit.htm#music=tl) | [《爱拼才会赢》](https://asdfqw.gitee.io/foolplay/edit.htm#music=apchy) | [《劳动最光荣》](https://asdfqw.gitee.io/foolplay/edit.htm#music=ldzgr) | [《同桌的你》](https://asdfqw.gitee.io/foolplay/edit.htm#music=tzdn)

[留言本](http://users.smartgb.com/g/g.php?a=s&i=g18-84768-1a) | [本程序的源代码](http://gitee.com/asdfqw/FoolPlay)

## 不联网运行

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

至于 Windows 用户，（待续）

## 功能

（如上所述）

*   键盘简谱输入；
*   简易播放，包括人声合成以及伴奏，但没有暂停（`|X X X X|X X X X|...|` ）；
*   可以按照JSON格式保存到电脑上或者读取由本程序保存功能输出的文件。

至于菜单上所显示的剩下几乎所有功能都没有实现（不要奇怪为什么点击某选项没有反应）。编辑功能有些Bug，不要太介意……

## 浏览器

*   最新的桌面浏览器（对于Chr***系列，从55开始）应该都能工作；
*   Internet Explorer 11（以及部分手机浏览器）之类近代浏览器（无 Web Audio API 支持）可以编辑歌谱，但不能出声音。不对其中的错误提示框负责。
*   介意ES6语法的浏览器不能工作。当然，如果（如果我不懒，）把程序翻译到ES5并打上Polyfill，可以在更多浏览器上、如Chrome 49（和WinXP!）上工作。
*   有严重的性能问题，但暂时不会得到解决。

## 计划

本人很懒，无心更新，下面的计划压根不会执行。在放寒暑假的时候可能会动一动。

*   加入对反复记号以及弱起的支持；
*   简化以及去除各 JS 文件内的多余代码；
*   美化歌谱及编辑器
*   解决浏览器打印不分页问题
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

*   怒独僧简谱字体 （[http://www.nuduseng.com/jianpu/](http://www.nuduseng.com/jianpu/)）
*   tiny-pinyin （[https://github.com/creeperyang/pinyin/](https://github.com/creeperyang/pinyin/)）
*   yux-storage （[https://github.com/yued-fe/yux-storage](https://github.com/yued-fe/yux-storage)）
*   瑾年 （[https://dsailab.com/voice/info/JIN%20NIAN/](https://dsailab.com/voice/info/JIN%20NIAN/)）