const linebot = require('linebot');
const express = require('express');
const linebotParser = require('./bot.event')

// Connect to MongoDB
mongoose
  .connect(
    'mongodb://使用者帳號:密碼@ds113495.mlab.com:13495/ninja-hattori',
    { useNewUrlParser: true }
  )
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

const app = express();
// Handle static files
app.use('/images',express.static(__dirname+'/images'));

// Handle webhook
app.post('/', linebotParser);

// Routes
const PORT = process.env.PORT || 8080;
app.listen(PORT, console.log(`Ninja Hattori is running on port ${PORT}`))
