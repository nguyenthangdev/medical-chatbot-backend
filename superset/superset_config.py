FEATURE_FLAGS = {
    "EMBEDDED_SUPERSET": True,
}

GUEST_ROLE_NAME = "Gamma"
GUEST_TOKEN_JWT_SECRET = "medical-chatbot-superset-guest-secret"
GUEST_TOKEN_JWT_EXP_SECONDS = 3600

TALISMAN_ENABLED = False
WTF_CSRF_ENABLED = False
ENABLE_CORS = True
CORS_OPTIONS = {
    "supports_credentials": True,
    "allow_headers": ["*"],
    "resources": ["*"],
    "origins": [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
}

HTTP_HEADERS = {
    "X-Frame-Options": "ALLOWALL",
}
