#!/bin/sh
set -e
# Single worker to save memory (important for Render's free tier)
# --limit-max-requests helps prevent memory leaks
exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-10000} --workers 1 --limit-max-requests 1000
