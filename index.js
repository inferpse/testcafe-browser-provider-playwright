const playwright = require('playwright');

module.exports = {

  isMultiBrowser: true,

  async getBrowserList() {
    return [
      'chromium',
      'chromium:headless',
      'firefox',
      'firefox:headless',
      'webkit',
      'webkit:headless',
    ];
  },

  async isValidBrowserName(browserName) {
    var browserList = await this.getBrowserList();
    return browserList.indexOf(browserName) > -1;
  },

  async init () {
    this._opened = {};
  },

  async openBrowser(id, pageUrl, browserName) {
    const [browserEngine, runHeadless] = browserName.split(':');
    const browser = await playwright[browserEngine].launch({ headless: !!runHeadless });
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(pageUrl);
    this._opened[id] = { page, browser };
  },

  async resizeWindow(id, width, height) {
    const { page } = this._opened[id];
    await page.setViewportSize({ width, height });
  },

  async takeScreenshot(id, screenshotPath) {
    const { page } = this._opened[id];
    await page.screenshot({ path: screenshotPath });
  },

  async closeBrowser(id) {
    const { browser } = this._opened[id];
    delete this._opened[id];
    await browser.close();
  },

  async dispose () {
    Object.values(this._opened).forEach(async item => await item.browser.close());
  },

};
