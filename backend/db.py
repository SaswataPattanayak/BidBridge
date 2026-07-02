"""Shared MongoDB handle — imported by both server.py and auth.py to avoid
a circular import between them."""
import os
from motor.motor_asyncio import AsyncIOMotorClient

mongo_client = AsyncIOMotorClient(os.environ["MONGO_URL"])
db = mongo_client[os.environ["DB_NAME"]]
