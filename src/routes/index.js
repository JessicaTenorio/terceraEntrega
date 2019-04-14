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
    if(!req.session.usuario){
       res.render('registroUsuario')
    }else{
        res.render('error',{
            titulo:"Error 404",
        })  
    }
    
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

        if(resultado.rol=='Coordinador'){
            req.session.rolCoordinador=true;
        }else{
            req.session.rolCoordinador=false; 
        }

        if(resultado.rol=='Aspirante'){
            req.session.rolAspirante=true;
        }else{
            req.session.rolAspirante=false; 
        }

        req.session.usuario = resultado._id
        req.session.nombre = resultado.nombre
        req.session.identidad = resultado.identidad
        req.session.correo = resultado.correo
        req.session.telefono = resultado.telefono

        res.render('ingresar',{
           mensaje: "BIENVENIDO " + resultado.nombre,
           session:true,
           nombre: req.session.nombre,
           rolC: req.session.rolCoordinador,
           rolA: req.session.rolAspirante            
        })        
    })
})


app.get('/registroCurso', (req, res)=>{
    if(req.session.rolCoordinador){
        res.render('registroCurso')
    }else{
        res.render('error',{
            titulo:"Error 404",
        }) 
    }
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
  if(req.session.rolAspirante){  
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
 } else{
    res.render('error',{
        titulo:"Error 404",
    })
 } 
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
  if(req.session.rolCoordinador){   
    let list;
    let curs;
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
            curs = null
                      
        }else{           
            curs= respuesta          
        }
    }); 
    Matricula.find({}).exec((err,respuesta)=>{        
        if(err){
            console.log(err)
            res.render ('verInscritos',{                
                listado: null,
                cursos: null,
                matriculas: null
            })            
        }else{
            res.render ('verInscritos',{ 
                listado: list,              
                cursos: curs,
                matriculas: respuesta
            })
        }
    }); 
}else{
    res.render('error',{
        titulo:"Error 404",
    })
}   
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
            curs = null
                      
        }else{           
            curs= respuesta          
        }
    }); 
    Matricula.find({}).exec((err,respuesta)=>{        
        if(err){
            console.log(err)
            res.render ('verInscritos',{                
                listado: null,
                cursos: null,
                matriculas: null,
                response: resp
            })            
        }else{
            res.render ('verInscritos',{ 
                listado: list,              
                cursos: curs,
                matriculas: respuesta,
                response: resp
            })
        }
    });    
});

app.get('/eliminaInscrito', (req, res)=>{
  if(req.session.rolCoordinador){  
    Curso.find({}).exec((err,respuesta)=>{          
        if(err){ 
            console.log(err)
            return res.render('eliminaInscrito',{
                listado: null
            })
        }else{              
             res.render('eliminaInscrito',{                
                listado: respuesta
            }) 
        }
    })
  }else{
    res.render('error',{
        titulo:"Error 404",
    }) 
  }    
});

app.post('/eliminar', (req, res)=>{
    let lista;
    let response;
    let curs;
    Curso.find({}).exec((err,respuesta)=>{          
        if(err){ 
            console.log(err)
            lista= null           
        }else{                           
            lista= respuesta           
        }
    })    
    Matricula.deleteOne({idUsuario:req.body.identidad2, idCurso:req.body.curso2}).exec((err,respuesta)=>{
        
        if(err){
            console.log(err)
            response= "Error al eliminar matricula"            
        }else if(respuesta.deletedCount==0){
              response= 'No se encontro registro con el documento de identidad '+req.body.identidad2+ ' para el curso seleccionado'            
        }else{       
            response= 'Eliminación exitosa '
        }        
    })     
    Curso.find({idCurso:req.body.curso2}).exec((err,respuesta)=>{
        
        if(err){
            console.log(err)
            curs = null                      
        }else{           
            curs= respuesta          
        }
    }); 
    Matricula.find({}).exec((err,respuesta)=>{        
        if(err){
            console.log(err)
            res.render ('eliminaInscrito',{                
                listado: lista,
                response: response,
                cursos: curs,
                matriculas: null
            })            
        }else{
            res.render ('eliminaInscrito',{ 
                listado: lista,
                response: response,
                cursos: curs,
                matriculas: respuesta
            })
        }
    });    
})       


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