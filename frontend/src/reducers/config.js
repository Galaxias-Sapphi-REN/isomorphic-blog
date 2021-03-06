/**
 * Created by Moyu on 16/10/20.
 */
var deepAssign = require('deep-assign');

const initState = {
    "title": "Moyu Dev Blog",
    "info": {},
    "leftPic": {
        "smText": "Welcome",
        "lgText": "Here",
        "bgUrl": "https://unsplash.it/2000/1200?image=1074",
        "bgColor": "#000"
    },

    "tagPageSize": 12,
    "pageSize": 6,
    "summaryNumber": 100,

    "iconTarget": "_blank",
    "icons": [
        {
            "key": "envelope-o",
            "url": "mailto:492899414@qq.com"
        }, {
            "key": "github",
            "url": "https://github.com/moyuyc"
        }, {
            "key": "weibo",
            "url": "http://weibo.com/2848472365"
        }
    ],
    "profile": {
        "contentHtml": "<h3>About Me</h3><p>I’m a Javascript enthusiast. I'm a member of Baidu BEFE team and try my best to improve myself. I’m also a nodejs, c/c++  developer, Sometimes.</p><p><img class='emoji' src='http://emojipedia-us.s3.amazonaws.com/cache/08/84/088419f4d97c19762c29008c4a89bbf4.png'/></p>",
        "image": "http://imglf2.ph.126.net/WnoYq02f9EUhK4AhZ5-H8A==/1109292883234569794.jpg"
    },
    "fillCovers": [
        "http://imglf2.nosdn.127.net/img/RGxnTTAxaDhPR052b1FSL1RNRElMN1FSejk4VEgxS2dlNXlNS3R3aXpTcmltSlZ4OFhhVGN3PT0.jpg?imageView&thumbnail=800x0&quality=96&stripmeta=0&type=jpg%7Cwatermark&type=2&text=wqkg4oCcTmFtaeS8mumBh-ingeS7gOS5iOKAnSAvIG5hbWljaG93LmxvZnRlci5jb20=&font=bXN5aA==&gravity=southwest&dissolve=30&fontsize=240&dx=8&dy=10&stripmeta=0",
        "http://imglf0.nosdn.127.net/img/dXh4MVFHRHpHd1drTmllaUVKUHFNVDU5N3ZBdnk1K3dRNkZjc2hSaUxFNCtlV3Mrd2JGVU5BPT0.jpg?imageView&thumbnail=800x0&quality=96&stripmeta=0&type=jpg",
        "http://imglf.nosdn.127.net/img/eE1wemFoSlNUWUVTWFpFaGFBY0xURFE2WThzSytheWMwdmdFY2VXNkVjZz0.jpg?imageView&thumbnail=800x0&quality=96&stripmeta=0&type=jpg%7Cwatermark&type=2&text=wqkgWS4gVGFvIC8gcG0tcGhvdG9ncmFwaHktbG9uZG9uLmxvZnRlci5jb20=&font=bXN5aA==&gravity=southwest&dissolve=30&fontsize=240&dx=8&dy=10&stripmeta=0",
        "http://imglf.nosdn.127.net/img/N1NjSG00NmtBVUdkRHYzeGJWV0RYYWFhQit5RHFpVlNiNnJTT2VOd255VC9Wdzc2VjFzQzhnPT0.jpg?imageView&thumbnail=800x0&quality=96&stripmeta=0&type=jpg",
        "http://imglf1.nosdn.127.net/img/NnpUZWdQKzhGbVBXeVYzNWNYbDZobWIwVFBhcEJUS2dod20ybDhydFdKcmlmMDdRSFRqcmR3PT0.jpg?imageView&thumbnail=800x0&quality=96&stripmeta=0&type=jpg",
        "http://imglf0.nosdn.127.net/img/b0RrSTJURkdmaEpxMjZFT2kyZENVV2doenpnUDJFVWFMdzVReDgrSW42Wk9CbmhsQjVWQkNBPT0.jpg?imageView&thumbnail=800x0&quality=96&stripmeta=0&type=jpg",
        "http://imglf2.nosdn.127.net/img/V1ViNVZzRUhYM3pXNUhxTHZTRUZ3c2xaZFd3WjZaWlB3ZnJtbk14WndYRkJmWXFIWjRSZkp3PT0.jpg?imageView&thumbnail=800x0&quality=96&stripmeta=0&type=jpg"
    ],
    "lazyLoadCover": false,
    "host": "https://moyuyc.github.io",
    "duoshuo": {}
}

export default function (state = initState, action) {
    let newState = {...state}
    switch (action.type) {
        case 'SET_CONFIG':
            return deepAssign(newState, action.config);
        default:
            return newState;
    }
}