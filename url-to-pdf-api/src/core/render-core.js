const puppeteer = require('puppeteer');
const _ = require('lodash');
const config = require('../config');
const logger = require('../util/logger')(__filename);

const FOOTER = `
<style type="text/css">
.footer {
    font-size: 10px;
    position: relative;
    width: 100%;
    text-align: center;
    top: 5px;
}
</style>
<div class="footer">
<span class="pageNumber"></span>/<span class="totalPages"></span>
</div>`;

async function render(_opts = {}) {
    const opts = _.merge({
        cookies: [],
        scrollPage: false,
        emulateScreenMedia: true,
        ignoreHttpsErrors: false,
        html: null,
        viewport: {
            width: 1600,
            height: 1200,
        },
        goto: {
            waitUntil: 'networkidle2',
        },
        output: 'pdf',
        pdf: {
            format: 'A4',
            printBackground: true,
            displayHeaderFooter: false,
            footerTemplate: FOOTER,
            headerTemplate: '<div></div>',
        },
        screenshot: {
            type: 'png',
            fullPage: true,
        },
        failEarly: false,
    }, _opts);

    if (_.get(_opts, 'pdf.width') && _.get(_opts, 'pdf.height')) {
        // pdf.format always overrides width and height, so we must delete it
        // when user explicitly wants to set width and height
        opts.pdf.format = undefined;
    }

    logOpts(opts);

    const browser = await puppeteer.launch({
        ignoreHTTPSErrors: true,
        args: ['--disable-gpu', '--no-sandbox', '--disable-setuid-sandbox'],
        sloMo: config.DEBUG_MODE ? 250 : undefined,
    });
    const page = await browser.newPage();

    //Yale: do not show PAGE LOG
    //page.on('console', (...args) => logger.info('PAGE LOG:', ...args));

    page.on('error', (err) => {
        logger.error(`Error event emitted: ${err}`);
        logger.error(err.stack);
        browser.close();
    });


    this.failedResponses = [];
    page.on('requestfailed', (request) => {
        this.failedResponses.push(request);
        if (request.url === opts.url) {
            this.mainUrlResponse = request;
        }
    });

    page.on('response', (response) => {
        if (response.status >= 400) {
            this.failedResponses.push(response);
        }

        if (response.url === opts.url) {
            this.mainUrlResponse = response;
        }
    });

    let data;
    try {
        //logger.info('Set browser viewport..');
        await page.setViewport(opts.viewport);
        if (opts.emulateScreenMedia) {
            //logger.info('Emulate @media screen..');
            await page.emulateMedia('screen');
        }

        //logger.info('Setting cookies..');
        opts.cookies.map(async(cookie) => {
            await page.setCookie(cookie);
        });

        if (opts.html) {
            logger.info('Set HTML ..');
            // https://github.com/GoogleChrome/puppeteer/issues/728
            await page.goto(`data:text/html;charset=UTF-8,${opts.html}`, opts.goto);
        } else {
            logger.info(`Goto url ${opts.url} ..`);
            await page.goto(opts.url, opts.goto);
        }

        if (_.isNumber(opts.waitFor) || _.isString(opts.waitFor)) {
            logger.info(`Wait for ${opts.waitFor} ..`);
            await page.waitFor(opts.waitFor);
        }

        if (opts.scrollPage) {
            logger.info('Scroll page ..');
            await scrollPage(page);
        }

        if (this.failedResponses.length) {
            logger.warn(`Number of failed requests: ${this.failedResponses.length}`);
            this.failedResponses.forEach((response) => {
                logger.warn(`${response.status} ${response.url}`);
            });

            if (opts.failEarly === 'all') {
                const err = new Error(`${this.failedResponses.length} requests have failed. See server log for more details.`);
                err.status = 412;
                throw err;
            }
        }
        if (opts.failEarly === 'page' && this.mainUrlResponse.status !== 200) {
            const msg = `Request for ${opts.url} did not directly succeed and returned status ${this.mainUrlResponse.status}`;
            const err = new Error(msg);
            err.status = 412;
            throw err;
        }


        if (config.DEBUG_MODE) {
            const msg = `\n\n---------------------------------\n
        Chrome does not support rendering in "headed" mode.
        See this issue: https://github.com/GoogleChrome/puppeteer/issues/576
        \n---------------------------------\n\n
      `;
            throw new Error(msg);
        }

        //add by yale. 2018-9-29

        var wait = await page.evaluate(() => {

            if (window.MathJax != undefined) {
                window.pdfRenderIsMathJaxRenderFinish = 0;
                MathJax.Hub.Register.StartupHook('End', function() {
                    window.pdfRenderIsMathJaxRenderFinish = 1;
                });
                return true;
            }
            return false;

        });

        logger.info(" Wait MathJax " + wait);
        if (wait) {
            try {
                await page.waitForFunction('window.pdfRenderIsMathJaxRenderFinish  == 1', { polling: 100, timeout: 300000 });
            } catch (e) {
                logger.info('window.pdfRenderIsMathJaxRenderFinish timeout :' + e.toString());
            }

            var sleep = async function() {
                return new Promise((res, ref) => {
                    setTimeout(() => {
                        res();
                    }, 300)
                });
            }
            await sleep();
        }



        const header = await page.$$eval('pdf-render-header', headers => {
            if (headers.length > 0) {
                return headers[0].innerHTML.replace(/\s/, "").replace(/\r\n/, "").replace(/[\r|\n]/, "").replace(/ +/, "");
            } else {
                return "";
            }
        });

        if (header.length > 0) {
            opts.pdf.headerTemplate = header;
        }

        const footer = await page.$$eval('pdf-render-footer', footers => {
            if (footers.length > 0) {
                return footers[0].innerHTML.replace(/\s/, "").replace(/\r\n/, "").replace(/[\r|\n]/, "").replace(/ +/, "");
            } else {
                return "";
            }
        });

        if (footer.length > 0) {
            opts.pdf.footerTemplate = footer;
        }

        //end add

        logger.info('Rendering ..');
        if (opts.output === 'pdf') {
            data = await page.pdf(opts.pdf);
        } else {
            // This is done because puppeteer throws an error if fullPage and clip is used at the same
            // time even though clip is just empty object {}
            const screenshotOpts = _.cloneDeep(_.omit(opts.screenshot, ['clip']));
            const clipContainsSomething = _.some(opts.screenshot.clip, val => !_.isUndefined(val));
            if (clipContainsSomething) {
                screenshotOpts.clip = opts.screenshot.clip
            }

            data = await page.screenshot(screenshotOpts);
        }

    } catch (err) {
        logger.error(`Error when rendering page: ${err}`);
        logger.error(err.stack);
        throw err;
    } finally {
        logger.info('Closing browser..');
        if (!config.DEBUG_MODE) {
            await browser.close();
        }
    }

    return data;
}

async function scrollPage(page) {
    // Scroll to page end to trigger lazy loading elements
    await page.evaluate(() => {
        const scrollInterval = 100;
        const scrollStep = Math.floor(window.innerHeight / 2);
        const bottomThreshold = 400;

        function bottomPos() {
            return window.pageYOffset + window.innerHeight;
        }

        return new Promise((resolve, reject) => {
            function scrollDown() {
                window.scrollBy(0, scrollStep);

                if (document.body.scrollHeight - bottomPos() < bottomThreshold) {
                    window.scrollTo(0, 0);
                    setTimeout(resolve, 500);
                    return;
                }

                setTimeout(scrollDown, scrollInterval);
            }

            setTimeout(reject, 30000);
            scrollDown();
        });
    });
}

function logOpts(opts) {
    const supressedOpts = _.cloneDeep(opts);
    if (opts.html) {
        supressedOpts.html = '...';
    }

    //Yale: do not show opts
    //logger.info(`Rendering with opts: ${JSON.stringify(supressedOpts, null, 2)}`);
}

module.exports = {
    render,
};