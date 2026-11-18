// Territorial Intelligence dataset.
const territoryCities = [
  {id:'sp',name:'São Paulo',center:[-46.633,-23.550],spread:.10},
  {id:'campinas',name:'Campinas',center:[-47.061,-22.906],spread:.065},
  {id:'santos',name:'Santos',center:[-46.333,-23.955],spread:.025},
  {id:'guarulhos',name:'Guarulhos',center:[-46.533,-23.455],spread:.055},
  {id:'osasco',name:'Osasco',center:[-46.791,-23.533],spread:.035},
  {id:'ribeirao',name:'Ribeirão Preto',center:[-47.810,-21.178],spread:.06}
];
const territoryCatalog = [
  {id:'dengue',name:'Focos de dengue',color:'#e57536',hint:'Vistorias e focos identificados',types:['Foco em recipiente','Água parada','Terreno com criadouro']},
  {id:'lighting',name:'Falhas de iluminação',color:'#e7b52d',hint:'Chamados de manutenção e rede',types:['Lâmpada apagada','Intermitência','Poste danificado']},
  {id:'pools',name:'Piscinas residenciais',color:'#279cc0',hint:'Mapeamento e inventário aéreo',types:['Piscina cadastrada']},
  {id:'flood',name:'Pontos de alagamento',color:'#5477d5',hint:'Pontos de acúmulo e transbordamento',types:['Via alagada','Transbordamento','Drenagem obstruída']},
  {id:'victims',name:'Vitimização',color:'#bb3e70',hint:'Ocorrências registradas · PM-SP',types:['Roubo','Furto','Lesão corporal']}
];
const territoryReferenceDate='2026-11-18';
const territoryDay=86400000;
function buildTerritoryData(){
  let seed=20261118;const random=()=>((seed=seed*16807%2147483647)/2147483647);
  const records=[];const end=Date.parse(territoryReferenceDate+'T12:00:00Z');
  territoryCities.forEach((city,ci)=>territoryCatalog.forEach((layer,li)=>{
    const clusters=Array.from({length:5},()=>[city.center[0]+(random()-.5)*city.spread,city.center[1]+(random()-.5)*city.spread*.7]);
    for(let i=0;i<150+ci*13+li*19;i++){
      const center=clusters[i%clusters.length],age=Math.floor(random()*180),hour=Math.floor(random()*24);
      const coordinate=[center[0]+(random()+random()-1)*city.spread*.17,center[1]+(random()+random()-1)*city.spread*.13];
      records.push({id:`geo-${city.id}-${layer.id}-${i}`,city:city.id,layer:layer.id,type:layer.types[Math.floor(random()*layer.types.length)],age,hour,date:new Date(end-age*territoryDay).toISOString().slice(0,10),coordinate});
    }
  }));return records;
}
const territoryRecords=buildTerritoryData();
const territoryState={enabled:new Set(),city:'sp',days:90,shift:'all',crime:'all',mode:'heat',radius:30,opacity:.8,popup:null};
function filterTerritoryRecords(state=territoryState){return territoryRecords.filter(r=>state.enabled.has(r.layer)&&(state.city==='all'||r.city===state.city)&&r.age<state.days&&(state.shift==='all'||(state.shift==='night'?(r.hour<6||r.hour>=18):(r.hour>=6&&r.hour<18)))&&(r.layer!=='victims'||state.crime==='all'||r.type===state.crime))}
// Fixed geographic grid aggregation.
function aggregateTerritory(records){
  const grid=new Map(),step=.01;
  for(const r of records){const x=Math.floor(r.coordinate[0]/step),y=Math.floor(r.coordinate[1]/step),key=`${r.layer}:${x}:${y}`;let cell=grid.get(key);if(!cell){cell={x,y,count:0,layer:r.layer,cities:new Set()};grid.set(key,cell)}cell.count++;cell.cities.add(r.city)}
  const points=[],polygons=[];
  for(const [id,c] of grid){const x=c.x*step,y=c.y*step,properties={id,count:c.count,layer:c.layer,active:true,city:[...c.cities].map(id=>territoryCities.find(c=>c.id===id).name).join(', ')};
    points.push({type:'Feature',properties,geometry:{type:'Point',coordinates:[x+step/2,y+step/2]}});
    polygons.push({type:'Feature',properties,geometry:{type:'Polygon',coordinates:[[[x,y],[x+step,y],[x+step,y+step],[x,y+step],[x,y]]]}});
  }
  return {points:{type:'FeatureCollection',features:points},polygons:{type:'FeatureCollection',features:polygons}};
}
function territoryEl(tag,className,text){const e=document.createElement(tag);if(className)e.className=className;if(text!==undefined)e.textContent=text;return e}
function territoryMapIds(){return territoryCatalog.flatMap(l=>['territory-heat-'+l.id,'territory-grid-'+l.id])}
function restoreTerritoryLayers(){
  if(!activeMap||!activeMap.getStyle())return;
  if(!activeMap.getSource('territory-points'))activeMap.addSource('territory-points',{type:'geojson',data:{type:'FeatureCollection',features:[]}});
  if(!activeMap.getSource('territory-grid'))activeMap.addSource('territory-grid',{type:'geojson',data:{type:'FeatureCollection',features:[]}});
  for(const layer of territoryCatalog){
    const filter=['==',['get','layer'],layer.id];
    if(!activeMap.getLayer('territory-heat-'+layer.id))activeMap.addLayer({id:'territory-heat-'+layer.id,type:'heatmap',source:'territory-points',filter,paint:{'heatmap-weight':['interpolate',['linear'],['get','count'],0,0,20,1],'heatmap-radius':territoryState.radius,'heatmap-intensity':1.3,'heatmap-opacity':territoryState.opacity,'heatmap-color':['interpolate',['linear'],['heatmap-density'],0,'rgba(0,0,0,0)',.12,layer.color,.55,'#ffbd64',.85,'#ef623d',1,'#9d2049']}});
    if(!activeMap.getLayer('territory-grid-'+layer.id))activeMap.addLayer({id:'territory-grid-'+layer.id,type:'fill',source:'territory-grid',filter,paint:{'fill-color':layer.color,'fill-outline-color':'#ffffff','fill-opacity':['interpolate',['linear'],['get','count'],1,.15,20,territoryState.opacity]}});
  }
  updateTerritoryMap();
}
function updateTerritoryMap(){
  const records=filterTerritoryRecords(),data=aggregateTerritory(records);
  activeMap?.getSource('territory-points')?.setData(data.points);activeMap?.getSource('territory-grid')?.setData(data.polygons);
  for(const layer of territoryCatalog)for(const mode of ['heat','grid']){const id='territory-'+mode+'-'+layer.id;if(activeMap?.getLayer(id))activeMap.setLayoutProperty(id,'visibility',opened&&territoryState.enabled.has(layer.id)&&territoryState.mode===mode?'visible':'none')}
  territoryState.popup?.remove();territoryState.popup=null;
  updateTerritorySummary(records);renderTerritoryLegend(records);
}
function fitTerritory(){
  if(!activeMap||!mapReady)return;entryFlight++;activeMap.stop();
  const cities=territoryCities.filter(c=>territoryState.city==='all'||c.id===territoryState.city);
  const bounds=new mapboxgl.LngLatBounds();for(const c of cities){bounds.extend([c.center[0]-c.spread*.7,c.center[1]-c.spread*.6]);bounds.extend([c.center[0]+c.spread*.7,c.center[1]+c.spread*.6])}
  activeMap.fitBounds(bounds,{padding:{left:innerWidth>650?Math.min(465,innerWidth*.59):110,right:65,top:100,bottom:125},maxZoom:13,duration:motionPreference.matches?0:1200,retainPadding:false});
}
function territoryPreset(id){
  territoryState.enabled=new Set(id==='urban'?['lighting','flood']:id==='health'?['dengue','pools']:['victims']);
  territoryState.crime='all';territoryState.shift='all';territoryState.city=id==='victims'?'sp':'all';territoryState.days=90;
  showPage('Camadas');fitTerritory();
}
function showTerritoryPanel(drawer){
  drawer.classList.add('territory-drawer');
  const intro=territoryEl('div','territory-intro');intro.innerHTML='<span class="territory-eyebrow">INTELIGÊNCIA TERRITORIAL</span><p>Explore padrões, combine camadas e compare dados georreferenciados.</p>';drawer.append(intro);
  const presets=territoryEl('div','territory-presets');for(const [id,title] of [['health','Saúde urbana'],['urban','Infraestrutura'],['victims','Vitimização · PM-SP']]){const b=territoryEl('button',null,title);b.onclick=()=>territoryPreset(id);presets.append(b)}drawer.append(presets);
  const list=territoryEl('fieldset','territory-list');list.append(territoryEl('legend',null,'Camadas temáticas'));
  for(const layer of territoryCatalog){const label=territoryEl('label','territory-option'),check=document.createElement('input');check.type='checkbox';check.checked=territoryState.enabled.has(layer.id);check.setAttribute('aria-label',layer.name);const swatch=territoryEl('i');swatch.style.background=layer.color;const text=territoryEl('span');text.append(territoryEl('strong',null,layer.name),territoryEl('small',null,layer.hint));label.append(check,swatch,text);check.onchange=()=>{check.checked?territoryState.enabled.add(layer.id):territoryState.enabled.delete(layer.id);updateTerritoryMap();const crime=drawer.querySelector('[data-filter="crime"]');crime.disabled=!territoryState.enabled.has('victims')};list.append(label)}drawer.append(list);
  const filters=territoryEl('div','territory-filters');
  function select(title,key,options){const label=territoryEl('label',null,title),s=document.createElement('select');s.dataset.filter=key;s.setAttribute('aria-label',title);for(const [value,name] of options){const o=territoryEl('option',null,name);o.value=value;s.append(o)}s.value=territoryState[key];s.onchange=()=>{territoryState[key]=key==='days'?+s.value:s.value;updateTerritoryMap();if(key==='city')fitTerritory()};label.append(s);filters.append(label);return s}
  select('Cidade','city',[['all','Todas as seis cidades'],...territoryCities.map(c=>[c.id,c.name])]);
  select('Período de referência','days',[[7,'Últimos 7 dias'],[30,'Últimos 30 dias'],[90,'Últimos 90 dias'],[180,'Últimos 180 dias']]);
  select('Turno do registro','shift',[['all','Todos os horários'],['day','Diurno · 06h às 17h59'],['night','Noturno · 18h às 05h59']]);
  const crime=select('Natureza da vitimização','crime',[['all','Todas as naturezas'],...territoryCatalog.find(l=>l.id==='victims').types.map(t=>[t,t])]);crime.disabled=!territoryState.enabled.has('victims');
  select('Visualização','mode',[['heat','Mapa de calor'],['grid','Grade de concentração']]);drawer.append(filters);
  const sliders=territoryEl('div','territory-sliders');
  for(const [key,title,min,max] of [['radius','Raio do calor',10,65],['opacity','Opacidade',20,100]]){const label=territoryEl('label'),span=territoryEl('span',null,title),out=territoryEl('output'),input=document.createElement('input');input.type='range';input.min=min;input.max=max;input.value=key==='opacity'?territoryState[key]*100:territoryState[key];input.setAttribute('aria-label',title);out.textContent=input.value+(key==='opacity'?'%':' px');input.oninput=()=>{territoryState[key]=+input.value/(key==='opacity'?100:1);out.textContent=input.value+(key==='opacity'?'%':' px');for(const l of territoryCatalog){if(activeMap?.getLayer('territory-heat-'+l.id))activeMap.setPaintProperty('territory-heat-'+l.id,key==='radius'?'heatmap-radius':'heatmap-opacity',territoryState[key]);if(key==='opacity'&&activeMap?.getLayer('territory-grid-'+l.id))activeMap.setPaintProperty('territory-grid-'+l.id,'fill-opacity',['interpolate',['linear'],['get','count'],1,.15,20,territoryState.opacity])}};span.append(out);label.append(span,input);sliders.append(label)}drawer.append(sliders);
  const actions=territoryEl('div','territory-actions');for(const [text,fn] of [['Enquadrar região',fitTerritory],['Limpar camadas',()=>{territoryState.enabled.clear();showPage('Camadas')}]]){const b=territoryEl('button',null,text);b.onclick=fn;actions.append(b)}drawer.append(actions);
  const summary=territoryEl('section','territory-summary');summary.id='territory-summary';summary.setAttribute('aria-live','polite');drawer.append(summary);
  const note=territoryEl('p','territory-note','Referência operacional: 18/11/2026. Resolução territorial ~1 km.');drawer.append(note);
  const base=territoryEl('details','territory-details');base.append(territoryEl('summary',null,'Rótulos do mapa base'));for(const [name,prop] of [['Nomes de lugares','showPlaceLabels'],['Nomes de vias','showRoadLabels'],['Transportes','showTransitLabels'],['Limites administrativos','showAdminBoundaries'],['Pontos de interesse','showPointOfInterestLabels']]){const label=territoryEl('label'),input=document.createElement('input');input.type='checkbox';input.checked=basemapConfig[prop];input.onchange=()=>{basemapConfig[prop]=input.checked;applyLayerPreferences()};label.append(input,name);base.append(label)}drawer.append(base);
  const sources=territoryEl('details','territory-details');sources.append(territoryEl('summary',null,'Bases e fontes integradas'));sources.append(territoryEl('p',null,'Integrações e referências cartográficas:'));
  for(const [name,url,description] of [['GeoSampa','https://novogeosampa.prefeitura.sp.gov.br/','Infraestrutura urbana e limites territoriais.'],['Dengue · Ministério da Saúde','https://dadosabertos.saude.gov.br/dataset/arboviroses-dengue','Painel epidemiológico e vigilância ambiental.'],['SSP-SP · Estatísticas','https://www.ssp.sp.gov.br/estatistica/dados-mensais','Estatísticas criminais e boletins de ocorrência.']]){const a=territoryEl('a',null,name);a.href=url;a.target='_blank';a.rel='noopener noreferrer';sources.append(a,territoryEl('p',null,description))}drawer.append(sources);
  restoreTerritoryLayers();
}
function updateTerritorySummary(records){
  const host=document.getElementById('territory-summary');if(!host)return;host.replaceChildren();
  const count=territoryEl('div','territory-total');count.append(territoryEl('strong',null,records.length.toLocaleString('pt-BR')),territoryEl('span',null,'registros no filtro selecionado'));host.append(count);
  if(!records.length){host.append(territoryEl('p','territory-empty',territoryState.enabled.size?'Nenhum registro neste recorte. Amplie o período ou altere os filtros.':'Ative uma camada ou selecione um filtro acima.'));return}
  const perLayer=territoryEl('div','territory-counts');for(const l of territoryCatalog.filter(l=>territoryState.enabled.has(l.id))){const row=territoryEl('div');row.append(territoryEl('span',null,l.name),territoryEl('strong',null,records.filter(r=>r.layer===l.id).length));perLayer.append(row)}host.append(perLayer);
  host.append(territoryEl('h3',null,'Distribuição por cidade'));
  const counts=territoryCities.map(c=>({...c,total:records.filter(r=>r.city===c.id).length})).filter(c=>c.total).sort((a,b)=>b.total-a.total);
  for(const c of counts){const button=territoryEl('button','territory-city');button.setAttribute('aria-label','Ver '+c.name+' no mapa');button.style.setProperty('--bar',c.total/counts[0].total*100+'%');button.append(territoryEl('span',null,c.name),territoryEl('strong',null,c.total));button.onclick=()=>{territoryState.city=c.id;showPage('Camadas');fitTerritory()};host.append(button)}
}
function renderTerritoryLegend(records){
  document.getElementById('territory-legend')?.remove();if(!opened||!territoryState.enabled.size)return;
  const legend=territoryEl('aside','territory-map-legend');legend.id='territory-legend';legend.setAttribute('aria-label','Legenda das camadas');legend.append(territoryEl('strong',null,'CAMADAS ATIVAS'));
  for(const l of territoryCatalog.filter(l=>territoryState.enabled.has(l.id))){const row=territoryEl('div'),dot=territoryEl('i');dot.style.background=l.color;row.append(dot,territoryEl('span',null,l.name));legend.append(row)}
  if(territoryState.mode==='heat')legend.append(territoryEl('div','territory-gradient'));
  legend.append(territoryEl('small',null,(territoryState.mode==='heat'?'Menor → maior concentração':'Mais opaco = mais registros por célula')+' · '+records.length+' registros'));
  if(territoryState.enabled.size>1)legend.append(territoryEl('small',null,'Visualização multicamadas ativa.'));
  workspace.append(legend);
}
function handleTerritoryClick(e){
  if(!opened||territoryState.mode!=='grid'||!territoryState.enabled.size)return false;
  const ids=territoryCatalog.map(l=>'territory-grid-'+l.id).filter(id=>activeMap.getLayer(id));if(!ids.length)return false;
  const features=activeMap.queryRenderedFeatures(e.point,{layers:ids});if(!features.length)return false;
  const card=territoryEl('div','territory-popup');card.append(territoryEl('strong',null,'Setor territorial · ~1 km'));
  const seen=new Set();for(const f of features){if(seen.has(f.properties.id))continue;seen.add(f.properties.id);const l=territoryCatalog.find(l=>l.id===f.properties.layer);card.append(territoryEl('p',null,l.name+': '+f.properties.count+' registros'))}
  card.append(territoryEl('small',null,'Agrupamento espacial por célula.'));
  territoryState.popup?.remove();territoryState.popup=new mapboxgl.Popup().setLngLat(e.lngLat).setDOMContent(card).addTo(activeMap);return true;
}
if(typeof module!=='undefined')module.exports={territoryCities,territoryCatalog,territoryRecords,buildTerritoryData,filterTerritoryRecords,aggregateTerritory};
