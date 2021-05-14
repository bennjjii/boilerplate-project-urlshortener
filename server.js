require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const mongoose = require('mongoose');
const { Schema } = mongoose;
var dns = require('dns');
const validUrl = require('valid-url');




//mongo setup
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true})
const shortLinkSchema = new Schema({
  original_url: String,
  short_url: Number
})
const ShortLink = mongoose.model('ShortLink', shortLinkSchema)

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({extended: false}))

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.post("/api/shorturl", async (req, res)=>{
  console.log(req.body.url)
  if(validUrl.isUri(req.body.url) && /http/.test(req.body.url)){
    //get next ticket in database
    let allLinks = await ShortLink.find({})
    //find if link already exists
    let existingLink = await ShortLink.findOne({
      original_url: req.body.url
    })
    if(existingLink){
      //return data for existing link
      return res.json({
        original_url: existingLink.original_url,
        short_url: existingLink.short_url
      })
    }
    //if got this far put the link in the db
    let newShortLink = await new ShortLink({
      original_url: req.body.url,
      short_url: allLinks.length + 1
    })
    let savedShortLink = await newShortLink.save();
    //console.log(savedShortLink);
    return res.json({
      original_url: req.body.url,
      short_url: allLinks.length + 1
    })

  } else {
    return res.json({
      error: 'invalid url'
    })
  }

})

app.get("/api/shorturl/:url", async (req, res)=>{
  let findFullLink = await ShortLink.findOne({
    short_url: req.params.url
  })
  if(findFullLink){
    return res.redirect(findFullLink.original_url)
  } else {
    return res.sendStatus(404)
  }
})

app.listen(port, function() {
  //console.log(mongoose.connection.readyState)
  console.log(`Listening on port ${port}`);
});