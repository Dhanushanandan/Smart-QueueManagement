const { Builder, By, until, Key } = require("selenium-webdriver");
require("chromedriver");
const fs = require('fs');

async function diagnoseLogin() {
  let driver;

  try {
    console.log("\n🔍 LOGIN DIAGNOSTIC");
    console.log("═══════════════════════════════════\n");

    driver = await new Builder().forBrowser("chrome").build();
    await driver.get("http://localhost:8081");
    await driver.sleep(3000);

    // Step 1: Check React state
    console.log("1️⃣  Checking React component state...");
    const stateInfo = await driver.executeScript(`
      var results = {};
      
      // Find email input
      var emailInput = document.querySelector('[data-testid="loginEmailInput"]');
      if (emailInput) {
        var fiberKey = Object.keys(emailInput).find(k => k.startsWith('__reactFiber'));
        if (fiberKey) {
          var fiber = emailInput[fiberKey];
          while (fiber) {
            if (fiber.memoizedState) {
              results.hasReactState = true;
              break;
            }
            fiber = fiber.return;
          }
        }
      }
      
      // Find login button
      var loginBtn = document.querySelector('[data-testid="loginButton"]');
      if (loginBtn) {
        results.buttonTag = loginBtn.tagName;
        results.buttonClasses = loginBtn.className;
        results.buttonText = loginBtn.innerText;
        
        // Check for event listeners
        var fiberKey = Object.keys(loginBtn).find(k => k.startsWith('__reactFiber'));
        if (fiberKey) {
          var fiber = loginBtn[fiberKey];
          var depth = 0;
          while (fiber && depth < 20) {
            if (fiber.memoizedProps && fiber.memoizedProps.onPress) {
              results.hasOnPress = true;
              results.componentType = fiber.type?.displayName || fiber.type?.name || 'unknown';
              break;
            }
            fiber = fiber.return;
            depth++;
          }
        }
      }
      
      // Check form values
      var emailValue = emailInput ? emailInput.value : 'not found';
      results.emailValue = emailValue;
      
      return results;
    `);
    
    console.log("  React State Info:", JSON.stringify(stateInfo, null, 2));

    // Step 2: Fill form properly
    console.log("\n2️⃣  Filling form...");
    
    // Fill email using JavaScript
    await driver.executeScript(`
      var emailInput = document.querySelector('[data-testid="loginEmailInput"]');
      if (emailInput) {
        // Get the native input
        var nativeInput = emailInput.querySelector('input') || emailInput;
        
        // Set value using React's value setter
        var nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype, 'value'
        ).set;
        nativeInputValueSetter.call(nativeInput, 'danushanandan1@mail.com');
        
        // Dispatch events that React listens to
        nativeInput.dispatchEvent(new Event('input', { bubbles: true }));
        nativeInput.dispatchEvent(new Event('change', { bubbles: true }));
        nativeInput.dispatchEvent(new Event('blur', { bubbles: true }));
      }
    `);
    
    await driver.executeScript(`
      var passwordInput = document.querySelector('[data-testid="loginPasswordInput"]');
      if (passwordInput) {
        var nativeInput = passwordInput.querySelector('input') || passwordInput;
        var nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype, 'value'
        ).set;
        nativeInputValueSetter.call(nativeInput, '123456');
        nativeInput.dispatchEvent(new Event('input', { bubbles: true }));
        nativeInput.dispatchEvent(new Event('change', { bubbles: true }));
        nativeInput.dispatchEvent(new Event('blur', { bubbles: true }));
      }
    `);
    
    console.log("  ✅ Form filled via JavaScript");
    await driver.sleep(500);

    // Step 3: Verify values are set in React state
    console.log("\n3️⃣  Verifying values...");
    const verifyValues = await driver.executeScript(`
      var emailInput = document.querySelector('[data-testid="loginEmailInput"]');
      var passwordInput = document.querySelector('[data-testid="loginPasswordInput"]');
      
      var emailNative = emailInput ? (emailInput.querySelector('input') || emailInput) : null;
      var passwordNative = passwordInput ? (passwordInput.querySelector('input') || passwordInput) : null;
      
      return {
        emailValue: emailNative ? emailNative.value : 'not found',
        passwordLength: passwordNative ? passwordNative.value.length : 0
      };
    `);
    
    console.log("  Values:", JSON.stringify(verifyValues));

    // Step 4: Trigger login via React fiber directly
    console.log("\n4️⃣  Triggering login via React fiber...");
    const triggerResult = await driver.executeScript(`
      var loginBtn = document.querySelector('[data-testid="loginButton"]');
      if (!loginBtn) return 'button not found';
      
      // Walk up the fiber tree to find the TouchableOpacity component
      function findOnPress(fiber, depth) {
        if (!fiber || depth > 30) return null;
        
        if (fiber.memoizedProps && typeof fiber.memoizedProps.onPress === 'function') {
          return fiber.memoizedProps.onPress;
        }
        
        // Check child
        if (fiber.child) {
          var result = findOnPress(fiber.child, depth + 1);
          if (result) return result;
        }
        
        // Check sibling
        if (fiber.sibling) {
          var result = findOnPress(fiber.sibling, depth + 1);
          if (result) return result;
        }
        
        // Go up and check siblings
        return findOnPress(fiber.return, depth + 1);
      }
      
      // Get fiber from button
      var fiberKey = Object.keys(loginBtn).find(k => k.startsWith('__reactFiber'));
      if (!fiberKey) return 'no fiber found';
      
      var onPress = findOnPress(loginBtn[fiberKey], 0);
      
      if (onPress) {
        try {
          onPress();
          return 'onPress called successfully';
        } catch(e) {
          return 'onPress error: ' + e.message;
        }
      }
      
      return 'onPress not found';
    `);
    
    console.log(`  Result: ${triggerResult}`);

    // Step 5: Wait and monitor
    console.log("\n5️⃣  Monitoring for response...");
    
    for (let i = 1; i <= 20; i++) {
      await driver.sleep(1000);
      
      try {
        const url = await driver.getCurrentUrl();
        const body = await driver.findElement(By.tagName("body")).getText();
        
        // Check for alerts
        const alertElements = await driver.findElements(By.css('[role="alert"], [role="dialog"], .alert, .modal'));
        for (const alert of alertElements) {
          const text = await alert.getText();
          if (text.trim().length > 0) {
            console.log(`  📢 [${i}s] Alert: "${text.substring(0, 100)}"`);
          }
        }
        
        // Check for navigation
        if (!url.includes("/login")) {
          console.log(`  ✅ [${i}s] Navigated to: ${url}`);
          break;
        }
        
        // Check content change
        if (!body.includes("Sign in to your account") && body.length > 10) {
          console.log(`  📄 [${i}s] Content changed!`);
          console.log(`     "${body.substring(0, 100).replace(/\\n/g, ' ')}"`);
          break;
        }
        
        if (i % 5 === 0) {
          console.log(`  ⏳ [${i}s] Still waiting...`);
        }
        
      } catch (e) {}
    }

    // Final state
    const finalUrl = await driver.getCurrentUrl();
    const finalBody = await driver.findElement(By.tagName("body")).getText();
    
    console.log("\n═══════════════════════════════════");
    console.log("📊 DIAGNOSTIC COMPLETE");
    console.log("═══════════════════════════════════");
    console.log(`  React onPress found: ${triggerResult.includes('called') ? '✅' : '❌'}`);
    console.log(`  URL changed: ${!finalUrl.includes('/login') ? '✅' : '❌'}`);
    console.log(`  Final URL: ${finalUrl}`);
    console.log(`  Body starts with: "${finalBody.substring(0, 50)}"`);
    console.log("═══════════════════════════════════\n");

  } catch (error) {
    console.error("\n❌ ERROR:", error.message);
  } finally {
    console.log("🌐 Browser left open for manual inspection");
    console.log("   Check browser console (F12) for errors");
  }
}

diagnoseLogin();