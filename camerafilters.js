const cameraEventFilters={filters:{Face:{}},expanded:false,dirty:false,geometry:null,areaLabel:'',drawing:false,points:[],photo:null,photoUrl:null};
const cameraFilterTypes={
 Face:{icon:'face',description:'Características do rosto nas capturas.',fields:[['gender','Gênero',['Masculino','Feminino']],['beard','Barba',['Sim','Não']],['glasses','Óculos',['Sem óculos','Óculos de grau','Óculos de sol']],['mask','Máscara',['Sim','Não']]]},
 Corpo:{icon:'body',description:'Vestuário e acessórios da pessoa.',fields:[['gender','Gênero',['Masculino','Feminino']],['top','Roupa superior',['Camiseta','Camisa','Jaqueta','Moletom']],['topColor','Cor da roupa superior',['Preta','Branca','Azul','Vermelha','Verde','Cinza','Amarela']],['bottom','Roupa inferior',['Calça','Bermuda','Saia']],['bottomColor','Cor da roupa inferior',['Preta','Branca','Azul','Cinza','Bege']],['backpack','Mochila',['Sim','Não']]]},
 Veículo:{icon:'car',description:'Identifique veículos por aparência e placa.',fields:[['kind','Tipo de veículo',['Carro','Moto','Caminhonete','Van','Ônibus','Caminhão']],['color','Cor',['Preto','Branco','Prata','Cinza','Azul','Vermelho','Verde']],['brand','Marca',['Chevrolet','Fiat','Ford','Honda','Hyundai','Jeep','Renault','Toyota','Volkswagen']],['plate','Placa',null]]}
};
function cameraFilterIcon(type){
 const icon=secEl('span','camera-filter-icon');icon.setAttribute('aria-hidden','true');
 const paths={face:'<rect x="5" y="3" width="14" height="18" rx="6"/><path d="M9 10h.01M15 10h.01M9 15q3 3 6 0M2 7V2h5M17 2h5v5M22 17v5h-5M7 22H2v-5"/>',body:'<circle cx="12" cy="4" r="2"/><path d="M5 11l7-4 7 4M12 7v7m0 0-4 8m4-8 4 8"/>',car:'<path d="m5 8 2-5h10l2 5M3 8h18v10H3zM6 18v3m12-3v3M6 12h2m8 0h2"/>'};
 icon.innerHTML='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">'+paths[cameraFilterTypes[type].icon]+'</svg>';return icon;
}
function cameraFilterDescription(type,values){return cameraFilterTypes[type].fields.filter(([key])=>values[key]).map(([key,label])=>label+': '+values[key]).join(' · ')||'Todos os eventos de '+type.toLowerCase()}
function refreshCameraEvents(){cameraEventFilters.dirty=true;showPage('Security')}
function showCameraEventFilters(container){
 const active=Object.keys(cameraEventFilters.filters),choices=secEl('div','camera-filter-choices');
 for(const type of Object.keys(cameraFilterTypes)){
  const button=secButton('',()=>openCameraFilter(type),'camera-filter-choice'+(active.includes(type)?' is-active':''));button.setAttribute('aria-label',(active.includes(type)?'Alterar':'Criar')+' filtro de '+type);button.append(cameraFilterIcon(type),secEl('strong',null,type),secEl('small',null,active.includes(type)?'Ativo · alterar':'Adicionar'));choices.append(button);
 }container.append(choices);
 for(const type of active){const row=secEl('div','camera-filter-description');row.append(secEl('strong',null,type),secEl('span',null,cameraFilterDescription(type,cameraEventFilters.filters[type])));container.append(row)}
}
function openCameraFilter(type){
 const definition=cameraFilterTypes[type],saved=cameraEventFilters.filters[type],dialog=secEl('dialog','findface-dialog camera-filter-dialog');dialog.setAttribute('aria-labelledby','camera-filter-title');
 const heading=secEl('h2',null,'Filtro de '+type.toLowerCase());heading.id='camera-filter-title';dialog.append(securityCloseButton('Fechar filtro de '+type,dialog),cameraFilterIcon(type),heading,secEl('p',null,definition.description));
 const form=secEl('form','sec-form camera-filter-form'),fields=secEl('div','camera-filter-fields'),inputs={};
 for(const [key,label,options] of definition.fields){
  const field=secEl('div'),caption=secEl('label',null,label),input=secEl(options?'select':'input');input.id='camera-filter-'+key;caption.htmlFor=input.id;
  if(options){const any=secEl('option',null,'Qualquer');any.value='';input.append(any);for(const value of options){const option=secEl('option',null,value);option.value=value;input.append(option)}}else{input.type='text';input.placeholder='ABC1D23';input.maxLength=7;input.autocomplete='off';input.oninput=()=>{input.value=input.value.toUpperCase().replace(/[^A-Z0-9]/g,'')}}
  input.value=saved?.[key]||'';inputs[key]=input;field.append(caption,input);fields.append(field);
 }form.append(fields,secEl('p','camera-filter-help','Preencha somente o que deseja filtrar. Os demais atributos ficam livres.'));
 const actions=secEl('div','camera-filter-actions');
 if(saved)actions.append(secButton('Remover filtro',()=>{delete cameraEventFilters.filters[type];dialog.close();refreshCameraEvents()},'camera-filter-remove'));
 actions.append(secButton('Cancelar',()=>dialog.close()),Object.assign(secEl('button','sec-primary','Salvar filtro'),{type:'submit'}));form.append(actions);
 form.onsubmit=event=>{event.preventDefault();cameraEventFilters.filters[type]=Object.fromEntries(Object.entries(inputs).map(([key,input])=>[key,input.value.trim()]));dialog.close();refreshCameraEvents()};
 dialog.append(form);dialog.addEventListener('close',()=>dialog.remove(),{once:true});document.body.append(dialog);dialog.showModal();
}
function runCameraEventSearch(service,form,initial=false){
 const values=securityState.values.camera||{},center=activeMap.getCenter(),area=values.area,origin=area?[(area[0]+area[2])/2,(area[1]+area[3])/2]:[center.lng,center.lat],date=form.querySelector('#sec-end')?.value||'2026-11-15';
 const types=Object.keys(cameraEventFilters.filters),selected=types.length?types:['Face'];
 const gender=cameraEventFilters.filters.Face?.gender,people=gender?securityPeople.filter(person=>['person-01','person-03','person-05'].includes(person.id)===(gender==='Masculino')):securityPeople;
 const rows=selected.flatMap((type,typeIndex)=>Array.from({length:3},(_,i)=>({title:'Evento '+type+' · Câmera '+String(typeIndex*3+i+1).padStart(2,'0'),code:'HX-CAMERA-'+cameraFilterTypes[type].icon.toUpperCase()+'-'+String(i+1).padStart(3,'0'),date,description:date+' · Câmera '+String(typeIndex*3+i+1).padStart(2,'0'),coordinate:cameraSearchPoint(typeIndex*3+i,origin),captureTime:values.specificTime?(values.timeStart||'09:00'):((10+typeIndex*3+i)+':24'),personId:people[i%people.length].id,eventType:type,filterDescription:cameraEventFilters.filters[type]?cameraFilterDescription(type,cameraEventFilters.filters[type]):''})));
 securityState.results.camera=rows;
 if(!initial){securityState.history.unshift({service:'camera',time:new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}),label:selected.join(', ')+' · '+rows.length+' eventos'});showSecurityLocations(rows)}
}
