---
title: 探究SegumentFault Markdown编辑器
date: 2016-08-13 21:41:57
tags: [markdown]
---

[SegumentFault](https://segmentfault.com/) 中的Markdown编辑器用户体验不错，比如

1. 高亮提示并显示你当前正在编辑的文本
2. 支持剪贴板图片直接粘贴上传，插入图片十分方便
3. 自动保存

为了探究sf实现的原理，在sf中我提出了下面的问题
【[segmentfault的实时markdown编辑修改位置定位是怎么做到的，而且效率还不低](https://segmentfault.com/q/1010000006166048)】

根据采纳答案提供的信息，我搜索到了这段谷歌开源代码 [google-diff-match-patch](https://code.google.com/p/google-diff-match-patch/)

根据官方的介绍，我们能用这个称为diff-match-path的开源库，进行diff(差异)/match(配对)/patch(补全)， 但我们只需要diff功能即可

在官方给出的[diff demo](https://neil.fraser.name/software/diff_match_patch/svn/trunk/demos/demo_diff.html)中, 通过源码可以很清晰的了解diff的使用

<!--more--> 

大体就是，对比两个字符串，找到两个字符串的不同，包括多余的，相同的，缺失的。

算法思想贪心，参考如下  
[英文原版](http://simplygenius.net/Article/DiffTutorial1)  
[翻译](http://yaowhat.com/2014/07/21/entry-version-diff-1.html)

## 我的工作

既然知道了sf的实时编辑高亮是基于diff的，那我也基于这个工具实现个markdown编辑器吧。 
用了如下第三方库
1. ace.js (一个漂亮的编辑器)
2. marked.js (一个markdown文本转html库)
3. highlight.js (将code文本高亮展示)
4. diff_match_patch.js

效果图
<img src="http://obu9je6ng.bkt.clouddn.com/FtLU4iWnXe9aqXR2cYkJ-55l167u?imageslim" alt="ClipboardImage" width="1438" height="731" />

具有如下功能：
1. markdown编辑，实时预览
2. 高亮提示并显示你当前正在编辑的文本
3. 支持剪贴板图片直接粘贴上传，插入图片十分方便
4. 自动保存

编辑器部分快捷键说明
1. cmd/ctrl + K : 33种编辑器主题供选择
2. cmd/ctrl + B : 编辑器字体放大
3. cmd/ctrl + M : 编辑器字体缩小
4. cmd/ctrl + U : 自动保存功能开关
5. cmd/ctrl + S : 保存

其他交互说明：
1. 编辑器左下角提示保存信息，右下角提示字数
 <img src="http://obu9je6ng.bkt.clouddn.com/FklqPf-mbderllJaGFfBamL_3lle?imageslim" alt="ClipboardImage" width="1435" height="730" />
2. 中部可拖动调节大小
<img src="http://obu9je6ng.bkt.clouddn.com/FroCfvrfeAz_b8oPCyiZrxXGHRmd?imageslim" alt="ClipboardImage" width="1440" height="729" />
3. 预览可直接复制代码
<img src="http://obu9je6ng.bkt.clouddn.com/FtRJ93mBtmKC0_LnGaSyuZfABdXN?imageslim" alt="ClipboardImage" width="1438" height="729" />

## 怎么安装使用？

代码地址  
[markdown-editor](https://github.com/moyuyc/markdown-editor)

```sh
git clone https://github.com/moyuyc/markdown-editor.git
cd markdown-editor
npm install
npm start
open http://localhost:9999
```

别忘了给个Star！

