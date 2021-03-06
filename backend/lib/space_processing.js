/**
 * Created by moyu on 2017/2/8.
 */
import path from 'path'
import default_config from './default_config'
import cls from 'colors/safe';
import cheerio from 'cheerio';
import moment from 'moment';
import deepAssign from 'deep-assign'
import {existsSync, watch, readFileSync} from 'fs'
import {getFileJson, initMarked, computeDBJson} from 'moka-cli/lib/generate'
import {updateDB, deleteDB} from 'moka-cli/lib/server'
import {testWord} from './utils';
import fs from 'fs';
import JsYml from 'js-yaml';

const PROJECT_PATH = path.join(__dirname, '..', '..');
export const SPACE_PATH = path.join(PROJECT_PATH, 'source');
const SPACE_CONFIG_PATH = path.join(SPACE_PATH, 'config.js');
export const SPACE_ARTICLES_PATH = path.join(SPACE_PATH, '_articles');
const SUMMARY_NUMBER = 100;

export const parseContent = (content) => {
    let head = {}
    content = content.replace(/^\s*?---([\s\S]+?)---/m, function (m, c) {
        head = JsYml.safeLoad(c, {schema: JsYml.FAILSAFE_SCHEMA});
        return '';
    })
    return {
        content: markedPure(content),
        head
    };
}

const clearCache = (modulepath) => delete require.cache[require.resolve(modulepath)]
const getConfig = () => {
    const customConfig = existsSync(SPACE_CONFIG_PATH) ? require(SPACE_CONFIG_PATH) : {};
    const conf = deepAssign({}, default_config, customConfig)
    if (customConfig && customConfig.marked && customConfig.marked.setup) {
        conf.marked.setup = customConfig.marked.setup
    }

    if (typeof conf.skipRegExp === 'string') {
        conf.skipRegExp = eval(conf.skipRegExp);
    }
    return conf;
}
const getMarked = () => initMarked(config.marked, require('marked'))
const computeDBJsonBind = () => {
    return () => {
        const markedFunc = markedPure;
        const skipRegExp = config.skipRegExp;
        const timeFormat = config.timeFormat;
        const articlePath = path.join(PROJECT_PATH, 'source', '_articles');
        let filenames = fs.readdirSync(articlePath);
        if (process.env.NODE_ENV != 'production') {
            filenames = filenames.slice(0, 10);
        }

        const DB = { main: {}, index: { sorted: [], tagMap: {} }};
        const { main, index: {sorted, tagMap} } = DB;

        const entList = filenames.map(name =>  ({json: parseContent(fs.readFileSync(articlePath+'/'+name).toString()), name}) )
            .sort((a, b) => new Date(moment(b.json.head.date, 'YYYY-MM-DD HH:mm:ss').format()) - new Date(moment(a.json.head.date, 'YYYY-MM-DD HH:mm:ss').format()))

        entList.forEach((x, i, all) => {
            if (x.json.head.skip && (x.json.head.skip == true || x.json.head.skip == 'true') ) {
                console.log(`${cls.green('[INFO]')}\t${cls.blue(''+(i+1)+'/'+all.length)}\t${x.name}\t${cls.yellow("[SKIPPED]")}`)
                return;
            }
            console.log(`${cls.green('[INFO]')}\t${cls.blue(''+(i+1)+'/'+all.length)}\t${x.name}`)
            let name = x.name;
            const keyStr = name.replace(/\.[^\.]*$/, '');
            x.json.head.realDate = new Date(x.json.head.date).toISOString();
            x.json.head.date = moment(x.json.head.realDate).format(timeFormat);
            main[keyStr] = x.json;
            sorted.push(keyStr);
            if (x.json.head.tags) {
                if (!Array.isArray(x.json.head.tags)) {
                    x.json.head.tags = [x.json.head.tags]
                }
                x.json.head.tags.forEach(tag => {
                    tagMap[tag] = tagMap[tag] || [];
                    tagMap[tag].push(keyStr);
                })
            }
        })
        return DB;
    }
    // computeDBJson.bind(null, markedPure, PROJECT_PATH, true, {...config, returnRaw: false })
}
export const reset = (clear=true) => {
    clear && clearCache(SPACE_CONFIG_PATH);
    config = getConfig();
    markedPure = getMarked()
    computeDBJsonPure = computeDBJsonBind();
    DataBase = computeDBJsonPure();
}

let config, markedPure, computeDBJsonPure, DataBase;
reset(false);

watch(SPACE_CONFIG_PATH, (type, filename) => {
    reset();
})

watch(SPACE_ARTICLES_PATH, function(eventType, filename) {
    if (!config.skipRegExp.test(filename)) {
        console.log(`filename provided: ${filename} => ${eventType}`);
        try {
            updateDB(DataBase, filename, SPACE_ARTICLES_PATH, markedPure, config.skipRegExp, config.returnRaw, config.timeFormat);
        } catch (ex) {
            console.error(ex.message);
            deleteDB(DataBase, filename) && console.log(`DB deleted: ${filename}`);
        }
    }
})

const summary_cover_cache = (item={}, summaryNumber, forcePure) => {
    item.head = item.head || {}
    if ( ( (!item.summary || item.summary.length != summaryNumber) && !isNaN(summaryNumber)) || (!item.head.cover && !item.noCover) ) {

        if( (!item.summary || item.summary.length != summaryNumber) && !isNaN(summaryNumber)) {
            pureText_cache(item);
            item.summary = item.pureText.substr(0, summaryNumber);
        } else {
            const imgs = cheerio(item.content).find('img');
            if (imgs.length >= 2) {
                item.head.cover = imgs.eq(-1).attr('src')
            } else {
                item.noCover = true
            }
        }

        if (forcePure && !item.pureText) {
            pureText_cache(item);
        }
    }
}

const pureText_cache = (item={}) => {
    if (!item.pureText) {
        const dom = cheerio(item.content)
        item.pureText = dom.text()
        item.pureText = item.pureText.replace(/(\r|\n)/g, ' ');
    }
}

const mapArticlePost = (key, summaryNumber=SUMMARY_NUMBER) => {
    const {main, index: {sorted, tagMap}} = DataBase;
    const item = main[key];
    summary_cover_cache(item, summaryNumber);
    return {
        summary: item.summary,
        key,
        head: item.head
    }
}

const mapTagNamePost = (key) => {
    const {main, index: {sorted, tagMap}} = DataBase;
    const item = main[tagMap[key][0]];
    summary_cover_cache(item, SUMMARY_NUMBER);
    // console.log(item, key, tagMap[key])
    return {
        posts: tagMap[key],
        name: key,
        cover: item.head.cover
    }
}

export const getArticle = key => {
    const {main, index: {sorted, tagMap}} = DataBase;
    let curr = deepAssign({}, main[key])
    const currIndex = sorted.indexOf(key);
    if (currIndex < 0) curr = null;
    const prev = main[sorted[currIndex-1]] ? deepAssign({key: sorted[currIndex-1]}, main[sorted[currIndex-1]]) : null
    const next = main[sorted[currIndex+1]] ? deepAssign({key: sorted[currIndex+1]}, main[sorted[currIndex+1]]) : null
    if (curr) {
        if (!curr.summary) summary_cover_cache(curr, SUMMARY_NUMBER);
        curr.head.mDate = fs.statSync(`${SPACE_ARTICLES_PATH}/${key}.md`).mtime.toISOString();
        // delete curr.summary;
        delete curr.pureText;
    }
    if (prev) {
        delete prev.content;
        delete prev.pureText;
    }
    if (next) {
        delete next.content;
        delete next.pureText;
    }
    return {
        curr, next, prev
    }
}
export const getDataBase = () => DataBase
export const getPosts = (start, size, summaryNumber=SUMMARY_NUMBER) => {
    const {main, index: {sorted, tagMap}} = DataBase;
    start = start - 0; summaryNumber = summaryNumber-0;
    let array, hasmore = false;
    if (size < 0 || !size) {
        array = sorted.slice(start)
    } else {
        size = size-0;
        hasmore = sorted.length > start+size
        array = sorted.slice(start, start+size)
    }
    return {
        posts: array.map(key => mapArticlePost(key, summaryNumber)),
        hasmore
    }
}
export const getTagPosts = (tagName, start, size, summaryNumber=SUMMARY_NUMBER) => {
    const {main, index: {sorted, tagMap}} = DataBase;
    start = start - 0; summaryNumber = summaryNumber-0;
    if (!tagMap[tagName]) {
        return false;
    }
    let array, hasmore = false, tags = tagMap[tagName];
    if (size < 0 || !size) {
        array = tags.slice(start);
    } else {
        size = size-0;
        hasmore = tags.length > start+size
        array = tags.slice(start, start+size)
    }
    return {
        posts: array.map(key => mapArticlePost(key, summaryNumber)),
        hasmore
    }
}

export const getTags = (start, size) => {
    const {main, index: {tagMap}} = DataBase;
    let array, hasmore = false, tagNumber = Object.keys(tagMap).length;
    let tags = Object.keys(tagMap).sort((a, b) => a.localeCompare(b)).slice(start)
    if (size > 0) {
        size = size-0;
        hasmore = tagNumber > start+size
        tags = tags.slice(0, size)
    }
    return {
        tags: tags.map(mapTagNamePost),
        hasmore
    }
}

export const getArchive = () => {
    const {main, index: {sorted, tagMap}} = DataBase;
    return sorted.map(k => ({...mapArticlePost(k)}) )
}

export const searchFilter = (searchWord) => {
    const {main, index: {sorted, tagMap}} = DataBase;
    const words = searchWord && searchWord.split(/[ +]/);
    let items = sorted;
    if(Array.isArray(words)) {
        const priority = {}
        items = items.filter(href => {
            const item = main[href];
            return words.every(w => {
                if(testWord(w, item.head.title)) {
                    priority[href] = 1;
                    return true;
                }
                if(testWord(w, item.pureText)) {
                    priority[href] = 2;
                    return true;
                }
            })
        })
        .sort((a, b) => priority[a] === priority[b] ? (sorted.indexOf(a) - sorted.indexOf(b)) : (priority[a] - priority[b]))
    }
    return items.map(mapArticlePost);
}

