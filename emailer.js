//emailer.js
// const authorize = require('../src/services/googleApiAuthService');
// const { sendEmail } = require('../src/services/gmailApiServices');
//emailer.js
const authorize = require('../Gmail_Scheduler/services/googleApiAuthService');
const { sendEmail } = require('../Gmail_Scheduler/services/gmailApiServices');
const fs = require('fs').promises;
const path = require('path');
const schedule = require('node-schedule');
const moment = require('moment-timezone');

let scheduledEmails = {}; // Object to store scheduled emails by their IDs

async function loadFileContent() {
    let auth = await authorize().catch(console.error);
    const filePath = path.join(__dirname, 'frontend_data.json');
    try {
        const fileContent = await fs.readFile(filePath, 'utf8');
        const data = JSON.parse(fileContent);
        const unsentEmails = data.unsent.filter(email => !email.sentEmail);
        unsentEmails.forEach((email) => {
            const { id, recipient, subject, message, custName, custPhNo, carModel, date } = email;
            const systemTimeZone = moment.tz.guess();
            const singaporeTime = moment.tz(date, 'Asia/Kolkata').tz(systemTimeZone).format(); // Convert to systemTimeZone
            formattedMessage = message.replace('\n', '<br><br>');
            finalMessage = `<br>Message Description: ${formattedMessage}.</br><br> Customer Name: ${custName}<br>Mobile No.: ${custPhNo}<br>Car Model: ${carModel}`;
            const msg = `TO: ${recipient}\nSubject: ${subject}\nContent-Type: text/html; charset=utf-8\n\n${finalMessage}`;
            if (!scheduledEmails[id]) { // Check if the email ID is not already scheduled
                schedule.scheduleJob(singaporeTime, async () => {
                    try {
                        await sendEmail(auth, msg);
                        console.log(`Email sent to ${recipient} - Subject: ${subject}`);
                        // Update frontend_data.json after sending the email
                        email.sentEmail = true;
                        data.sent.push(email);
                        data.unsent = data.unsent.filter(item => item.id !== id);
                        await fs.writeFile(filePath, JSON.stringify(data, null, 4));
                    } catch (error) {
                        console.error('Error sending email:', error);
                    }
                });
                console.log(`Email scheduled for ${date} (IST) / ${singaporeTime} (SGT) - Subject: ${subject}`);
                scheduledEmails[id] = true; // Mark the email ID as scheduled
            }
        });
    } catch (error) {
        console.error('Error reading file:', error);
    }
}

// Function to periodically check for updates in frontend_data.json
async function checkForUpdates() {
    setInterval(async () => {
        await loadFileContent();
    }, 60000); // Check every minute
}

// Initial load
loadFileContent();

// Start checking for updates
checkForUpdates();
