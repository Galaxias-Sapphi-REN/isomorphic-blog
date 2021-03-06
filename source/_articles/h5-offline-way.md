---
title: H5之「离线应用」
date: 2016-09-07 23:20:45
categories:
tags: [cache, indexedDB]
---

「离线存储」：顾名思义，在有线的环境下先缓存数据（包括静态资源，动态资源），从而在离线环境下，依旧可以正常使用应用（单页应用）

<!--more-->

## 静态资源存储(ApplicationCache)

[applicationCache](https://developer.mozilla.org/en-US/docs/Web/API/Window/applicationCache) 是一套h5静态资源缓存方案.
利用该技术可以实现配置静态资源/转发请求，加快应用加载速度，降低服务器负载.

### 基本用法

1. 引入manifest配置文件

```html
<!doctype html>
<html manifest="cache.manifest">
    <head>
        ...
    </head>
    <body>
        ...
    </body>
</html>
```

2. 配置manifest文件

```sh
CACHE MANIFEST
# 修改配置后，附加上下面一段js代码，才能更新缓存
# 2016972143
# 注释：需要缓存的文件，无论在线与否，均从缓存里读取
CACHE:
/dist/0.eda078350ef514670764.bundle.js
/dist/common.bundle.js?v=2016972143
/dist/df9f379beae2559b27044dcfdc0653ab.png?v=2016972143
/dist/home.bundle.js?v=2016972143
/dist/home.css?v=2016972143
uncached.js?v=2016972143

#cached.css

# 注释：不缓存的文件，无论缓存中存在与否，均从新获取
NETWORK:
*
#uncached.js
#uncached.css

# 注释：获取不到资源时的备选路径，如index.html访问失败，则返回404页面
FALLBACK:
#/v1/team/dirlists mock/team_dirlists.json
#/v1/team/app_filelist?isAdd=0&source=team&page=1&pageSize=10&sort=ftime&from=hiwebapp&fid=t293 mock/team_app_filelist.json
#index.html 404.html
```

3. 书写更新缓冲js

```javascript
// 每次打开页面执行该代码段，更新缓存
// !!! 注意：更新缓存后不会立即生效，需要重新加载页面
(function () {
    var cache = window.applicationCache;

    cache.addEventListener('updateready', function(e) {
        if (cache.status == cache.UPDATEREADY) {
            // Browser downloaded a new app cache.
            // if (confirm('A new version of this site is available. Load it?')) {
                cache.swapCache();
                window.location.reload();
            // }
        } else {
            // Manifest didn't changed. Nothing new to server.
        }
    }, false);

    cache.update()

}())
```

4. 服务器配置

    1. 配置manifest文件，响应 `Content-Type: text/cache-manifest` `Cache-Control: max-age=0`
    
    2. 部署线上代码时更新manifest版本号与配置
    
按照以上配置，这样就能实现静态资源缓存
<img src="http://obu9je6ng.bkt.clouddn.com/FvEkGfGFiqRIPaoqrCm-dvTET2Xp?imageslim" alt="ClipboardImage" width="674" height="325" />
如上图，`from cache`的加载时间相比其他网络请求快得多！  
其中的`fetch/ajax`请求不能够通过静态资源存储，因为响应结果是可能会变的.

那么对于异步ajax请求（动态资源）要通过什么方法才能存储起来呢？实现真正意义的离线存储.

## 动态资源存储(WebSQL/IndexedDB)

使用前端数据库可以较为灵活的控制动态资源存储，在这里我使用了indexedDB, 为什么不用WebSQL？
1. 之前做在线聊天应用时，使用过WebSQL存储聊天记录
2. WebSQL已经被弃用
3. WebSQL是传统的关系数据库，indexedDB是主流的NoSQL DB

### 基本用法

1. 创建一个通用的数据库访问接口

```javascript
var indexedDB = window.indexedDB || window.msIndexedDB || window.mozIndexedDB || window.webkitIndexedDB;

// memCache 内存缓冲，避免频繁的读写数据库
var req, db, memCache = {};
if(indexedDB) {
    // version：2
    req = indexedDB.open('ajax_cache', 2);
    // 保证caches成功创建
    req.onsuccess = function (e) {
        db = e.target.result;
        if(!db.objectStoreNames.contains('caches')){
            db.createObjectStore('caches', {keyPath: "id"});
        }
    }
    // 数据库版本改变触发
    req.onupgradeneeded=function(e){
        var db=e.target.result;
        if(!db.objectStoreNames.contains('caches')){
            db.createObjectStore('caches', {keyPath: "id"});
        }
        console.log('DB version changed to ' + db.version);
    };
    req.onerror = function (err) {
        console.error('indexedDB open failed. ', err)
    }
}

export default {
    isSupported: !!indexedDB,
    set: (id, data) => {
        var entity = {
            id: id,
            data: data
        }
        var transaction = db.transaction('caches', 'readwrite');
        var store = transaction.objectStore('caches');
        var req = store.put(entity);
        req.onerror = () => {
            console.error('put data failed. ', entity)
        }
        req.onsuccess = () => {
            memCache[id] = data
            console.info('put data successed. ', entity)
        }
    },
    get: (id) => {
        return new Promise((resolve, reject) => {
            if(memCache[id]) {
                resolve(memCache[id]);
                return;
            }

            var transaction = db.transaction('caches', 'readwrite');
            var store = transaction.objectStore('caches');
            var req = store.get(id);
            req.onerror = () => {
                console.error('get data failed. ', id)
                resolve()
            }
            req.onsuccess = (e) => {
                var rlt = e.target.result;
                console.info('get data successed. ', id, rlt)
                resolve(rlt && rlt.data)
            }
        })
    }
}
```

2. 重写fetch/ajax方法

```javascript
/* reset fetch function for offline be compatible*/
var fetch = require('isomorphic-fetch')
import {parse} from 'url'

var __fetch = fetch;
fetch = function (url) {
    var rlt = parse(url, true);
    function generateJson(json) {
        return {
            json: function () {
                return json
            }
        }
    }
    function generateErrorJson() {
        return generateJson({
            errno: 500, errmsg: '你正处于离线状态',
            result: {
                files: []
            }
        })
    }
    var query = rlt.query;
    // 去掉时间戳与重复的from参数
    delete query.t;
    delete query.from;
    var id = rlt.pathname
    var key = MyUtils.jsonToUrl(query)
    if(MyUtils.isOffline()) { // 离线
        if(!id) {
            return new Promise((resolve, reject) => {
                resolve(generateErrorJson())
            })
        } else {
            if(DB.isSupported) {
                return DB.get(id).then(json => {
                    return (!json || !json[key])
                        ? generateErrorJson()
                        : generateJson(json[key])
                })
            } else {
                return new Promise((resolve, reject) => {
                    resolve(generateErrorJson())
                })
            }
        }
    } else {
        return __fetch.apply(null, [].slice.call(arguments))
            .then(res => res.json())
            .then( (resJson) => {
                if(DB.isSupported) {
                    var tmp = {};
                    tmp[key] = resJson;
                    DB.get(id).then(json => {
                        DB.set(id, Object.assign({}, json, tmp))
                    })
                }
                return generateJson(resJson)
            }
        )
    }

}
```

可以在chrome的web tool中看到indexedDB  
<img src="http://obu9je6ng.bkt.clouddn.com/FmF0kN7KEA15rnXMaMMC-32EeTqg?imageslim" alt="ClipboardImage" width="473" height="431" />
每次请求都缓存下来了

在脱离网络后！依旧可以模拟异步请求！
