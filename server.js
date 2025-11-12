const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 5500;
const DATA_FILE = path.join(__dirname, 'contacts.json');

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname))); 

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.post('/api/save-contact-data', async (req, res) => {
    const newContact = req.body;

    if (!newContact || !newContact.name || !newContact.email) {
        return res.status(400).json({ error: 'Name and email are required.' });
    }

    try {
        let contacts = [];
        try {
            const data = await fs.readFile(DATA_FILE, 'utf8');
            contacts = JSON.parse(data);
        } catch (readError) {
            if (readError.code !== 'ENOENT') { 
                throw readError;
            }
        }

        const entryWithTimestamp = { ...newContact, timestamp: new Date().toISOString() };
        contacts.push(entryWithTimestamp);

        await fs.writeFile(DATA_FILE, JSON.stringify(contacts, null, 2), 'utf8');
        
        console.log('New contact saved:', entryWithTimestamp.name);
        res.status(200).json({ message: 'Data saved successfully.' });
    
    } catch (saveError) {
        console.error('Error saving data:', saveError);
        res.status(500).json({ error: 'Could not save data to file.' });
    }
});
// server.js file mein yeh naya block jodein

// The new endpoint to serve JSON data
app.get('/api/contacts', async (req, res) => {
    try {
        // JSON file ko padhe
        const data = await fs.readFile(DATA_FILE, 'utf8');
        const contacts = JSON.parse(data);
        
        // Data ko browser ko JSON format mein bhej de
        res.status(200).json(contacts);
        
    } catch (readError) {
        // Agar file nahi milti ya koi galti hoti hai
        if (readError.code === 'ENOENT') {
            return res.status(200).json([]); // Empty array bhej de agar file nahi mili
        }
        console.error('Error reading contacts data:', readError);
        res.status(500).json({ error: 'Could not fetch contact data.' });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Server listening at http://localhost:${PORT}`);
});