/** Local-only review: synthetic photos, no camera, upload, or printer calls. */
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { HomecomingPhotoSelect } from '../src/HomecomingFrame';
import { POCHEON_FRAMES, getPocheonCaptureCrop } from '../src/shared/pocheonFrames';
import { captureCameraFrame } from '../src/lib/captureFrame';
import { PocheonFrame } from '../src/PocheonFrame';
import { composePocheonPrint } from '../src/lib/composeCanvas';
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
  const [frameId, setFrameId] = useState('pocheon_1');
  const [order, setOrder] = useState<number[]>([]);
  const [message, setMessage] = useState('선택 후 합성 검증');
  const shots: Shot[] = photos.map((previewUrl, index) => ({index, previewUrl, captured:true, localPath:null, selectedOrder:order.includes(index) ? order.indexOf(index) + 1 : null}));
  const verify = async () => {
    try {
      for (const frame of POCHEON_FRAMES) {
        // Simulate wide, standard and portrait cameras. Edge colors must survive
        // capture and final placement in every slot, including shorter bottom slots.
        for (const [width, height] of [[1920,1080], [640,480], [720,1280]]) {
          const source = document.createElement('canvas'); source.width=width; source.height=height;
          const sourceCtx=source.getContext('2d')!;
          const crop=getPocheonCaptureCrop(frame.id,width,height);
          const aspect=frame.slots[0].w/frame.slots[0].h;
          if (Math.abs(crop.width/crop.height-aspect)>1e-9 || Math.abs(crop.x*2+crop.width-width)>1e-6 || Math.abs(crop.y*2+crop.height-height)>1e-6) throw Error('camera crop geometry');
          sourceCtx.fillStyle='#ff00ff';sourceCtx.fillRect(0,0,width,height);
          sourceCtx.fillStyle='#ffffff';sourceCtx.fillRect(crop.x,crop.y,crop.width,crop.height);
          sourceCtx.fillStyle='#00ffff';sourceCtx.fillRect(crop.x,crop.y,crop.width*.15,crop.height);
          sourceCtx.fillStyle='#ffff00';sourceCtx.fillRect(crop.x+crop.width*.85,crop.y,crop.width*.15,crop.height);
          const captured=captureCameraFrame(source,width,height,frame.id);
          if (Math.abs(captured.width/captured.height-aspect)>.003) throw Error('saved photo aspect');
          const cropBlob=await composePocheonPrint(Array(4).fill(captured.toDataURL()),frame.id);
          const cropBitmap=await createImageBitmap(cropBlob);
          const result=document.createElement('canvas');result.width=1200;result.height=1800;
          const resultCtx=result.getContext('2d')!;resultCtx.drawImage(cropBitmap,0,0);
          for (const slot of frame.slots) {
            for (const [fraction,expected] of [[.05,[255,255,0]],[.95,[0,255,255]]] as const) {
              const x=Math.round((slot.x+slot.w*fraction)*1200/frame.width);
              const y=Math.round((slot.y+slot.h*.5)*1800/frame.height);
              const pixel=resultCtx.getImageData(x,y,1,1).data;
              if(expected.some((value,i)=>Math.abs(value-pixel[i])>2)) throw Error('captured edges cropped or mirror mismatch');
            }
          }
          cropBitmap.close();
        }
        const blob = await composePocheonPrint(order.map(i => photos[i]), frame.id);
        const bitmap = await createImageBitmap(blob);
        if (bitmap.width !== 1200 || bitmap.height !== 1800) throw Error('print dimensions');
        const canvas = document.createElement('canvas'); canvas.width=1200; canvas.height=1800;
        const ctx=canvas.getContext('2d')!; ctx.drawImage(bitmap,0,0);
        frame.slots.forEach((slot,i) => {
          for (const fraction of [.08, .5, .92]) {
          const x = Math.round((slot.x+slot.w*fraction)*1200/frame.width);
          const y = Math.round((slot.y+slot.h*.25)*1800/frame.height);
          const actual=Array.from(ctx.getImageData(x,y,1,1).data).slice(0,3);
          const expected=colors[order[i]].slice(1).match(/../g)!.map(v=>parseInt(v,16));
          if(actual.some((v,j)=>Math.abs(v-expected[j])>2)) throw Error(frame.id+' slot '+i+' color/order');
          }
        });
        const link=document.createElement('a');link.textContent=frame.name+' PNG';link.download=frame.id+'.png';link.href=URL.createObjectURL(blob);
        link.style.cssText='display:block;background:white;color:black;padding:10px';document.getElementById('results')!.append(link);
      }
      setMessage('PASS: 6 camera crops, mirrored edges in 24 slots, 2 layouts, 1200×1800, selected order');
    } catch(e) {setMessage('FAIL: '+String(e));}
  };
  return <><div className="app-viewport"><div className="app-scale"><main className="screen screen--select screen--homecoming screen--pocheon">
    <HomecomingPhotoSelect frameId={frameId} shots={shots} selectedShots={order.map(i=>shots[i])} preview={<PocheonFrame frameId={frameId} photos={order.map(i=>photos[i])} />}
      onToggle={i=>setOrder(prev=>prev.includes(i)?prev.filter(v=>v!==i):prev.length<4?[...prev,i]:prev)}
      onBack={()=>setOrder([])} onPrint={()=>void verify()} />
  </main></div></div><aside style={{position:'fixed',right:0,top:0,zIndex:999,background:'white',font:'12px sans-serif',width:180}}>
    <label>검토 프레임<select aria-label="검토 프레임" value={frameId} onChange={e=>setFrameId(e.target.value)}>{POCHEON_FRAMES.map(f=><option key={f.id} value={f.id}>{f.name}</option>)}</select></label>
    <p role="status">{message}</p><div id="results" /></aside></>;
}
createRoot(document.getElementById('root')!).render(<Review />);
