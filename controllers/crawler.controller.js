import Puppeteer from 'puppeteer';
import fs from 'fs';
import { stringify } from 'querystring';

const CrawlerController = {};
const result = new Array();
let baseUrl = [
    'https://muaban.net/ban-dat-da-nang-l15-c31?cp=',
    'https://muaban.net/ban-nha-can-ho-da-nang-l15-c32?cp='
];

const getListArticles = async (url = null, next) => {
    if (url === null) {
        return next(new Error("Have error"));
    }
    try {
        const browser = await Puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(url, {waitUntil: 'load', timeout: 0});
        const articles = await page.evaluate(() => {
            const articlesPerPage = document.getElementsByClassName("mbn-box-list-content").length;
            const ar_title = new Array();
            for (let j = 0; j < articlesPerPage; j++) {
                const title = document.getElementsByClassName("mbn-box-list-content")[j].getElementsByTagName("a")[0].getAttribute("title");
                const link = document.getElementsByClassName("mbn-box-list-content")[0].getElementsByTagName("a")[0].getAttribute("href");
                ar_title.push({title: title, link: link, phone: ''});
            }
            return ar_title
        });
        for (const element of articles) {
            result.push(element);
        }
        await browser.close();
    } catch(err) {
        return next(err);
    }
}

const getPhone = async (next) => {
    try {
        const browser = await Puppeteer.launch();
        const page = await browser.newPage();
        for (const element of result) {
            await page.goto(element.link, {waitUntil: 'load', timeout: 0});
            const phone = await page.evaluate(() => {
                const data = document.getElementsByClassName("contactmobile-desktop")[0].getElementsByTagName("b")[0].innerText;
                return data;
            });
            element.phone = phone;
        }
        await browser.close();
        return next(null);
    } catch(err) {
        return next(err);
    }
}

const getBanDat = async (page = 1, next) => {
    try {
        let url = baseUrl[0] + page;
        await getListArticles(url, next);
        await getPhone(next);
        return next(null);
    } catch(err) {
        return next(err);
    }
}

CrawlerController.getData = async (req, res, next) => {
    try {
        const dataLink = process.cwd() + '/data.json';
        let data = await fs.readFileSync(dataLink);
        let temp = [];
        temp = JSON.parse(data);
        if (temp.length >= 1 && temp[0].phone !== undefined) {
            for (const element of temp) {
                result.push(element);
            }
        }
        await getBanDat(req.params.page, next);
        await fs.writeFileSync(dataLink, JSON.stringify(result));
        return res.json({ "isSuccess": true });
    } catch(err) {
        return next(err);
    }
}

export default CrawlerController;