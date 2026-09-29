/** Local-only review: synthetic photos, no camera, upload, or printer calls. */
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { HomecomingPhotoSelect } from '../src/HomecomingFrame';
import { HOMECOMING_FRAMES } from '../src/shared/homecomingFrames';
import { composeHomecomingPrint } from '../src/lib/composeCanvas';
import type { Shot } from '../src/shared/types';
import '../src/styles.css';

const colors = ['#ea5967', '#4d83d6', '#69b47b', '#e8b94d', '#ac80ce', '#68babe'];
const photos = colors.map((color, index) => {
  const canvas = document.createElement('canvas'); canvas.width = 800; canvas.height = 1000;
  const ctx = canvas.getContext('2d')!; ctx.fillStyle = color; ctx.fillRect(0, 0, 800, 1000);
  ctx.fillStyle = '#fff'; ctx.font = 'bold 240px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(String(index + 1), 400, 600);
  return canvas.toDataURL();
});
const scale = () => document.documentElement.style.setProperty('--app-scale', String(Math.min(innerWidth / 1080, innerHeight / 1920)));
scale(); addEventListener('resize', scale);
function Review() {
  const [frameId, setFrameId] = useState('homecoming_1');
  const [order, setOrder] = useState<number[]>([]);
  const [message, setMessage] = useState('선택 후 합성 검증');
  const shots: Shot[] = photos.map((previewUrl, index) => ({index, previewUrl, captured:true, localPath:null, selectedOrder:order.includes(index) ? order.indexOf(index) + 1 : null}));
  const verify = async () => {
    try {
      for (const frame of HOMECOMING_FRAMES) {
        const blob = await composeHomecomingPrint(order.map(i => photos[i]), frame.id);
        const bitmap = await createImageBitmap(blob);
        if (bitmap.width !== 1200 || bitmap.height !== 1800) throw Error('print dimensions');
        const canvas = document.createElement('canvas'); canvas.width=1200; canvas.height=1800;
        const ctx=canvas.getContext('2d')!; ctx.drawImage(bitmap,0,0);
        frame.slots.forEach((slot,i) => {
          const x = Math.round((slot.x+slot.w*.5)*1200/frame.width);
          const y = Math.round((slot.y+slot.h*.25)*1800/frame.height);
          const actual=Array.from(ctx.getImageData(x,y,1,1).data).slice(0,3);
          const expected=colors[order[i]].slice(1).match(/../g)!.map(v=>parseInt(v,16));
          if(actual.some((v,j)=>Math.abs(v-expected[j])>2)) throw Error(frame.id+' slot '+i+' color/order');
        });
        const link=document.createElement('a');link.textContent=frame.name+' PNG';link.download=frame.id+'.png';link.href=URL.createObjectURL(blob);
        link.style.cssText='display:block;background:white;color:black;padding:10px';document.getElementById('results')!.append(link);
      }
      setMessage('PASS: 4 layouts, 1200×1800, 16 photo slots and selected order');
    } catch(e) {setMessage('FAIL: '+String(e));}
  };
  return <><div className="app-viewport"><div className="app-scale"><main className="screen screen--select screen--homecoming">
    <HomecomingPhotoSelect frameId={frameId} shots={shots} selectedShots={order.map(i=>shots[i])}
      onToggle={i=>setOrder(prev=>prev.includes(i)?prev.filter(v=>v!==i):prev.length<4?[...prev,i]:prev)}
      onBack={()=>setOrder([])} onPrint={()=>void verify()} />
  </main></div></div><aside style={{position:'fixed',right:0,top:0,zIndex:999,background:'white',font:'12px sans-serif',width:180}}>
    <label>검토 프레임<select aria-label="검토 프레임" value={frameId} onChange={e=>setFrameId(e.target.value)}>{HOMECOMING_FRAMES.map(f=><option key={f.id} value={f.id}>{f.name}</option>)}</select></label>
    <p role="status">{message}</p><div id="results" /></aside></>;
}
createRoot(document.getElementById('root')!).render(<Review />);
