var express = require('express');
var path = require('path');
var net = require('net');
const readline = require("readline");

var secp256k1 = require('secp256k1');

let user = require('../models/User')
let wallet = require('../models/Wallet')
let header = require('../public/script/embedded_html')
const newUser = new user();

var crypto = require("crypto");
var algorithm = "aes-192-cbc"; //algorithm to use
const chalk = require('chalk');

//var new_Transaction = new transaction(0, '0001', Date.now());

var router = express.Router();

var ssn;

router.get('/', function (req, res, next) {
	res.render('index.ejs', {
		header: header
	});
});

router.get('/email', function (req, res, next) {
	res.render('email.ejs', {
		header: header
	});
	//console.log(req.session);
});

router.get('/inbox', function (req, res, next) {
	console.log('Client called :: /inbox');
	var data = {
		protocol: 4,
		publicKey: req.session.publicKey
	};

	const clients = net.connect({port: 2222}, (err) => {
		if(err) console.log( err);

		console.log(clients.address());

		// 'connect' listener
		console.log('connected to server!');

			//var new_Transaction = emit_Transaction(req.body);
			clients.write(JSON.stringify(data));

	});
	clients.on('data', (data) => {
		console.log("Client REQUESTED chain data");

		data = JSON.parse(data);

console.log(chalk.blue(data));
		const key = crypto.scryptSync(req.session.publicKey, 'salt', 24); //create key

		var messages = [];
		var countz = 0;

		for(var i = 0; i < data.length; i++){
			var iv = data[i].output.iv;
			//console.log(chalk.yellow(iv));
			iv = Buffer.from(iv, 'hex');
			const decipher = crypto.createDecipheriv(algorithm, key, iv);
			var decrypted = decipher.update(data[i].output.email, 'hex', 'utf8') + decipher.final('utf8'); //deciphered text
console.log(chalk.green(countz));
			messages[countz] = JSON.parse(decrypted);
			console.log(decrypted);
			countz = countz + 1;
		}

console.log(messages);
		res.render('inbox.ejs', {
			header: header,
			'messages': messages
		});
		//clients.end();
	});
	clients.on('end', () => {
		console.log('disconnected from server');
		//res.send({"Success":"Success!"});
	});
});


router.get('/root', function (req, res, next) {
	res.render('root.ejs', {
		header: header
	});
});


router.get('/register', function (req, res, next) {
	pubKey = newUser.publicKey;
	publicKey = Buffer.from(pubKey).toString('hex')

	res.render('register.ejs', {
		privateKey: newUser.privateKey.toString('hex'),
		publicKey: publicKey,
		address: newUser.address,
		amount: 0,
		header: header
	});
});

router.get('/buy', function (req, res, next) {
	res.render('buy.ejs', {
		header: header
	});
});

function send_Data(transaction){

var hold = "";
var flag = false;

		//*************************************************************************************************************************************
		// BEGIN CLIENT SIDE TCP CONNECTION TO NODE
		//*************************************************************************************************************************************

	const clients = net.connect({port: 2222}, (err) => {
		if(err) console.log( err);

		console.log(clients.address());

		// 'connect' listener
		console.log('connected to server!');

			//var new_Transaction = emit_Transaction(req.body);
			clients.write(JSON.stringify(transaction));

	});
	clients.on('data', (data) => {
		//console.log(data.toString());

		if(transaction.protocol == 3){
			flag = true;
			hold = data.toString();
			return new Promise(resolve => {
		 			resolve(data.toString());
 			});
		}
		//clients.end();
	});
	clients.on('end', () => {
		console.log('disconnected from server');
		//res.send({"Success":"Success!"});
	});

	//*************************************************************************************************************************************
	// END CLIENT SIDE TCP CONNECTION TO NODE
	//*************************************************************************************************************************************
	if(flag){
		console.log(hold);
	return new Promise(resolve => {
			resolve("hey");
	});
}
}

async function get_Transactions(data){
	const transaction_Packet = await send_Data(data);

	return transaction_Packet;

}


router.get('/login', function (req, res, next) {
	res.render('login.ejs', {
		header: header
	});
});

router.post('/login', function (req, res, next) {
	var pub_key = req.body.pub_key;
	var priv_key = req.body.priv_key;

console.log('/login');

	var attempt = "";

	try{

		attempt = secp256k1.publicKeyCreate(Uint8Array.from(Buffer.from(priv_key, 'hex')));

	  attempt = Buffer.from(attempt).toString('hex')

	}catch(e){

		console.log(e);

	}

	if(attempt == pub_key){
		console.log("Success!");

		try{
			req.session.publicKey = pub_key;
			req.session.privateKey = priv_key;

			var transaction = {};

			transaction.publicKey = req.session.publicKey;

			transaction.protocol = 001;

			//send_Data(transaction);

		} catch (e){

		console.log("SERVER ERROR :: " + e);

		}


		res.send({"Success":"Success!"});
	}else{
		console.log("Failure");
		res.send({"Success":"Failure!"});
	}
});


router.post('/send_email', function (req, res, next) {
	var transaction = req.body;

	transaction.recipients = transaction.recipients.split(",");

	console.log('/send_email');

	try{
		transaction.privateKey = req.session.privateKey;
		transaction.publicKey = req.session.publicKey;
}catch(e){
	console.log(e);
}

 transaction.protocol = 002;

	try{

		send_Data(transaction);

	} catch (e){

	console.log("SERVER ERROR :: " + e);

	}

});

function formatted_date()
{
	 var result="";
	 var d = new Date();
	 if(d.getHours() > 12){
		 if(d.getMinutes() < 10){
										result = (d.getHours() - 12)+":0"+d.getMinutes()+ " pm";
		 }else{
										result = (d.getHours() - 12)+":"+d.getMinutes() + " pm";
		 }
	 }else{
	 result = d.getHours()+":"+d.getMinutes()+" am";
 }
	 return result;
}

router.get('/transactions', function (req, res, next) {
	console.log('Client called :: /transactions');
	var data = {
		protocol: 3
	};

	const clients = net.connect({port: 2222}, (err) => {
		if(err) console.log( err);

		console.log(clients.address());

		// 'connect' listener
		console.log('connected to server!');

			//var new_Transaction = emit_Transaction(req.body);
			clients.write(JSON.stringify(data));

	});
	clients.on('data', (data) => {
		console.log("Client REQUESTED chain data");

		data = JSON.parse(data);

		console.log(data);

		res.render('transactions.ejs', {
			'blocks': data,
			header: header,
			time: formatted_date()
		});
		//clients.end();
	});
	clients.on('end', () => {
		console.log('disconnected from server');
		//res.send({"Success":"Success!"});
	});
});

router.post('/transaction', function (req, res, next){
console.log('Client called :: /transaction');
try{
	var uint = Uint8Array.from(Buffer.from(req.body.priv_key, 'hex'));
	var result = secp256k1.publicKeyCreate(uint);
	result = Buffer.from(result, 'uint8');
	result = result.toString('hex');
}	catch(e){
	console.log("SERVER ERROR :: " + e);
}


if(result == req.body.pub_key){
	var transaction = req.body;

	transaction.protocol = 002;

	try{

		send_Data(transaction);

	} catch (e){

		console.log("SERVER ERROR :: " + e);

	}

}else{
	console.log("/transaction says :: 'INVALID KEY PAIR PROVIDED'");
}
});

router.get('/blocks', function (req, res, next) {
	console.log('Client called :: /blocks');
	var data = {
		protocol: 3
	};

	const clients = net.connect({port: 2222}, (err) => {
		if(err) console.log( err);

		console.log(clients.address());

		// 'connect' listener
		console.log('connected to server!');

			//var new_Transaction = emit_Transaction(req.body);
			clients.write(JSON.stringify(data));

	});
	clients.on('data', (data) => {
		console.log("Client REQUESTED chain data");

		data = JSON.parse(data);

		console.log(data);

		res.render('blocks.ejs', {
			'blocks': data,
			header: header
		});
		//clients.end();
	});
	clients.on('end', () => {
		console.log('disconnected from server');
		//res.send({"Success":"Success!"});
	});
});
	//connection.query("SELECT * FROM classes WHERE search_code= '"+req.session.search_code+"'", function (err, result, fields)
	//connection.query("SELECT * FROM classes WHERE search_code= '"+req.body.search_code+"'", function (err, result, fields) {
		//if (err) throw err;

module.exports = router;
