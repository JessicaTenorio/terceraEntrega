const hbs = require('hbs');


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


 hbs.registerHelper('selectCursos',(listado)=>{
   let texto;   
 try{
  if(listado.length>0){
      texto="<select name='curso2' class='form-control' id='exampleFormControlSelect1'>";
      listado.forEach(curso=>{      
          texto=texto+
            `<option value="${curso.idCurso}">${curso.nombre}</option>`
      })
      texto=texto+` </select>`     
  }else{
      texto="No hay cursos"
  }
}catch(err){
  texto="Error listando cursos "+err

}
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

function listarInscritosForm (id_curso, matriculas) {   
  texto2="<table class='table table-striped'>\
    <thead class='thead-dark'> \
    <th> Documento </th>\
    <th> Nombre </th>\
    <th> Correo </th>\
    <th> Telefono </th>\
    </thead>\
    <tbody>";  

          matriculas.forEach(ins=>{
            if(ins.idCurso==id_curso){                       
              texto2=texto2+`<tr>
              <td> ${ins.idUsuario}</td>
              <td> ${ins.nombre}</td>
              <td> ${ins.correo}</td>
              <td> ${ins.telefono}</td>
              </tr>`; 
            }         
          }) 
          texto2=texto2+ '</tbody></table>'; 

   return texto2;
};


hbs.registerHelper('listarCursosInscritos', (cursos, matriculas)=>{      
  let texto="";
  try{
      
       texto="<div class='accordion' id='accordionExample2'>";
     
       cursos.forEach(curso=>{
          
           texto=texto +
              `Nombre del curso: ${curso.nombre} <br>
                     Valor: $${curso.valor} <br>
                     Estado: ${curso.estado} <br>                      
                 
                 <div class="card-body"> 
                    ${listarInscritosForm(curso.idCurso, matriculas)}
                 </div>`              
       })               
  }catch(error){
       texto="** Error listando cursos"
  }

  return texto;

});