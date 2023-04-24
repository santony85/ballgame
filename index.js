const express = require('express');
const ejs = require('ejs');
const app = express();
const http = require('http');
const path = require('path');
const fs = require('fs');
var moment = require('moment');



const { Sigfox } = require('@nightswinger/sigfox-js');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const MONGO_URL = 'mongodb://AdminDbR**t:NewPass2020@127.0.0.1:27017/games?authSource=admin' 

const MongoClient = require('mongodb',{ useUnifiedTopology: true }).MongoClient;
var dbo;
var db;
var ObjectID = require('mongodb').ObjectID;

MongoClient.connect(MONGO_URL, { useUnifiedTopology: true },function(err, db) {
  if (err) throw err;
  db = db;
  dbo = db.db("games");
  console.log("Database connected!");  
 });

var httpServer = http.createServer(app);
var io = require( "socket.io" )( httpServer );
httpServer.listen(8000);
console.log("Server connected! port 8000");	

io.on('connection', (socket) => {
	//console.log('a user connected');
	socket.on('disconnect', () => {
	  //  console.log('user disconnected');
	});
	socket.on('start', (data) => {
	  //  console.log('user disconnected');
	  console.log(data)
	});
});

const client = new Sigfox({
  username: "626bc2f83d4d5c0e2fea991c",
  password: "8cc459cd011b776e1546763928b2f1a2"
})



app.get('/', async (req, res)=> {
	res.render('index'); 
  });
  
  
  
app.get('/detaildevice/:did', async (req, res)=> {
	try{
	  var did = req.params.did.toString();
	  res.render('detaildevice',{deviceid:did});
	} catch(error){
	  res.render('detaildevice');
	}	  
  });  
  
app.get('/graphdevice/:did', async (req, res)=> {
	try{
	  var did = req.params.did.toString();
	  res.render('graphdevice',{deviceid:did});
	} catch(error){
	  res.render('graphdevice');
	}	  
  });  

function makeDummyData(dbo){
	let poids=0;
	let tmpdt= new Date();
	tmpdt.setDate(tmpdt.getDate()-60);
	for(let i=0;i<8000;i++){
	  poids = poids+12;
	  if(poids > 120)poids=0;
	  tmpdt = new Date(tmpdt.getTime() + 30*60000);
	  //tmpdt.setDate(tmpdt.getDate()-60);
	  var myobj = { deviceid: '202EB5E', seqnum: i+1, date: tmpdt,temperature:24.5,volt:4.8,poids:poids,comstate: 2, lqi: 2 };
	  console.log(myobj)
	  dbo.collection("messageDummy").insertOne(myobj);
	  	
	}
}



app.get('/getcumulfromdate/:d1/:d2', async (req, res)=> {
	var d1 = req.params.d1.toString();
	var d2 = req.params.d2.toString();
	let cumul=0;
	let cumulday=0;
	let lastpoids=0;
	let result=[];
	let restxt="x,poids\r\n";
	try{
	  //makeDummyData(dbo);	
	  let i=0;	
	  const dataX = await dbo.collection('messageDummy').aggregate([
		  {
			  $match:{date:{$gte:new Date(d1),$lte:new Date(d2)}}
		  }, 
		  {
			  $group : {
				 _id :{ $dateToString: { format: "%Y-%m-%d", date: "$date"} },
				 list: { $push: "$$ROOT" },
				 count: { $sum: 1 }
			  }
	  }]).sort({_id:1}).toArray();

	  //const data = await dbo.collection("messageDummy").find({}).sort({seqnum:1}).toArray();	
	  dataX.forEach(el =>{
		  //lastpoids=0;
		  cumulday=0;
		  let lst = el.list;
		  lst.forEach(ellist =>{
			 //console.log(ellist.poids) 
			if( ellist.poids < lastpoids ){
				cumulday += lastpoids;
				//console.log("->"+lastpoids);
				lastpoids = ellist.poids; 
			  }
			  else {
				lastpoids = ellist.poids;	
			  } 
			  
		  })
		 cumulday += lastpoids;
		 cumul += lastpoids;
		 
		 //console.log(cumulday); 
		 //console.log(el._id);
		 //console.log(el.count);
		 let tmpres= {date:el._id,value:cumulday};
		 result.push(tmpres);
		 restxt = restxt +el._id+","+cumulday+"\r\n";
		 
	  })
	  cumul += lastpoids;
	  //res.send({value:cumul,data:result})
	  res.send(restxt);
	}
	catch{}
});

app.get('/sigfoxmessage/:did/:data/:seq', async (req, res)=> {

	try{
	  var did = req.params.did.toString();
	  var data = req.params.data.toString();
	  var seq = req.params.seq.toString();
	  let vc = data;
	  let temperature = parseInt(vc.substring(0,4), 16)/10;
	  let volt = parseInt(vc.substring(4,8), 16)/10;
	  volt = volt/100;
	  let poids = parseInt(vc.substring(8,12), 16)/10;
	  let remp = parseInt(vc.substring(12,16), 16)/10;
	  let msg = await client.getDevice('202EB5E',{})
	  console.log(msg)
	  
	  /*let dummy =
	  {
		id: '202EB5E',
		name: 'SNOC_DevKit_1-device',
		satelliteCapable: false,
		repeater: false,
		messageModulo: 4096,
		lastCom: 1652044327000,
		state: 0,
		comState: 1,
		location: { lat: 0, lng: 0 },
		deviceType: { id: '626bc1623d4d5c0e2fea6a42' },
		group: { id: '626bc15fdb89951ba6b69a0d' },
		lqi: 2,
		activationTime: 1651231496682,
		token: { state: 0, detailMessage: 'Valid', end: 1682767496682 },
		contract: { id: '626bc161c71c7c56e78b18df' },
		creationTime: 1651229026402,
		modemCertificate: { id: '570617e7e4b0f210fc12b29d' },
		prototype: false,
		productCertificate: { id: '5a7b743cc55ce6717e191caf' },
		automaticRenewal: true,
		automaticRenewalStatus: 1,
		createdBy: '59799fc8500574298ba05c4c',
		lastEditionTime: 1651230649506,
		lastEditedBy: '626bc160db89951ba6b69a1d',
		activable: true
	  }*/
	  
	   	
      var myobj = { deviceid: did, data: data, seqnum: seq, date: new Date(),temperature:temperature,volt:volt,poids:poids,comstate: msg.comState, lqi: msg.lqi,device:msg };
	  dbo.collection("message").insertOne(myobj);
	  
	  var key={deviceid:did};
	  var device ={deviceid: did, date: new Date(),temperature:temperature,volt:volt,poids:poids,comstate: msg.comState, lqi: msg.lqi,device:msg,remp:remp };
	  dbo.collection("devices").updateOne(key, {$set:device},{upsert:true}, function(err, obj) { 
		  if (err) throw err;
		  console.log("1 document updated");
		})
		
	  
	  console.log(did);	
	  console.log(myobj);	
	  res.sendStatus(200);
	} catch(error){
	  res.sendStatus(200);
	}	  
  });
  
app.get('/sigfoxdevice/:did/:temp/:batt/:seq', async (req, res)=> {
	  var did = req.params.did.toString();
	  var temp = req.params.temp.toString();
	  var seq = req.params.seq.toString();
	  var batt = req.params.batt.toString();
	  try{
		var myobj = { deviceid: did, temp: temp, batt:batt, seqnum:seq, date: new Date() };
		dbo.collection("device").insertOne(myobj);
		res.send('ok');
	  } catch(error){
		res.send('ok');
	  }	  
	});
	
app.get('/getUserDevices', async (req, res)=> {
	  try{
		  const obj = await dbo.collection("devices").find({}).toArray();
		  res.send(obj);
	  }
	  catch{
		  res.send("fail");	
	  }
  });
  
app.get('/getDeviceData/:did', async (req, res)=> {
	    var did = req.params.did.toString();
		try{
			const obj = await dbo.collection("message").find({deviceid:did}).sort({date : -1}).toArray();
			res.send(obj);
		}
		catch{
			res.send("fail");	
		}
	});
  	 
app.post('/getdata', async (req, res)=> {
	try{
	  console.log(req.body);
	  res.send("ok");	
	}
	catch{
	  res.send("fail");	
	}
	
	 
  })