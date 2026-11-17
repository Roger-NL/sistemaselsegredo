#!/usr/bin/env python3
"""Original First Encounters character artwork and articulated Rive timelines.

Authoring source is deliberately retained: no downloaded character art, no scripts
inside runtime files, no dependency on a paid Rive workspace.
"""
from __future__ import annotations

import argparse
import copy
import json
import math
import re
import shutil
import subprocess
import time
import xml.etree.ElementTree as E
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
PUBLIC = ROOT / 'public/first-encounters/characters'
RIVE = Path.home() / '.rive/bin/rive'

PALETTES = {
    'ana': dict(name='Ana', skin='D9A17F', shade='C58468', light='E6B89A', hair='332A34', hairLight='51404A', coat='DF735F', coatDark='C65446', shirt='FFF5E8', pants='37495D', shoe='F6EBDB', trim='B85B4E', eye='3F3634', style='bob'),
    'leo': dict(name='Leo', skin='875942', shade='70432F', light='9F6E50', hair='252728', hairLight='41403C', coat='D6A43D', coatDark='B88427', shirt='F6E9CE', pants='384641', shoe='EBE5D8', trim='9A7739', eye='261F20', style='curly'),
    'maya': dict(name='Maya', skin='BE895E', shade='A66D49', light='D3A67F', hair='323042', hairLight='51475C', coat='4F8F8A', coatDark='357873', shirt='EAF2DD', pants='D3C4A1', shoe='756788', trim='325D61', eye='3E3031', style='bun'),
    'sam': dict(name='Sam', skin='E8BE9C', shade='CF9C7E', light='F1CFB0', hair='AC6741', hairLight='C1804F', coat='A69CC7', coatDark='867DAA', shirt='FAF1E1', pants='4D5E74', shoe='694B3B', trim='77698E', eye='49565A', style='quiff'),
    'nina': dict(name='Nina', skin='744A39', shade='5F372D', light='8D5E45', hair='C5C6BF', hairLight='E0DDD0', coat='647CA6', coatDark='4B638C', shirt='E8BA5A', pants='6B6964', shoe='EBDFCC', trim='405577', eye='302827', style='short'),
}


def fmt(value):
    return f'{value:.6g}' if isinstance(value, float) else str(value)


class Art:
    def __init__(self):
        self.counter = 10
        self.ids = {}
        self.rive = E.Element('Rive', version='1', kind='fragment')
        self.artboard = E.SubElement(self.rive, 'Artboard', name='Character', width='360', height='460', id='0:2', styleId='0:5', defaultStateMachineId='0:7')
        E.SubElement(self.artboard, 'LayoutComponentStyle', name='Character canvas', id='0:5')

    def ident(self, name):
        self.counter += 1
        result = f'0:{self.counter}'
        self.ids[name] = result
        return result

    def group(self, parent, name, x=0, y=0, **attrs):
        return E.SubElement(parent, 'Node', name=name, id=self.ident(name), x=fmt(x), y=fmt(y), **{k:fmt(v) for k,v in attrs.items()})

    def paint(self, shape, color=None, stroke=None, thickness=1):
        if color:
            fill = E.SubElement(shape, 'Fill', name='Fill')
            E.SubElement(fill, 'SolidColor', name='Color', colorValue=('FF' + color) if len(color)==6 else color)
        if stroke:
            p = E.SubElement(shape, 'Stroke', name='Stroke', thickness=fmt(thickness), cap='round', join='round')
            E.SubElement(p, 'SolidColor', name='Color', colorValue=('FF' + stroke) if len(stroke)==6 else stroke)

    def ellipse(self, parent, name, x, y, w, h, color, **attrs):
        sh = E.SubElement(parent, 'Shape', name=name, id=self.ident(name), x=fmt(x), y=fmt(y), **{k:fmt(v) for k,v in attrs.items()})
        E.SubElement(sh, 'Ellipse', width=fmt(w), height=fmt(h), originX='.5', originY='.5', name='Path')
        self.paint(sh, color)
        return sh

    def rect(self, parent, name, x, y, w, h, radius, color, **attrs):
        sh = E.SubElement(parent, 'Shape', name=name, id=self.ident(name), x=fmt(x), y=fmt(y), **{k:fmt(v) for k,v in attrs.items()})
        E.SubElement(sh, 'Rectangle', width=fmt(w), height=fmt(h), originX='.5', originY='.5', cornerRadiusTL=fmt(radius), name='Path')
        self.paint(sh, color)
        return sh

    def path(self, parent, name, d, color=None, stroke=None, thickness=1, **attrs):
        """Convert authored M/L/C/Q/Z paths to native detached cubic vertices."""
        tokens = re.findall(r'[MLCQZmlcqz]|-?(?:\d*\.\d+|\d+)(?:[eE][+-]?\d+)?', d)
        verts=[]; contours=[]; i=0; command=None; closed=False
        def point():
            nonlocal i
            out = (float(tokens[i]), float(tokens[i+1])); i+=2
            return out
        def vertex(p): return {'p':p,'in':p,'out':p}
        while i<len(tokens):
            if re.fullmatch('[A-Za-z]', tokens[i]): command=tokens[i].upper(); i+=1
            if command=='M':
                if verts:
                    contours.append((verts,closed));verts=[];closed=False
                verts.append(vertex(point())); command='L'
            elif command=='L': verts.append(vertex(point()))
            elif command=='C':
                cp1,cp2,p=point(),point(),point(); verts[-1]['out']=cp1
                v=vertex(p);v['in']=cp2;verts.append(v)
            elif command=='Q':
                cp,p=point(),point(); prev=verts[-1]['p']
                verts[-1]['out']=(prev[0]+2*(cp[0]-prev[0])/3,prev[1]+2*(cp[1]-prev[1])/3)
                v=vertex(p);v['in']=(p[0]+2*(cp[0]-p[0])/3,p[1]+2*(cp[1]-p[1])/3);verts.append(v)
            elif command=='Z': closed=True; command=None
            else: raise ValueError(f'Unsupported authored path command {command}')
        if verts: contours.append((verts,closed))
        sh=E.SubElement(parent,'Shape',name=name,id=self.ident(name),**{k:fmt(v) for k,v in attrs.items()})
        for verts,closed in contours:
            if len(verts)>1 and verts[-1]['p']==verts[0]['p']:
                verts[0]['in']=verts[-1]['in']; verts.pop()
            area=sum(verts[j]['p'][0]*verts[(j+1)%len(verts)]['p'][1]-verts[(j+1)%len(verts)]['p'][0]*verts[j]['p'][1] for j in range(len(verts)))
            path=E.SubElement(sh,'PointsPath',name='Path',isClosed=str(closed).lower(),isClockwise=str(area>=0).lower())
            for v in verts:
                x,y=v['p']; ix,iy=v['in']; ox,oy=v['out']
                E.SubElement(path,'CubicDetachedVertex',x=fmt(x),y=fmt(y),inRotation=fmt(math.atan2(iy-y,ix-x)),inDistance=fmt(math.hypot(ix-x,iy-y)),outRotation=fmt(math.atan2(oy-y,ox-x)),outDistance=fmt(math.hypot(ox-x,oy-y)))
        self.paint(sh,color,stroke,thickness)
        return sh

    def finalize_order(self, node=None):
        """Source is composed back-to-front; Rive native order is front-to-back."""
        node=self.artboard if node is None else node
        for child in node: self.finalize_order(child)
        if node.tag in ['Artboard','Node']:
            node[:]=list(reversed(list(node)))


def artwork(a, p):
    ink='34333A';skin=p['skin'];shade=p['shade'];hair=p['hair'];coat=p['coat']; coatdark=p['coatDark']
    # A soft contact mark belongs to the illustration, never to the page background.
    a.ellipse(a.artboard,'Ground contact',180,431,132,12,'163A3540')
    body=a.group(a.artboard,'Body',180,223)
    # Separate legs and shoes produce an adult silhouette with weight on the ground.
    for side in [-1,1]:
        leg=a.group(body,'Left leg' if side<0 else 'Right leg',side*23,83)
        a.path(leg,f'Leg cloth {side}','M-20-5 C-18 27-17 63-14 101 L12 101 C16 72 20 34 21-5 Z',p['pants'])
        a.path(leg,f'Trouser seam {side}','M10 10 C7 38 6 64 5 89',stroke=p['trim'],thickness=1.5)
        a.path(leg,f'Sock {side}','M-13 97 L13 97 L13 109 L-14 109 Z',p['shirt'])
        a.path(leg,f'Shoe {side}','M-15 106 C-4 103 9 105 14 110 L26 116 C31 119 28 125 22 125 L-15 125 C-22 124-23 111-15 106 Z',p['shoe'])
        a.path(leg,f'Sole {side}','M-20 121 C-7 124 14 123 27 121 L26 127 L-15 127 C-19 126-20 124-20 121 Z',p['trim'])
        a.path(leg,f'Shoe lace {side}','M1 112 L13 116 M-3 116 L9 120',stroke=p['shirt'],thickness=2)
    a.path(body,'Trouser waist','M-44 65 Q0 54 44 65 L42 101 L-42 101 Z',p['pants'])
    a.path(body,'Torso silhouette','M-47-33 C-35-45-20-48-12-43 L13-43 C28-46 45-37 50-26 L43 74 C22 86-20 86-43 74 Z',coat)
    a.path(body,'Torso side shade','M30-36 C41-29 46-21 46-9 L41 72 Q27 79 16 78 L22-17 Z',coatdark)
    if p['style'] in ['bob','curly','short']:
        a.path(body,'Inner tee','M-17-42 L17-42 L22 76 Q0 81-22 76 Z',p['shirt'])
    a.path(body,'Neck','M-16-77 L17-77 L16-39 Q0-27-16-39 Z',skin)
    a.path(body,'Neck shadow','M-16-76 L17-76 L16-52 Q1-44-15-53 Z',shade)
    if p['style'] in ['bob','curly']:
        a.path(body,'Left collar','M-19-43 L-4-29 L-22-10 L-30-37 Z',coatdark)
        a.path(body,'Right collar','M18-43 L4-29 L23-10 L30-36 Z',coat)
        a.path(body,'Hem stitching','M-39 71 Q-29 74-23 74 M23 74 Q33 74 39 71',stroke=p['trim'],thickness=1.3)
        a.path(body,'Pocket','M-39 13 L-25 12 L-25 29 Q-32 35-39 29 Z',coatdark)
        a.ellipse(body,'Pocket button',-32,17,3,3,p['shirt'])
        for y in [4,29,55]: a.ellipse(body,f'Jacket button {y}',25,y,3.5,3.5,p['shirt'])
    elif p['style']=='bun':
        a.path(body,'Sweater crew neck','M-19-42 Q0-21 20-42 L22-37 Q0-15-22-37 Z',p['coatDark'])
        a.path(body,'Sweater knit hem','M-42 65 Q0 75 43 65 L42 76 Q0 87-42 76 Z',p['coatDark'])
        for x in range(-35,41,7): a.path(body,f'Knit rib{x}',f'M{x} 70 L{x} 77',stroke=p['coat'],thickness=1.5)
        a.path(body,'Sweater light crease','M-30 14 Q-37 37-28 51',stroke=p['trim'],thickness=1.5)
    elif p['style']=='quiff':
        a.path(body,'Round shirt neck','M-20-42 Q0-22 21-42 L23-35 Q0-11-23-35 Z',p['shirt'])
        a.path(body,'Workshirt pocket','M16 4 L35 4 L35 27 Q26 34 16 27 Z',p['coatDark'])
        a.path(body,'Pencil in pocket','M25 7 L25-3 L28-8 L31-3 L31 7',stroke=p['shirt'],thickness=2.2)
        a.path(body,'Shirt hem','M-39 73 Q0 84 40 73',stroke=p['trim'],thickness=1.7)
    else:
        a.path(body,'Vest neckline left','M-18-43 L-5-22 L-16 68 L-24 73 L-23-10 L-29-36 Z',coatdark)
        a.path(body,'Vest neckline right','M18-43 L5-22 L16 68 L24 73 L23-10 L29-36 Z',coat)
        a.path(body,'Vest pocket','M26 20 L39 20 L39 35 L26 35 Z',coatdark)
        a.path(body,'Tee neck rib','M-18-43 Q0-27 18-43',stroke=p['shirt'],thickness=4)
    # The neck pivot stays in the lower head, not in the middle of the face.
    head=a.group(body,'Head',0,-53)
    if p['style']=='bob':
        a.path(head,'Hair back','M-45-80 C-55-105-35-124-6-125 C26-130 53-113 50-77 L48 17 C30 30-35 30-49 10 Z',hair)
    elif p['style']=='bun':
        a.ellipse(head,'High bun',5,-124,56,43,hair)
        a.path(head,'Hair back','M-46-76 C-51-106-27-121 3-119 C33-121 50-99 45-70 L39 14 L-39 14 Z',hair)
    else:
        a.path(head,'Hair back','M-47-75 C-50-109-23-125 5-120 C38-124 53-101 47-71 L41-18 L-40-17 Z',hair)
    # Ears are distinct pieces, shaded inside, and stay attached under head turns.
    for x in [-44,44]:
        a.ellipse(head,f'Ear {x}',x,-42,18,29,skin)
        a.path(head,f'Ear fold {x}',f'M{x-2}-49 Q{x+7}-45 {x+1}-36',stroke=shade,thickness=2)
    face='M-43-79 C-43-102-23-114 0-111 C25-114 45-99 44-75 L40-29 C37-3 19 13 0 14 C-21 13-39-4-41-31 Z'
    if p['style']=='curly': face='M-45-79 C-45-104-22-114 0-111 C26-114 47-99 46-75 L43-27 C39-4 20 11 0 12 C-23 12-42-3-43-29 Z'
    elif p['style']=='bun': face='M-43-79 C-43-102-23-115 0-111 C25-115 45-99 44-75 L41-29 C38-3 22 13 0 14 C-23 13-40-4-41-31 Z'
    elif p['style']=='short': face='M-43-79 C-43-102-23-114 0-111 C25-114 45-99 44-75 L40-27 C36-3 21 12 0 12 C-22 12-39-3-41-29 Z'
    a.path(head,'Face',face,skin)
    a.path(head,'Face light','M-38-79 C-37-98-21-108-3-107 C-15-85-20-42-9-15 C-27-19-37-36-38-79 Z',p['light'])
    a.ellipse(head,'Cheek left',-29,-30,15,8,'24B95D59')
    a.ellipse(head,'Cheek right',29,-30,15,8,'24B95D59')
    # Each white, iris and highlight stays under an independently blinkable eyelid group.
    for x in [-18,18]:
        eye=a.group(head,'Left eye' if x<0 else 'Right eye',x,-52)
        a.path(eye,f'Eye white {x}','M-8-2 Q0-8 8-2 L8 4 Q0 9-8 3 Z','FFF9EF')
        a.ellipse(eye,f'Iris {x}',1,0,7,10,p['eye'])
        a.ellipse(eye,f'Eye catchlight {x}',2,-2,2.4,2.4,'FFFFFF')
        a.path(eye,f'Upper eyelid {x}','M-8-2 Q0-7 8-2',stroke=p['hairLight'],thickness=2.2)
        brow=a.group(head,'Left brow' if x<0 else 'Right brow',x,-70)
        a.path(brow,f'Eyebrow {x}','M-8 1 Q0-3 8 0',stroke=hair,thickness=3.7)
    a.path(head,'Nose','M1-47 L-3-28 Q1-24 7-28',stroke=shade,thickness=2.1)
    smile=a.group(head,'Smile',0,-13)
    a.path(smile,'Smile line','M-12-2 Q0 11 13-3',stroke='8C5147' if p['style'] not in ['leo','nina'] else '472B2C',thickness=2.6)
    a.path(smile,'Lower lip','M-5 8 Q1 10 6 7',stroke=p['light'],thickness=1.6)
    no=a.group(head,'Neutral mouth',0,-9,opacity=0)
    a.path(no,'No mouth','M-10 0 Q0-3 11 0',stroke='77493E' if p['style'] not in ['leo','nina'] else '3D2527',thickness=2.5)
    think=a.group(head,'Thinking mouth',0,-8,opacity=0)
    a.ellipse(think,'Small thoughtful mouth',0,0,8,5,shade)
    # One native, head-owned speaking mouth. Its timeline is a pose range, not
    # an autonomous lip loop: the host scrubs it with the decoded audio level.
    speech=a.group(head,'Speech mouth',0,-9,opacity=0,scaleY='.18')
    a.path(speech,'Speech cavity','M-12-3 Q0-8 12-3 C12 9 7 13 0 13 C-7 13-12 9-12-3 Z','603238' if p['style'] not in ['curly','short'] else '3D242B')
    a.path(speech,'Speech teeth','M-10-3 Q0-6 10-3 L9 1 Q0 4-9 1 Z','FFF5E8')
    a.path(speech,'Speech tongue','M-7 9 Q0 4 7 9 Q0 14-7 9 Z','BE756E')
    # The five hair styles have different silhouettes, not recolours of one cap.
    if p['style']=='bob':
        a.path(head,'Swept bob fringe','M-48-79 C-53-108-30-127 2-123 C28-127 48-108 47-83 L42-59 L34-89 C15-78-3-78-19-93 C-24-79-32-64-42-58 Z',hair)
        a.path(head,'Bob sheen','M-38-98 C-24-117-1-118 18-110',stroke=p['hairLight'],thickness=3)
        for x in [-44,44]:
            a.ellipse(head,f'Gold hoop {x}',x,-22,10,14,'D8AF62')
            a.ellipse(head,f'Hoop cutout {x}',x,-22,5,9,skin)
    elif p['style']=='curly':
        for i,(x,y,w) in enumerate([(-37,-94,28),(-23,-108,30),(-3,-115,31),(19,-111,30),(37,-96,27),(-9,-96,30),(15,-94,31)]):
            a.ellipse(head,f'Curl {i}',x,y,w,w*.9,hair)
        for i,(x,y) in enumerate([(-27,-112),(-5,-122),(20,-118)]):
            a.path(head,f'Curl light {i}',f'M{x-5} {y+7} Q{x} {y} {x+7} {y+5}',stroke=p['hairLight'],thickness=2)
        glasses=a.group(head,'Glasses',0,-51)
        for x in [-18,18]:
            a.path(glasses,f'Glasses rim{x}',f'M{x-12}-7 Q{x}-13 {x+12}-7 L{x+11} 7 Q{x} 14 {x-11} 7 Z',stroke='504B3D',thickness=2.4)
        a.path(glasses,'Glasses bridge','M-6-2 Q0-6 6-2 M-31-4 L-41-8 M31-4 L41-8',stroke='504B3D',thickness=2.1)
    elif p['style']=='bun':
        a.path(head,'Bun swept fringe','M-47-79 C-49-103-30-120-7-116 C19-121 47-104 47-79 L40-63 L34-89 Q6-78-12-98 Q-27-82-41-65 Z',hair)
        a.path(head,'Hair contour','M-34-102 Q-14-117 7-109 M-28-96 Q-11-107 7-101',stroke=p['hairLight'],thickness=2)
        a.path(head,'Bun tie','M-18-123 Q5-116 25-123',stroke=p['coatDark'],thickness=4)
        a.ellipse(head,'Ear stud',45,-27,5,5,p['shirt'])
    elif p['style']=='quiff':
        a.path(head,'Quiff','M-47-79 C-50-98-35-110-16-112 C-18-124-8-132 3-132 C11-131 15-125 14-118 C23-128 36-123 34-113 C52-114 53-94 45-79 L38-65 L33-91 Q5-81-18-94 L-39-63 Z',hair)
        a.path(head,'Quiff sweep','M-31-100 C-13-118 13-120 32-104',stroke=p['hairLight'],thickness=3)
        for x,y in [(-31,-35),(-25,-32),(-20,-35),(22,-35),(29,-32),(33,-36)]: a.ellipse(head,f'Freckle{x}{y}',x,y,2,2,p['shade'])
    else:
        a.path(head,'Short side part','M-46-79 C-50-106-28-120 0-119 C29-120 50-106 47-80 L41-66 L34-90 Q10-80-5-95 Q-24-85-40-70 Z',hair)
        a.path(head,'Silver hair strokes','M-33-100 Q-10-117 17-106 M-26-95 Q-10-105 8-102 M23-107 Q35-101 38-93',stroke=p['hairLight'],thickness=3)
        for x in [-44,44]: a.ellipse(head,f'Round earring{x}',x,-25,7,9,'E0B866')
        a.path(head,'Smile line left','M-34-20 Q-31-12-26-8',stroke=shade,thickness=1.2)
        a.path(head,'Smile line right','M32-20 Q30-12 25-8',stroke=shade,thickness=1.2)
    # Upper arm -> elbow -> wrist hierarchy. Every joint has its own pivot.
    for side in [-1,1]:
        label='Left' if side<0 else 'Right'
        upper=a.group(body,f'{label} upper arm',side*46,-25,rotation=side*-.045)
        sleeve=p['shirt'] if p['style']=='short' else coat
        a.path(upper,f'{label} sleeve','M-14-10 C-22-2-21 12-17 30 L-12 56 Q0 63 13 55 L19 24 C22 6 17-9 5-12 Z',sleeve)
        a.path(upper,f'{label} sleeve fold','M-12 43 Q0 48 13 42',stroke=p['trim'] if p['style']=='short' else coatdark,thickness=1.6)
        if p['style']=='curly': a.path(upper,f'{label} rolled cuff','M-13 47 Q0 53 14 47 L12 58 Q0 65-11 58 Z',p['coatDark'])
        fore=a.group(upper,f'{label} forearm',0,53,rotation=side*.07)
        a.path(fore,f'{label} forearm skin','M-11-8 C-15 8-11 27-8 48 Q0 54 8 48 C12 27 14 7 10-8 Z',skin)
        a.path(fore,f'{label} arm shade','M6-7 C10 11 8 33 5 48 L9 47 C13 25 14 6 10-7 Z',shade)
        hand=a.group(fore,f'{label} hand',0,48)
        opened=a.group(hand,f'{label} open hand')
        a.path(opened,f'{label} fingers','M-8-2 C-10 2-11 7-10 13 L-9 28 Q-8 32-6 29 L-5 18 L-4 34 Q-2 38 0 34 L0 19 L2 34 Q4 37 6 33 L6 18 L8 29 Q11 32 12 27 L12 10 C15 7 19 4 17 1 Q15-1 11 3 L8 5 L8-2 Z',skin)
        a.path(opened,f'{label} palm crease','M-5 9 Q0 7 6 11',stroke=shade,thickness=1.1)
        pointed=a.group(hand,f'{label} point hand',opacity=0)
        a.path(pointed,f'{label} pointing finger','M-8-2 C-12 6-11 16-7 23 L-3 26 L-3 43 Q0 47 3 43 L5 23 L10 21 Q14 18 12 13 L11 5 L16 2 Q19-2 15-4 L8 1 L8-2 Z',skin)
        gripped=a.group(hand,f'{label} grip hand',opacity=0)
        a.path(gripped,f'{label} grip','M-9-2 Q-15 12-7 22 Q0 28 9 19 L13 9 Q15 3 10 2 L8 12 L5 13 L7 0 Z',skin)
        a.path(gripped,f'{label} grip crease','M-6 12 Q0 16 6 12',stroke=shade,thickness=1.1)
    held=a.group(body,'Held badge',0,94,opacity=0)
    a.rect(held,'Badge shadow',2,3,58,45,7,'20454A50')
    a.rect(held,'Badge face',0,0,58,45,7,'FFF8E8')
    a.path(held,'Badge portrait','M-17-3 Q-11-13-5-3 L-4 9 L-18 9 Z',p['coat'])
    a.ellipse(held,'Badge portrait head',-11,-10,10,12,p['skin'])
    a.path(held,'Badge name mark','M4-7 L18-7 M4 1 L21 1 M4 9 L14 9',stroke=p['trim'],thickness=2.2)
    body.remove(held)
    body.insert(next(i for i,child in enumerate(body) if child.get('name')=='Left upper arm'),held)
    return body


DEFAULTS = {
    ('Body','x'):180,('Body','y'):223,('Body','rotation'):0,
    ('Head','x'):0,('Head','y'):-53,('Head','rotation'):0,
    ('Left eye','scaleY'):1,('Right eye','scaleY'):1,
    ('Left brow','rotation'):0,('Right brow','rotation'):0,
    ('Smile','opacity'):1,('Smile','scaleY'):1,
    ('Neutral mouth','opacity'):0,('Thinking mouth','opacity'):0,
    ('Speech mouth','opacity'):0,('Speech mouth','scaleY'):.18,
    ('Left upper arm','rotation'):.045,('Right upper arm','rotation'):-.045,
    ('Left forearm','rotation'):-.07,('Right forearm','rotation'):.07,
    ('Left hand','rotation'):0,('Right hand','rotation'):0,
    ('Left open hand','opacity'):1,('Right open hand','opacity'):1,
    ('Left point hand','opacity'):0,('Right point hand','opacity'):0,
    ('Left grip hand','opacity'):0,('Right grip hand','opacity'):0,
    ('Held badge','opacity'):0,
}
DURATIONS={'idle':48,'wave':108,'self-point':84,'yes':66,'no':66,'receive-badge':90,'thinking':96,
           'speech-self':60,'speech-listener-left':60,'speech-listener-right':60,'speech-team':60,'speech-mouth':60}
PROP={'x':13,'y':14,'rotation':15,'scaleX':16,'scaleY':17,'opacity':18}
MOUTH_NODES={'Smile','Neutral mouth','Thinking mouth','Speech mouth'}


def animation_data(cue):
    data={key:[(0,value)] for key,value in DEFAULTS.items()}
    def keys(node,prop,*pairs): data[node,prop]=list(pairs)
    if cue=='speech-mouth':
        # Separate ownership is important: semantic body timelines never key
        # these properties, so body and audio envelope cannot overwrite one another.
        return {
            ('Smile','opacity'):[(0,1),(3,1),(8,0),(60,0)],
            ('Smile','scaleY'):[(0,1)],
            ('Neutral mouth','opacity'):[(0,0)],
            ('Thinking mouth','opacity'):[(0,0)],
            ('Speech mouth','opacity'):[(0,0),(3,0),(8,1),(60,1)],
            ('Speech mouth','scaleY'):[(0,.18),(8,.24),(24,.5),(60,1)],
        }
    if cue.startswith('speech-'):
        data={key:value for key,value in data.items() if key[0] not in MOUTH_NODES}
        # All semantic motion is normalized over the real utterance duration.
        # A single clear gesture arrives early, holds while speaking, and rests.
        if cue=='speech-self':
            keys('Right upper arm','rotation',(0,-.045),(14,.48),(44,.48),(60,-.045))
            keys('Right forearm','rotation',(0,.07),(16,2.12),(44,2.12),(60,.07))
            keys('Right hand','rotation',(0,0),(17,-2.60),(44,-2.60),(60,0))
            keys('Right open hand','opacity',(0,1),(9,1),(10,0),(48,0),(49,1))
            keys('Right point hand','opacity',(0,0),(9,0),(10,1),(48,1),(49,0))
            keys('Head','rotation',(0,0),(17,.025),(44,.025),(60,0))
        elif cue in ['speech-listener-left','speech-listener-right']:
            side=-1 if cue.endswith('left') else 1
            label='Left' if side<0 else 'Right'
            keys(f'{label} upper arm','rotation',(0,-side*.045),(14,-side*.5),(44,-side*.5),(60,-side*.045))
            keys(f'{label} forearm','rotation',(0,side*.07),(17,-side*1.6),(44,-side*1.6),(60,side*.07))
            keys(f'{label} hand','rotation',(0,0),(18,side*.2),(44,side*.2),(60,0))
            keys(f'{label} open hand','opacity',(0,1),(9,1),(10,0),(48,0),(49,1))
            keys(f'{label} point hand','opacity',(0,0),(9,0),(10,1),(48,1),(49,0))
            keys('Head','rotation',(0,0),(18,-side*.035),(44,-side*.035),(60,0))
        elif cue=='speech-team':
            for side,label in [(-1,'Left'),(1,'Right')]:
                keys(f'{label} upper arm','rotation',(0,-side*.045),(15,-side*.58),(45,-side*.58),(60,-side*.045))
                keys(f'{label} forearm','rotation',(0,side*.07),(17,-side*.74),(45,-side*.74),(60,side*.07))
                keys(f'{label} hand','rotation',(0,0),(18,-side*.30),(45,-side*.30),(60,0))
            keys('Head','rotation',(0,0),(20,.025),(43,-.015),(60,0))
        return data
    if cue=='idle':
        for eye in ['Left eye','Right eye']: keys(eye,'scaleY',(0,1),(14,1),(17,.12),(20,1),(48,1))
        keys('Head','rotation',(0,0),(23,.018),(48,0))
    elif cue=='wave':
        keys('Right upper arm','rotation',(0,-.045),(9,-.17),(24,-1.69),(34,-1.74),(80,-1.74),(108,-.045))
        keys('Right forearm','rotation',(0,.07),(24,-1.25),(80,-1.25),(108,.07))
        keys('Right hand','rotation',(0,0),(25,0),(34,-.28),(44,.27),(54,-.28),(64,.23),(74,0),(108,0))
        keys('Head','rotation',(0,0),(24,-.04),(78,-.04),(108,0))
        keys('Right brow','rotation',(0,0),(24,-.08),(84,-.08),(108,0))
    elif cue=='self-point':
        keys('Right upper arm','rotation',(0,-.045),(22,.48),(62,.48),(84,-.045))
        keys('Right forearm','rotation',(0,.07),(26,2.12),(62,2.12),(84,.07))
        keys('Right hand','rotation',(0,0),(28,-2.60),(62,-2.60),(84,0))
        keys('Right open hand','opacity',(0,1),(16,1),(17,0),(67,0),(68,1))
        keys('Right point hand','opacity',(0,0),(16,0),(17,1),(67,1),(68,0))
        keys('Head','rotation',(0,0),(28,.025),(62,.025),(84,0))
    elif cue=='yes':
        keys('Head','rotation',(0,0),(14,.115),(26,-.035),(39,.08),(51,-.018),(66,0))
        keys('Head','y',(0,-53),(14,-49),(26,-54),(39,-50),(66,-53))
        keys('Smile','scaleY',(0,1),(17,1.2),(49,1.2),(66,1))
    elif cue=='no':
        keys('Head','rotation',(0,0),(13,-.11),(25,.1),(38,-.08),(51,.04),(66,0))
        keys('Head','x',(0,0),(13,-3),(25,3),(38,-2),(51,1),(66,0))
        keys('Smile','opacity',(0,1),(7,0),(52,0),(66,1))
        keys('Neutral mouth','opacity',(0,0),(7,1),(52,1),(66,0))
        keys('Left brow','rotation',(0,0),(13,-.08),(51,-.08),(66,0))
        keys('Right brow','rotation',(0,0),(13,.08),(51,.08),(66,0))
    elif cue=='receive-badge':
        for side,label in [(-1,'Left'),(1,'Right')]:
            keys(f'{label} upper arm','rotation',(0,-side*.045),(23,side*.05),(68,side*.05),(90,-side*.045))
            keys(f'{label} forearm','rotation',(0,side*.07),(28,side*.42),(68,side*.42),(90,side*.07))
            keys(f'{label} open hand','opacity',(0,1),(24,1),(25,0),(71,0),(72,1))
            keys(f'{label} grip hand','opacity',(0,0),(24,0),(25,1),(71,1),(72,0))
        keys('Held badge','opacity',(0,0),(24,0),(30,1),(70,1),(90,0))
        keys('Head','rotation',(0,0),(26,.06),(52,-.025),(90,0))
    elif cue=='thinking':
        keys('Head','rotation',(0,0),(25,-.085),(72,-.085),(96,0))
        keys('Left brow','rotation',(0,0),(25,-.12),(72,-.12),(96,0))
        keys('Right brow','rotation',(0,0),(25,.07),(72,.07),(96,0))
        keys('Smile','opacity',(0,1),(15,0),(77,0),(96,1))
        keys('Thinking mouth','opacity',(0,0),(15,1),(77,1),(96,0))
        keys('Right upper arm','rotation',(0,-.045),(27,.3),(72,.3),(96,-.045))
        keys('Right forearm','rotation',(0,.07),(30,2.52),(72,2.52),(96,.07))
    return data


def add_animations(a, default_cue='idle'):
    for number,(cue,duration) in enumerate(DURATIONS.items(),1000):
        animation=E.SubElement(a.artboard,'LinearAnimation',name=cue,id=f'0:{number}',duration=str(duration),fps='60',loopValue='oneShot')
        for (node,prop),keys in animation_data(cue).items():
            obj=E.SubElement(animation,'KeyedObject',objectId=a.ids[node])
            property_el=E.SubElement(obj,'KeyedProperty',propertyKey=str(PROP[prop]))
            discrete=prop=='opacity' and cue!='speech-mouth'
            for index,(frame,value) in enumerate(keys):
                key=E.SubElement(property_el,'KeyFrameDouble',frame=str(frame),value=fmt(value),interpolationType='hold' if discrete or index==len(keys)-1 else 'cubic')
                if not discrete and index<len(keys)-1: E.SubElement(key,'CubicEaseInterpolator',x1='.33',y1='0',x2='.2',y2='1')
    machine=E.Element('StateMachine',name='Character preview',id='0:7')
    layer=E.SubElement(machine,'StateMachineLayer',name='Gesture',id='0:8')
    entry=E.SubElement(layer,'EntryState',x='0',y='0')
    E.SubElement(entry,'StateTransition',stateToId='0:9')
    E.SubElement(layer,'AnimationState',x='180',y='0',id='0:9',animationId=f'0:{1000+list(DURATIONS).index(default_cue)}')
    E.SubElement(layer,'AnyState',x='0',y='140')
    E.SubElement(layer,'ExitState',x='360',y='0')
    a.artboard.insert(0,machine)


def make(character, default_cue='idle'):
    a=Art(); artwork(a,PALETTES[character]);a.finalize_order();add_animations(a,default_cue)
    E.indent(a.rive,space='  ')
    return E.tostring(a.rive,encoding='unicode')+'\n'


def command(args):
    r=subprocess.run([str(RIVE),*args],capture_output=True,text=True)
    if r.returncode: raise RuntimeError(f'{args}: {r.stdout}\n{r.stderr}')
    return r.stdout


def build(character, export=False):
    folder=HERE/character; folder.mkdir(parents=True,exist_ok=True)
    (folder/'rive.yaml').write_text(f'name: {character}\nmain: Character\noutput:\n  dir: build\n')
    (folder/'scene.rml').write_text(make(character))
    report=json.loads(command([str(folder),'--verify','--format=json']))
    (folder/'build').mkdir(exist_ok=True)
    summary=command(['inspect',str(folder),'--summary'])
    (folder/'build/inspect.json').write_text(summary)
    command([str(folder),f'--screenshot={folder}/build/rest.png','--advance=1'])
    export_started=time.time_ns()
    if export: command([str(folder),'--publish=local','--format=json'])
    PUBLIC.mkdir(parents=True,exist_ok=True)
    # Local captures keep their runtime build in memory in CLI 1.9.2. Export is
    # an explicit separate step after the user's Rive account is authenticated.
    runtime=folder/'build'/f'{character}.riv'
    if export:
        if not runtime.is_file() or runtime.stat().st_mtime_ns<export_started:
            raise RuntimeError(f'Local export did not write a fresh artifact: {runtime}')
        shutil.copy2(runtime,PUBLIC/f'{character}.riv')
    return {'character':character,'verify':report,'summary':json.loads(summary),'exported':export}


def capture(character, cue, frames):
    preview=HERE/'qa'/f'{character}-{cue}';preview.mkdir(parents=True,exist_ok=True)
    (preview/'rive.yaml').write_text(f'name: {character}-{cue}\nmain: Character\noutput:\n  dir: build\n')
    (preview/'scene.rml').write_text(make(character,cue))
    renders=HERE/'qa/renders';renders.mkdir(parents=True,exist_ok=True)
    out=[]
    for frame in frames:
        destination=renders/f'{character}-{cue}-{frame:03d}.png'
        command([str(preview),f'--screenshot={destination}',f'--advance={frame}'])
        out.append(str(destination))
    return out


if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--character',choices=list(PALETTES),action='append');parser.add_argument('--capture',action='store_true');parser.add_argument('--export',action='store_true',help='Write .riv with the authenticated official local export; never web publishing')
    options=parser.parse_args();selected=options.character or list(PALETTES)
    reports=[]
    for character in selected:
        reports.append(build(character,options.export));print(f'Built {character}',flush=True)
        if options.capture:
            for cue in DURATIONS:
                frames=[1,24,42,72] if cue=='wave' else [1,33,48] if cue in ['yes','no'] else [1,39,60]
                capture(character,cue,frames)
    report_file=HERE/'build-report.json'
    previous={r['character']:r for r in json.loads(report_file.read_text())} if report_file.exists() else {}
    previous.update({r['character']:r for r in reports})
    report_file.write_text(json.dumps([previous[key] for key in PALETTES if key in previous],indent=2))
