from datetime import datetime

from pydantic import (
    BaseModel,
    EmailStr,
    ConfigDict,
)


class UserCreate(BaseModel):
    name: str
    email: EmailStr


class UserSummary(BaseModel):
    id: int
    name: str

    model_config = ConfigDict(
        from_attributes=True
    )


class UserRead(BaseModel):
    id: int
    name: str
    email: EmailStr
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )