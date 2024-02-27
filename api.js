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
