const fs = require('fs');
const path = require('path');

// We can just reuse our own engine to parse the CSV exactly as the website does!
const { parseCSV } = require('./utils/engine.js');

const csvPath = path.join(__dirname, 'assets', 'Spotify_Song_Attributes.csv');
const jsonPath = path.join(__dirname, 'assets', 'songs.json');

try {
    const text = fs.readFileSync(csvPath, 'utf8');
    const songs = parseCSV(text);
    fs.writeFileSync(jsonPath, JSON.stringify(songs));
    console.log('Successfully converted CSV to JSON! Total songs:', songs.length);
} catch (e) {
    console.error('Conversion failed:', e);
}
