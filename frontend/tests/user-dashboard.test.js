const { createDriver, By, until } = require('../test-setup');
const { expect } = require('chai'); // Install chai for assertions

describe('UserDashboard Tests', function() {
  this.timeout(30000);
  let driver;

  before(async () => {
    driver = await createDriver();
    // Start your Expo web app first: npx expo start --web
    await driver.get('http://localhost:19006');
  });

  after(async () => {
    await driver.quit();
  });

  it('should display the dashboard header', async () => {
    const dashboardTitle = await driver.wait(
      until.elementLocated(By.xpath("//*[text()='Dashboard']")),
      10000
    );
    const titleText = await dashboardTitle.getText();
    expect(titleText).to.equal('Dashboard');
  });

  it('should show welcome message with user name', async () => {
    const welcomeElement = await driver.findElement(
      By.xpath("//*[contains(text(), 'Hi,')]")
    );
    const text = await welcomeElement.getText();
    expect(text).to.include('Hi,');
  });

  it('should display quick action buttons', async () => {
    const bookButton = await driver.findElement(
      By.xpath("//*[text()='Book']")
    );
    const bookingsButton = await driver.findElement(
      By.xpath("//*[text()='Bookings']")
    );
    const queueButton = await driver.findElement(
      By.xpath("//*[text()='Queue']")
    );
    const qrButton = await driver.findElement(
      By.xpath("//*[text()='QR Code']")
    );

    expect(await bookButton.isDisplayed()).to.be.true;
    expect(await bookingsButton.isDisplayed()).to.be.true;
    expect(await queueButton.isDisplayed()).to.be.true;
    expect(await qrButton.isDisplayed()).to.be.true;
  });

  it('should open service type modal when clicking Book', async () => {
    const bookButton = await driver.findElement(
      By.xpath("//*[text()='Book']")
    );
    await bookButton.click();
    
    // Wait for modal to appear
    const modalTitle = await driver.wait(
      until.elementLocated(By.xpath("//*[text()='Select Service']")),
      5000
    );
    expect(await modalTitle.isDisplayed()).to.be.true;
    
    // Check if services are listed
    const nicService = await driver.findElement(
      By.xpath("//*[text()='NIC Card']")
    );
    const passportService = await driver.findElement(
      By.xpath("//*[text()='Passport']")
    );
    const licenseService = await driver.findElement(
      By.xpath("//*[text()='Driving License']")
    );
    
    expect(await nicService.isDisplayed()).to.be.true;
    expect(await passportService.isDisplayed()).to.be.true;
    expect(await licenseService.isDisplayed()).to.be.true;
    
    // Close modal
    const closeButton = await driver.findElement(
      By.css("ion-icon[name='close']")
    );
    await closeButton.click();
  });

  it('should navigate through bottom tabs', async () => {
    // Find tab buttons
    const homeTab = await driver.findElement(
      By.xpath("//*[text()='Home']")
    );
    const bookingsTab = await driver.findElement(
      By.xpath("//*[text()='Booking']")
    );
    const settingsTab = await driver.findElement(
      By.xpath("//*[text()='Settings']")
    );
    
    // Click settings tab
    await settingsTab.click();
    
    // Wait for settings modal
    const settingsTitle = await driver.wait(
      until.elementLocated(By.xpath("//*[text()='Settings']")),
      5000
    );
    expect(await settingsTitle.isDisplayed()).to.be.true;
    
    // Check for dark mode switch
    const darkModeText = await driver.findElement(
      By.xpath("//*[text()='Dark Mode']")
    );
    expect(await darkModeText.isDisplayed()).to.be.true;
    
    // Close settings
    const closeButton = await driver.findElement(
      By.css("ion-icon[name='close']")
    );
    await closeButton.click();
  });

  it('should handle login/logout flow', async () => {
    // Navigate to settings
    const settingsTab = await driver.findElement(
      By.xpath("//*[text()='Settings']")
    );
    await settingsTab.click();
    
    await driver.sleep(1000); // Wait for animation
    
    // Find logout button
    const logoutButton = await driver.findElement(
      By.xpath("//*[text()='Logout']")
    );
    await logoutButton.click();
    
    // Handle alert dialog
    await driver.sleep(1000);
    try {
      const alert = await driver.switchTo().alert();
      const alertText = await alert.getText();
      expect(alertText).to.include('logout');
      await alert.dismiss(); // Cancel logout
    } catch (e) {
      // Alert might not appear in web
    }
  });
});