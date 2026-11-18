function savedChristModel3D(){return {id:'model3d-christ-redeemer',name:'Cristo Redentor',location:'Corcovado · Rio de Janeiro, RJ',lng:-43.2105,lat:-22.9519,alt:-1.5,scale:0.45,viewZoom:18.5,rotationX:0,rotationY:90,rotationZ:0,visible:true,asset:null,building:null,assetPath:'assets/models/christ-redeemer-v2.glb'}}
const models3D={items:[savedChristModel3D()],draft:null,picking:false,pickMarker:null,hover:null,hoverFrame:0,buildings:true,nextId:1,runtime:null};
async function get3DRuntime(){
 if(!models3D.runtime)models3D.runtime=Promise.all([import('three'),import('./vendor/three/addons/loaders/GLTFLoader.js'),import('./vendor/three/addons/controls/OrbitControls.js'),import('./vendor/three/addons/exporters/GLTFExporter.js'),import('./vendor/meshoptimizer/meshopt_decoder.mjs')]).then(([THREE,{GLTFLoader},{OrbitControls},{GLTFExporter},{MeshoptDecoder}])=>({THREE,GLTFLoader,OrbitControls,GLTFExporter,MeshoptDecoder})).catch(error=>{models3D.runtime=null;throw error});
 return models3D.runtime;
}
function model3DElement(tag,cls,text){return imageElement(tag,cls,text)}
function model3DButton(text,fn,cls='sec-secondary'){return secButton(text,fn,cls)}
function model3DStatus(text){const el=byId('model3d-status');if(el)el.textContent=text}
function showModels3D(drawer,entering){
 if(entering){entryFlight++;activeMap.stop()}
 drawer.append(model3DElement('div','sec-status','MODELOS GEORREFERENCIADOS'),model3DElement('p','sec-intro','Importe um modelo e posicione-o por coordenadas ou escolhendo um ponto no mapa.'));
 drawer.append(model3DButton('+ Importar modelo 3D',()=>openModel3DEditor(null),'sec-primary'));
 const sample=model3DElement('div','sec-result model3d-sample');sample.append(model3DElement('strong',null,'Cristo Redentor'),model3DElement('p',null,'Modelo 3D do Cristo Redentor, pronto para posicionar no mapa.'));
 sample.append(model3DButton('Posicionar modelo',()=>openModel3DEditor(null,true)));
 const credit=model3DElement('a','model3d-credit','Archéomatique · CC BY-NC 4.0');credit.href='https://sketchfab.com/3d-models/christ-the-redeemer-rio-de-janeiro-635854a864204f4389ec92b79921cf58';credit.target='_blank';credit.rel='noopener noreferrer';sample.append(credit);if(!models3D.items.some(item=>item.assetPath==='assets/models/christ-redeemer-v2.glb')){if(models3D.items.length){const library=model3DElement('details','model3d-library');library.append(model3DElement('summary',null,'Catálogo de modelos'),sample);drawer.append(library)}else drawer.append(sample)}
 const settings=model3DElement('label','model3d-building-toggle'),check=model3DElement('input');check.type='checkbox';check.checked=models3D.buildings;check.onchange=()=>{models3D.buildings=check.checked;restoreModels3D()};settings.append(check,'Exibir prédios em 3D');drawer.append(settings);
 const status=model3DElement('p','model3d-status');status.id='model3d-status';status.setAttribute('role','status');status.textContent=models3D.picking?'Clique no mapa para selecionar a posição. Passe sobre um prédio para destacar sua referência.':'Selecione um local no mapa ou informe as coordenadas ao importar.';drawer.append(status);
 if(models3D.picking){const hint=model3DElement('div','model3d-pick-hint');hint.append(model3DElement('strong',null,'Selecionando localização'),model3DElement('p',null,'Clique em um prédio ou em qualquer ponto do mapa. Use Esc para cancelar.'),model3DButton('Cancelar seleção',()=>{cancelModel3DPick();openModel3DEditor()}));drawer.append(hint)}
 const head=model3DElement('div','sec-result-head');head.append(model3DElement('strong',null,'No mapa'),model3DElement('small',null,models3D.items.length+(models3D.items.length===1?' modelo':' modelos')));drawer.append(head);
 if(!models3D.items.length)drawer.append(model3DElement('p','sec-empty','Nenhum modelo adicionado. Importe um arquivo ou selecione um modelo do catálogo.'));
 for(const item of models3D.items){
  const card=model3DElement('article','sec-result'),title=model3DElement('div','model3d-item-title');title.append(model3DElement('strong',null,item.name),model3DElement('span','sec-pill',item.visible?'Visível':'Oculto'));card.append(title,model3DElement('p',null,item.lat.toFixed(6)+'°, '+item.lng.toFixed(6)+'°'),model3DElement('code',null,'Altitude '+item.alt+' m · Escala '+item.scale+'×'));
  if(item.location)card.append(model3DElement('p','model3d-building-ref',item.location));
  if(item.assetPath&&!item.asset)card.append(model3DElement('p','model3d-building-ref',item.loadError?'Não foi possível carregar. Clique em Ir ao local para tentar novamente.':'Carregando modelo…'));
  if(item.building)card.append(model3DElement('p','model3d-building-ref','Prédio '+item.building.id+' · '+item.building.height+' m'));
  const actions=model3DElement('div','sec-result-actions');actions.append(model3DButton(item.visible?'Ocultar':'Exibir',()=>{item.visible=!item.visible;restoreModels3D();showPage('3D')}),model3DButton('Ir ao local',()=>locateModel3D(item)),model3DButton('Editar',async()=>{if(!item.asset&&!await ensureSavedModel3D(item))return;openModel3DEditor(item)}));card.append(actions);
  card.append(model3DButton('Remover modelo',()=>removeModel3D(item),'model3d-remove'));drawer.append(card);
 }
 restoreModels3D();
 for(const item of models3D.items)if(item.assetPath&&!item.asset&&!item.loadError)ensureSavedModel3D(item);
 if(models3D.picking)activeMap.getCanvas().style.cursor='crosshair';
}
async function ensureSavedModel3D(item){
 if(item.asset)return true;if(item.loading)return item.loading;
 item.loadError=false;item.loading=(async()=>{
  try{const asset=await readModel3DAsset(item.assetPath);if(!models3D.items.includes(item)){disposeModel3DAsset(asset);return false}item.asset=asset;restoreModels3D();activeMap.triggerRepaint();return true}
  catch(error){item.loadError=true;return false}
  finally{item.loading=null;if(models3D.items.includes(item)&&currentPage==='3D'&&!document.querySelector('.model3d-dialog[open]'))showPage('3D')}
 })();return item.loading;
}
function newModel3DDraft(){const center=activeMap.getCenter();return {name:'',lng:+center.lng.toFixed(6),lat:+center.lat.toFixed(6),alt:0,scale:1,rotationX:0,rotationY:0,rotationZ:0,asset:null,building:null}}
async function readModel3DAsset(main,files=[]){
 const {THREE,GLTFLoader,GLTFExporter,MeshoptDecoder}=await get3DRuntime();
 const manager=new THREE.LoadingManager(),urls=[];
 const resourceMap=new Map(files.map(file=>[file.name,file]));
 manager.setURLModifier(url=>{
  if(url.startsWith('data:')||url.startsWith('blob:'))return url;
  const filename=decodeURIComponent(url.split('/').pop().split('?')[0]),file=resourceMap.get(filename);
  if(!file)throw Error('Arquivo auxiliar não selecionado: '+filename+'. Selecione o .gltf junto com seus arquivos .bin e texturas, ou use .glb.');
  const resolved=URL.createObjectURL(file);urls.push(resolved);return resolved;
 });
 let gltf,inputBytes;
 try{
  if(typeof main==='string'){
   const response=await fetch(main);if(!response.ok)throw Error('Não foi possível carregar o modelo.');
   inputBytes=await response.arrayBuffer();gltf=await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).parseAsync(inputBytes,'');
  }else{
   const input=/\.gltf$/i.test(main.name)?await main.text():await main.arrayBuffer();
   gltf=await new GLTFLoader(manager).setMeshoptDecoder(MeshoptDecoder).parseAsync(input,'');
  }
  if(!gltf.scene||!gltf.scene.children.length)throw Error('O arquivo não contém uma cena 3D.');
  const bytes=inputBytes||await new GLTFExporter().parseAsync(gltf.scene,{binary:true,onlyVisible:false});
  const dimensions=new THREE.Box3().setFromObject(gltf.scene).getSize(new THREE.Vector3());
  return {url:URL.createObjectURL(new Blob([bytes],{type:'model/gltf-binary'})),scene:gltf.scene,THREE,custom:typeof main==='string',size:{x:dimensions.x,y:dimensions.y,z:dimensions.z},bytes:bytes.byteLength,filename:typeof main==='string'?'christ-redeemer-v2.glb':main.name};
 }finally{urls.forEach(url=>URL.revokeObjectURL(url))}
}
function disposeModel3DAsset(asset){
 if(!asset)return;URL.revokeObjectURL(asset.url);const geometries=new Set(),materials=new Set(),textures=new Set();asset.scene.traverse(node=>{if(node.geometry)geometries.add(node.geometry);for(const m of Array.isArray(node.material)?node.material:node.material?[node.material]:[])materials.add(m)});materials.forEach(m=>Object.values(m).forEach(value=>{if(value?.isTexture)textures.add(value)}));geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());
}
async function setupModel3DPreview(host,asset,draft){
 const {THREE,OrbitControls}=await get3DRuntime();const scene=new THREE.Scene();scene.background=new THREE.Color('#eef2f7');
 const camera=new THREE.PerspectiveCamera(40,1,.01,10000),renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.3;host.replaceChildren(renderer.domElement);renderer.domElement.setAttribute('aria-label','Prévia interativa do modelo 3D');
 scene.add(new THREE.HemisphereLight(0xffffff,0x748399,3));const sun=new THREE.DirectionalLight(0xffffff,3);sun.position.set(8,15,10);scene.add(sun);
 const root=new THREE.Group(),object=asset.scene.clone(true);root.add(object);scene.add(root);
 const box=new THREE.Box3().setFromObject(object),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3()),extent=Math.max(size.x,size.y,size.z)||1;
 object.position.sub(center);const grid=new THREE.GridHelper(extent*3,20,0xb5c2d2,0xd8e0eb);grid.position.y=-size.y/2;scene.add(grid);
 camera.position.set(extent*1.1,extent*.75,extent*1.3);camera.near=extent/1000;camera.far=extent*100;camera.updateProjectionMatrix();
 const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=false;controls.minDistance=extent*.3;controls.maxDistance=extent*8;controls.target.set(0,0,0);controls.update();
 const render=()=>renderer.render(scene,camera),resize=()=>{if(!host.isConnected)return;const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();render()};
 controls.addEventListener('change',render);const observer=new ResizeObserver(resize);observer.observe(host);resize();
 return {update(){root.rotation.set(THREE.MathUtils.degToRad(draft.rotationX),THREE.MathUtils.degToRad(draft.rotationY),THREE.MathUtils.degToRad(draft.rotationZ));render()},dispose(){observer.disconnect();controls.dispose();grid.geometry.dispose();grid.material.dispose();renderer.dispose();renderer.forceContextLoss()}};
}
function openModel3DEditor(item=null,catalog=false){
 if(item)models3D.draft={...item};else if(!models3D.draft)models3D.draft=newModel3DDraft();const draft=models3D.draft;
 const dialog=model3DElement('dialog','findface-dialog model3d-dialog');dialog.setAttribute('aria-labelledby','model3d-editor-title');const heading=model3DElement('h2',null,draft.id?'Editar modelo 3D':'Adicionar modelo 3D');heading.id='model3d-editor-title';const close=securityCloseButton('Fechar editor 3D',dialog);dialog.append(close,heading,model3DElement('p',null,'Importe o arquivo, confira a prévia e ajuste a localização no mapa.'));
 const form=model3DElement('form','sec-form model3d-form');let preview=null,loadTicket=0,loading=false;
 function field(key,title,min,max,step='any'){
  const group=model3DElement('div'),label=model3DElement('label',null,title),input=model3DElement('input');input.id='model3d-'+key;label.htmlFor=input.id;input.type=key==='name'?'text':'number';input.required=true;input.value=draft[key];
  if(key==='name')input.maxLength=80;else{input.step=step;if(min!==undefined)input.min=min;if(max!==undefined)input.max=max}
  input.oninput=()=>{input.setCustomValidity('');draft[key]=key==='name'?input.value:Number(input.value);if(['rotationX','rotationY','rotationZ'].includes(key))preview?.update();if(['lng','lat'].includes(key))draft.building=null};group.append(label,input);return {group,input};
 }
 const name=field('name','Nome do modelo');form.append(name.group);
 const fileBlock=model3DElement('div'),fileLabel=model3DElement('label',null,'Arquivo 3D'),file=model3DElement('input');file.type='file';file.id='model3d-file';file.multiple=true;file.accept='.glb,.gltf,.bin,.png,.jpg,.jpeg,.webp';fileLabel.htmlFor=file.id;fileBlock.append(fileLabel,file,model3DElement('small',null,'GLB ou GLTF · até 50 MB. Para GLTF, selecione também os arquivos .bin e as texturas.'));form.append(fileBlock);
 const host=model3DElement('div','model3d-preview'+(draft.asset?'':' is-empty'));host.append(model3DElement('p',null,'A prévia aparecerá aqui ao carregar um modelo.'));const previewHelp=model3DElement('small','model3d-preview-help','Arraste para girar · Use o scroll para aproximar');previewHelp.hidden=!draft.asset;form.append(host,previewHelp);
 const error=model3DElement('p','model3d-form-error');error.setAttribute('role','status');form.append(error);
 const location=model3DElement('section','model3d-location'),positioning=model3DElement('div','model3d-positioning'),locationText=model3DElement('div','model3d-location-copy');locationText.append(model3DElement('h3',null,'Localização'),model3DElement('p',null,'Selecione um ponto no mapa ou informe as coordenadas.'));
 const pickButton=model3DButton('',()=>{dialog.close('pick');startModel3DPick()},'sec-secondary model3d-pick-button'),pickIcon=model3DElement('span','model3d-pick-icon','⌖');pickIcon.setAttribute('aria-hidden','true');pickButton.append(pickIcon,model3DElement('span',null,'Selecionar no mapa'));positioning.append(locationText,pickButton);location.append(positioning);
 const position=model3DElement('div','model3d-fields');for(const args of [['lng','Longitude',-180,180],['lat','Latitude',-85,85],['alt','Altitude (m)',-500,10000]])position.append(field(...args).group);location.append(position,model3DElement('small',null,'Ao selecionar um prédio, a altitude acompanha a altura da cobertura.'));form.append(location);
 if(draft.building)location.append(model3DElement('div','model3d-selected-building','Prédio '+draft.building.id+' · Altura estimada: '+draft.building.height+' m. A altitude foi ajustada para a cobertura.'));
 const transform=model3DElement('div','model3d-fields');for(const args of [['scale','Escala',.001,10000],['rotationZ','Rotação Z (°)',-360,360],['rotationX','Rotação X (°)',-360,360],['rotationY','Rotação Y (°)',-360,360]])transform.append(field(...args).group);const adjustments=model3DElement('details','model3d-adjustments');adjustments.open=!!draft.id;adjustments.append(model3DElement('summary',null,'Escala e rotação'),transform);form.append(adjustments);
 const footer=model3DElement('div','model3d-editor-actions'),cancel=model3DButton('Cancelar',()=>dialog.close()),submit=model3DElement('button','sec-primary',draft.id?'Salvar alterações':'Adicionar ao mapa');submit.type='submit';submit.disabled=!draft.asset;footer.append(cancel,submit);form.append(footer);dialog.append(form);
 async function loadAsset(main,resources=[]){
  const ticket=++loadTicket;loading=true;submit.disabled=true;file.disabled=true;pickButton.disabled=true;error.textContent='Carregando modelo…';
  try{const asset=await readModel3DAsset(main,resources);if(ticket!==loadTicket||!dialog.open){disposeModel3DAsset(asset);return}const old=draft.asset;preview?.dispose();preview=null;draft.asset=asset;if(!draft.name){draft.name=typeof main==='string'?'Cristo Redentor':main.name.replace(/\.(glb|gltf)$/i,'');name.input.value=draft.name}host.classList.remove('is-empty');previewHelp.hidden=false;preview=await setupModel3DPreview(host,asset,draft);preview.update();if(old&&!models3D.items.some(m=>m.asset===old))disposeModel3DAsset(old);error.textContent='Modelo carregado · '+(asset.bytes/1024/1024).toFixed(2)+' MB';submit.disabled=false;
  }catch(e){error.textContent=e.message||'Não foi possível ler o modelo.';submit.disabled=!draft.asset}finally{if(ticket===loadTicket){loading=false;file.disabled=false;pickButton.disabled=false}}
 }
 file.onchange=()=>{const files=Array.from(file.files),main=files.filter(f=>/\.(glb|gltf)$/i.test(f.name));if(main.length!==1){error.textContent='Selecione exatamente um modelo .glb ou .gltf, junto com os arquivos auxiliares quando necessário.';return}if(files.reduce((sum,f)=>sum+f.size,0)>50*1024*1024){error.textContent='Os arquivos selecionados ultrapassam 50 MB.';return}loadAsset(main[0],files)};
 form.onsubmit=e=>{e.preventDefault();if(loading||!draft.asset)return;name.input.setCustomValidity(draft.name.trim()?'':'Informe um nome para o modelo.');if(!form.reportValidity())return;
  try{draft.name=draft.name.trim();const original=models3D.items.find(m=>m.id===draft.id),saved={...draft,id:draft.id||'model3d-'+models3D.nextId++,visible:original?.visible??true};installModel3D(saved,true);if(original){const index=models3D.items.indexOf(original);models3D.items[index]=saved;if(original.asset!==saved.asset)disposeModel3DAsset(original.asset)}else models3D.items.push(saved);models3D.draft=null;models3D.pickMarker?.remove();models3D.pickMarker=null;dialog.close('saved');showPage('3D');byId('drawer').scrollTop=0;locateModel3D(saved);
  }catch(e){error.textContent='Não foi possível adicionar o modelo: '+e.message}
 };
 dialog.addEventListener('close',()=>{loadTicket++;preview?.dispose();dialog.remove();if(dialog.returnValue!=='pick'&&dialog.returnValue!=='saved'){if(draft.asset&&!models3D.items.some(m=>m.asset===draft.asset))disposeModel3DAsset(draft.asset);models3D.draft=null;models3D.pickMarker?.remove();models3D.pickMarker=null}},{once:true});
 document.body.append(dialog);dialog.showModal();
 if(draft.asset){setupModel3DPreview(host,draft.asset,draft).then(p=>{if(!dialog.open){p.dispose();return}preview=p;p.update()}).catch(e=>error.textContent=e.message)}else if(catalog)loadAsset('assets/models/christ-redeemer-v2.glb');name.input.focus();
}
function installModel3D(item,replace=false){
 if(!item.asset)return;
 const map=activeMap,id=item.id;if(replace){if(map.getLayer(id))map.removeLayer(id);if(map.getSource(id))map.removeSource(id);if(map.hasModel(id))map.removeModel(id)}
 if(item.asset.custom){
  if(map.getLayer(id)){map.triggerRepaint();return}
  const {THREE}=item.asset;
  map.addLayer({id,type:'custom',renderingMode:'3d',onAdd(map,gl){
   this.camera=new THREE.Camera();this.scene=new THREE.Scene();this.scene.add(item.asset.scene.clone(true));this.scene.add(new THREE.HemisphereLight(0xffffff,0x748399,3));const light=new THREE.DirectionalLight(0xffffff,3);light.position.set(8,15,10);this.scene.add(light);
   this.renderer=new THREE.WebGLRenderer({canvas:map.getCanvas(),context:gl,antialias:true});this.renderer.autoClear=false;this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.3;
  },render(gl,matrix){
   if(!item.visible||map.getZoom()<14.5)return;const origin=mapboxgl.MercatorCoordinate.fromLngLat([item.lng,item.lat],item.alt),scale=origin.meterInMercatorCoordinateUnits()*item.scale;
   const transform=new THREE.Matrix4().makeTranslation(origin.x,origin.y,origin.z).scale(new THREE.Vector3(scale,-scale,scale)).multiply(new THREE.Matrix4().makeRotationX(Math.PI/2)).multiply(new THREE.Matrix4().makeRotationX(THREE.MathUtils.degToRad(item.rotationX))).multiply(new THREE.Matrix4().makeRotationY(THREE.MathUtils.degToRad(item.rotationY))).multiply(new THREE.Matrix4().makeRotationZ(THREE.MathUtils.degToRad(item.rotationZ)));
   this.camera.projectionMatrix.fromArray(matrix).multiply(transform);this.renderer.resetState();this.renderer.render(this.scene,this.camera);
  },onRemove(){this.renderer.dispose()}});return;
 }
 if(!map.hasModel(id))map.addModel(id,item.asset.url);
 if(!map.getSource(id))map.addSource(id,{type:'geojson',data:{type:'FeatureCollection',features:[{type:'Feature',properties:{},geometry:{type:'Point',coordinates:[item.lng,item.lat]}}]}});
 if(!map.getLayer(id))map.addLayer({id,type:'model',source:id,layout:{'model-id':id,visibility:item.visible?'visible':'none'},paint:{'model-scale':[item.scale,item.scale,item.scale],'model-rotation':[item.rotationX,item.rotationY,item.rotationZ],'model-translation':[0,0,item.alt],'model-emissive-strength':.25}});
 else map.setLayoutProperty(id,'visibility',item.visible?'visible':'none');
}
function restoreModels3D(){
 if(!activeMap)return;
 const sourceLayer=activeMap.getStyle().layers?.find(layer=>layer['source-layer']==='building'&&['fill','fill-extrusion'].includes(layer.type));
 if(sourceLayer&&!activeMap.getLayer('model3d-buildings'))activeMap.addLayer({id:'model3d-buildings',type:'fill-extrusion',source:sourceLayer.source,'source-layer':'building',minzoom:15,paint:{'fill-extrusion-color':'#d4dde8','fill-extrusion-height':['coalesce',['get','height'],8],'fill-extrusion-base':['coalesce',['get','min_height'],0],'fill-extrusion-opacity':.85}});
 if(activeMap.getLayer('model3d-buildings'))activeMap.setLayoutProperty('model3d-buildings','visibility',models3DBuildingsVisible()?'visible':'none');
 for(const item of models3D.items)installModel3D(item);
}
function locateModel3D(item){entryFlight++;activeMap.stop();if(!item.asset&&item.assetPath)ensureSavedModel3D(item);const size=item.asset?.size;const extent=size?Math.max(size.x,size.z,size.y)*item.scale:10;const zoom=item.viewZoom??Math.max(14,Math.min(20,20-Math.log2(Math.max(18,extent)/18)));activeMap.flyTo({center:[item.lng,item.lat],zoom,pitch:60,bearing:-20,duration:1100,padding:{left:innerWidth>700?450:85,right:40,top:80,bottom:80},retainPadding:false})}
function removeModel3D(item){const map=activeMap;if(map.getLayer(item.id))map.removeLayer(item.id);if(map.getSource(item.id))map.removeSource(item.id);if(map.hasModel(item.id))map.removeModel(item.id);models3D.items=models3D.items.filter(m=>m!==item);disposeModel3DAsset(item.asset);showPage('3D')}
function setModel3DHover(feature){
 const empty={type:'FeatureCollection',features:[]},data=feature?{type:'FeatureCollection',features:[{type:'Feature',properties:{},geometry:feature.geometry}]}:empty;
 if(!activeMap.getSource('model3d-hover'))activeMap.addSource('model3d-hover',{type:'geojson',data});else activeMap.getSource('model3d-hover').setData(data);
 if(!activeMap.getLayer('model3d-hover-fill'))activeMap.addLayer({id:'model3d-hover-fill',type:'fill',source:'model3d-hover',paint:{'fill-color':'#bc3255','fill-opacity':.2}});
 if(!activeMap.getLayer('model3d-hover-line'))activeMap.addLayer({id:'model3d-hover-line',type:'line',source:'model3d-hover',paint:{'line-color':'#bc3255','line-width':2}});
}
function model3DBuildingAt(point){
 const layers=activeMap.getStyle().layers.filter(l=>l['source-layer']==='building'&&['fill','fill-extrusion'].includes(l.type)).map(l=>l.id);
 return layers.length?activeMap.queryRenderedFeatures(point,{layers}).find(f=>['Polygon','MultiPolygon'].includes(f.geometry.type)):null;
}
function startModel3DPick(){
 entryFlight++;activeMap.stop();models3D.picking=true;pinMode=false;showPage('3D');byId('drawer').scrollTop=0;
 if(activeMap.getZoom()<16){model3DStatus('Aproxime o mapa para identificar os prédios, ou clique em qualquer ponto para selecionar coordenadas.');activeMap.easeTo({zoom:16,pitch:45,duration:900})}
 activeMap.getCanvas().style.cursor='crosshair';activeMap.getCanvas().focus();
}
function cancelModel3DPick(){models3D.picking=false;models3D.hover=null;if(activeMap){activeMap.getCanvas().style.cursor='';if(activeMap.getSource('model3d-hover'))setModel3DHover(null)}}
function handleModel3DClick(event){
 if(!models3D.picking)return false;const feature=model3DBuildingAt(event.point),draft=models3D.draft||newModel3DDraft();draft.lng=+event.lngLat.lng.toFixed(7);draft.lat=+event.lngLat.lat.toFixed(7);draft.building=feature?{id:String(feature.id??feature.properties?.osm_id??'selecionado'),height:Math.max(0,Number(feature.properties?.height)||8)}:null;draft.alt=draft.building?draft.building.height:0;models3D.draft=draft;
 models3D.pickMarker?.remove();models3D.pickMarker=new mapboxgl.Marker({color:'#b32a49'}).setLngLat([draft.lng,draft.lat]).addTo(activeMap);cancelModel3DPick();showPage('3D');openModel3DEditor();return true;
}
function initModel3DInteractions(map){
 map.on('mousemove',e=>{if(!models3D.picking||models3D.hoverFrame)return;models3D.hoverFrame=requestAnimationFrame(()=>{models3D.hoverFrame=0;if(!models3D.picking)return;const feature=model3DBuildingAt(e.point);setModel3DHover(feature);models3D.hover=feature;model3DStatus(feature?'Prédio identificado · Clique para usar a posição e a altura da cobertura.':'Clique para capturar latitude e longitude deste ponto.');map.getCanvas().style.cursor=feature?'pointer':'crosshair'})});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&models3D.picking){e.preventDefault();cancelModel3DPick();showPage('3D');openModel3DEditor()}});
}
function clearModels3D(){cancelModel3DPick();models3D.pickMarker?.remove();models3D.pickMarker=null;for(const item of models3D.items){if(activeMap?.getLayer(item.id))activeMap.removeLayer(item.id);if(activeMap?.getSource(item.id))activeMap.removeSource(item.id);if(activeMap?.hasModel(item.id))activeMap.removeModel(item.id);disposeModel3DAsset(item.asset)}models3D.items=[savedChristModel3D()];if(models3D.draft?.asset)disposeModel3DAsset(models3D.draft.asset);models3D.draft=null}

function models3DBuildingsVisible(){return models3D.buildings&&(currentPage==='3D'||models3D.items.some(item=>item.visible))}
function syncModels3DVisibility(){if(activeMap?.getLayer('model3d-buildings'))activeMap.setLayoutProperty('model3d-buildings','visibility',models3DBuildingsVisible()?'visible':'none')}
