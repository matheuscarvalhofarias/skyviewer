// Image catalog.
const imageSatellites = [
  {name:'Sentinel-2',resolution:'10 m',sensor:'MSI'},
  {name:'Landsat 9',resolution:'30 m',sensor:'OLI-2'},
  {name:'Landsat 8',resolution:'30 m',sensor:'OLI'},
  {name:'PlanetScope',resolution:'3 m',sensor:'SuperDove'},
  {name:'WorldView-3',resolution:'0,3 m',sensor:'WV110'},
  {name:'Pléiades Neo',resolution:'0,3 m',sensor:'HiRI'}
];
const imageSearch = {satellite:'all',start:'2026-11-01',end:'2026-11-14',cloud:30,scenes:[],searched:false,visible:new Set(),acquired:new Set(),details:new Set()};
function imageElement(tag,className,text){const el=document.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=text;return el}
function showImageSearch(drawer){
  drawer.append(imageElement('div','imagery-kicker','Catálogo de imagens'));
  drawer.append(imageElement('p','imagery-intro','Pesquise cenas na região visível do mapa. Selecione o satélite, o período e a cobertura máxima de nuvens.'));
  const form=imageElement('form','image-form');
  const satelliteField=imageElement('div');const label=imageElement('label',null,'Satélite');label.htmlFor='image-satellite';
  const select=imageElement('select');select.id='image-satellite';
  for(const item of [{name:'Todos os satélites',value:'all'},...imageSatellites.map(s=>({name:s.name,value:s.name}))]){const option=imageElement('option',null,item.name);option.value=item.value;select.append(option)}
  select.value=imageSearch.satellite;select.onchange=()=>imageSearch.satellite=select.value;satelliteField.append(label,select);form.append(satelliteField);
  const dates=imageElement('div','image-dates');
  for(const [key,title] of [['start','Data de início'],['end','Data de fim']]){const field=imageElement('div'),l=imageElement('label',null,title),input=imageElement('input');input.id='image-'+key;l.htmlFor=input.id;input.type='date';input.required=true;input.value=imageSearch[key];input.onchange=()=>{imageSearch[key]=input.value;input.setCustomValidity('')};field.append(l,input);dates.append(field)}
  form.append(dates);
  const cloud=imageElement('div'),row=imageElement('div','cloud-label'),cl=imageElement('label',null,'Cobertura máxima de nuvens'),out=imageElement('output',null,imageSearch.cloud+'%'),range=imageElement('input');
  range.type='range';range.min=0;range.max=100;range.value=imageSearch.cloud;range.id='image-cloud';cl.htmlFor=range.id;out.htmlFor=range.id;
  range.oninput=()=>{imageSearch.cloud=+range.value;out.textContent=range.value+'%'};row.append(cl,out);const ends=imageElement('div','range-ends');ends.append(imageElement('span',null,'0% · Céu limpo'),imageElement('span',null,'100%'));cloud.append(row,range,ends);form.append(cloud);
  const search=imageElement('button','image-search-button','Pesquisar imagens');search.type='submit';form.append(search);
  form.onsubmit=e=>{e.preventDefault();const end=form.querySelector('#image-end');end.setCustomValidity(imageSearch.end<imageSearch.start?'A data de fim deve ser igual ou posterior à data de início.':'');if(!form.reportValidity())return;runImageSearch();showPage('Search & Acquire Images')};
  drawer.append(form);
  const results=imageElement('section');results.setAttribute('aria-label','Resultados da pesquisa');results.setAttribute('aria-live','polite');
  if(!imageSearch.searched){results.append(imageElement('p','image-empty','Escolha o período e pesquise para ver as cenas disponíveis nesta região.'))}
  else{const head=imageElement('div','image-results-head');head.append(imageElement('strong',null,imageSearch.scenes.length+' imagens encontradas'),imageElement('span',null,'CATÁLOGO'));results.append(head);
    results.append(imageElement('p','image-map-key','Os contornos indicam a cobertura de cada cena. Use “Exibir” para sobrepor uma imagem.'));
    if(!imageSearch.scenes.length)results.append(imageElement('p','image-empty','Nenhuma cena corresponde aos filtros. Amplie o período ou a cobertura de nuvens.'));
    imageSearch.scenes.forEach(scene=>results.append(imageResultCard(scene)));
  }
  drawer.append(results);
}
function runImageSearch(){
  activeMap.stop();entryFlight++;
  for(const scene of imageSearch.scenes)removeImageScene(scene.id);
  imageSearch.visible.clear();imageSearch.details.clear();imageSearch.acquired.clear();imageSearch.searched=true;
  const center=activeMap.getCenter(),bounds=activeMap.getBounds();
  const span=Math.min(.24,Math.max(.035,(bounds.getEast()-bounds.getWest())*.22));
  const start=Date.parse(imageSearch.start+'T00:00:00Z'),end=Date.parse(imageSearch.end+'T00:00:00Z');
  const sats=imageSearch.satellite==='all'?imageSatellites:imageSatellites.filter(s=>s.name===imageSearch.satellite);
  imageSearch.scenes=Array.from({length:9},(_,i)=>{
    const sat=sats[i%sats.length],cloud=[0,8,17,26,35,44,59,73,91][i];
    const lng=center.lng+((i%3)-1)*span*.76,lat=center.lat+(Math.floor(i/3)-1)*span*.66;
    const west=lng-span/2,east=lng+span/2,south=Math.max(-85,lat-span/2),north=Math.min(85,lat+span/2);
    const date=new Date(start+(end-start)*(i/8)).toISOString().slice(0,10);
    return {id:'satellite-scene-'+i,satellite:sat.name,sensor:sat.sensor,resolution:sat.resolution,cloud,date,tile:['18LXJ','18LXK','18LYJ','18LYK','18LXL','18LYL','19LBG','19LBH','19LCG'][i],coordinates:[[west,north],[east,north],[east,south],[west,south]],texture:satelliteTexture(i),seed:i};
  }).filter(s=>s.cloud<=imageSearch.cloud).sort((a,b)=>b.date.localeCompare(a.date));
  restoreImageLayers();
  if(imageSearch.scenes.length){
    const coverage=new mapboxgl.LngLatBounds();
    imageSearch.scenes.forEach(scene=>scene.coordinates.forEach(point=>coverage.extend(point)));
    activeMap.fitBounds(coverage,{padding:{top:90,bottom:65,left:innerWidth>700?480:85,right:65},duration:900,maxZoom:14,retainPadding:false});
  }
}
function satelliteTexture(seed){
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=512;const ctx=canvas.getContext('2d');
  let state=seed+712;const rand=()=>{state=(state*16807)%2147483647;return state/2147483647};
  ctx.fillStyle='#334732';ctx.fillRect(0,0,512,512);
  const colors=['#475a38','#6d7047','#3b5339','#878461','#5f633e','#344c35','#918568'];
  for(let y=0;y<512;y+=28)for(let x=0;x<512;x+=38){ctx.fillStyle=colors[Math.floor(rand()*colors.length)];ctx.fillRect(x+2,y+2,34+rand()*9,24+rand()*5)}
  ctx.strokeStyle='#344e58';ctx.lineWidth=25;ctx.beginPath();ctx.moveTo(-20,440);ctx.bezierCurveTo(150,130,270,420,540,35);ctx.stroke();
  for(let i=0;i<220;i++){const x=rand()*190+220,y=rand()*180+200;ctx.fillStyle=rand()>.5?'#9b9b8c':'#74766c';ctx.fillRect(x,y,3+rand()*8,3+rand()*6)}
  ctx.strokeStyle='#b5ad8c';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,180);ctx.lineTo(512,340);ctx.moveTo(295,0);ctx.lineTo(350,512);ctx.stroke();
  for(let i=0;i<12000;i++){ctx.fillStyle=rand()>.5?'#ffffff0c':'#00000018';ctx.fillRect(rand()*512,rand()*512,2,2)}
  ctx.fillStyle='#07131cb0';ctx.fillRect(0,480,512,32);ctx.fillStyle='#e4ece5';ctx.font='12px monospace';ctx.fillText('CENA '+String(seed+1).padStart(2,'0'),14,501);
  return canvas.toDataURL('image/png');
}
function imageResultCard(scene){
  const card=imageElement('article','image-result'+(imageSearch.visible.has(scene.id)?' is-visible':''));
  const top=imageElement('div','image-result-top'),img=imageElement('img','image-thumb');img.src=scene.texture;img.alt='Prévia da cena '+scene.tile;
  const text=imageElement('div');text.append(imageElement('div','image-result-title',scene.satellite),imageElement('div','image-date',scene.date.split('-').reverse().join('/')));
  const tags=imageElement('div','image-tags');tags.append(imageElement('span',null,scene.tile),imageElement('span',null,'☁ '+scene.cloud+'%'),imageElement('span',null,scene.resolution));text.append(tags);top.append(img,text);card.append(top);
  const actions=imageElement('div','image-result-actions');
  function button(title,fn){const b=imageElement('button',null,title);b.type='button';b.onclick=fn;actions.append(b);return b}
  const visible=imageSearch.visible.has(scene.id);
  const toggle=button(visible?'◉ Ocultar':'◎ Exibir',()=>{if(imageSearch.visible.has(scene.id)){imageSearch.visible.delete(scene.id);activeMap.setLayoutProperty(scene.id,'visibility','none')}else{imageSearch.visible.add(scene.id);addImageScene(scene)}showPage('Search & Acquire Images')});toggle.setAttribute('aria-pressed',String(visible));toggle.setAttribute('aria-label',(visible?'Ocultar':'Exibir')+' imagem '+scene.tile);
  button('↗ Ir ao local',()=>{const c=scene.coordinates;activeMap.fitBounds([c[3],c[1]],{padding:{top:80,bottom:70,left:innerWidth>700?480:90,right:65},duration:900,maxZoom:15,retainPadding:false})});
  const meta=button('ⓘ Metadados',()=>{if(imageSearch.details.has(scene.id))imageSearch.details.delete(scene.id);else imageSearch.details.add(scene.id);showPage('Search & Acquire Images')});meta.setAttribute('aria-expanded',String(imageSearch.details.has(scene.id)));card.append(actions);
  if(imageSearch.details.has(scene.id)){
    const details=imageElement('div','image-details'),dl=imageElement('dl');
    for(const [key,value] of [['ID da cena','HX_'+scene.tile+'_'+scene.date.replaceAll('-','')],['Satélite',scene.satellite],['Sensor',scene.sensor],['Aquisição (UTC)',scene.date+' 13:42:08'],['Nuvens',scene.cloud+'%'],['Resolução nominal',scene.resolution],['Sistema de referência','WGS 84 · EPSG:4326'],['Processamento','Ortorretificado · RGB'],['Cobertura',scene.coordinates[3].map(v=>v.toFixed(4)).join(', ')+' / '+scene.coordinates[1].map(v=>v.toFixed(4)).join(', ')]])dl.append(imageElement('dt',null,key),imageElement('dd',null,value));
    details.append(dl,imageElement('p',null,'Informações da cena.'));
    const acquire=imageElement('button','image-search-button',imageSearch.acquired.has(scene.id)?'✓ Imagem adquirida':'Adquirir imagem');acquire.disabled=imageSearch.acquired.has(scene.id);acquire.onclick=()=>{imageSearch.acquired.add(scene.id);showPage('Search & Acquire Images')};details.append(acquire);card.append(details);
  }
  return card;
}
function removeImageScene(id){if(activeMap?.getLayer(id))activeMap.removeLayer(id);if(activeMap?.getSource(id))activeMap.removeSource(id)}
function addImageScene(scene){
  if(!activeMap.getSource(scene.id))activeMap.addSource(scene.id,{type:'image',url:scene.texture,coordinates:scene.coordinates});
  if(!activeMap.getLayer(scene.id))activeMap.addLayer({id:scene.id,type:'raster',source:scene.id,paint:{'raster-opacity':.93,'raster-fade-duration':0}});
  activeMap.setLayoutProperty(scene.id,'visibility','visible');
  if(activeMap.getLayer('image-footprints-line'))activeMap.moveLayer('image-footprints-line');
}
function restoreImageLayers(){
  if(!activeMap || !imageSearch.searched)return;
  const data={type:'FeatureCollection',features:imageSearch.scenes.map(s=>({type:'Feature',properties:{tile:s.tile},geometry:{type:'Polygon',coordinates:[[...s.coordinates,s.coordinates[0]]]}}))};
  if(activeMap.getSource('image-footprints'))activeMap.getSource('image-footprints').setData(data);
  else activeMap.addSource('image-footprints',{type:'geojson',data});
  if(!activeMap.getLayer('image-footprints-line'))activeMap.addLayer({id:'image-footprints-line',type:'line',source:'image-footprints',paint:{'line-color':'#ff789b','line-width':2,'line-dasharray':[3,2]}});
  for(const scene of imageSearch.scenes)if(imageSearch.visible.has(scene.id))addImageScene(scene);
}
function clearImageSearch(){
  for(const scene of imageSearch.scenes)removeImageScene(scene.id);
  if(activeMap?.getLayer('image-footprints-line'))activeMap.removeLayer('image-footprints-line');
  if(activeMap?.getSource('image-footprints'))activeMap.removeSource('image-footprints');
  imageSearch.scenes=[];imageSearch.searched=false;imageSearch.visible.clear();imageSearch.details.clear();imageSearch.acquired.clear();
}
