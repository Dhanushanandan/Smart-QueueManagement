const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function createDriver() {
  const options = new chrome.Options();
  
  // Add arguments for testing
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  options.addArguments('--window-size=375,812'); // Mobile viewport size
  
  // Enable mobile emulation
  options.setMobileEmulation({ deviceName: 'iPhone X' });
  
  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();
    
  return driver;
}

module.exports = { createDriver, By, until };