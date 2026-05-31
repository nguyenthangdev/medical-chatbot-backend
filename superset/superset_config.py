import os

FEATURE_FLAGS = {
    "EMBEDDED_SUPERSET": True,
}

GUEST_ROLE_NAME = "Gamma"
GUEST_TOKEN_JWT_SECRET = os.environ.get("SUPERSET_GUEST_TOKEN_JWT_SECRET", "change-this-guest-secret")
GUEST_TOKEN_JWT_EXP_SECONDS = 3600

cors_origins = [
    origin.strip()
    for origin in os.environ.get("SUPERSET_CORS_ORIGINS", "").split(",")
    if origin.strip()
]

TALISMAN_ENABLED = False
WTF_CSRF_ENABLED = False
ENABLE_CORS = True
CORS_OPTIONS = {
    "supports_credentials": True,
    "allow_headers": ["*"],
    "resources": ["*"],
    "origins": cors_origins or [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
}

HTTP_HEADERS = {
    "X-Frame-Options": "ALLOWALL",
}
