mespeak.js
==========

受 （meSing.js）https://github.com/usdivad/mesing 启发。

mespeak.js 应该可以从 https://masswerk.at/mespeak/ 找到。

另外，mespeak.js 的源码已打包在 mespeak.zip 中。其中文件被触摸过、修改过，但内容应该等价。

此处 mespeak.js 可能不能在移动端正确发声，因为移动端的自动播放解锁程序被破坏。（但这让我们更容易地使用 Worker，否则有可能卡住。）

mespeak-core.js （而不是源码或压缩包内文件） 被修改过，除f5外其他变种（m1, m2, ...）被删除，并且使 f5 失去音调。（用文本编辑器查找 `pitch 441 441`）