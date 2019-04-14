const hbs = require('hbs');
const Matricula = require('./../models/matricula');
const Curso = require('./../models/curso');


hbs.registerHelper('listarDisponibles', (listado)=>{   
    
    let texto;
    
    if(listado.length>0){
        texto="<div class='accordion' id='accordionExample'>";
        let i=1;
        listado.forEach(curso=>{
            texto=texto +
                `<div class="card">
                <div class="card-header" id="heading${i}">
                  <h2 class="mb-0">
                    <button class="btn btn-link" type="button" data-toggle="collapse" data-target="#collapse${i}" aria-expanded="true" aria-controls="collapse${i}">
                      Nombre del curso: ${curso.nombre} <br>
                      Valor $${curso.valor}
                    </button>
                  </h2>
                </div>
            
                <div id="collapse${i}" class="collapse" aria-labelledby="heading${i}" data-parent="#accordionExample">
                  <div class="card-body">
                     Descripcion detallada: ${curso.descripcion} <br>
                     Modalidad: ${curso.modalidad} <br>
                     Intensidad horaria: ${curso.intensidad} <br>
                  </div>
                </div>
              </div>`
              i=i+1;
        })
        texto=texto+ `</div>`;
        
   }else{
        texto="No hay cursos disponibles"
   }

   return texto;

 
 });

 hbs.registerHelper('selectCursos', ()=>{
   let texto="";
  Curso.find({}).exec((err,respuesta)=>{  

  if(respuesta.length>0){
      texto="<select name='curso2' class='form-control' id='exampleFormControlSelect1'>";
      respuesta.forEach(curso=>{
          texto=texto+
            `<option value="${curso.idCurso}">${curso.nombre}</option>`
      })
      texto=texto+` </select>`     
  }else{
      texto="No hay cursos"
  }

}) 
 return texto;
});


 hbs.registerHelper('selectDisponibles', (listado)=>{
  let texto;
  if(listado.length>0){
      texto="<select name='curso' class='form-control' id='exampleFormControlSelect1'>";
      listado.forEach(curso=>{
          texto=texto+
            `<option value="${curso.idCurso}">${curso.nombre}</option>`
      })
      texto=texto+` </select>`     
  }else{
      texto="No hay cursos disponibles"
  }
 return texto;
});

function listarInscritosForm (id_curso) {   
  let texto2="";
  
  texto2="<table class='table table-striped'>\
  <thead class='thead-dark'> \
  <th> Documento </th>\
  <th> Nombre </th>\
  <th> Correo </th>\
  <th> Telefono </th>\
  </thead>\
  <tbody>";
  Matricula.find({idCurso:id_curso}).exec((err,respuesta)=>{
     
    if(err){
         console.log(err)        
         return texto2= "Error realizando consulta en la BD";                   
    }else{
          respuesta.forEach(ins=>{            
              texto2=texto2+`<tr>
              <td> ${ins.identidad}</td>
              <td> ${ins.nombre}</td>
              <td> ${ins.correo}</td>
              <td> ${ins.telefono}</td>
              </tr>`;          
          })   
    }
  })

  texto2=texto2+ '</tbody></table>'; 

  return texto2;
};


hbs.registerHelper('listarCursosInscritos', (cursos)=>{      
  let texto="";
  try{
      
       texto="<div class='accordion' id='accordionExample2'>";
     
       let i=1;
       cursos.forEach(curso=>{
          
           texto=texto +
              `Nombre del curso: ${curso.nombre} <br>
                     Valor: $${curso.valor} <br>
                     Estado: ${curso.estado} <br>                      
                 
                 <div class="card-body"> 
                    ${listarInscritosForm(curso.idCurso)}
                 </div>`              
       })               
  }catch(error){
       texto="** No hay cursos"
  }

  return texto;

});




