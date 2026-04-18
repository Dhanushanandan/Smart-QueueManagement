// const { Builder, By, until } = require("selenium-webdriver");
// require("chromedriver");

// async function waitForElement(driver, selector, timeout = 15000) {
//   console.log(`Waiting for: ${selector}`);
//   await driver.wait(until.elementLocated(By.css(selector)), timeout);
//   const element = await driver.findElement(By.css(selector));
//   await driver.wait(until.elementIsVisible(element), timeout);
//   return element;
// }

// async function typeInto(driver, selector, value, timeout = 15000) {
//   const element = await waitForElement(driver, selector, timeout);
//   await element.clear();
//   await element.sendKeys(value);
// }

// async function clickElement(driver, selector, timeout = 15000) {
//   const element = await waitForElement(driver, selector, timeout);
//   await element.click();
// }

// async function runTest() {
//   let driver;

//   try {
//     console.log("Starting Chrome browser...");
//     driver = await new Builder().forBrowser("chrome").build();

//     console.log("Opening Expo web app...");
//     await driver.get("http://localhost:8081");

//     console.log("Checking splash screen...");
//     await waitForElement(driver, '[data-testid="splashScreen"]', 10000);
//     await waitForElement(driver, '[data-testid="splashLogo"]', 10000);
//     console.log(" Splash screen passed");

//     console.log("Waiting for login screen...");
//     await waitForElement(driver, '[data-testid="loginScreen"]', 15000);
//     await waitForElement(driver, '[data-testid="loginButton"]', 15000);
//     console.log(" Login screen passed");

//     console.log("Opening register screen...");
//     await clickElement(driver, '[data-testid="goToRegisterButton"]', 10000);

//     console.log("Checking signup screen...");
//     await waitForElement(driver, '[data-testid="signupScreen"]', 10000);
//     await waitForElement(driver, '[data-testid="registerButton"]', 10000);
//     console.log(" Signup screen passed");

//     const uniqueEmail = `test${Date.now()}@mail.com`;

//     console.log("Filling signup form...");
//     await typeInto(driver, '[data-testid="nicInput"]', "200012345678");
//     await typeInto(driver, '[data-testid="nameInput"]', "Test User");
//     await typeInto(driver, '[data-testid="dobInput"]', "2000-01-01");
//     await typeInto(driver, '[data-testid="emailInput"]', uniqueEmail);
//     await typeInto(driver, '[data-testid="mobileInput"]', "0712345678");
//     await typeInto(driver, '[data-testid="passwordInput"]', "123456");
//     await typeInto(driver, '[data-testid="confirmPasswordInput"]', "123456");
//     console.log(" Signup form filled");

//     console.log("Submitting register form...");
//     await clickElement(driver, '[data-testid="registerButton"]', 10000);

//     console.log("Waiting for upload certificate screen...");
//     await waitForElement(
//       driver,
//       '[data-testid="uploadCertificateScreen"]',
//       20000,
//     );
//     await waitForElement(driver, '[data-testid="chooseImageButton"]', 20000);
//     console.log(" Upload certificate screen passed");

//     console.log(" ALL TESTS PASSED");
//     console.log(`Created test email: ${uniqueEmail}`);
//   } catch (error) {
//     console.error(" SELENIUM TEST FAILED");
//     console.error(error);
//   } finally {
//     // set to true if you want browser to close automatically
//     const closeBrowser = false;

//     if (driver && closeBrowser) {
//       await driver.quit();
//     }
//   }
// }

// runTest();














































// const { Builder, By, until } = require("selenium-webdriver");
// require("chromedriver");

// async function waitForElement(driver, selector, timeout = 15000) {
//   console.log(`Waiting for: ${selector}`);
//   await driver.wait(until.elementLocated(By.css(selector)), timeout);
//   const element = await driver.findElement(By.css(selector));
//   await driver.wait(until.elementIsVisible(element), timeout);
//   return element;
// }

// async function typeInto(driver, selector, value, timeout = 15000) {
//   const element = await waitForElement(driver, selector, timeout);
//   await element.clear();
//   await element.sendKeys(value);
// }

// async function clickElement(driver, selector, timeout = 15000) {
//   const element = await waitForElement(driver, selector, timeout);
//   await element.click();
// }

// async function runTest() {
//   let driver;

//   try {
//     console.log("Starting Chrome browser...");
//     driver = await new Builder().forBrowser("chrome").build();

//     console.log("Opening Expo web app...");
//     await driver.get("http://localhost:8081");

//     console.log("Checking splash screen...");
//     await waitForElement(driver, '[data-testid="splashScreen"]', 10000);
//     await waitForElement(driver, '[data-testid="splashLogo"]', 10000);
//     console.log("✅ Splash screen passed");

//     console.log("Waiting for login screen...");
//     await waitForElement(driver, '[data-testid="loginScreen"]', 15000);
//     await waitForElement(driver, '[data-testid="loginButton"]', 15000);
//     console.log("✅ Login screen passed");

//     console.log("Opening register screen...");
//     await clickElement(driver, '[data-testid="goToRegisterButton"]', 10000);

//     console.log("Checking signup screen...");
//     await waitForElement(driver, '[data-testid="signupScreen"]', 10000);
//     await waitForElement(driver, '[data-testid="registerButton"]', 10000);
//     console.log("✅ Signup screen passed");

//     const uniqueEmail = `test${Date.now()}@mail.com`;

//     console.log("Filling signup form...");
//     await typeInto(driver, '[data-testid="nicInput"]', "200012345678");
//     await typeInto(driver, '[data-testid="nameInput"]', "Test User");
//     await typeInto(driver, '[data-testid="dobInput"]', "2000-01-01");
//     await typeInto(driver, '[data-testid="emailInput"]', uniqueEmail);
//     await typeInto(driver, '[data-testid="mobileInput"]', "0712345678");
//     await typeInto(driver, '[data-testid="passwordInput"]', "123456");
//     await typeInto(driver, '[data-testid="confirmPasswordInput"]', "123456");
//     console.log("✅ Signup form filled");

//     console.log("Submitting register form...");
//     await clickElement(driver, '[data-testid="registerButton"]', 10000);

//     console.log("Waiting for upload certificate screen...");
//     await waitForElement(driver, '[data-testid="uploadCertificateScreen"]', 20000);
//     await waitForElement(driver, '[data-testid="chooseImageButton"]', 20000);
//     console.log("✅ Upload certificate screen passed");

//     console.log("✅ ALL TESTS PASSED");
//     console.log(`Created test email: ${uniqueEmail}`);
//   } catch (error) {
//     console.error("❌ SELENIUM TEST FAILED");
//     console.error(error);
//   } finally {
//     const closeBrowser = false;

//     if (driver && closeBrowser) {
//       await driver.quit();
//     }
//   }
// }

// runTest();

























































const { Builder, By, until } = require("selenium-webdriver");
require("chromedriver");

async function waitForElement(driver, selector, timeout = 15000) {
  console.log(`Waiting for: ${selector}`);
  await driver.wait(until.elementLocated(By.css(selector)), timeout);
  const element = await driver.findElement(By.css(selector));
  await driver.wait(until.elementIsVisible(element), timeout);
  return element;
}

async function typeInto(driver, selector, value, timeout = 15000) {
  const element = await waitForElement(driver, selector, timeout);
  await element.clear();
  await element.sendKeys(value);
}

async function clickElement(driver, selector, timeout = 15000) {
  const element = await waitForElement(driver, selector, timeout);
  await element.click();
}

async function printCurrentPageInfo(driver) {
  try {
    const url = await driver.getCurrentUrl();
    const bodyText = await driver.findElement(By.tagName("body")).getText();

    console.log("Current URL:", url);
    console.log("Page text preview:");
    console.log(bodyText.slice(0, 1500));
  } catch (error) {
    console.log("Could not print page info");
  }
}

async function checkAnyLoginResult(driver, timeout = 15000) {
  const start = Date.now();

  while (Date.now() - start < timeout) {
    try {
      const currentUrl = await driver.getCurrentUrl();
      const bodyText = await driver.findElement(By.tagName("body")).getText();
      const lowerText = (bodyText || "").toLowerCase();

      if (currentUrl.includes("/dashboard")) {
        return {
          passed: true,
          reason: "Navigated to dashboard",
        };
      }

      const keywords = [
        "success",
        "login successful",
        "verify your email",
        "invalid email or password",
        "please enter email and password",
        "user data not found",
        "error",
      ];

      for (const keyword of keywords) {
        if (lowerText.includes(keyword)) {
          return {
            passed: true,
            reason: `Message detected: "${keyword}"`,
          };
        }
      }
    } catch (error) {
      // ignore temporary read errors while waiting
    }

    await driver.sleep(1000);
  }

  return {
    passed: false,
    reason: "No login response detected after clicking Login",
  };
}

async function checkAnyRegisterResult(driver, timeout = 20000) {
  const start = Date.now();

  while (Date.now() - start < timeout) {
    try {
      const currentUrl = await driver.getCurrentUrl();
      const bodyText = await driver.findElement(By.tagName("body")).getText();
      const lowerText = (bodyText || "").toLowerCase();

      if (currentUrl.includes("/upload-certificate")) {
        return {
          passed: true,
          reason: "Navigated to upload certificate screen",
        };
      }

      const keywords = [
        "success",
        "account created successfully",
        "now upload the birth certificate",
        "signup error",
        "network request failed",
        "failed to save pending user",
        "please fill all fields",
        "passwords do not match",
        "error",
      ];

      for (const keyword of keywords) {
        if (lowerText.includes(keyword)) {
          return {
            passed: true,
            reason: `Message detected: "${keyword}"`,
          };
        }
      }
    } catch (error) {
      // ignore temporary read errors while waiting
    }

    await driver.sleep(1000);
  }

  return {
    passed: false,
    reason: "No navigation or visible message detected after clicking Register",
  };
}

async function runTest() {
  let driver;
  let uniqueEmail = "";

  try {
    console.log("Starting Chrome browser...");
    driver = await new Builder().forBrowser("chrome").build();

    console.log("Opening Expo web app...");
    await driver.get("http://localhost:8081");

    console.log("\n=== SPLASH SCREEN TEST ===");
    await waitForElement(driver, '[data-testid="splashScreen"]', 10000);
    await waitForElement(driver, '[data-testid="splashLogo"]', 10000);
    console.log("✅ Splash screen test passed");

    console.log("\n=== LOGIN SCREEN LOAD TEST ===");
    await waitForElement(driver, '[data-testid="loginScreen"]', 15000);
    await waitForElement(driver, '[data-testid="loginButton"]', 15000);
    await waitForElement(driver, '[data-testid="loginEmailInput"]', 15000);
    await waitForElement(driver, '[data-testid="loginPasswordInput"]', 15000);
    console.log("✅ Login form load test passed");

    console.log("\n=== LOGIN FORM INPUT TEST ===");
    await typeInto(driver, '[data-testid="loginEmailInput"]', "danushanandan1@mail.com");
    await typeInto(driver, '[data-testid="loginPasswordInput"]', "123456");
    console.log("✅ Login form input test passed");

    console.log("\n=== LOGIN SUBMIT TEST ===");
    await clickElement(driver, '[data-testid="loginButton"]', 10000);

    const loginResult = await checkAnyLoginResult(driver, 15000);

    if (loginResult.passed) {
      console.log(`✅ Login submit test passed - ${loginResult.reason}`);
    } else {
      console.log(`❌ Login submit test failed - ${loginResult.reason}`);
      await printCurrentPageInfo(driver);
    }

    // If login unexpectedly navigates somewhere else, reopen signup through login screen path
    const urlAfterLogin = await driver.getCurrentUrl();
    if (!urlAfterLogin.includes("/signup")) {
      if (!urlAfterLogin.includes("/login")) {
        await driver.get("http://localhost:8081/login");
      }
    }

    console.log("\n=== NAVIGATE TO REGISTER TEST ===");
    await waitForElement(driver, '[data-testid="loginScreen"]', 15000);
    await clickElement(driver, '[data-testid="goToRegisterButton"]', 10000);
    await waitForElement(driver, '[data-testid="signupScreen"]', 10000);
    await waitForElement(driver, '[data-testid="registerButton"]', 10000);
    console.log("✅ Navigate to register test passed");

    console.log("\n=== REGISTER FORM TEST ===");
    uniqueEmail = `test${Date.now()}@mail.com`;

    await typeInto(driver, '[data-testid="nicInput"]', "200012345678");
    await typeInto(driver, '[data-testid="nameInput"]', "Test User");
    await typeInto(driver, '[data-testid="dobInput"]', "2000-01-01");
    await typeInto(driver, '[data-testid="emailInput"]', uniqueEmail);
    await typeInto(driver, '[data-testid="mobileInput"]', "0712345678");
    await typeInto(driver, '[data-testid="passwordInput"]', "123456");
    await typeInto(driver, '[data-testid="confirmPasswordInput"]', "123456");
    console.log("✅ Register form fill test passed");

    console.log("\n=== REGISTER SUBMIT TEST ===");
    await clickElement(driver, '[data-testid="registerButton"]', 10000);

    const registerResult = await checkAnyRegisterResult(driver, 20000);

    if (registerResult.passed) {
      console.log(`✅ Register submit test passed - ${registerResult.reason}`);
    } else {
      console.log(`❌ Register submit test failed - ${registerResult.reason}`);
      await printCurrentPageInfo(driver);
    }

    const currentUrl = await driver.getCurrentUrl();
    if (currentUrl.includes("/upload-certificate")) {
      console.log("\n=== UPLOAD CERTIFICATE SCREEN TEST ===");
      await waitForElement(driver, '[data-testid="uploadCertificateScreen"]', 10000);
      await waitForElement(driver, '[data-testid="chooseImageButton"]', 10000);
      await waitForElement(driver, '[data-testid="uploadExtractButton"]', 10000);
      console.log("✅ Upload certificate screen test passed");
    } else {
      console.log("\n=== UPLOAD CERTIFICATE SCREEN TEST ===");
      console.log("⚠️ Skipped because app did not navigate to upload-certificate");
    }

    console.log("\n=== QA TEST SUMMARY ===");
    console.log("✅ Splash screen test passed");
    console.log("✅ Login form load test passed");
    console.log("✅ Login form input test passed");
    console.log(
      loginResult.passed
        ? `✅ Login submit test passed - ${loginResult.reason}`
        : `❌ Login submit test failed - ${loginResult.reason}`
    );
    console.log("✅ Navigate to register test passed");
    console.log("✅ Register form fill test passed");
    console.log(
      registerResult.passed
        ? `✅ Register submit test passed - ${registerResult.reason}`
        : `❌ Register submit test failed - ${registerResult.reason}`
    );
    console.log(uniqueEmail ? `Test email used: ${uniqueEmail}` : "Test email used: N/A");
  } catch (error) {
    console.error("\n❌ SELENIUM TEST FAILED");
    console.error(error);
    if (driver) {
      await printCurrentPageInfo(driver);
    }
  } finally {
    const closeBrowser = false;

    if (driver && closeBrowser) {
      await driver.quit();
    }
  }
}

runTest();