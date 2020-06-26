const express   = require('express');
const mongoose  = require('mongoose');
const bodyParser= require('body-parser');
const multer    = require('multer');
const path      = require('path');
const admin = require("firebase-admin");

require('dotenv').config();

const app       = express(); 


const MONGODB_URI = process.env.MONGODB_URI ;

const port      = process.env.PORT || 8080  ;

  //multer
  const fileStorage = multer.diskStorage({
    destination:(req,file,cb)=>{
      if(file.mimetype==='video/mp4'){
        cb(null,'vid');
      }else{
        cb(null,'images');
      }
    },
    filename:(req,file,cb)=>{
      cb(null,new Date().toISOString()+'-' + file.originalname);
    }
  });


  

  const fileFilter = (req,file,cb)=>{
    if(file.mimetype==='image/png'||
    file.mimetype==='image/jpg'   ||
    file.mimetype==='image/jpeg'  ||
    file.mimetype==='video/mp4'){
        cb(null,true);
    }else {
      cb(null,false);
    }
  }

  //meddleWere
app.use(bodyParser.json());
  //multer meddlewere
app.use(multer({storage:fileStorage,fileFilter:fileFilter}).array('image'));
app.use('/images',express.static(path.join(__dirname,'images')));
app.use('/vid',express.static(path.join(__dirname,'vid')));
  
//headers meddlewere
app.use((req,res,next)=>{
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Methods','GET,POST,PUT,PATCH,DELETE');
    res.setHeader('Access-Control-Allow-Headers','Content-type,Authorization');
    next();
});
//fireBace

admin.initializeApp({
    credential: admin.credential.cert({
      
      clientEmail: process.env.FCM_CLINT_EMAIL,
      privateKey:  process.env.FCM_PRIVATE_KEY.replace(/\\n/g, '\n'),
      projectId:   process.env.FCM_PROJ_ID ,

  }),
});

//routes
const adminRout = require('./admin/routs/admin');
const authRouter = require('./routes/auth');
const shopRouter = require('./routes/shop');
const userRouter = require('./routes/user');
const payRouter = require('./routes/pay');
const supportRouter = require('./routes/support');
const lostRouter = require('./routes/lost');

app.use('/admin',adminRout);
app.use('/user', userRouter);

app.use(authRouter);
app.use('/shop',shopRouter);
app.use(payRouter);
app.use(supportRouter);
app.use(lostRouter);




//error handle meddlewere
app.use((error,req,res,next)=>{
    const status    = error.statusCode || 500 ;
    const message   = error.message           ;
    const data      = error.data              ;
    
    res.status(status).json({state:0,message:message,data:data});
});

mongoose
.connect(
  MONGODB_URI,{
      useNewUrlParser: true,useUnifiedTopology: true,useFindAndModify:false }
)
  .then(result => {
    const server = app.listen(port);
    const io     = require('./socket.io/socket').init(server);
    io.on('connection',socket=>{
      console.log("Clint connected");
    })
  })
  .catch(err => {
    console.log(err);
  });