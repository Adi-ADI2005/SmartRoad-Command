"""
Accident severity prediction using Roboflow CLIP model.
"""
import cv2
import tempfile

from config import ROBOFLOW_API_KEY


def _load_model():
    try:
        from roboflow import CLIPModel
        return CLIPModel(api_key=ROBOFLOW_API_KEY)
    except Exception as e:
        print(f"[accident_predictor] CLIP model load failed: {e}")
        return None


_model = None


def _get_model():
    global _model
    if _model is None:
        _model = _load_model()
    return _model


def predict_live_accident(frame) -> float:
    try:
        model = _get_model()
        if model is None:
            return 0
        with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
            frame_path = tmp.name
        cv2.imwrite(frame_path, frame)
        result = model.predict(frame_path)
        return _calculate_severity(result)
    except Exception as e:
        print(f"[accident_predictor] Live prediction error: {e}")
        return 0


def _calculate_severity(result) -> float:
    try:
        predictions = result.get("predictions", [])
        if not predictions:
            return 0
        scores = [p.get("confidence", 0) for p in predictions]
        return round(sum(scores) / len(scores) * 100, 2)
    except Exception:
        return 0
