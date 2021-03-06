---
title: git捣鼓记之「Pull Request」
date: 2016-04-28 15:48:32
tags: [git]
categories: [Studying]
---

# 前言
　　昨天，又捣鼓了一会儿git，因为想把我关于[NexT](https://github.com/iissnan/hexo-theme-next)主题的修改提交到原作者github上，以方便更多人使用。
<!--more-->
# 修改之处
　　原版的主题中，有三种Schema（Muse/Mist/Pisces），在主题的配置文件`_config.yml`中，有sidebar:position属性，但是却反人类的**仅仅**只支持Pisces
<img src="http://obu9je6ng.bkt.clouddn.com/FmcBlZwsZRfTu76I0UBIKmZUTBqB?imageslim" alt="ClipboardImage" width="780" height="181" />

　　Pisces设置sidebar:position为left后，效果如下(图片来自原作者博客)：
<img src="http://obu9je6ng.bkt.clouddn.com/FlfSqCEE9xdbhoX8ge8heScTRS1C?imageslim" alt="ClipboardImage" width="1021" height="888" />

　　于是乎，我便「一言不合，开始动手」，研究起其他两个主题的sidebar源码起来。
有了原作者代码的参考，照葫芦画瓢，不一会儿也修改好了。
为了让更多人知道我闲的蛋疼的举动，于是我便打算 Pull Request.

# Pull Request！
## Fork
　　首先，找到你需要修改的项目，Fork It！
<img src="http://obu9je6ng.bkt.clouddn.com/Fo7IJxphHt6Kx1pBFlJ90ShA32pX?imageslim" alt="ClipboardImage" width="498" height="141" />

## Clone
　　Fork完成之后，找到你Fork的项目。

	git clone {ssh or https}
	cd {name} # 进入项目目录
## New Branch & Fix Bug
　　Clone之后，切换分支（branch）

	git checkout -b fix-bug
　　然后在本地尽情地修改吧，修改完成后

	git add . && git commit -m "fix-bug"
	git push origin fix-bug
## Pull Request
　　提交你的修改至github后，切换branch至fix-bug
<img src="http://obu9je6ng.bkt.clouddn.com/FiW1kAXel6WqirDiUDWlIMiLGIBZ?imageslim" alt="ClipboardImage" width="1048" height="408" />
点击**Compare & pull request**按钮，然后写下你修改内容的说明就OK了
## Wait To Be Merged
　　目前还没有同意Merge. = =
<img src="http://obu9je6ng.bkt.clouddn.com/FthPzIG1sKMsA9YPt0fAuESHl73s?imageslim" alt="ClipboardImage" width="1066" height="389" />

参考资料
[http://www.zhihu.com/question/21682976](http://www.zhihu.com/question/21682976)