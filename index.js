const linebot = require('linebot');
const express = require('express');
const linebotParser = require('./bot.event.js')

// Connect to MongoDB


const app = express();
// Handle static files
app.use('/images',express.static(__dirname+'/images'));

// Handle webhook
app.post('/', linebotParser);

// Routes
const PORT = process.env.PORT || 8080;
app.listen(PORT, console.log(`Ninja Hattori is running on port ${PORT}`))
