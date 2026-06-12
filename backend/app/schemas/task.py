from datetime import (
    date,
    datetime,
)

from pydantic import (
    BaseModel,
    ConfigDict,
)

from app.models.task import TaskStatus
from app.schemas.user import UserSummary


class TaskCreate(BaseModel):
    title: str
    description: str

    due_date: date

    assignee_id: int
    assigner_id: int


class TaskUpdate(BaseModel):
    title: str | None = None

    description: str | None = None

    due_date: date | None = None

    assignee_id: int | None = None

    status: TaskStatus | None = None


class TaskStatusUpdate(BaseModel):
    status: TaskStatus


class TaskRead(BaseModel):
    id: int

    title: str
    description: str

    status: TaskStatus

    due_date: date

    assignee: UserSummary
    assigner: UserSummary

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )