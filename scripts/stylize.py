# Local stylisation of the capsule cutout (no generative model: likeness is preserved because only rendering filters are applied).
import cv2, numpy as np
src=cv2.imread('photos/portrait-capsule.png',cv2.IMREAD_UNCHANGED)
S=2  # upscale first so strokes stay fine at 840px
src=cv2.resize(src,None,fx=840/src.shape[1],fy=840/src.shape[1],interpolation=cv2.INTER_LANCZOS4)
bgr,a=src[...,:3].copy(),src[...,3]
# bleed edge colours into the transparent area so filters don't pull a dark halo from the black matte
m=(a<128).astype(np.uint8)*255
small=cv2.inpaint(cv2.resize(bgr,None,fx=.25,fy=.25),cv2.resize(m,None,fx=.25,fy=.25,interpolation=cv2.INTER_NEAREST),5,cv2.INPAINT_TELEA)
fill=cv2.resize(small,(bgr.shape[1],bgr.shape[0])); bgr[m>0]=fill[m>0]
def comp(img,name):
    out=np.dstack([img,a]); cv2.imwrite(f'photos/portrait-{name}.png',out)
    return out
def vib(img,sat=1.25,val=1.05):
    h=cv2.cvtColor(img,cv2.COLOR_BGR2HSV).astype(np.float32); h[...,1]*=sat; h[...,2]*=val
    return cv2.cvtColor(np.clip(h,0,255).astype(np.uint8),cv2.COLOR_HSV2BGR)
def ink(img,th=9,blk=9):
    g=cv2.medianBlur(cv2.cvtColor(img,cv2.COLOR_BGR2GRAY),5)
    e=cv2.adaptiveThreshold(g,255,cv2.ADAPTIVE_THRESH_MEAN_C,cv2.THRESH_BINARY,blk,th)
    return cv2.cvtColor(e,cv2.COLOR_GRAY2BGR)
# A: painterly (edge-preserving stylisation + vibrance) — closest to the reference's digital-painting look
A=cv2.stylization(bgr,sigma_s=30,sigma_r=0.18); A=vib(A,1.3,1.06)
A=cv2.addWeighted(A,.82,cv2.detailEnhance(bgr,sigma_s=8,sigma_r=.15),.18,0)
comp(A,'painted')
# B: oil paint
B=cv2.xphoto.oilPainting(bgr,6,1); B=vib(B,1.22,1.05); B=cv2.addWeighted(B,1.12,cv2.GaussianBlur(B,(0,0),3),-.12,0); comp(B,'oil')
# C: illustrated / cel — bilateral flattening + colour quantisation + ink lines
C=bgr.copy()
for _ in range(6): C=cv2.bilateralFilter(C,9,40,7)
Z=C.reshape(-1,3).astype(np.float32); _,lab,cen=cv2.kmeans(Z,14,None,(cv2.TERM_CRITERIA_EPS+cv2.TERM_CRITERIA_MAX_ITER,10,1),3,cv2.KMEANS_PP_CENTERS)
C=cen.astype(np.uint8)[lab.flatten()].reshape(C.shape); C=vib(C,1.25,1.05)
C=cv2.bitwise_and(C,ink(bgr,7,9)); comp(C,'illustrated')
print('ok')
