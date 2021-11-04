const path = require('path');
const readline = require('readline');
const puppeteer = require('puppeteer-core');
const notifier = require('node-notifier');

const LOW_BATTERY_WARNING_VALUE = 25;
const chromePathOnWindows = path.join(process.env.ProgramFiles, 'Google', 'Chrome', 'Application', 'chrome.exe');
const airtelDongleWebUrl = 'http://192.168.1.1/index.html';
const intervalToCheck = 1000 * 60 * 5;

check();

setInterval(async () => {
    await check();
}, intervalToCheck);

async function check() {
    const browser = await puppeteer.launch({
        executablePath: chromePathOnWindows
    });
    const page = await browser.newPage();
    await page.goto(airtelDongleWebUrl);

    const { bat, isCharging } = await page.evaluate(() => {
        return {
            bat: window['batt_p'],
            isCharging: window['flag_battery'] === 4 ? true : false
        }
    })
    readline.clearLine(process.stdout, 0);
    readline.cursorTo(process.stdout, 0);
    process.stdout.write(`${new Date().toLocaleString()} Battery: ${bat}%  Charging: ${isCharging}`);
    if (!isCharging)
        warn(bat);
    await browser.close();
}

function warn(bat) {
    if (bat <= LOW_BATTERY_WARNING_VALUE) {
        notifier.notify(
            {
                title: 'Airtel Dongle Charge Reminder',
                message: `Battery is ${bat}%. Please Charge`,
                icon: path.join(__dirname, 'airtel.png'),
                sound: true
            }
        );
    }
}