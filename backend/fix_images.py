import sys
import os
sys.path.append(r"c:\Users\radoo\.gemini\antigravity\scratch\moths_app\backend")
from database import SessionLocal
from models import Moth

images = [
    "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1618210344400-b6c8ebba4afb?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1596700877969-923cb8f6a9e1?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1542385151-efd9000785a0?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1579782531633-8a3d561fb683?auto=format&fit=crop&q=80&w=800",
]

db = SessionLocal()
moths = db.query(Moth).all()
for i, moth in enumerate(moths):
    moth.image_url = images[i % len(images)]
db.commit()
db.close()
print("Images updated in DB.")
