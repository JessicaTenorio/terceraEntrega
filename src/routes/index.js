const express = require('express')
const app = express()
const path = require('path')
const hbs = require ('hbs')
const Curso = require('./../models/curso')
const Usuario = require('./../models/usuario')
const Matricula = require('./../models/matricula')
const dirViews= path.join(__dirname, '../../template/views')
const dirPartials = path.join(__dirname, '../../template/partials')
const bcrypt = require('bcrypt');



require('./../helpers/helpers')

//hbs
app.set('view engine', 'hbs')
app.set('views', dirViews)
hbs.registerPartials(dirPartials)



app.get('/', (req, res)=>{
    res.render('index', {
          titulo: 'Inicio',
    })
});

app.get('/registroUsuario', (req, res)=>{
    res.render('registroUsuario')
});

app.post('/registrar', (req, res)=>{
   
    let usuario= new Usuario({
        identidad: req.body.identidad,
        nombre: req.body.nombre,
        password: bcrypt.hashSync(req.body.password, 10),
        correo: req.body.correo,
        telefono: req.body.telefono,
        rol: "Aspirante"      
    });   

    usuario.save((err, resultado)=>{
        if(err){
            res.render('registroUsuario', {
                response: "Error registrando el usuario "+err
             });
           
        }else{
            res.render('registroUsuario', {
                response: "**Se ha registrado exitosamente "+ resultado.nombre
             });            
        }        
    })  
});

app.post('/ingresar', (req,res)=>{
    Usuario.findOne({identidad: req.body.usuario}, (err,resultado)=>{
        if(err){
            return console.log(err)
        }

        if(!resultado){
            return res.render('ingresar',{
                mensaje: "**Usuario o clave incorrecta"               
            })  
        }
        
        if(!bcrypt.compareSync(req.body.password, resultado.password)){
           return res.render('ingresar',{
                mensaje: "**Usuario o clave incorrecta"               
            })
        }        
        req.session.usuario = resultado._id
        req.session.nombre = resultado.nombre
        req.session.rol = resultado.rol
        req.session.identidad = resultado.identidad
        req.session.correo = resultado.correo
        req.session.telefono = resultado.telefono

        res.render('ingresar',{
           mensaje: "BIENVENIDO " + resultado.nombre,
           session:true,
           nombre: req.session.nombre,
           rol: req.session.rol              
        })        
    })
})


app.get('/registroCurso', (req, res)=>{
    res.render('registroCurso')
});

app.post('/guardar', (req, res)=>{
    let inten=req.body.intensidad;
    
    if(inten===null || inten==undefined || inten==""){
       inten="-";
    }
    let curso= new Curso({
        nombre: req.body.nombre,
        idCurso: req.body.idCurso,
        descripcion: req.body.descripcion,
        valor: req.body.valor,
        modalidad: req.body.modalidad,
        intensidad: inten,
        estado: 'Disponible'
    });   

    curso.save((err, resultado)=>{
        if(err){
            res.render('registroCurso', {
                response: "Error registrando el curso "+err
             });
           
        }else{
            res.render('registroCurso', {
                response: "**Se ha registrado exitosamente "+ resultado.nombre
             });            
        }        
    })  
});


app.get('/verCurso', (req,res)=>{
    Curso.find({estado:"Disponible"}).exec((err,respuesta)=>{
        if(err){
            console.log(err)
            res.render('verCurso',{
                listado : null
            })
            
        }else{
            res.render('verCurso',{
                listado : respuesta
            })
        }
    })
})

app.get('/inscribir', (req,res)=>{
    
    Curso.find({estado:"Disponible"}).exec((err,respuesta)=>{
        
        if(err){
            console.log(err)
            res.render ('inscripcion',{
                identidad : req.session.identidad,
                nombre : req.session.nombre,
                correo : req.session.correo,
                telefono : req.session.telefono,
                listado: null
            })
            
        }else{
            res.render ('inscripcion',{
                identidad : req.session.identidad,
                nombre : req.session.nombre,
                correo : req.session.correo,
                telefono : req.session.telefono,
                listado: respuesta
            })
        }
    })    
})

app.post('/inscribir', (req, res)=>{    

    let matricula=new Matricula({
        idUsuario: req.session.identidad,          
        idCurso: req.body.curso,
        nombre: req.session.nombre,
        correo: req.session.correo,
        telefono: req.session.telefono 
    });   

    Matricula.find({idUsuario:req.session.identidad, idCurso:req.body.curso}).exec((err,respuesta)=>{
       
        if(err){
            console.log(err)
            return res.render ('indexpost',{
                response: "Error realizando consulta en la BD"
            })            
        }
        if(respuesta.length>0){ 
            
            return res.render ('indexpost',{
                response: "Usted ya se encuentra matriculado en el curso seleccionado"
            }) 
            
        }else{
            matricula.save( (err, resultado)=>{
                if(err){
                     res.render('indexpost', {
                        response: "Error registrando la matricula "+err
                     })
                   
                }else{
                    res.render('indexpost', {
                        response: "**Se ha matriculado exitosamente al curso"
                     })        
                }        
            }) 
        }        
    })
});

app.get('/verInscritos', (req, res)=>{
    let list;
    Curso.find({estado:"Disponible"}).exec((err,respuesta)=>{
        
        if(err){
            console.log(err)
            list=null;          
        }else{
            list=respuesta;
        }
    });
    Curso.find({}).exec((err,respuesta)=>{
        
        if(err){
            console.log(err)
            res.render ('verInscritos',{                
                listado: null,
                cursos: null
            })            
        }else{
            res.render ('verInscritos',{ 
                listado: list,              
                cursos: respuesta
            })
        }
    });   
});

app.post('/cambiar', (req, res)=>{
    let list;
    let resp;
    Curso.updateOne({idCurso: req.body.curso}, {$set:  {estado: "Cerrado" }},
     (err, resultado)=>{
         if(err){
           resp = "Error al actualizar curso"            
         }else{
            resp = "Actualizó correctamente"            
         }        
     })
     
    Curso.find({estado:"Disponible"}).exec((err,respuesta)=>{
        
        if(err){
            console.log(err)
            list=null;          
        }else{
            list=respuesta;
        }
    });
    Curso.find({}).exec((err,respuesta)=>{
        
        if(err){
            console.log(err)
            res.render ('verInscritos',{                
                listado: null,
                cursos: null,
                response: resp
            })            
        }else{
            res.render ('verInscritos',{ 
                listado: list,              
                cursos: respuesta,
                response: resp
            })
        }
    });   
    
});

app.get('/eliminaInscrito', (req, res)=>{
    res.render('eliminaInscrito')
});


app.get('/salir', (req, res)=>{
    req.session.destroy((err)=>{
        if(err) return console.log(err)
    })
    res.redirect('/')
});


app.get('*', (req, res)=>{
    res.render('error',{
        titulo:"Error 404",
    })
});

module.exports = app