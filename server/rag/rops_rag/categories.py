from enum import Enum

class Category(str, Enum):
    SAFETY = "bezpieczenstwo"
    CYBERSECURITY = "cyberbezpieczenstwo"
    ROADS = "infrastruktura_drogowa"
    TRANSPORT = "transport_i_mobilnosc"
    HEALTH = "zdrowie"
    MENTAL_HEALTH = "zdrowie_psychiczne"
    EDUCATION = "edukacja"
    DIGITAL = "wlaczenie_cyfrowe"
    INTEGRATION = "integracja_spoleczna"
    ACCESSIBILITY = "dostepnosc"
    CARE = "opieka_i_wsparcie"
    ENVIRONMENT = "srodowisko"
    WORK = "rynek_pracy"
    OTHER = "inne"

CATEGORY_LABELS = dict(zip(Category, ["Bezpieczeństwo", "Cyberbezpieczeństwo",
    "Infrastruktura drogowa", "Transport i mobilność", "Zdrowie", "Zdrowie psychiczne",
    "Edukacja", "Włączenie cyfrowe", "Integracja społeczna", "Dostępność",
    "Opieka i wsparcie", "Środowisko", "Rynek pracy", "Inne"]))

def category_catalog():
    return [{"id": category.value, "label": label} for category, label in CATEGORY_LABELS.items()]
