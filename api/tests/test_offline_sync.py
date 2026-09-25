import pytest
from app.ml.waste_text_classifier import classify_waste_text
from app.models.waste_surplus import WasteReason

def test_offline_text_classifier():
    # Test operator note mapping
    note1 = "3 kg excess rice remaining after lunch dinner hall"
    assert classify_waste_text(note1) == WasteReason.OVERPRODUCTION

    note2 = "milk turned sour and curdled in walk-in cooler"
    assert classify_waste_text(note2) == WasteReason.SPOILAGE

    note3 = "vegetable peelings and potato skins from prep"
    assert classify_waste_text(note3) == WasteReason.PREPARATION_WASTE
