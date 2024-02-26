const authorize = require('../Gmail_Scheduler/services/googleApiAuthService');
const { sendEmail } = require('../Gmail_Scheduler/services/gmailApiServices');
const fs = require('fs').promises;
const path = require('path');
const schedule = require('node-schedule');

let scheduledEmails = {}; // Object to store scheduled emails by their IDs

async function loadFileContent() {
    let auth = await authorize().catch(console.error);
    const filePath = path.join(__dirname, 'frontend_data.json');
    try {
        const fileContent = await fs.readFile(filePath, 'utf8');
        const data = JSON.parse(fileContent);
        const unsentEmails = data.unsent.filter(email => !email.sentEmail && new Date(email.date) > new Date());
        unsentEmails.forEach((email) => {
            const { id, recipient, subject, message, custName,custPhNo, carModel, date } = email;
            finalMessage = `Message Description: ${message}.\n\n Customer Name: ${custName}\n\n Mobile No.: ${custPhNo}\n\n Car Model: ${carModel}`;
            const msg = `TO: ${recipient}\nSubject: ${subject}\nContent-Type: text/html; charset=utf-8\n\n${finalMessage}`;
            if (!scheduledEmails[id]) { // Check if the email ID is not already scheduled
                schedule.scheduleJob(date, async () => {
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
                console.log(`Email scheduled for ${date} - Subject: ${subject}`);
                scheduledEmails[id] = true; // Mark the email ID as scheduled
            }
        });
    } catch (error) {
        console.error('Error reading file:', error);
    }
}

// Check for new emails every minute
setInterval(loadFileContent, 1000);

// Load initial unsent emails
loadFileContent();



/* let unsentEmails = [];

async function loadUnsentEmails() {
    try {
        console.log('Loading unsent emails...');
        const filePath = path.join(__dirname, 'frontend_data.json');
        const fileContent = await readFile(filePath, 'utf8');
        console.log('File Content:', fileContent);

        const data = JSON.parse(fileContent);
        unsentEmails = data.unsent.filter(email => !email.sentEmail);
        console.log("Unsent Emails:", unsentEmails);

    } catch (error) {
        console.error('Error loading unsent emails:', error);
    }
}


loadUnsentEmails(); */

/* async function sendScheduledEmails() {
    try {
        console.log('Checking for scheduled emails...');
        // Authenticate with Google API
        const auth = await authorize();

        for (const email of unsentEmails) {
            const { id, recipient, subject, message, date } = email;

            // Calculate the time remaining before sending the email
            const emailDate = new Date(date);
            const currentDate = new Date();
            const timeRemaining = emailDate - currentDate;

            if (timeRemaining <= 0) {
                console.log(`Sending email to ${recipient} - Subject: ${subject}`);
                // Send the email
                const msg = `TO: ${recipient}\nSubject: ${subject}\nContent-Type: text/html; charset=utf-8\n\n${message}`;
                await sendEmail(auth, msg);

                // Mark the email as sent
                email.sentEmail = true;
            } else {
                console.log(`Email to ${recipient} - Subject: ${subject} scheduled in ${timeRemaining} milliseconds`);
            }
        }

        // Filter out sent emails
        unsentEmails = unsentEmails.filter(email => !email.sentEmail);
    } catch (error) {
        console.error('Error sending scheduled emails:', error);
    }
} */

/* // Load unsent emails initially
loadUnsentEmails();

// Check for scheduled emails every minute
setInterval(sendScheduledEmails, 1000);

// Update the frontend_data.json file every minute
setInterval(async () => {
    const filePath = path.join(__dirname, 'frontend_data.json');
    const fileContent = await readFile(filePath, 'utf8');
    const data = JSON.parse(fileContent);
    data.unsent = unsentEmails;
    await fs.writeFile(filePath, JSON.stringify(data, null, 4));
}, 60000); */




/* // Define the function to send scheduled emails
async function sendScheduledEmailsWrapper() {
    try {
        await sendScheduledEmails();
    } catch (error) {
        console.error('Error sending scheduled emails:', error);
    }
}

// Schedule the function to run every minute
setInterval(sendScheduledEmailsWrapper, 60000); */

