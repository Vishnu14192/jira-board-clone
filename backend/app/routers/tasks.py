from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db

from app.models.task import (
    Task,
    TaskStatus,
)

from app.models.user import User

from app.schemas.task import (
    TaskCreate,
    TaskRead,
    TaskUpdate,
    TaskStatusUpdate,
)

router = APIRouter(
    prefix="/tasks",
    tags=["Tasks"],
)

#Create task endpoint
@router.post(
    "",
    response_model=TaskRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_task(
    payload: TaskCreate,
    db: AsyncSession = Depends(get_db),
):
    assignee = await db.get(
        User,
        payload.assignee_id,
    )

    if not assignee:
        raise HTTPException(
            status_code=404,
            detail="Assignee not found",
        )

    assigner = await db.get(
        User,
        payload.assigner_id,
    )

    if not assigner:
        raise HTTPException(
            status_code=404,
            detail="Assigner not found",
        )

    task = Task(
        title=payload.title,
        description=payload.description,
        due_date=payload.due_date,
        assignee_id=payload.assignee_id,
        assigner_id=payload.assigner_id,
        status=TaskStatus.TODO.value,
    )

    db.add(task)

    await db.commit()

    result = await db.execute(
        select(Task)
        .options(
            selectinload(Task.assignee),
            selectinload(Task.assigner),
        )
        .where(Task.id == task.id)
    )

    return result.scalar_one()

#Get all tasks
@router.get(
    "",
    response_model=list[TaskRead],
)
async def get_tasks(
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Task)
        .options(
            selectinload(Task.assignee),
            selectinload(Task.assigner),
        )
        .order_by(Task.due_date)
    )

    return result.scalars().all()

#get 1 task endpoint
@router.get(
    "/{task_id}",
    response_model=TaskRead,
)
async def get_task(
    task_id: int,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Task)
        .options(
            selectinload(Task.assignee),
            selectinload(Task.assigner),
        )
        .where(Task.id == task_id)
    )

    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found",
        )

    return task

#update task endpoint
@router.put(
    "/{task_id}",
    response_model=TaskRead,
)
async def update_task(
    task_id: int,
    payload: TaskUpdate,
    db: AsyncSession = Depends(get_db),
):
    task = await db.get(
        Task,
        task_id,
    )

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found",
        )

    updates = payload.model_dump(
        exclude_unset=True,
    )

    for key, value in updates.items():
        setattr(task, key, value)

    await db.commit()

    result = await db.execute(
        select(Task)
        .options(
            selectinload(Task.assignee),
            selectinload(Task.assigner),
        )
        .where(Task.id == task.id)
    )

    return result.scalar_one()

# delete task endpoint
@router.delete(
    "/{task_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_task(
    task_id: int,
    db: AsyncSession = Depends(get_db),
):
    task = await db.get(
        Task,
        task_id,
    )

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found",
        )

    await db.delete(task)

    await db.commit()

#move task to a different status endpoint
@router.patch(
    "/{task_id}/status",
    response_model=TaskRead,
)
async def update_task_status(
    task_id: int,
    payload: TaskStatusUpdate,
    db: AsyncSession = Depends(get_db),
):
    task = await db.get(
        Task,
        task_id,
    )

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found",
        )

    task.status = payload.status.value

    await db.commit()

    result = await db.execute(
        select(Task)
        .options(
            selectinload(Task.assignee),
            selectinload(Task.assigner),
        )
        .where(Task.id == task.id)
    )

    return result.scalar_one()

#edit status of a task endpoint(PATCH)
@router.patch(
    "/{task_id}/status",
    response_model=TaskRead,
)
async def update_task_status(
    task_id: int,
    payload: TaskStatusUpdate,
    db: AsyncSession = Depends(get_db),
):
    task = await db.get(Task, task_id)

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found",
        )

    task.status = payload.status

    await db.commit()

    await db.refresh(task)

    return task