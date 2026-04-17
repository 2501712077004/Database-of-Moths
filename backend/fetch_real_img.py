import sys
import os
import urllib.request
import urllib.parse
import json

sys.path.append(r"c:\Users\radoo\.gemini\antigravity\scratch\moths_app\backend")
from database import SessionLocal
from models import Moth

def get_wiki_image(search_term):
    headers = {"User-Agent": "MothsAppBot/1.0"}
    
    # Try exact title first
    url = f"https://en.wikipedia.org/w/api.php?action=query&titles={str(search_term).replace(' ', '_')}&prop=pageimages&format=json&pithumbsize=1000"
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
        pages = data.get("query", {}).get("pages", {})
        for k, v in pages.items():
            if "thumbnail" in v:
                return v["thumbnail"]["source"]
    except Exception:
        pass
    
    # Try search
    url_search = f"https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch={urllib.parse.quote(str(search_term))}&prop=pageimages&format=json&pithumbsize=1000"
    try:
        req = urllib.request.Request(url_search, headers=headers)
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
        pages = data.get("query", {}).get("pages", {})
        for k, v in pages.items():
            if "thumbnail" in v:
                return v["thumbnail"]["source"]
    except Exception:
        pass

    return None

db = SessionLocal()
moths = db.query(Moth).all()
for moth in moths:
    # First priority: scientific name
    scientific_name = moth.scientific_name.replace(" spp", "")
    print(f"Fetching image for {scientific_name} ({moth.common_name})...")
    img_url = get_wiki_image(scientific_name)
    
    if not img_url:
        img_url = get_wiki_image(moth.common_name)
        
    if img_url:
        print(f"Found: {img_url}")
        moth.image_url = img_url
    else:
        print("Not found fallback.")

db.commit()
db.close()
print("Finished updating images.")
