const express = require('express');
const ejs = require('ejs');
const app = express();
const http = require('http');
const path = require('path');
const fs = require('fs');
var moment = require('moment');


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

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

console.log("Server connected! port 8000");	



io.on('connection', (socket) => {
	console.log('a user connected');
	socket.on('disconnect', () => {
	  console.log('user disconnected');
	});
	//ok
	socket.on('init', (data) => {
	  socket.join(data);
	  dbo.collection('parties').findOne({_id : ObjectID(data)},function(err, item) {
		  item.plateau = createPlateauInit(12);
		  socket.emit('affplateau',item);
		});
	});
	//ok
	socket.on('join', (data) => {
	  socket.join(data);
	  dbo.collection('parties').findOne({_id : ObjectID(data)},function(err, item) {
		  item.plateau = item.plateauInitial;
		  io.to(data).emit("affplateau",item);
		});
	});
	//change player + score
	//
	
});

    
//**************
//** routes ****
//**************

app.get('/', async (req, res)=> {
	res.render('index'); 
  });  
  
  
  
  
app.get('/createpartie/:id', async (req, res)=> {
	var id = req.params.id.toString();
	res.render('partie',{idpartie:id,type:'N'});    
  });
  
  app.get('/partie/:id', async (req, res)=> {
	  var id = req.params.id.toString();
	  res.render('partie',{idpartie:id,type:'J'});    
	});

//**************
//**** apis ****
//**************
  
app.get('/getDeviceData', async (req, res)=> {  
	  try{
		  const obj = await dbo.collection("parties").find().sort({date : -1}).toArray();
		  res.send(obj);
	  }
	  catch{
		  res.send("fail");	
	  }
  });
  
  app.post('/addj2', async (req,res) => {
	  var myobj = req.body;
	  console.log(myobj)
	  var device = {joueur2:myobj.joueur2};
	  var key={_id: new ObjectID(myobj['_id'])};
	  const student = await dbo.collection('parties').updateOne(key, {$set:device},{upsert:true});
	  res.status(200).json(student)
	  
  })
  
  app.post('/addpartie', async (req,res) => {
	  try {
		  var coll = 'parties';
		  var myobj = req.body;
		  myobj.joueur2 = ""; 
		  myobj.date = new Date();
		  myobj.plateau = createPlateau(12);
		  myobj.plateauInitial =  myobj.plateau;
		  //console.log(myobj)
		  if (myobj['_id'] !== "") {
			myobj['_id'] = new ObjectID(myobj['_id']);
			const student = await dbo.collection(coll).replaceOne({_id:myobj['_id']},myobj)
			res.status(200).json(student)
		  }
		  else {
			myobj['_id'] = new ObjectID();
			const student = await dbo.collection(coll).insertOne(myobj)
			res.status(200).json(student)
		  }  
	  } catch (err) {
		  console.log(err)
		  throw err
	  }  
  })

  
//**************
//**** game ****
//**************

function getValidXY(X,Y,plateausize){
	return X>=0 && Y>=0 && X < plateausize && Y < plateausize;
} 

function getCell(X,Y,plateau){
	return plateau[Y][X];
} 

function checkCell (X, Y, COL,plateau){
	var colorActuel = COL;
	var cellColor = getCell(X,Y,plateau)
	return colorActuel == cellColor;
}

function checkRight (X, Y, COL, plateau,plateausize){
	var colorActuel = COL;
	if(getValidXY(X+1,Y,plateausize)){
		var cellColor = getCell(X+1,Y,plateau)
		return colorActuel == cellColor;
	}
	else return false;
}

function checkLeft(X, Y, COL,plateau,plateausize){
	var colorActuel = COL;
	if(getValidXY(X-1,Y,plateausize)){
		var cellColor = getCell(X-1,Y,plateau)
		return colorActuel == cellColor;
	}
	else return false;
}

function checkTop(X, Y, COL,plateau,plateausize){
	var colorActuel = COL;
	if(getValidXY(X,Y-1,plateausize)){
		var cellColor = getCell(X,Y-1,plateau)
		return colorActuel == cellColor;
	}
	else return false;
}

function checkBottom(X, Y, COL,plateau,plateausize){
	var colorActuel = COL;
	if(getValidXY(X,Y+1,plateausize)){
		var cellColor = getCell(X,Y+1,plateau)
		return colorActuel == cellColor;
	}
	else return false;
}


function AiGame(idpart){}


function createPlateauInit(plateausize) {
	var plateau = new Array(plateausize);
	for (i = 0; i < plateausize; i++) plateau[i] = new Array(plateausize);
	for (var i = 0; i < plateausize; i++) {
		for (var j = 0; j < plateausize; j++) {
			plateau[i][j] = 1;
		}
	}
	return plateau;
}

function createPlateau(plateausize) {
	var plateau = new Array(plateausize);
	for (i = 0; i < plateausize; i++) plateau[i] = new Array(plateausize);
	for (var i = 0; i < plateausize; i++) {
		for (var j = 0; j < plateausize; j++) {
			var vtp = Math.floor(Math.random() * 4);
			plateau[i][j] = vtp;
		}
	}
	return plateau;
}



httpServer.listen(8000);