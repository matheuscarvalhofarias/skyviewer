const test=require('node:test');
const assert=require('node:assert/strict');
const data=require('./layers.js');
const base={enabled:new Set(data.territoryCatalog.map(l=>l.id)),city:'all',days:180,shift:'all',crime:'all'};
test('dataset is deterministic and covers all six cities and five themes',()=>{
  assert.deepEqual(data.buildTerritoryData(),data.territoryRecords);
  assert.equal(new Set(data.territoryRecords.map(r=>r.id)).size,data.territoryRecords.length);
  for(const c of data.territoryCities)for(const l of data.territoryCatalog)assert(data.territoryRecords.some(r=>r.city===c.id&&r.layer===l.id));
});
test('victim filters combine city, period, shift and nature',()=>{
  const rows=data.filterTerritoryRecords({...base,enabled:new Set(['victims']),city:'sp',days:30,shift:'night',crime:'Roubo'});
  assert.equal(rows.length,7);
  assert(rows.every(r=>r.city==='sp'&&r.layer==='victims'&&r.age<30&&(r.hour<6||r.hour>=18)&&r.type==='Roubo'));
});
test('day and night partition the data without duplication',()=>{
  const day=data.filterTerritoryRecords({...base,shift:'day'}),night=data.filterTerritoryRecords({...base,shift:'night'});
  assert.equal(day.length+night.length,data.territoryRecords.length);
  assert.equal(new Set([...day,...night].map(r=>r.id)).size,data.territoryRecords.length);
});
test('empty selection clears both geometry collections',()=>{
  const rows=data.filterTerritoryRecords({...base,enabled:new Set()});assert.equal(rows.length,0);
  assert.equal(data.aggregateTerritory(rows).points.features.length,0);assert.equal(data.aggregateTerritory(rows).polygons.features.length,0);
});
test('aggregation preserves every count and creates closed geographic cells',()=>{
  const aggregate=data.aggregateTerritory(data.territoryRecords);
  assert.equal(aggregate.points.features.reduce((n,f)=>n+f.properties.count,0),data.territoryRecords.length);
  assert.equal(aggregate.points.features.length,aggregate.polygons.features.length);
  for(const f of aggregate.polygons.features){const ring=f.geometry.coordinates[0];assert.deepEqual(ring[0],ring[4]);assert.equal(f.properties.active,true);assert(f.properties.count>0)}
});
test('crime filters do not filter other themes and periods are nested',()=>{
  const other={...base,enabled:new Set(['pools','dengue'])};assert.deepEqual(data.filterTerritoryRecords({...other,crime:'Roubo'}),data.filterTerritoryRecords(other));
  const seven=data.filterTerritoryRecords({...base,days:7}),thirty=new Set(data.filterTerritoryRecords({...base,days:30}).map(r=>r.id));assert(seven.every(r=>thirty.has(r.id)));
});
