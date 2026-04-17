from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Moth(Base):
    __tablename__ = "moths"

    id = Column(Integer, primary_key=True, index=True)
    common_name = Column(String, index=True)
    scientific_name = Column(String, index=True)
    family_name = Column(String)
    image_url = Column(String)
    description = Column(String)
    damage_caused = Column(String, nullable=True)
    link = Column(String)

    distributions = relationship("Distribution", back_populates="moth", cascade="all, delete-orphan")

class Distribution(Base):
    __tablename__ = "distributions"

    id = Column(Integer, primary_key=True, index=True)
    moth_id = Column(Integer, ForeignKey("moths.id"))
    moth_name = Column(String)
    description = Column(String)
    distribution_file_url = Column(String)

    moth = relationship("Moth", back_populates="distributions")
