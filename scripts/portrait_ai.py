# AI portrait pipeline: watermark inpaint -> gentle clarity/sharpen/colour polish -> BiRefNet cutout -> capsule crop -> rim light -> exports.
import sys, cv2, numpy as np
from PIL import Image, ImageFilter
from rembg import remove, new_session
SRC=sys.argv[1]
im=cv2.cvtColor(np.asarray(Image.open(SRC).convert('RGB')),cv2.COLOR_RGB2BGR)
H,W=im.shape[:2]
# 1) watermark: bright, low-saturation sparkle on the dark blazer (lower-right region)
x0,y0,x1,y1=int(W*.80),int(H*.84),int(W*.95),int(H*.96)
roi=im[y0:y1,x0:x1]; hsv=cv2.cvtColor(roi,cv2.COLOR_BGR2HSV)
m=((hsv[...,2]>95)&(hsv[...,1]<70)).astype(np.uint8)*255
n,lab,st,_=cv2.connectedComponentsWithStats(m)
mask=np.zeros((H,W),np.uint8)
if n>1:
    i=1+np.argmax(st[1:,cv2.CC_STAT_AREA]); x,y,w,h=st[i,:4]
    cx,cy,r=x0+x+w//2,y0+y+h//2,int(max(w,h)*.62)
    cv2.circle(mask,(cx,cy),r,255,-1)  # cover the sparkle plus its soft anti-aliased glow
    print('watermark bbox',x0+x,y0+y,w,h)
clean=cv2.inpaint(im,mask,15,cv2.INPAINT_NS)
# blend a touch of noise/texture back into the patch so it isn't flat
noise=(np.random.default_rng(1).normal(0,1.5,clean.shape)).astype(np.float32)
mm=cv2.GaussianBlur(mask,(0,0),3)[...,None]/255.
clean=np.clip(clean+noise*mm,0,255).astype(np.uint8)
cv2.imwrite('photos/portrait-ai-clean.png',clean)
# 2) clarity (local contrast on L), gentle unsharp, colour polish (warm highlights, violet shadows)
lab=cv2.cvtColor(clean,cv2.COLOR_BGR2LAB); L=lab[...,0]
lab[...,0]=cv2.createCLAHE(clipLimit=1.4,tileGridSize=(8,8)).apply(L)
e=cv2.cvtColor(lab,cv2.COLOR_LAB2BGR).astype(np.float32)
e=cv2.addWeighted(e,1.35,cv2.GaussianBlur(e,(0,0),2.2),-.35,0)
lum=(e@np.array([.114,.587,.299],np.float32))[...,None]/255
e+= (lum**2)*np.array([-4,6,14],np.float32) + ((1-lum)**3)*np.array([14,0,6],np.float32)  # BGR: amber in highlights, violet in shadows
e=np.clip(e,0,255).astype(np.uint8)
# 3) cutout
sess=new_session('birefnet-portrait')
cut=np.asarray(remove(Image.fromarray(cv2.cvtColor(e,cv2.COLOR_BGR2RGB)),session=sess,post_process_mask=False)).copy()
a=cut[...,3]
# 4) capsule crop: 4:5, head centred, ~8% headroom, shoulders to bottom
ys,xs=np.where(a>60); top=ys.min()
headrows=a[top:top+int(H*.25)]; hx=int(np.where(headrows>60)[1].mean())
CH=int((H-top)*1.0); CW=int(CH*.8)
cy0=max(0,top-int(CH*.08)); cx0=int(np.clip(hx-CW//2,0,W-CW)) if CW<=W else 0
C=Image.fromarray(cut).crop((cx0,cy0,cx0+CW,cy0+CH))
# 5) rim light along the alpha edge: amber upper-right, violet left
c=np.asarray(C).astype(np.float32); al=c[...,3]/255
inner=np.asarray(Image.fromarray((al*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(14))).astype(np.float32)/255
edge=np.clip(al-inner,0,1)*al; h,w=edge.shape; yy,xx=np.mgrid[0:h,0:w]; xx=xx/w; yy=yy/h
rim=np.clip(xx*1.3-yy*.4,0,1)[...,None]*np.array([255,178,110])+np.clip((1-xx)*1.2-.25,0,1)[...,None]*np.array([160,140,255])
c[...,:3]=np.clip(c[...,:3]+edge[...,None]*rim*.9,0,255)
P=Image.fromarray(c.astype(np.uint8),'RGBA'); P.save('photos/portrait-ai-master.png',optimize=True)
for s,ww in ((1,420),(2,840)):
    r=P.resize((ww,int(P.height*ww/P.width)),Image.LANCZOS)
    r.save(f'public/portrait/portrait@{s}x.webp',quality=82,method=6); r.save(f'public/portrait/portrait@{s}x.avif',quality=58)
print(P.size)
