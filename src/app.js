require('./config/config')
const express = require('express');
const app = express ();
const path = require('path');
const bodyParser= require('body-parser');
const mongoose = require('mongoose');
//### Para usar las variables de sesión
const session = require('express-session')
var MemoryStore = require('memorystore')(session)

//Paths
const directoriopublico = path.join(__dirname, '../public')
const dirNode_modules = path.join(__dirname, '../node_modules')


//Static
app.use(express.static(directoriopublico));
app.use('/css', express.static(dirNode_modules + '/bootstrap/dist/css'));
app.use('/js', express.static(dirNode_modules + '/jquery/dist'));
app.use('/js', express.static(dirNode_modules + '/popper.js/dist'));
app.use('/js', express.static(dirNode_modules + '/bootstrap/dist/js'));


app.use(session({
	cookie: { maxAge: 86400000 },
 	store: new MemoryStore({
      	checkPeriod: 86400000 // prune expired entries every 24h
    	}),
  	secret: 'keyboard cat',
  	resave: true,
  	saveUninitialized: true
}))


app.use((req, res, next)=>{
    if(req.session.usuario){
        res.locals.session = true
        res.locals.nombre = req.session.nombre
        res.locals.rol= req.session.rol
    }
    next()
})


//BodyParser
app.use(bodyParser.urlencoded({extended:false}))

app.use(require('./routes/index'));



mongoose.connect(process.env.URLDB, {useNewUrlParser: true, useCreateIndex: true}, 
(err, resultado)=>{
    if(err){
        return console.log(err)
    }

    console.log("conectado");
});

app.listen(process.env.PORT, ()=>{
    console.log('Servidor escuchando en el puerto '+ process.env.PORT)
})

