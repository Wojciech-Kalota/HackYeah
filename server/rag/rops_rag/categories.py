from pydantic import BaseModel, ConfigDict, Field, TypeAdapter, field_validator
from typing import Annotated


class CategoryDefinition(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)
    id: str = Field(min_length=1, max_length=100)
    label: str = Field(min_length=1, max_length=200)

    @field_validator("id", "label")
    @classmethod
    def nonblank(cls, value):
        if not value.strip() or value != value.strip():
            raise ValueError("Wartość musi być niepusta i bez skrajnych spacji")
        return value


def validate_categories(categories):
    items = TypeAdapter(Annotated[list[CategoryDefinition], Field(min_length=1, max_length=100)]).validate_python(categories)
    if len({item.id for item in items}) != len(items):
        raise ValueError("Identyfikatory kategorii muszą być unikalne")
    return [item.model_dump() for item in items]
