var express = require('express');
var cors = require('cors');
var multer=require('multer');
var upload=multer({dest:'uploads/'});
require('dotenv').config()

var app = express();

app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(cors());
app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});
app.post('/api/fileanalyse',upload.array('upfile'),(req,res)=>{
  let first=req.files[0];
  res.send({
    name:first.originalname,
    type:first.mimetype,
    size:first.size
  });
});



const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('Your app is listening on port ' + port)
});
