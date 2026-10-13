# Re-frame the cutout for the hero capsule: centre the head, headroom on top, torso to the bottom edge. No pixel edits to the subject.
from PIL import Image
import numpy as np
c=Image.open('photos/portrait-cutout.png'); a=np.asarray(c)[...,3]
ys,xs=np.where(a>40); x0,x1,y0,y1=xs.min(),xs.max(),ys.min(),ys.max()
# head centre: mean x of opaque pixels in the top 25% of the subject
top=a[y0:y0+(y1-y0)//4]; hx=int(np.where(top>40)[1].mean())
H=int((y1-y0)*1.12); W=int(H*0.8)
out=Image.new('RGBA',(W,H),(0,0,0,0)); out.paste(c,(W//2-hx, H-(y1+1)),c)
out.save('photos/portrait-capsule.png',optimize=True)
for s,w in ((1,420),(2,840)):
    r=out.resize((w,int(H*w/W)),Image.LANCZOS); r.save(f'public/portrait/portrait@{s}x.webp',quality=82,method=6); r.save(f'public/portrait/portrait@{s}x.avif',quality=60)
print(W,H)
