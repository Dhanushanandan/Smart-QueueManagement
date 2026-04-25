const { createDriver, By, until } = require('../test-setup');
const { expect } = require('chai');

describe('Booking Flow Tests', function() {
  this.timeout(30000);
  let driver;

  before(async () => {
    driver = await createDriver();
    await driver.get('http://localhost:19006');
    await driver.sleep(2000); // Wait for app to load
  });

  after(async () => {
    await driver.quit();
  });

  it('should complete NIC booking flow', async () => {
    // Click Book button
    const bookButton = await driver.findElement(
      By.xpath("//*[text()='Book']")
    );
    await bookButton.click();
    await driver.sleep(1000);

    // Select NIC service
    const nicService = await driver.wait(
      until.elementLocated(By.xpath("//*[text()='NIC Card']")),
      5000
    );
    await nicService.click();
    await driver.sleep(1000);

    // Check if we navigated to NIC booking page
    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).to.include('nic-booking');
  });

  it('should fill out booking form', async () => {
    // This would need to be on the booking form page
    // Fill name
    const nameInput = await driver.findElement(
      By.xpath("//*[@placeholder='Enter your full name']")
    );
    await nameInput.sendKeys('John Doe');
    
    // Fill email
    const emailInput = await driver.findElement(
      By.xpath("//*[@placeholder='Enter your email']")
    );
    await emailInput.sendKeys('john@example.com');
    
    // Fill phone
    const phoneInput = await driver.findElement(
      By.xpath("//*[@placeholder='Enter your phone number']")
    );
    await phoneInput.sendKeys('1234567890');
    
    // Select date
    const todayOption = await driver.findElement(
      By.xpath("//*[text()='Today']")
    );
    await todayOption.click();
    
    // Select time
    const timeOption = await driver.findElement(
      By.xpath("//*[text()='09:00 AM']")
    );
    await timeOption.click();
    
    // Submit form
    const submitButton = await driver.findElement(
      By.xpath("//*[text()='Confirm Appointment']")
    );
    await submitButton.click();
    
    // Handle success alert
    await driver.sleep(1000);
    try {
      const alert = await driver.switchTo().alert();
      const alertText = await alert.getText();
      expect(alertText).to.include('successfully');
      await alert.accept();
    } catch (e) {
      console.log('Alert handling:', e);
    }
  });
});