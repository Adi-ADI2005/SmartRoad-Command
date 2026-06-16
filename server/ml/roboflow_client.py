"""
server/ml/roboflow_client.py
Roboflow InferenceHTTPClient — used only for accident detection.
"""

ROBOFLOW_API_KEY   = "XkEdFZmeHhUBywp5u6yZ"
ROBOFLOW_API_URL   = "https://serverless.roboflow.com"

ACCIDENT_WORKSPACE = "student-iu7zo"
ACCIDENT_WORKFLOW  = "detect-count-and-visualize-2"

_client = None


def get_client():
    global _client
    if _client is not None:
        return _client
    try:
        from inference_sdk import InferenceHTTPClient
        _client = InferenceHTTPClient(
            api_url=ROBOFLOW_API_URL,
            api_key=ROBOFLOW_API_KEY,
        )
        print("[roboflow_client] Accident-detection client ready.")
    except Exception as e:
        print(f"[roboflow_client] Failed to create client: {e}")
        _client = None
    return _client
