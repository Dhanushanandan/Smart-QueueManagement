const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');

async function verifySetup() {
    console.log('\n🔍 SELENIUM SETUP VERIFICATION');
    console.log('═══════════════════════════════════\n');
    
    // Check 1: Verify Node modules exist
    console.log('📦 CHECK 1: Verifying Package Installation');
    try {
        require.resolve('selenium-webdriver');
        console.log('  ✅ selenium-webdriver is installed');
    } catch (e) {
        console.log('  ❌ selenium-webdriver is NOT installed');
        console.log('  Run: npm install --save-dev selenium-webdriver');
        return;
    }
    
    try {
        require.resolve('chromedriver');
        console.log('  ✅ chromedriver is installed');
    } catch (e) {
        console.log('  ❌ chromedriver is NOT installed');
        console.log('  Run: npm install --save-dev chromedriver');
        return;
    }

    // Check 2: Chrome Browser
    console.log('\n🌐 CHECK 2: Chrome Browser Availability');
    let driver;
    try {
        const options = new chrome.Options();
        options.addArguments('--no-sandbox');
        options.addArguments('--disable-dev-shm-usage');
        
        driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .build();
        
        console.log('  ✅ Chrome browser is available');
        
        // Check 3: Basic Navigation
        console.log('\n🧭 CHECK 3: Basic Web Navigation');
        await driver.get('https://www.google.com');
        const title = await driver.getTitle();
        console.log(`  ✅ Successfully navigated to: ${title}`);
        
        // Check 4: Element Finding
        console.log('\n🔍 CHECK 4: Element Finding Capability');
        const searchBox = await driver.findElement(By.name('q'));
        console.log('  ✅ Can find elements by name');
        
        // Check 5: Mobile Emulation
        console.log('\n📱 CHECK 5: Mobile Emulation');
        await driver.quit();
        
        // Create mobile emulation driver - FIXED DEVICE NAME
        const mobileOptions = new chrome.Options();
        mobileOptions.addArguments('--no-sandbox');
        mobileOptions.setMobileEmulation({ 
            deviceName: 'iPhone X'  // ✅ Changed from 'iPhone 12' to 'iPhone X'
        });
        
        const mobileDriver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(mobileOptions)
            .build();
        
        await mobileDriver.get('https://www.google.com');
        console.log('  ✅ Mobile emulation working');
        await mobileDriver.quit();
        
        // Check 6: File System Access
        console.log('\n📁 CHECK 6: Screenshot Capability');
        const screenshotOptions = new chrome.Options();
        screenshotOptions.addArguments('--no-sandbox');
        screenshotOptions.addArguments('--headless=new');
        
        const screenshotDriver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(screenshotOptions)
            .build();
        
        await screenshotDriver.get('https://www.google.com');
        const screenshot = await screenshotDriver.takeScreenshot();
        fs.writeFileSync('tests/verification-screenshot.png', screenshot, 'base64');
        console.log('  ✅ Screenshot saved: tests/verification-screenshot.png');
        await screenshotDriver.quit();
        
        // Final Summary
        console.log('\n═══════════════════════════════════');
        console.log('✅ ALL CHECKS PASSED!');
        console.log('✅ Selenium is properly configured');
        console.log('✅ Ready to test your Expo app');
        console.log('\n📝 NEXT STEPS:');
        console.log('  1. Start Expo web: npx expo start --web');
        console.log('  2. Create actual tests in tests/dashboard-test.js');
        console.log('  3. Run tests with: node tests/dashboard-test.js');
        console.log('═══════════════════════════════════\n');
        
    } catch (error) {
        console.log('\n❌ VERIFICATION FAILED');
        console.log(`  Error: ${error.message}`);
        console.log('\n📝 TROUBLESHOOTING:');
        console.log('  1. Make sure Chrome browser is installed');
        console.log('  2. Try: npm install --save-dev chromedriver@latest');
        console.log('  3. Check antivirus is not blocking chromedriver');
        
        if (error.message.includes('chromedriver')) {
            console.log('\n🔧 CHROMEDRIVER FIX:');
            console.log('  npm uninstall chromedriver');
            console.log('  npm install --save-dev chromedriver@latest');
        }
        return false;
    }
}

verifySetup();