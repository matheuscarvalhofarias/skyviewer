// Local service catalog.
const securityServices=[
  {id:'camera',name:'FindFace · Camera Events',group:'Eventos e monitoramento',description:'Explore eventos de face, corpo e veículos.',icon:'camera'},
  {id:'watchlists',name:'Watchlists',group:'Eventos e monitoramento',description:'Organize listas e registros.',icon:'bookmark'},
  {id:'webhooks',name:'Webhook Events',group:'Eventos e monitoramento',description:'Acompanhe o recebimento de eventos.',icon:'layers'},
  {id:'alerts',name:'Alerts',group:'Eventos e monitoramento',description:'Revise, filtre e reconheça alertas.',icon:'shield'},
  {id:'locator',name:'Device Locator',group:'Dispositivos e localização',description:'Consulte dispositivos em uma área do mapa.',icon:'pin'},
  {id:'ip',name:'Device Tracking by IP',group:'Dispositivos e localização',description:'Explore posições e histórico por IP.',icon:'globe'},
  {id:'device',name:'Device Tracking by ID',group:'Dispositivos e localização',description:'Visualize a trajetória de um dispositivo.',icon:'compass'},
  {id:'identity',name:'Identity Search',group:'Pesquisa e documentos',description:'Consulte um perfil por dados de pesquisa.',icon:'search'},
  {id:'social',name:'Redes Sociais',group:'Pesquisa e documentos',description:'Pesquise a partir de uma imagem.',icon:'search'},
  {id:'geodocs',name:'Geodocs',group:'Pesquisa e documentos',description:'Explore documentos associados a locais.',icon:'bookmark'}
];
const securityPeople=[
 {id:'person-01',name:'Rafael Monteiro',birth:'1988-04-17',city:'Curitiba, PR',photo:'assets/people/rafael.jpg',notes:'Investigado por suspeita de associação criminosa e lavagem de dinheiro. Apontado como articulador de uma rede de empresas de fachada utilizada para movimentar recursos de origem ilícita.'},
 {id:'person-02',name:'Camila Duarte',birth:'1992-09-03',city:'São Paulo, SP',photo:'assets/people/camila.jpg',notes:'Investigada por suspeita de corrupção ativa e fraude em licitações. Apuração indica possível intermediação de vantagens indevidas para direcionamento de contratos públicos.'},
 {id:'person-03',name:'André Vasconcelos',birth:'1985-02-21',city:'Brasília, DF',photo:'assets/people/andre.jpg',notes:'Investigado por suspeita de corrupção passiva, peculato e ocultação de patrimônio. Apuração concentra-se no possível desvio de verbas públicas e na utilização de terceiros para aquisição de bens.'},
 {id:'person-04',name:'Marina Azevedo',birth:'1995-07-12',city:'Porto Alegre, RS',photo:'assets/people/marina.jpg',notes:'Investigada por suspeita de integrar associação criminosa voltada a fraudes financeiras. Apontada como possível responsável pelo recrutamento de intermediários e pela abertura de contas para circulação dos valores.'},
 {id:'person-05',name:'Lucas Menezes',birth:'1990-11-08',city:'Belo Horizonte, MG',photo:'assets/people/lucas.jpg',notes:'Investigado por suspeita de estelionato, falsificação documental e lavagem de dinheiro. Apuração reúne indícios de participação em operações financeiras estruturadas com documentos adulterados.'},
 {id:'person-06',name:'Beatriz Nogueira',birth:'1993-06-25',city:'Recife, PE',photo:'assets/people/beatriz.jpg',notes:'Investigada por suspeita de associação criminosa e fraude em contratos públicos. Apontada como possível elo entre fornecedores e agentes envolvidos no superfaturamento de serviços.'}
];
function securityPerson(item,index=0){return securityPeople.find(p=>p.id===item?.personId)||securityPeople[index%securityPeople.length]}
function personLists(person){return securityState.watchlists.filter(l=>l.members.includes(person.id)).map(l=>l.name).join(', ')||'Sem watchlist'}
const securityState={service:null,query:'',values:{},results:{},history:[],connected:false,acknowledged:new Set(),watchlists:[{name:'Acompanhamento regional',color:'#bc6381',members:['person-01','person-02','person-03','person-04']},{name:'Revisão de cadastros',color:'#6cbcd7',members:['person-05','person-06']}],selectedList:null,personQuery:'',addingPerson:false,features:[],message:''};
const secEl=imageElement;
function secButton(text,fn,cls='sec-secondary'){const button=secEl('button',cls,text);button.type='button';button.onclick=fn;return button}
function securityCloseButton(label,dialog){
 const close=secButton('',()=>dialog.close(),'findface-close');
 close.setAttribute('aria-label',label);
 close.innerHTML='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>';
 return close;
}
function securityIcon(service){
 const span=secEl('span','sec-service-icon'),img=secEl('img');img.src='assets/security/'+service.id+'.svg';img.alt='';span.append(img);
 if(service.id==='geodocs'){const globe=secEl('img','sec-geodocs-globe');globe.src='assets/security/geodocsGlobe.svg';globe.alt='';span.append(globe)}return span;
}
function openSecurityService(id){if(id!=='camera'&&cameraEventFilters.drawing)cancelCameraDrawing();if(id!==securityState.service){securityState.selectedList=null;securityState.personQuery='';securityState.addingPerson=false}securityState.service=id;securityState.message='';showPage('Security');byId('drawer').scrollTop=0}
function securityBreadcrumbs(service){
 const nav=secEl('nav','sec-breadcrumbs');nav.setAttribute('aria-label','Navegação estrutural');const ol=secEl('ol');
 function crumb(text,href,callback){const li=secEl('li'),el=secEl(callback?'a':'span',null,text);if(callback){el.href=href;el.onclick=e=>{e.preventDefault();callback()}}else el.setAttribute('aria-current','page');li.append(el);ol.append(li)}
 crumb('Segurança','#security',()=>openSecurityService(null));
 if(service.id==='watchlists'&&securityState.selectedList!==null){crumb('Watchlists','#security/watchlists',()=>{securityState.selectedList=null;securityState.addingPerson=false;securityState.personQuery='';showPage('Security')});crumb(securityState.watchlists[securityState.selectedList].name)}else crumb(service.name);
 nav.append(ol);return nav;
}
function showSecurity(drawer){
  drawer.querySelector('h2').textContent=securityState.service?securityServices.find(s=>s.id===securityState.service).name:'Segurança';
  if(!securityState.service){
    drawer.append(secEl('div','sec-status','DEFENSE'),secEl('p','sec-intro','Serviços de segurança em um só lugar. Escolha uma ferramenta para começar.'));
    const counts=secEl('div','sec-counts');for(const [value,label] of [['10','serviços'],[securityState.history.length,'consultas nesta sessão']]){const c=secEl('div');c.append(secEl('strong',null,value),secEl('span',null,label));counts.append(c)}drawer.append(counts);
    const input=secEl('input','sec-search');input.placeholder='Buscar serviço…';input.setAttribute('aria-label','Buscar serviço');input.value=securityState.query;const list=secEl('div');
    function render(){list.replaceChildren();const normalize=t=>t.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();const matches=securityServices.filter(s=>normalize(s.name+' '+s.description+' '+s.group).includes(normalize(input.value)));
      for(const group of [...new Set(matches.map(s=>s.group))]){list.append(secEl('h3','sec-section-title',group));for(const service of matches.filter(s=>s.group===group)){const b=secButton('',()=>openSecurityService(service.id),'sec-service');const copy=secEl('span','sec-service-copy');copy.append(secEl('strong',null,service.name),secEl('small',null,service.description));b.append(securityIcon(service),copy,secEl('span','sec-service-arrow','›'));list.append(b)}}
      if(!matches.length)list.append(secEl('p','sec-empty','Nenhum serviço encontrado.'));
    }input.oninput=()=>{securityState.query=input.value;render()};drawer.append(input,list);render();return;
  }
  const service=securityServices.find(s=>s.id===securityState.service);
  drawer.prepend(securityBreadcrumbs(service));
  drawer.append(secEl('div','sec-status','CENTRAL DE OPERAÇÕES'),secEl('p','sec-intro',service.description+''));
  if(service.id==='watchlists'){showSecurityWatchlists(drawer);return}
  if(service.id==='webhooks'){showSecurityWebhooks(drawer);return}
  if(service.id==='alerts'){showSecurityAlerts(drawer);return}
  if(service.id==='social'){showSocialSearch(drawer);return}
  showSecurityForm(drawer,service);
}
function secField(form,id,label,type='text',options){
  const key=securityState.service,values=securityState.values[key]||(securityState.values[key]={});
  const box=secEl('div'),l=secEl('label',null,label),input=secEl(options?'select':'input');input.id='sec-'+id;l.htmlFor=input.id;
  if(options){for(const text of options){const o=secEl('option',null,text);o.value=text;input.append(o)}}else input.type=type;
  if(type!=='file')input.value=values[id]??(options?options[0]:type==='date'?'2026-11-15':type==='time'?'09:00':'');
  input.onchange=()=>{values[id]=type==='file'?(input.files[0]?.name||''):input.value};box.append(l,input);form.append(box);return input;
}
function showSecurityForm(drawer,service){
  const form=secEl('form','sec-form');const id=service.id;
  if(id==='camera'){showCameraEventForm(drawer,service);return}
  const filterPanel=['camera','identity'].includes(id)?secEl('details','findface-filters'):null;
  if(filterPanel){filterPanel.append(secEl('summary',null,id==='camera'?'Área, período e foto':'Filtros de pesquisa'));drawer.querySelector('.sec-intro').textContent=id==='camera'?'Explore os registros e abra um evento para consultar os detalhes.':'Consulte as pesquisas recentes ou abra os filtros para iniciar uma nova consulta.';}
  if(id==='camera')showCameraEventFilters(drawer);
  if(['camera','locator','geodocs'].includes(id)){
    const area=secButton('⌖ Usar área visível do mapa',()=>{const b=activeMap.getBounds();securityState.values[id]||={};securityState.values[id].area=[b.getWest(),b.getSouth(),b.getEast(),b.getNorth()];area.textContent='✓ Área do mapa selecionada';});form.append(area);
  }
  if(id==='ip'){const input=secField(form,'query','Endereço IP');input.placeholder='192.0.2.10';input.value=securityState.values[id]?.query||'192.0.2.10';}
  if(id==='device'){const input=secField(form,'query','ID do dispositivo');input.placeholder='HX-DEVICE-001';input.value=securityState.values[id]?.query||'HX-DEVICE-001';}
  if(id==='identity'){secField(form,'first','Nome');secField(form,'last','Sobrenome');secField(form,'email','E-mail','email');secField(form,'user','Usuário');secField(form,'phone','Telefone','tel');}
  if(['camera','locator','ip','device','geodocs'].includes(id)){
    const dates=secEl('div','sec-field-pair');const start=secField(dates,'start','Data de início','date'),end=secField(dates,'end','Data de fim','date');start.required=true;end.required=true;form.append(dates);
    const times=secEl('div','sec-field-pair');secField(times,'timeStart','Hora inicial','time');secField(times,'timeEnd','Hora final','time');form.append(times);
  }
  if(['social','camera'].includes(id)){const file=secField(form,'photo',id==='social'?'Imagem de referência':'Foto de referência (opcional)','file');file.accept='image/png,image/jpeg';}
  if(id==='geodocs'){secField(form,'query','Pesquisar documentos');secField(form,'kind','Tipo de documento','text',['Todos','Relatório','Boletim','Documento de campo']);}
  const submit=secEl('button','sec-primary','Pesquisar');submit.type='submit';form.append(submit);
  form.onsubmit=e=>{e.preventDefault();if(id==='identity'){const report=runIdentitySearch(form);showPage('Security');openIdentityReport(report);return}const start=form.querySelector('#sec-start'),end=form.querySelector('#sec-end');if(start&&end){end.setCustomValidity(end.value<start.value?'A data final deve ser posterior à inicial.':'');if(!form.reportValidity())return}runSecuritySearch(service,form);showPage('Security');if(id==='camera')drawer.scrollTop=0};
  if(filterPanel){filterPanel.append(form);drawer.append(filterPanel);if(id==='camera'&&!securityState.results[id])runSecuritySearch(service,form,true)}else drawer.append(form);
  if(id==='identity'){showIdentityHistory(drawer);return}
  const history=securityState.history.filter(h=>h.service===id);if(history.length){const h=secEl('details');h.append(secEl('summary',null,'Histórico de consultas ('+history.length+')'));for(const item of history.slice(0,4))h.append(secEl('p','sec-intro',item.time+' · '+item.label));(filterPanel||drawer).append(h)}
  const results=securityState.results[id];
  if(!results){drawer.append(secEl('p','sec-empty','Preencha os filtros para explorar os resultados.'));return}
  const head=secEl('div','sec-result-head');head.append(secEl('strong',null,results.length+' resultados'),secEl('small',null,'REGISTROS'));drawer.append(head);
  if(id==='camera'){results.forEach((item,i)=>drawer.append(findfaceCard(item,i)));return}
  results.forEach((item,i)=>{const card=secEl('article','sec-result');card.append(secEl('strong',null,item.title),secEl('p',null,item.description),secEl('code',null,item.code));const actions=secEl('div','sec-result-actions');
    if(item.coordinate)actions.append(secButton('↗ Ver no mapa',()=>showSecurityLocations([item])));
    actions.append(secButton('Detalhes',()=>{const old=card.querySelector('.sec-detail');if(old){old.remove();return}card.append(secEl('div','sec-detail','Origem: catálogo\nConsulta: '+service.name+'\nRegistro: '+item.code+'\nData: '+item.date+'\nStatus: disponível'))}));card.append(actions);drawer.append(card)});
}
function runSecuritySearch(service,form,initial=false){
  const id=service.id,values=securityState.values[id]||{};const center=activeMap.getCenter();
  if(id==='camera'){runCameraEventSearch(service,form,initial);return}
  const date=form.querySelector('#sec-end')?.value||'2026-11-15';
  const query=form.querySelector('#sec-query')?.value||'';
  const titles=id==='identity'?['Perfil 01','Perfil 02']:id==='social'?['Perfil social 01','Perfil social 02']:id==='geodocs'?['Relatório de campo','Boletim operacional','Vistoria de área']:id==='camera'?['Evento '+(values.event||'Face')+' · Câmera 01','Evento '+(values.event||'Face')+' · Câmera 02','Evento '+(values.event||'Face')+' · Câmera 03']:['Dispositivo 01','Dispositivo 02','Dispositivo 03'];
  const geo=['camera','locator','ip','device','geodocs'].includes(id);const area=values.area;const origin=area?[(area[0]+area[2])/2,(area[1]+area[3])/2]:[center.lng,center.lat];
  const rows=titles.map((title,i)=>({title,code:'HX-'+id.toUpperCase()+'-'+String(i+1).padStart(3,'0'),date,description:date+' · '+(id==='identity'?'Dados pessoais · perfil'+(i+1)+'@example.com':id==='social'?'Perfil · example.com/perfil-'+(i+1):id==='camera'?'Câmera · '+(10+i)+':24 UTC':id==='geodocs'?'Documento georreferenciado':'Posição · Precisão de 100 m'),coordinate:geo?[origin[0]+(i-1)*.007,origin[1]+(i%2?-.004:.004)]:null}));
  if(id==='camera')rows.forEach((row,i)=>{row.personId=securityPeople[i].id;row.eventType=values.event||'Face'});
  securityState.results[id]=rows;if(!initial)securityState.history.unshift({service:id,time:new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}),label:query||service.name});
  if(geo&&!initial)showSecurityLocations(rows,id==='device'||id==='ip');
}
function showSecurityLocations(rows,route=false){
  securityState.features=rows.filter(r=>r.coordinate).map(r=>({type:'Feature',properties:{title:r.title},geometry:{type:'Point',coordinates:r.coordinate}}));
  if(route&&rows.length>1)securityState.features.push({type:'Feature',properties:{},geometry:{type:'LineString',coordinates:rows.map(r=>r.coordinate)}});
  restoreSecurityLayers();const bounds=new mapboxgl.LngLatBounds();rows.forEach(r=>bounds.extend(r.coordinate));activeMap.fitBounds(bounds,{padding:{left:innerWidth>700?500:90,right:65,top:100,bottom:90},maxZoom:14,duration:900,retainPadding:false});
}
function restoreSecurityLayers(){
  if(!activeMap||!securityState.features.length)return;const data={type:'FeatureCollection',features:securityState.features};
  if(activeMap.getSource('security-events'))activeMap.getSource('security-events').setData(data);else activeMap.addSource('security-events',{type:'geojson',data});
  if(!activeMap.getLayer('security-events-route'))activeMap.addLayer({id:'security-events-route',type:'line',source:'security-events',filter:['==',['geometry-type'],'LineString'],paint:{'line-color':'#f082a0','line-width':3,'line-dasharray':[2,2]}});
  if(!activeMap.getLayer('security-events-points'))activeMap.addLayer({id:'security-events-points',type:'circle',source:'security-events',filter:['==',['geometry-type'],'Point'],paint:{'circle-radius':8,'circle-color':'#b7294c','circle-stroke-width':3,'circle-stroke-color':'#fff'}});
}
function clearSecurityMap(){for(const id of ['security-events-points','security-events-route'])if(activeMap?.getLayer(id))activeMap.removeLayer(id);if(activeMap?.getSource('security-events'))activeMap.removeSource('security-events');securityState.features=[]}
function showSecurityWatchlists(drawer){
 if(securityState.selectedList!==null){showWatchlistPeople(drawer);return}
 drawer.querySelector('.sec-intro').textContent='Organize as pessoas acompanhadas em listas e acesse seus cadastros.';
 const toolbar=secEl('div','watchlist-toolbar');toolbar.append(secEl('span','watchlist-total',securityState.watchlists.length+' watchlists'),secButton('+ Criar watchlist',openCreateWatchlist,'sec-primary'));drawer.append(toolbar);
 securityState.watchlists.forEach((list,i)=>{
  const card=secButton('',()=>{securityState.selectedList=i;securityState.personQuery='';showPage('Security')},'sec-service watchlist-link');
  const badge=secEl('span','watchlist-color-badge');badge.style.setProperty('--list-color',list.color);badge.setAttribute('aria-hidden','true');
  badge.innerHTML='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4h12v17l-6-4-6 4z"/></svg>';
  const text=secEl('span','sec-service-copy');text.append(secEl('strong',null,list.name),secEl('small',null,list.members.length+' '+(list.members.length===1?'pessoa cadastrada':'pessoas cadastradas')));card.append(badge,text,secEl('span','sec-service-arrow','›'));drawer.append(card);
 });
}
function openCreateWatchlist(){
 const dialog=secEl('dialog','findface-dialog watchlist-create-dialog');dialog.setAttribute('aria-labelledby','create-watchlist-title');const close=securityCloseButton('Fechar criação de watchlist',dialog),heading=secEl('h2',null,'Criar watchlist');heading.id='create-watchlist-title';
 dialog.append(close,heading,secEl('p',null,'Escolha um nome e uma cor para identificar sua lista.'));
 const form=secEl('form','sec-form'),label=secEl('label',null,'Nome da watchlist'),name=secEl('input');name.id='watchlist-name';name.name='name';name.required=true;name.maxLength=70;name.placeholder='Ex.: Operação Centro';label.htmlFor=name.id;const field=secEl('div');field.append(label,name);form.append(field);
 const colors=secEl('fieldset','watchlist-palette');colors.append(secEl('legend',null,'Cor de identificação'));
 for(const [i,[value,title]] of [['#bc6381','Rosa'],['#7284ba','Índigo'],['#56a6b9','Azul'],['#539b80','Verde'],['#c18a4f','Âmbar'],['#9b78b8','Violeta']].entries()){
  const option=secEl('label','watchlist-swatch'),input=secEl('input');input.type='radio';input.name='color';input.value=value;input.checked=i===0;input.setAttribute('aria-label',title);const circle=secEl('span');circle.style.backgroundColor=value;option.append(input,circle);colors.append(option);
 }form.append(colors);
 const actions=secEl('div','watchlist-modal-actions'),cancel=secButton('Cancelar',()=>dialog.close(),'sec-secondary'),submit=secEl('button','sec-primary','Criar watchlist');submit.type='submit';actions.append(cancel,submit);form.append(actions);
 form.onsubmit=e=>{e.preventDefault();name.setCustomValidity(name.value.trim()?'':'Informe o nome da watchlist.');if(!form.reportValidity())return;securityState.watchlists.push({name:name.value.trim(),color:form.querySelector('input[name=color]:checked').value,members:[]});securityState.selectedList=null;dialog.close();showPage('Security')};name.oninput=()=>name.setCustomValidity('');
 dialog.append(form);dialog.addEventListener('close',()=>dialog.remove(),{once:true});document.body.append(dialog);dialog.showModal();name.focus();
}
function showWatchlistPeople(drawer){
 const list=securityState.watchlists[securityState.selectedList];drawer.querySelector('h2').textContent=list.name;
 drawer.querySelector('.sec-intro').textContent='Pessoas cadastradas nesta watchlist. Pesquise um nome ou abra um perfil para consultar as informações.';
 const bar=secEl('div','watchlist-toolbar'),count=secEl('span','sec-pill',list.members.length+' pessoas');bar.append(count,secButton('+ Adicionar pessoa',()=>{securityState.addingPerson=!securityState.addingPerson;showPage('Security')},'sec-primary'));drawer.append(bar);
 if(securityState.addingPerson)showAddWatchlistPerson(drawer,list);
 const input=secEl('input','sec-search');input.placeholder='Pesquisar pessoa…';input.setAttribute('aria-label','Pesquisar pessoa');input.value=securityState.personQuery;drawer.append(input);
 const results=secEl('div','watchlist-people');results.setAttribute('aria-live','polite');drawer.append(results);
 function render(){results.replaceChildren();const normalize=t=>t.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();const people=securityPeople.filter(p=>list.members.includes(p.id)&&normalize(p.name+' '+p.city).includes(normalize(input.value)));
  if(!people.length)results.append(secEl('p','sec-empty',list.members.length?'Nenhuma pessoa encontrada.':'Esta watchlist ainda não possui pessoas cadastradas.'));
  people.forEach(person=>{const card=secEl('article','watchlist-person'),photo=secEl('img');photo.src=person.photo;photo.alt='Retrato de '+person.name;photo.loading='lazy';const text=secEl('div','watchlist-person-copy');text.append(secEl('strong',null,person.name),secEl('small',null,person.city),secEl('p',null,person.notes),secButton('Ver perfil →',()=>openWatchlistPerson(person),'person-open'));card.append(photo,text);results.append(card)});
 }input.oninput=()=>{securityState.personQuery=input.value;render()};render();
}
function showAddWatchlistPerson(drawer,list){
 const form=secEl('form','sec-form person-create');
 function field(label,type='text'){const box=secEl('div'),l=secEl('label',null,label),input=secEl('input');input.type=type;input.id='new-person-'+form.children.length;l.htmlFor=input.id;box.append(l,input);form.append(box);return input}
 const name=field('Nome completo');name.required=true;name.maxLength=100;const birth=field('Data de nascimento','date'),city=field('Cidade / UF'),notes=field('Informações adicionais');
 const box=secEl('div'),label=secEl('label',null,'Foto do perfil'),select=secEl('select');select.setAttribute('aria-label','Foto do perfil');securityPeople.slice(0,6).forEach((p,i)=>{const option=secEl('option',null,'Retrato '+(i+1));option.value=p.photo;select.append(option)});box.append(label,select);form.append(box);
 const b=secEl('button','sec-primary','Cadastrar pessoa');b.type='submit';form.append(b);form.onsubmit=e=>{e.preventDefault();if(!name.value.trim())return;const person={id:'person-'+Date.now(),name:name.value.trim(),birth:birth.value,city:city.value.trim()||'Não informado',notes:notes.value.trim()||'Cadastro incluído nesta watchlist.',photo:select.value};securityPeople.push(person);list.members.push(person.id);securityState.addingPerson=false;securityState.personQuery='';showPage('Security')};drawer.append(form);
}
function openWatchlistPerson(person){
 const dialog=secEl('dialog','findface-dialog person-dialog');dialog.setAttribute('aria-label','Perfil de '+person.name);const close=securityCloseButton('Fechar perfil',dialog);const photo=secEl('img','person-profile-photo');photo.src=person.photo;photo.alt='Retrato de '+person.name;
 dialog.append(close,photo,secEl('h2',null,person.name),secEl('p',null,person.city));const dl=secEl('dl','findface-facts');for(const [label,value]of [['ID do cadastro',person.id.toUpperCase()],['Nascimento',person.birth?person.birth.split('-').reverse().join('/'):'Não informado'],['Watchlists',personLists(person)],['Cidade',person.city]]){const f=secEl('div');f.append(secEl('dt',null,label),secEl('dd',null,value));dl.append(f)}dialog.append(dl,secEl('h3',null,'Informações do cadastro'),secEl('p',null,person.notes));dialog.addEventListener('close',()=>dialog.remove(),{once:true});document.body.append(dialog);dialog.showModal();close.focus();
}
function showSecurityWebhooks(drawer){
  const box=secEl('div','sec-result');box.append(secEl('strong',null,'Canal de eventos'),secEl('p',null,'Recebimento de eventos das fontes integradas.'),secEl('code',null,'wss://events.example.com/events'),secEl('div','sec-pill',securityState.connected?'Conectado':'Desconectado'));
  const button=secButton(securityState.connected?'Desconectar':'Conectar',()=>{securityState.connected=!securityState.connected;showPage('Security')},'sec-primary');box.append(button);drawer.append(box);
  if(securityState.connected){for(const [i,text] of ['Câmera 01 · evento recebido','Dispositivo 02 · posição atualizada','Watchlist · atualização recebida'].entries()){const card=secEl('div','sec-result');card.append(secEl('strong',null,text),secEl('p',null,'HX-EVENT-00'+(i+1)+' · 15/11/2026 09:4'+i+' UTC'));drawer.append(card)}}
}
function showSecurityAlerts(drawer){
  const filter=secEl('select','sec-search');filter.setAttribute('aria-label','Filtrar alertas');for(const value of ['Todos','Pendentes','Reconhecidos'])filter.append(secEl('option',null,value));drawer.append(filter);const results=secEl('div');drawer.append(results);
  function render(){results.replaceChildren();let count=0;['Evento de câmera para revisão','Dispositivo em área de interesse','Atualização de watchlist'].forEach((title,i)=>{const ack=securityState.acknowledged.has(i);if(filter.value==='Pendentes'&&ack||filter.value==='Reconhecidos'&&!ack)return;count++;const card=secEl('div','sec-result');card.append(secEl('strong',null,title),secEl('p',null,'HX-ALERT-00'+(i+1)+' · 15/11/2026 09:4'+i),secEl('div','sec-pill '+(ack?'is-success':'is-pending'),ack?'Reconhecido':'Pendente de revisão'));if(!ack)card.append(secButton('Reconhecer alerta',()=>{securityState.acknowledged.add(i);render()}));results.append(card)});if(!count)results.append(secEl('p','sec-empty','Nenhum alerta neste filtro.'))}filter.onchange=render;render();
}
function findfaceImages(item,index=0){
  const person=securityPerson(item,index);
  const pair=secEl('div','findface-pair');
  for(const [file,label] of [['capture','Captura'],['reference','Referência']]){const figure=secEl('figure'),img=secEl('img');img.src=person.photo;img.className=file==='capture'?'person-capture':'person-reference';img.alt=label+' de '+person.name;figure.append(img,secEl('figcaption',null,label));pair.append(figure)}
  return pair;
}
function findfaceFacts(item,index,compact=false){
  const person=securityPerson(item,index),date=item.date.split('-').reverse().join('/')+' · '+(item.captureTime||((10+index)+':24'))+' UTC';
  const fields=compact?[['Capturado em',date],['Câmera','CAM-'+String(index+1).padStart(3,'0')],['Cidade',person.city],['ID do evento',item.code]]:[['Data do evento',date],['Nascimento',person.birth.split('-').reverse().join('/')],['Câmera','CAM-'+String(index+1).padStart(3,'0')],['Watchlist',personLists(person)],['ID do evento',item.code],['Coordenadas',item.coordinate.map(v=>v.toFixed(4)).join(', ')]];
  const dl=secEl('dl','findface-facts');
  for(const [label,value] of fields){const field=secEl('div');field.append(secEl('dt',null,label),secEl('dd',null,value));dl.append(field)}return dl;
}
function findfaceCard(item,index){
  const card=secEl('article','sec-result findface-result'),face=(item.eventType||'Face')==='Face';
  const head=secEl('div','findface-heading'),confidence=secEl('div','findface-confidence',(98-index)+'%');confidence.append(secEl('small',null,'Confiança'));
  head.append(secEl('strong',null,face?securityPerson(item,index).name:item.title),confidence);card.append(head);
  if(face){card.append(findfaceWatchlistChips(securityPerson(item,index)),findfaceImages(item,index))}
  if(item.filterDescription)card.append(secEl('p','camera-event-attributes',item.filterDescription));
  card.append(findfaceFacts(item,index,true));
  if(face){
    const person=securityPerson(item,index),bio=secEl('div','findface-bio');bio.id='findface-bio-'+item.code;bio.hidden=true;
    bio.append(secEl('strong',null,'Bio cadastrada'),secEl('p',null,person.notes));
    const toggle=secButton('Ver bio',()=>{bio.hidden=!bio.hidden;toggle.textContent=bio.hidden?'Ver bio':'Ocultar bio';toggle.setAttribute('aria-expanded',String(!bio.hidden))},'findface-bio-toggle');
    toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-controls',bio.id);card.append(toggle,bio);
  }
  const actions=secEl('div','sec-result-actions');actions.append(secButton('↗ Ver no mapa',()=>showSecurityLocations([item])),secButton('Abrir evento',()=>openFindfaceEvent(item,index,face),'sec-primary'));card.append(actions);return card;
}
function findfaceWatchlistChips(person){
  const group=secEl('div','findface-watchlist-chips');group.setAttribute('aria-label','Watchlists de '+person.name);
  const lists=securityState.watchlists.filter(list=>list.members.includes(person.id));
  for(const list of lists){const chip=secEl('span','findface-watchlist-chip');chip.style.setProperty('--list-color',list.color);const dot=secEl('span','findface-watchlist-dot');dot.setAttribute('aria-hidden','true');chip.append(dot,secEl('span',null,list.name));group.append(chip)}
  if(!lists.length)group.append(secEl('span','findface-watchlist-chip','Sem watchlist'));
  return group;
}
const identityReports=[];
function runIdentitySearch(form){
 const values=Object.fromEntries(['first','last','user','email','phone'].map(id=>[id,form.querySelector('#sec-'+id).value.trim()]));
 return buildIdentityReport(values);
}
function buildIdentityReport(values,completedAt){
 const value=id=>values[id]||'';
 const fixtures=[
  {first:'Rafael',middle:'Henrique',last:'Monteiro',gender:'Masculino',city:'Curitiba',state:'PR',zip:'80540-180',street:'Rua das Araucárias, 284, ap. 302',district:'Jardim Aurora',birth:'17/04/1988',phone:'+55 (41) 9****-6724',job:'Analista de operações',company:'Aurora Serviços Integrados',education:'Administração'},
  {first:'Camila',middle:'Fernanda',last:'Duarte',gender:'Feminino',city:'São Paulo',state:'SP',zip:'04532-020',street:'Rua dos Jacarandás, 156, ap. 81',district:'Vila das Flores',birth:'03/09/1992',phone:'+55 (11) 9****-3842',job:'Coordenadora comercial',company:'Horizonte Gestão e Projetos',education:'Comunicação Social'},
  {first:'André',middle:'Luiz',last:'Vasconcelos',gender:'Masculino',city:'Brasília',state:'DF',zip:'70740-060',street:'Quadra 214, bloco C, ap. 104',district:'Setor Jardim Norte',birth:'21/02/1985',phone:'+55 (61) 9****-2196',job:'Consultor de projetos',company:'Vértice Consultoria Empresarial',education:'Ciências Contábeis'}
 ];
 const normalize=text=>text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const query=normalize([value('first'),value('last'),value('user'),value('email')].join(' '));
 const base=fixtures.find(p=>query.includes(normalize(p.first))||query.includes(normalize(p.last)))||fixtures[0];
 const given=(value('first')||base.first+' '+base.middle).split(/\s+/),first=given[0],middle=given.slice(1).join(' '),last=value('last')||base.last;
 const slug=normalize(first+'.'+last).replace(/[^a-z0-9.]/g,''),user=(value('user')||slug).replace(/^@/,''),email=value('email')||slug+'@correio.example',phone=value('phone')||base.phone;
 const report={id:'ID-'+String(identityReports.length+1).padStart(4,'0'),first,middle,last,user,email,phone,name:[first,middle,last].filter(Boolean).join(' '),gender:base.gender,job:base.job,company:base.company,education:base.education,time:new Date(completedAt||Date.now()).toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo'}),sources:[
  {name:'Fonte 1',type:'Diretório cadastral',...base,email,phone,addressType:'Residencial',profile:'https://perfis.example/'+encodeURIComponent(user),updated:'12/11/2026'},
  {name:'Fonte 2',type:'Perfis na rede',...base,email:slug+'@contato.example',phone:'Não divulgado',street:'Não divulgado',zip:'Não divulgado',addressType:'Localidade do perfil',profile:'https://comunidade.example/@'+encodeURIComponent(user),updated:'05/11/2026'},
  {name:'Fonte 3',type:'Registros profissionais',...base,email:slug+'@empresa.example',phone:base.phone,street:'Avenida dos Ipês, 870, sala 506',addressType:'Comercial',profile:'https://profissional.example/in/'+encodeURIComponent(user),updated:'28/10/2026'}
 ]};
 identityReports.unshift(report);securityState.history.unshift({service:'identity',time:report.time,label:report.name});return report;
}
function showIdentityHistory(drawer){
 if(!identityReports.length){drawer.append(secEl('p','sec-empty','Abra os filtros de pesquisa para iniciar uma consulta por nome, usuário, e-mail ou telefone.'));return}
 const head=secEl('div','sec-result-head');head.append(secEl('strong',null,'Consultas recentes'),secEl('small',null,identityReports.length+' consultas'));drawer.append(head);
 for(const report of identityReports){const card=secButton('',()=>openIdentityReport(report),'sec-result recent-search-card');card.setAttribute('aria-label','Abrir pesquisa de '+report.name);card.append(secEl('strong',null,report.name),secEl('p',null,'@'+report.user+' · '+report.time),secEl('code',null,report.id+' · '+report.sources.length+' fontes'));card.append(secEl('span','recent-search-hint','Ver resultado ↗'));drawer.append(card)}
}
function openIdentityReport(report){
 const dialog=secEl('dialog','findface-dialog identity-dialog');dialog.setAttribute('aria-labelledby','identity-report-title');const heading=secEl('h2',null,'Resultado da pesquisa');heading.id='identity-report-title';const close=securityCloseButton('Fechar resultado da pesquisa',dialog);
 dialog.append(close,heading,secEl('p','identity-subtitle','@'+report.user+' · '+report.id+' · '+report.time));
 const tabs=secEl('div','identity-tabs');tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','Fontes de dados');
 const panel=secEl('section','identity-source-panel');panel.id='identity-source-panel';panel.setAttribute('role','tabpanel');panel.tabIndex=0;const buttons=[];
 function section(title,columns,rows){
  const block=secEl('section','identity-data-section');block.append(secEl('h3',null,title));const wrap=secEl('div','identity-table-wrap');wrap.tabIndex=0;wrap.setAttribute('aria-label',title);const table=secEl('table');const caption=secEl('caption','visually-hidden',title);table.append(caption);const thead=secEl('thead'),tr=secEl('tr');columns.forEach(c=>{const th=secEl('th',null,c);th.scope='col';tr.append(th)});thead.append(tr);table.append(thead);const tbody=secEl('tbody');rows.forEach(row=>{const r=secEl('tr');row.forEach(cell=>r.append(secEl('td',null,cell)));tbody.append(r)});table.append(tbody);wrap.append(table);block.append(wrap);panel.append(block);
 }
 function select(index){
  buttons.forEach((button,i)=>{button.setAttribute('aria-selected',String(i===index));button.tabIndex=i===index?0:-1});panel.setAttribute('aria-labelledby','identity-tab-'+index);panel.replaceChildren();const source=report.sources[index];
  const info=secEl('div','identity-source-info');info.append(secEl('strong',null,source.type),secEl('span',null,'Atualização: '+source.updated));panel.append(info);
  section('Nomes',['Nome completo','Sobrenome','Primeiro nome','Nome do meio'],[[report.name,report.last,report.first,report.middle||'Não informado']]);
  section('Gênero',['Gênero'],[[report.gender]]);
  section('Endereços',['Logradouro','Bairro','Cidade','Tipo','Estado','País','CEP','Idioma'],[[source.street,source.district,source.city,source.addressType,source.state,'Brasil',source.zip,'pt-BR']]);
  section('Datas de nascimento',['Data de nascimento','Precisão'],[[source.birth,source.birth==='Não informado'?'Não disponível':'Dia, mês e ano']]);
  section('Contatos',['E-mail','Telefone'],[[source.email,source.phone]]);
  if(index===2)section('Vínculo profissional',['Cargo','Organização','Formação'],[[report.job,report.company,report.education]]);
  section('Perfis na rede',['Usuário','Endereço do perfil'],[['@'+report.user,source.profile]]);
 }
 report.sources.forEach((source,i)=>{const button=secButton(source.name,()=>select(i),'identity-tab');button.id='identity-tab-'+i;button.setAttribute('role','tab');button.setAttribute('aria-controls',panel.id);button.onkeydown=e=>{let next;if(e.key==='ArrowRight')next=(i+1)%report.sources.length;if(e.key==='ArrowLeft')next=(i+report.sources.length-1)%report.sources.length;if(e.key==='Home')next=0;if(e.key==='End')next=report.sources.length-1;if(next!==undefined){e.preventDefault();select(next);buttons[next].focus()}};buttons.push(button);tabs.append(button)});
 dialog.append(tabs,panel);select(0);dialog.addEventListener('close',()=>dialog.remove(),{once:true});document.body.append(dialog);dialog.showModal();close.focus();
}
function openFindfaceEvent(item,index,face){
  const dialog=secEl('dialog','findface-dialog');dialog.setAttribute('aria-label','Detalhes do evento '+item.code);
  const close=securityCloseButton('Fechar evento',dialog);dialog.append(close,secEl('h2',null,'Detalhes do evento'),secEl('p',null,item.code));
  if(face)dialog.append(findfaceImages(item,index));
  if(face)dialog.append(findfaceWatchlistChips(securityPerson(item,index)));
  dialog.append(secEl('h3',null,face?securityPerson(item,index).name:item.title),secEl('p',null,'Confiança: '+(98-index)+'%'),findfaceFacts(item,index),secEl('h3',null,'Descrição'),secEl('p',null,securityPerson(item,index).notes));
  dialog.append(secButton('↗ Ir à localização da captura',()=>{dialog.close();showSecurityLocations([item])}));
  dialog.append(secEl('h3',null,'Documentos relacionados'));const docs=secEl('div','findface-documents');
  for(const title of ['Ficha do registro','Relatório do evento','Histórico de capturas']){const d=secEl('details');d.append(secEl('summary',null,title),secEl('p',null,title+' · '+item.code+' · '+item.date),secEl('p',null,'Registro: '+(face?securityPerson(item,index).name:item.title)+' · Câmera CAM-'+String(index+1).padStart(3,'0')));docs.append(d)}dialog.append(docs);
  dialog.addEventListener('close',()=>dialog.remove(),{once:true});dialog.addEventListener('click',e=>{if(e.target===dialog){const rect=dialog.getBoundingClientRect();if(e.clientX<rect.left||e.clientX>rect.right||e.clientY<rect.top||e.clientY>rect.bottom)dialog.close()}});
  document.body.append(dialog);dialog.showModal();close.focus();
}

// Populate the initial request history with completed searches.
for(const [values,time] of [
 [{first:'André Luiz',last:'Vasconcelos',user:'andre.vasconcelos'},'2026-11-14T17:16:00-03:00'],
 [{first:'Camila Fernanda',last:'Duarte',user:'camila.duarte'},'2026-11-14T18:42:00-03:00'],
 [{first:'Rafael Henrique',last:'Monteiro',user:'rafael.monteiro'},'2026-11-14T19:08:00-03:00']
])buildIdentityReport(values,time);
