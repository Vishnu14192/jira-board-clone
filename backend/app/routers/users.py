from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.schemas.user import (
    UserCreate,
    UserRead,
)

router = APIRouter(
    prefix="/users",
    tags=["Users"],
)

@router.post(
    "",
    response_model=UserRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_user(
    payload: UserCreate,
    db: AsyncSession = Depends(get_db),
):
    existing_user = await db.scalar(
        select(User).where(
            User.email == payload.email
        )
    )

    if existing_user:
        raise HTTPException(
            status_code=409,
            detail="Email already exists",
        )

    user = User(
        name=payload.name,
        email=payload.email,
    )

    db.add(user)

    await db.commit()

    await db.refresh(user)

    return user

@router.get(
    "",
    response_model=list[UserRead],
)
async def get_users(
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(User)
        .order_by(User.name)
    )

    users = result.scalars().all()

    return users

@router.get(
    "/{user_id}",
    response_model=UserRead,
)
async def get_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
):
    user = await db.get(
        User,
        user_id,
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    return user