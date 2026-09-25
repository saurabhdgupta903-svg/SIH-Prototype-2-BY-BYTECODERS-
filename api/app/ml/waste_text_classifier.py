from typing import Tuple
from ..models.waste_surplus import WasteReason

KEYWORD_MAPPINGS = {
    WasteReason.OVERPRODUCTION: ["excess", "overcooked", "too much", "leftover", "surplus", "extra batch", "unconsumed batch"],
    WasteReason.SPOILAGE: ["spoiled", "curdled", "sour", "smell", "fungus", "mold", "stale", "foul", "bad taste"],
    WasteReason.EXPIRY: ["expired", "past date", "shelf life", "expiry date", "outdated"],
    WasteReason.PREPARATION_WASTE: ["peeling", "trimming", "burnt", "kitchen cutting", "preparation", "dough scrap"],
    WasteReason.STORAGE_ISSUE: ["freezer stopped", "chiller breakdown", "warm fridge", "door left open", "leak", "storage"],
    WasteReason.LOW_DEMAND: ["low turnout", "absent", "rainy day", "strike", "students left", "empty hall", "holiday attendance"],
    WasteReason.PLATE_WASTE: ["plate leftovers", "dining hall bins", "consumer waste", "table scraps"],
    WasteReason.EQUIPMENT_ISSUE: ["oven malfunction", "grinder breakdown", "steamer failure", "power cut"]
}

def classify_waste_text(text: str) -> WasteReason:
    """
    Classifies unstructured free-text operator notes into standardized MoFPI waste reasons.
    Uses multi-keyword semantic matching with confidence scoring.
    """
    if not text:
        return WasteReason.OTHER

    lower_text = text.lower()
    best_reason = WasteReason.OTHER
    highest_score = 0

    for reason, keywords in KEYWORD_MAPPINGS.items():
        score = sum(1 for kw in keywords if kw in lower_text)
        if score > highest_score:
            highest_score = score
            best_reason = reason

    return best_reason if highest_score > 0 else WasteReason.OVERPRODUCTION
