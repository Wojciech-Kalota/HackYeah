from pydantic import BaseModel, ConfigDict, Field


class Assessment(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)
    cost: int = Field(ge=1, le=5)
    duration: int = Field(ge=1, le=5)
    importance: int = Field(ge=1, le=5)
    reach: int = Field(ge=1, le=5)

    def score(self) -> float:
        # Skala 1..5 jest przekształcona do 0..100. Koszt/czas odwracamy.
        return round(25 * (
            0.4 * (self.importance - 1) + 0.3 * (self.reach - 1)
            + 0.2 * (5 - self.cost) + 0.1 * (5 - self.duration)
        ), 1)
