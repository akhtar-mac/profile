# Procedural artwork: starfields, nebula glows, abstract covers, OG image. No people, no real imagery.
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
rng=np.random.default_rng(7)
def nebula(w,h,blobs,base=(7,7,10)):
    y,x=np.mgrid[0:h,0:w].astype(np.float32)
    img=np.zeros((h,w,3),np.float32)+np.array(base,np.float32)
    for cx,cy,r,col,a in blobs:
        d=((x-cx*w)**2+(y-cy*h)**2)/(r*max(w,h))**2
        img+=np.exp(-d)[...,None]*np.array(col,np.float32)*a
    return img
def stars(img,n,maxb=255):
    h,w,_=img.shape
    xs=rng.integers(0,w,n); ys=rng.integers(0,h,n); b=rng.random(n)**3*maxb
    for x,y,v in zip(xs,ys,b): img[y,x]=np.minimum(255,img[y,x]+v)
    return img
def save(img,path,q=80,blur=0):
    im=Image.fromarray(np.clip(img,0,255).astype(np.uint8))
    if blur: im=im.filter(ImageFilter.GaussianBlur(blur))
    im.save(path,quality=q,method=6)
    return im
# hero static fallback (reduced motion / no canvas): sun + orbits
W,H=1600,1000
img=nebula(W,H,[(.78,.35,.35,(91,92,255),.55),(.9,.1,.2,(42,165,255),.35),(.2,.9,.4,(120,60,200),.25)])
img=stars(img,2600)
im=Image.fromarray(np.clip(img,0,255).astype(np.uint8)); d=ImageDraw.Draw(im)
cx,cy=int(W*.76),int(H*.38)
for r in (120,200,300,420): d.ellipse([cx-r*1.6,cy-r*.55,cx+r*1.6,cy+r*.55],outline=(255,255,255,30),width=1)
glow=nebula(W,H,[(.76,.38,.06,(255,190,110),1.6),(.76,.38,.12,(255,120,60),.6)],base=(0,0,0))
im=Image.fromarray(np.clip(np.asarray(im,np.float32)+glow,0,255).astype(np.uint8)); d=ImageDraw.Draw(im)
for (r,ang,s,c) in [(200,2.2,9,(140,170,255)),(300,.6,14,(230,170,120)),(420,3.8,11,(120,220,200))]:
    px,py=cx+np.cos(ang)*r*1.6,cy+np.sin(ang)*r*.55; d.ellipse([px-s,py-s,px+s,py+s],fill=c)
im.save('public/bg/hero-static.webp',quality=78,method=6)
# section background
img=nebula(1600,900,[(.15,.3,.35,(91,92,255),.28),(.85,.8,.3,(42,165,255),.18)]); save(stars(img,1200,180),'public/bg/cosmic.webp',72)
# project covers
pal=[((91,92,255),(42,165,255)),((160,80,255),(91,92,255)),((42,165,255),(40,220,180))]
for i,(a,b) in enumerate(pal,1):
    w,h=1200,750; img=nebula(w,h,[(.2,.25,.45,a,.9),(.85,.8,.4,b,.8),(.55,.5,.15,(255,255,255),.15)],base=(12,12,20))
    y,x=np.mgrid[0:h,0:w]
    rings=(np.sin(np.sqrt((x-w*.7)**2+(y-h*.3)**2)/(14+i*4))>.97)*28
    img+=rings[...,None]; save(stars(img,500,200),f'public/covers/cover-{i}.webp',78)
# OG image
img=nebula(1200,630,[(.85,.3,.35,(91,92,255),.7),(.95,.0,.2,(42,165,255),.4)]); im=Image.fromarray(np.clip(stars(img,900),0,255).astype(np.uint8))
d=ImageDraw.Draw(im)
try:
    F=ImageFont.truetype('/tmp/clash-700.ttf',120); S=ImageFont.truetype('/tmp/gs-500.ttf',36)
except Exception:
    F=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',110); S=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',34)
d.text((70,200),'AKHTAR',font=F,fill=(236,235,230)); d.text((70,320),'SHAIKH',font=F,fill=(236,235,230))
d.text((74,480),'Frontend & AI Automation Developer',font=S,fill=(180,180,200))
im.save('public/og.png',optimize=True)
