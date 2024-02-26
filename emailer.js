//emailer.js
// This version works on singapore based server. 
// const authorize = require('../Gmail_Scheduler/services/googleApiAuthService');
// const { sendEmail } = require('../Gmail_Scheduler/services/gmailApiServices');
const authorize = require('../src/services/googleApiAuthService');
const { sendEmail } = require('../src/services/gmailApiServices');
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
            finalMessage = `Message Description: ${message}.\n\n Customer Name: ${custName}\n\n Mobile No.: ${custPhNo}\n\n Car Model: ${carModel}`;
            const msg = `TO: ${recipient}\nSubject: ${subject}\nContent-Type: text/html; charset=utf-8\n\n${finalMessage}`;
            if (!scheduledEmails[id]) { // Check if the email ID is not already scheduled
                const istDate = moment.tz(date, 'Asia/Kolkata'); // Convert date to IST
                const offset = istDate.diff(moment(), 'milliseconds'); // Calculate offset from current time
                schedule.scheduleJob(new Date(Date.now() + offset), async () => {
                    try {
                        console.log(`Email sent to ${recipient} - Subject: ${subject}`);
                        await sendEmail(auth, msg);
                        // Update frontend_data.json after sending the email
                        email.sentEmail = true;
                        data.sent.push(email);
                        data.unsent = data.unsent.filter(item => item.id !== id);
                        await fs.writeFile(filePath, JSON.stringify(data, null, 4));
                    } catch (error) {
                        console.error('Error sending email:', error);
                    }
                });
                console.log(`Email scheduled for ${date} - Subject: ${subject}`);
                scheduledEmails[id] = true; // Mark the email ID as scheduled
            }
        });
    } catch (error) {
        console.error('Error reading file:', error);
    }
}

// Continuously check for new emails when frontend_data.json updates
(async () => {
    while (true) {
        await loadFileContent();
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 minute before checking again
    }
})();
