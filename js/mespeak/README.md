mespeak.js
==========

受 （meSing.js）https://github.com/usdivad/mesing 启发。

mespeak.js 应该可以从 https://masswerk.at/mespeak/ 找到。

另外，mespeak.js 的源码已打包在 mespeak.zip 中。

注意：文件被触摸过、修改过，但内容应该等价。

压缩包中的 mespeak.js （以及本文件夹中的）有注释：
```javascript
/* Modified to remove Mobile Worker Lock */
```
然而 它仍然不会在手机上加载 Worker. 

mespeak-core.js （而不是源码或压缩包内文件） 被修改过，使 f5 失去音调。（用16进制器定位到 `1718A0A9` .或用文本编辑器查找 `pitch 228 228`）