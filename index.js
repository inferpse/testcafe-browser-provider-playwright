const playwright = require('playwright');

module.exports = {

  isMultiBrowser: true,

  baseBrowsers: ['chromium', 'firefox', 'webkit'],
  mobileBrowsers: ['chromium', 'webkit'],

  async getBrowserList() {
    const browsers = [];

    this.baseBrowsers.forEach(browser => {
      browsers.push(browser);
      browsers.push(`${browser}:headless`);
    });

    this.mobileBrowsers.forEach(browser => {
      Object.keys(playwright.devices).forEach(device => {
        browsers.push(`${browser}:emulation:device=${device}`);
        browsers.push(`${browser}:headless:emulation:device=${device}`);
      });
    });

    return browsers;
  },

  async isValidBrowserName(browserName) {
    var browserList = await this.getBrowserList();
    return browserList.indexOf(browserName) > -1;
  },

  async init () {
    this._opened = {};
  },

  async openBrowser(id, pageUrl, browserName) {
    const [browserEngine] = browserName.split(':');
    const runHeadless = browserName.includes('headless');
    const emulationDeviceMatch = browserName.match("^.+:emulation:device=(?<device>.+)$");
    let emulationDevice = {}
    if (emulationDeviceMatch && emulationDeviceMatch.groups && emulationDeviceMatch.groups.device) {
      emulationDevice = playwright.devices[emulationDeviceMatch.groups.device]
    }
    const browser = await playwright[browserEngine].launch({ headless: !!runHeadless });
    const context = await browser.newContext({...emulationDevice});
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
    await page.screenshot({ path: screenshotPath, fullPage: true });
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
