"""
server/ml/accident_predictor.py
Accident detection via Roboflow detect-count-and-visualize-2 workflow.
Falls back gracefully to 0 if the client is unavailable.
"""
import cv2
import os
import tempfile


def predict_live_accident(frame) -> float:
    """
    Submit one frame to the accident-detection Roboflow workflow.
    Returns a severity score 0-100.
    """
    try:
        from ml.roboflow_client import get_client, ACCIDENT_WORKSPACE, ACCIDENT_WORKFLOW
        client = get_client()
        if client is None:
            return 0.0

        with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
            frame_path = tmp.name
        cv2.imwrite(frame_path, frame)

        result = client.run_workflow(
            workspace_name=ACCIDENT_WORKSPACE,
            workflow_id=ACCIDENT_WORKFLOW,
            images={"image": frame_path},
        )
        try:
            os.unlink(frame_path)
        except OSError:
            pass

        return _score_from_result(result)

    except Exception as e:
        print(f"[accident_predictor] Roboflow error: {e}")
        return 0.0


def _score_from_result(result) -> float:
    """Convert a Roboflow workflow result to a 0-100 severity score."""
    try:
        # run_workflow returns a list of output dicts
        if isinstance(result, list) and result:
            result = result[0]

        # Try 'predictions' key (object-detection output)
        predictions = result.get("predictions", [])
        if isinstance(predictions, dict):
            predictions = predictions.get("predictions", [])

        if not predictions:
            return 0.0

        scores = [p.get("confidence", 0) for p in predictions]
        return round(sum(scores) / len(scores) * 100, 2)
    except Exception:
        return 0.0
