const authorize = require('../Gmail_Scheduler/services/googleApiAuthService');
const { sendEmail } = require('../Gmail_Scheduler/services/gmailApiServices');
const fs1 = require('fs').promises;
const path1 = require('path');
const schedule = require('node-schedule');

let scheduledEmails = {}; // Object to store scheduled emails by their IDs

async function loadFileContent() {
    let auth = await authorize().catch(console.error);
    const filePath = path1.join(__dirname, 'frontend_data.json');
    try {
        const fileContent = await fs1.readFile(filePath, 'utf8');
        const data = JSON.parse(fileContent);
        const unsentEmails = data.unsent.filter(email => !email.sentEmail && new Date(email.date) > new Date());
        unsentEmails.forEach((email) => {
            const { id, recipient, subject, message, custName,custPhNo, carModel, date } = email;
            console.log("id: ",id)
            console.log("recipient: ",recipient)
            console.log("subject: ",subject)
            console.log("message: ",message)
            console.log("custName: ",custName)
            console.log("custPhNo: ",custPhNo)
            console.log("carModel: ",carModel)
            console.log("date: ",date)
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
                        await fs1.writeFile(filePath, JSON.stringify(data, null, 4));
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
setInterval(loadFileContent, 10000);

// Load initial unsent emails
loadFileContent();


const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.static(path.join(__dirname, 'frontend')));
app.use(express.json());

// Serve the index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

async function saveData(req,res){
    console.log('Received request:', req.body);

    const { recipient, subject, message, date, custName, custPhNo, carModel} = req.body;
    const sentEmail = false; // Assuming email is not sent initially

    // Generate a unique ID
    const id = uuidv4();

    // Load existing data from frontend_data.json
    let data = {
        sent: [],
        unsent: []
    };

    try {
        if (fs.existsSync('frontend_data.json')) {
            const fileContent = fs.readFileSync('frontend_data.json', 'utf8');
            if (fileContent.trim() !== '') {
                data = JSON.parse(fileContent);
            }
        }
    } catch (err) {
        console.error('Error reading frontend_data.json:', err);
    }

    // Add new data to the appropriate array
    if (sentEmail) {
        data.sent.push({ id, recipient, custName, custPhNo, carModel, subject, message, date, sentEmail});
    } else {
        data.unsent.push({ id, recipient, custName, custPhNo, carModel, subject, message, date, sentEmail });
    }

    // Save the updated data back to frontend_data.json
    try {
        fs.writeFileSync('frontend_data.json', JSON.stringify(data, null, 4));
    } catch (err) {
        console.error('Error writing frontend_data.json:', err);
        res.status(500).send('Error saving data');
        return;
    }

    res.send('Data saved successfully');
}

async function getData(req,res){}
async function updateData(req,res){}
async function deleteData(req,res){}
app.post('/api/saveData', saveData);
app.get('/api/getData', getData);
app.post('/api/updateData', updateData);
app.post('/api/deleteData', deleteData);



app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
