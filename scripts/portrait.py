# Portrait pipeline: crop head+torso, background removal (rembg), gentle palette grade, cosmic rim light.
# Face/body pixels are not reshaped — only global tone/colour and an additive edge glow.
import sys, numpy as np
from PIL import Image, ImageFilter, ImageEnhance
from rembg import remove, new_session
SRC=sys.argv[1]; OUT='/workspace/portfolio/photos'
im=Image.open(SRC).convert('RGB')
crop=im.crop((335,400,1000,1000))  # head and upper torso, above the laptop
crop.save(f'{OUT}/portrait-original-crop.jpg',quality=92)
sess=new_session(sys.argv[2] if len(sys.argv)>2 else 'birefnet-portrait')
cut=remove(crop,session=sess,post_process_mask=True)
a=np.asarray(cut).astype(np.float32)
rgb,alpha=a[...,:3],a[...,3:]/255
# grade: slight lift of shadows toward deep blue, cool mids, keep skin natural (low strength)
g=rgb/255
g=g*0.94+0.03*np.array([.55,.6,1.0])        # lift blacks toward blue
g=np.clip((g-.5)*1.06+.5,0,1)                # gentle contrast
lum=(g@np.array([.299,.587,.114]))[...,None]
g=lum+(g-lum)*0.92                           # -8% saturation
# rim light: glow from alpha edge, amber from upper-right, violet from left
A=Image.fromarray((alpha[...,0]*255).astype(np.uint8))
inner=np.asarray(A.filter(ImageFilter.GaussianBlur(10))).astype(np.float32)/255
edge=np.clip(alpha[...,0]-inner,0,1)*alpha[...,0]
h,w=edge.shape; yy,xx=np.mgrid[0:h,0:w]/np.array([h,w])[:,None,None]
amber=np.clip(xx*1.2-yy*.3,0,1)[...,None]*np.array([1.0,.69,.41])
violet=np.clip((1-xx)*1.1-.2,0,1)[...,None]*np.array([.61,.55,1.0])
g=np.clip(g+edge[...,None]*(amber+violet)*1.3,0,1)
out=np.dstack([g*255,alpha*255]).astype(np.uint8)
P=Image.fromarray(out,'RGBA'); P.save(f'{OUT}/portrait-cutout.png',optimize=True)
pub='/workspace/portfolio/public/portrait'
import os; os.makedirs(pub,exist_ok=True)
for s,W in ((1,420),(2,840)):
    r=P.resize((min(W,P.width),int(P.height*min(W,P.width)/P.width)),Image.LANCZOS)
    r.save(f'{pub}/portrait@{s}x.webp',quality=82,method=6); r.save(f'{pub}/portrait@{s}x.avif',quality=60)
