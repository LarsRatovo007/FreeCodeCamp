const express = require('express')
const mongoose=require('mongoose')
const app = express()
const cors = require('cors')

require('dotenv').config()
const mongo=mongoose.connect(process.env.MONGO_URI,{useNewUrlParser:true,useUnifiedTopology:true});

const adminSchema=new mongoose.Schema({
  username:String
})
const logSchema=new mongoose.Schema({
  owner:String,
  description:String,
  duration:Number,
  date:Date
})
const Admin=mongoose.model('admin',adminSchema);
const Log=mongoose.model('log',logSchema);
app.use(cors())
app.use(express.urlencoded({extended:false}))
app.use(express.json())
app.use((req,res,next)=>{
  console.log(req.url);
  next();
})
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users',(req,res)=>{
  let username=req.body.username;
  let admin=new Admin({username:username,log:[]});
  admin.save().then(user=>{
    if(user){
      return res.json({
        _id:user._id,
        username:user.username
      });
    }
    return res.json({error:'invalid user'});
  }).catch(error=>{
      return res.json({error:error})
  });
});

app.post('/api/users/:_id/exercises',(req,res)=>{
  let id=req.params._id;
  let desc=req.body.description;
  let duration=req.body.duration;
  let date=new Date(req.body.date);
  if(isNaN(date)){
    date=new Date();
  }
  Admin.findById(id).then(admin=>{
    if(admin){
      let data={
        owner:id,
        username:admin.username,
        description:desc,
        duration:parseInt(duration),
        date:date.toDateString()
      };
      let log=new Log(data);
      log.save().then(l=>{
        if(l){
          return res.json({
            _id:id,
            username:admin.username,
            description:desc,
            duration:parseInt(duration),
            date:date.toDateString()
          });
        }
      })
    }else{
      return res.json({error:'User not found'});
    }
  }).catch(err=> {
    console.log(err);
    return res.json({error:'Error occured'})
  });
});
app.get('/api/users',(req,res)=>{
  Admin.find().then(users=> res.json(users));
})
app.get('/api/users/:_id/logs',(req,res)=>{
  Admin.findById(req.params._id).then(admin=>{
    if(admin){
      let from=req.query.from;
      let to=req.query.to;
      let limit=req.query.limit;
      let query=Log.find({owner:admin._id});
      if(from){
        query=query.where('date').gte(new Date(from));
      }
      if(to){
        query=query.where('date').lte(new Date(to));
      }
      if(limit){
        query=query.limit(parseInt(limit));
      }
      query=query.select({description:1,duration:1,date:1,_id:0});
      query.exec().then(data=>{
        let result={
          _id:admin._id,
          username:admin.username,
          count:data.length,
          from:from,
          to:to,
          log:[]
        };
        data.forEach(day=>{
          let tmp={
            description:day.description,
            duration:day.duration,
            date:day.date.toDateString()
          }
          result.log.push(tmp);
        })
        return res.json(result)
      }).catch(err=>{
        return res.json({
          _id:admin._id,
          username:admin.username,
          count:admin.log.length,
          log:admin.log
        })
      });   
    }else{
      return res.json({error:'Invalid id'})
    }
  }).catch(err=>{
    return res.json({error:err})
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
