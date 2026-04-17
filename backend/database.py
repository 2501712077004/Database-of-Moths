import json
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Use DATABASE_URL from environment if available (for production Postgres),
# otherwise fallback to local SQLite
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")
if not SQLALCHEMY_DATABASE_URL:
    SQLALCHEMY_DATABASE_URL = f"sqlite:///{os.path.join(BASE_DIR, 'moths.db')}"

# SQLAlchemy requires "postgresql://" not "postgres://" which some platforms provide
if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)

connect_args = {}
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args=connect_args
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    print("Initializing database...")
    from models import Moth, Distribution
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    # Check if we already seeded
    if db.query(Moth).first():
        print("Database already seeded.")
        db.close()
        return

    print("Seeding database with mock data...")
    file_path = os.path.join(BASE_DIR, 'mock_moths_data.json')
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
            for item in data:
                moth = Moth(
                    common_name=item.get("common_name", ""),
                    scientific_name=item.get("scientific_name", ""),
                    family_name=item.get("family_name", ""),
                    image_url=item.get("image_url", ""),
                    description=item.get("description", ""),
                    damage_caused=item.get("damage_caused", ""),
                    link=item.get("link", "")
                )
                db.add(moth)
                db.flush() # to get moth.id
                
                distributions = item.get("distributions", [])
                for dist in distributions:
                    distribution = Distribution(
                        moth_id=moth.id,
                        moth_name=dist.get("moth_name", ""),
                        description=dist.get("description", ""),
                        distribution_file_url=dist.get("distribution_file_url", "")
                    )
                    db.add(distribution)
            
            db.commit()
    print("Database seeding complete.")
    db.close()
