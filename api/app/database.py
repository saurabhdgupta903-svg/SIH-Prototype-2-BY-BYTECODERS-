import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy import create_engine
from .config import settings

import urllib.parse
import logging

logger = logging.getLogger(__name__)

# Async Engine for FastAPI
RAW_DB_URL = settings.DATABASE_URL.strip()

# Normalize scheme for async drivers
if RAW_DB_URL.startswith("postgres://"):
    ASYNC_DATABASE_URL = RAW_DB_URL.replace("postgres://", "postgresql+asyncpg://", 1)
elif RAW_DB_URL.startswith("postgresql://"):
    ASYNC_DATABASE_URL = RAW_DB_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
elif RAW_DB_URL.startswith("sqlite:///"):
    ASYNC_DATABASE_URL = RAW_DB_URL.replace("sqlite:///", "sqlite+aiosqlite:///", 1)
else:
    ASYNC_DATABASE_URL = RAW_DB_URL

connect_args = {}

if "asyncpg" in ASYNC_DATABASE_URL:
    parsed = urllib.parse.urlsplit(ASYNC_DATABASE_URL)
    query_params = urllib.parse.parse_qs(parsed.query)

    # asyncpg does not accept sslmode query param in the URL string; convert to connect_args
    if "sslmode" in query_params:
        ssl_val = query_params.pop("sslmode")[0].lower()
        if ssl_val in ("require", "verify-ca", "verify-full", "prefer"):
            connect_args["ssl"] = "require"
        elif ssl_val == "disable":
            connect_args["ssl"] = False

    # For remote cloud databases (Render, etc.) not on localhost, default to SSL if not disabled
    if "ssl" not in connect_args and parsed.hostname and parsed.hostname not in ("localhost", "127.0.0.1", "db"):
        connect_args["ssl"] = "require"

    # Reassemble URL without unsupported query parameters
    clean_query = urllib.parse.urlencode([(k, v[0]) for k, v in query_params.items()])
    ASYNC_DATABASE_URL = urllib.parse.urlunsplit((
        parsed.scheme,
        parsed.netloc,
        parsed.path,
        clean_query,
        parsed.fragment
    ))
elif "sqlite" in ASYNC_DATABASE_URL:
    connect_args["check_same_thread"] = False

engine = create_async_engine(
    ASYNC_DATABASE_URL,
    connect_args=connect_args,
    echo=False,
    future=True
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
