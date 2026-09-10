(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  else api.install(root);
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const CHANNEL='science-lab.experiment-state.v1';
  const READOUTS={readChip:'温度计读数',tempText:'温度',timeText:'时间',powerText:'加热功率',
    tPill:'温度（℃）',gasPill:'管内紫色程度（%）',crystalPill:'冷板附着程度（%）',
    massReadout:'质量',volumeValue:'体积',scaleReadout:'天平读数',cylinderReadout:'量筒读数',thermoReadout:'温度计读数',
    lab14WaterReadout:'水体积',lab14AlcoholReadout:'酒精体积',lab14MixReadout:'混合体积',
    gaugeText:'仪表示数',scaleRead:'测力计读数（N）',meterText:'传声现象',
    pitchReadout:'钢尺',loudReadout:'音叉',waveReadout:'波形状态',summaryReadout:'归纳状态',
    angleReadout:'入射角',reflectReadout:'反射角',planeReadout:'光线平面',refractReadout:'折射角',mediumReadout:'介质',
    motionReadout:'运动状态',meterReadout:'仪表',uReadout:'电压',iReadout:'电流',rReadout:'电阻',
    measureReadout:'测量值',timeReadout:'计时',levelReadout:'液面',currentReadout:'电流',protectionReadout:'保护状态',
    voltageReadout:'电压',modelReadout:'模型',chargeReadout:'电荷',sourceReadout:'电源'};
  function experimentPath(pathname){
    try{
      const path=decodeURIComponent(pathname);
      const match=path.match(/(?:^|\/)(physics-middle\/初中物理实验\d+(?:-\d+)?\.html)$/);
      return match?match[1]:null;
    }catch(error){return null;}
  }
  function allowedParent(origin,contentOrigin){
    if(origin==='https://lab.xingnian.net.cn') return true;
    try{
      const a=new URL(origin),b=new URL(contentOrigin);
      return [a,b].every(url=>['localhost','127.0.0.1'].includes(url.hostname)&&['http:','https:'].includes(url.protocol));
    }catch(error){return false;}
  }
  function collect(doc,path,now=Date.now()){
    // Read only explicitly named output nodes, never form values, whole pages or canvas pixels.
    const text=(ids,max=240)=>{
      for(const id of ids){
        const el=doc.getElementById(id);
        if(!el||el.matches('input,textarea,select,[contenteditable]')||el.querySelector('input,textarea,select,[contenteditable]')) continue;
        const value=(el.textContent||'').replace(/\s+/g,' ').trim();
        if(value) return value.slice(0,max);
      }
      return '';
    };
    const readouts=[];
    for(const [id,label] of Object.entries(READOUTS)){
      const value=text([id],100);
      if(value) readouts.push({label,value});
      if(readouts.length===16) break;
    }
    const cold=text(['coldPill'],100);
    if(cold&&readouts.length<16) readouts.push({label:path.endsWith('/初中物理实验3.html')?'冷凝强度（%）':'冷水扩散',value:cold});
    for(const id of ['pillA','pillB','pillC','pillD']){
      const value=text([id],100);
      if(!value||readouts.length===16) continue;
      // These shared outputs include their own experiment-specific label and unit.
      const parts=value.match(/^([^:：]{1,40})[:：]\s*(.+)$/);
      readouts.push(parts?{label:parts[1],value:parts[2]}:{label:'实验状态读数',value});
    }
    return {version:1,experimentPath:path,capturedAt:now,mode:text(['modeTag','modeChip'],100),
      status:text(['statusTag','stateChip'],160),step:text(['taskStep','stepNo'],80),
      task:text(['taskText','taskTitle']),hint:text(['taskHint']),readouts};
  }
  function install(view){
    const path=experimentPath(view.location.pathname);
    if(!path||view.parent===view) return {destroy(){}};
    function receive(event){
      const data=event.data;
      if(event.source!==view.parent||!allowedParent(event.origin,view.location.origin)||!data||
        data.channel!==CHANNEL||data.type!=='snapshot-request'||typeof data.requestId!=='string'||
        !/^[a-zA-Z0-9-]{1,96}$/.test(data.requestId)||data.experimentPath!==path) return;
      view.parent.postMessage({channel:CHANNEL,type:'snapshot',requestId:data.requestId,
        state:collect(view.document,path)},event.origin);
    }
    view.addEventListener('message',receive);
    return {destroy(){view.removeEventListener('message',receive);}};
  }
  return {CHANNEL,READOUTS,experimentPath,allowedParent,collect,install};
});
