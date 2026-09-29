"""Crop embedded PNGs in the current Figma sticker exports without resampling.

Requires Pillow. Run: python scripts/optimize-haesol.py
Original SVGs remain untouched; copy-assets checks their hashes before using outputs.
"""
from pathlib import Path
import re,base64,io,math,json,hashlib
from PIL import Image
root=Path(__file__).resolve().parents[1]; source=root/'design'/'해솔'/'해솔 svg'; dest=root/'design'/'optimized-haesol';dest.mkdir(exist_ok=True)
report=[]
for file in sorted(source.glob('*.svg')):
    svg=file.read_text(encoding='utf-8'); image=re.search(r'<image\b[^>]+/>',svg).group(); use=re.search(r'<use\b[^>]+/>',svg).group()
    assert len(re.findall(r'<image\b',svg)) == 1 and len(re.findall(r'<use\b',svg)) == 1, file.name
    assert not re.search(r'\s[xy]="',image), file.name
    data=re.search(r'data:image/png;base64,([^\"]+)',image); raw=base64.b64decode(data[1]); im=Image.open(io.BytesIO(raw)); im.load()
    transform=re.search(r'transform="([^"]+)"',use)[1]
    assert re.fullmatch(r'(scale|matrix)\([^()]+\)', transform), file.name
    values=list(map(float,re.search(r'\(([^)]+)\)',transform)[1].split()))
    if transform.startswith('scale('): a,d=values; b=c=e=f=0
    else: a,b,c,d,e,f=values
    det=a*d-b*c
    points=[((d*(x-e)-c*(y-f))/det,(-b*(x-e)+a*(y-f))/det) for x,y in [(0,0),(1,0),(0,1),(1,1)]]
    left=max(0,math.floor(min(x for x,y in points))-4);top=max(0,math.floor(min(y for x,y in points))-4)
    right=min(im.width,math.ceil(max(x for x,y in points))+4);bottom=min(im.height,math.ceil(max(y for x,y in points))+4)
    assert right>left and bottom>top,file.name
    crop=im.crop((left,top,right,bottom)); buf=io.BytesIO();crop.save(buf,format='PNG',optimize=True)
    newimage=image.replace(data[0],'data:image/png;base64,'+base64.b64encode(buf.getvalue()).decode())
    newimage=re.sub(r'\bwidth="[^"]+"',f'width="{right-left}"',newimage);newimage=re.sub(r'\bheight="[^"]+"',f'height="{bottom-top}"',newimage)
    newimage=newimage.replace('<image ',f'<image x="{left}" y="{top}" ',1)
    optimized=svg.replace(image,newimage)
    original=file.read_bytes(); out=optimized.encode()
    if len(out)>=len(original):out=original
    (dest/file.name).write_bytes(out)
    report.append(dict(file=file.name,sourceSha256=hashlib.sha256(original.replace(b'\r\n',b'\n')).hexdigest(),optimizedSha256=hashlib.sha256(out.replace(b'\r\n',b'\n')).hexdigest(),before=len(original),after=len(out),crop=[left,top,right,bottom]))
(dest/'manifest.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(dict(files=len(report),before=sum(x['before'] for x in report),after=sum(x['after'] for x in report)),ensure_ascii=False))
