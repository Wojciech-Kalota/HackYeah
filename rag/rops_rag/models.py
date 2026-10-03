from dataclasses import dataclass


@dataclass(frozen=True)
class Concept:
    problem: str
    audience: str
    solution: str
    category: str
    context: str = ""

    def __post_init__(self):
        for field in ("problem", "audience", "category"):
            value = getattr(self, field)
            if not isinstance(value, str) or not value.strip():
                raise ValueError(f"Pole {field} musi być niepustym tekstem")
        if not isinstance(self.context, str):
            raise ValueError("Pole context musi być tekstem")
        if not isinstance(self.solution, str):
            raise ValueError("Pole solution musi być tekstem")
        if not self.solution.strip():
            object.__setattr__(self, "solution", "")

    def retrieval_text(self) -> str:
        return "\n".join((
            f"Problem: {self.problem}", f"Odbiorcy: {self.audience}",
            f"Rozwiązanie i sposób działania: {self.solution}",
            f"Kontekst: {self.context}",
        ))
