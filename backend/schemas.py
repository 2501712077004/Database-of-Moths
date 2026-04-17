from pydantic import BaseModel
from typing import List, Optional

class MothDistributionBase(BaseModel):
    moth_name: str
    description: str
    distribution_file_url: str

class MothDistributionCreate(MothDistributionBase):
    pass

class MothDistribution(MothDistributionBase):
    id: int
    moth_id: int

    class Config:
        orm_mode = True
        from_attributes = True

class MothDescriptionBase(BaseModel):
    common_name: str
    scientific_name: str
    family_name: str
    image_url: str
    description: str
    damage_caused: Optional[str] = None
    link: str

class MothDescriptionCreate(MothDescriptionBase):
    distributions: List[MothDistributionCreate] = []

class MothDescription(MothDescriptionBase):
    id: int
    distributions: List[MothDistribution] = []

    class Config:
        orm_mode = True
        from_attributes = True

class StructureSchema(BaseModel):
    name: str
    value: str
