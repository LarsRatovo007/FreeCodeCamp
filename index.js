require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns= require('dns');
const mongoose=require('mongoose');
const mongo=mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;
const schema=new mongoose.Schema({
  url:String
});
const Url=mongoose.model("url",schema);
app.use(cors());
app.use(express.urlencoded({extended:false}));
app.use(express.json());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl',(req,res)=>{
    let url=req.body.url;
    if(url.endsWith("/")){
      url=url.substring(0,url.length-1);
    }
    dns.lookup(url,(error,address,family)=>{
      if(error){
        res.json({error:'invalid url'});
        res.json({error:'Error Saved'});
      }
      let simp=new Url({url:url});
      simp.save().then(simple=>{
          res.json({original_url:simple.url,short_url:simple._id});
      }).catch(err=>{
        console.log(err);
        res.json({error:err});
      });
    });
});

app.get('/api/shorturl/:id',(req,res)=>{
  let id=req.params.id;
  Url.findById(id).then(url=>{
    console.log(url);
  res.redirect("http://"+url.url);
  }).catch(error=>{
    console.log(error);
  });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
