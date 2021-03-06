---
title: 「图像处理」图像的直方图均衡化
date: 2016-06-03 15:56:22
categories: [其他]
tags: [图像处理]
cover: http://img.my.csdn.net/uploads/201112/9/0_1323437843KrRS.gif
---

# 介绍

直方图均衡化：我们把一张图片对应的rgb像素点分成3个(对应rgb)256(0-255)等级，并且将等级绘制为直方图，我们把直方图变得分布均匀，这就是直方图均衡化。
<img src="http://img.my.csdn.net/uploads/201112/9/0_1323437843KrRS.gif" alt="img" width="560" height="420" />
这样的图片往往具有高对比度，我使用js语言实现了该算法。
<!--more-->
# 代码解释

```javascript
    average: function (imgData) {
        // imgData : 图片数据
        var data = imgData.data, w = imgData.width, h = imgData.height;
        var histogramR = [],
            histogramG = [],
            histogramB = [];
        for(var i=0; i<data.length; i+=4){
            // 统计rgb等级数目
            histogramR[data[i]] = histogramR[data[i]]+1 || 1;
            histogramG[data[i+1]] = histogramG[data[i+1]]+1 || 1;
            histogramB[data[i+2]] = histogramB[data[i+2]]+1 || 1;
        }
        //直方图均衡化
        function getRate(grayHis,total,index) {
            var s = 0;
            for(var i=0;i<index;i++){
                var v = grayHis[i]||0;
                s+=(v/total);
            }
            return Math.floor(s*255);
        }
        var total = w*h,
            newHisR = [],
            newHisG = [],
            newHisB = [];
        for(i=0; i<256; i++){//直方图均衡化
            newHisR[i] = getRate(histogramR,total,i);
            newHisG[i] = getRate(histogramG,total,i);
            newHisB[i] = getRate(histogramB,total,i);
        }
        console.log([histogramR,histogramG,histogramB],[newHisR,newHisG,newHisB]);
        for(i=0; i<h; i++){
            for(var j=0; j<w; j++){
                var v = (i*w+j)<<2;
                data[v] = newHisR[data[v]];
                data[v+1]=newHisG[data[v+1]];
                data[v+1]=newHisB[data[v+2]];
            }
        }
        return imgData;
    }
```

查看控制台，左边为原图局部数据，右边为执行算法后的数据，明显后者分布更加平稳。
<img src="/images/aver1.png" alt="img" width="1019" height="949" />

直观的感觉如下
<img src="/images/aver2.png" alt="img" width="647" height="308" />

# 参考资料

- [http://blog.csdn.net/jia20003/article/details/8119563](http://blog.csdn.net/jia20003/article/details/8119563)
- [http://hello-wangfeng.iteye.com/blog/1717150](http://hello-wangfeng.iteye.com/blog/1717150)