"""BidBridge - Real-time auction platform.

FastAPI + MongoDB + Socket.IO. All API routes prefixed with /api. Socket.IO
mounted at /api/socket.io so kubernetes ingress routes it to backend.
"""
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import os
import logging
import asyncio
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Literal, Any

import socketio
from bson import ObjectId
from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, Query
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from starlette.middleware.cors import CORSMiddleware

from auth import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
    set_auth_cookies,
    clear_auth_cookies,
    get_current_user,
    get_current_admin,
)

# ---------------------------------------------------------------------------
# DB & app setup
# ---------------------------------------------------------------------------
mongo_url = os.environ["MONGO_URL"]
mongo_client = AsyncIOMotorClient(mongo_url)
db = mongo_client[os.environ["DB_NAME"]]

fastapi_app = FastAPI(title="BidBridge API")
api = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
log = logging.getLogger("bidbridge")

# Socket.IO ---------------------------------------------------------------
sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins="*",
    logger=False,
    engineio_logger=False,
)


# ---------------------------------------------------------------------------
# Utility
# ---------------------------------------------------------------------------
def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def iso(dt: datetime) -> str:
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc).isoformat()


def parse_dt(val: Any) -> datetime:
    if isinstance(val, datetime):
        return val if val.tzinfo else val.replace(tzinfo=timezone.utc)
    if isinstance(val, str):
        return datetime.fromisoformat(val.replace("Z", "+00:00"))
    raise ValueError("Invalid datetime")


def serialize_user(u: dict) -> dict:
    return {
        "id": str(u.get("_id", u.get("id"))),
        "email": u["email"],
        "name": u.get("name", ""),
        "role": u.get("role", "bidder"),
        "avatar": u.get("avatar"),
        "bio": u.get("bio", ""),
        "created_at": iso(parse_dt(u["created_at"])) if u.get("created_at") else None,
    }


def serialize_auction(a: dict, extra: Optional[dict] = None) -> dict:
    doc = {
        "id": str(a.get("_id", a.get("id"))),
        "title": a["title"],
        "description": a.get("description", ""),
        "category": a.get("category", "Other"),
        "images": a.get("images", []),
        "starting_price": a["starting_price"],
        "current_bid": a.get("current_bid", a["starting_price"]),
        "min_increment": a.get("min_increment", 1),
        "start_time": iso(parse_dt(a["start_time"])),
        "end_time": iso(parse_dt(a["end_time"])),
        "seller_id": a["seller_id"],
        "seller_name": a.get("seller_name", ""),
        "status": a.get("status", "upcoming"),
        "bid_count": a.get("bid_count", 0),
        "highest_bidder_id": a.get("highest_bidder_id"),
        "highest_bidder_name": a.get("highest_bidder_name"),
        "condition": a.get("condition", "Used"),
        "created_at": iso(parse_dt(a["created_at"])) if a.get("created_at") else None,
    }
    if extra:
        doc.update(extra)
    return doc


def compute_status(a: dict) -> str:
    now = now_utc()
    start = parse_dt(a["start_time"])
    end = parse_dt(a["end_time"])
    if now < start:
        return "upcoming"
    if now >= end:
        return "ended"
    return "live"


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------
class RegisterInput(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    name: str = Field(min_length=1, max_length=80)
    role: Literal["bidder", "seller"] = "bidder"


class LoginInput(BaseModel):
    email: EmailStr
    password: str


class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    avatar: Optional[str] = None


class AuctionInput(BaseModel):
    title: str = Field(min_length=3, max_length=140)
    description: str = Field(min_length=10, max_length=4000)
    category: str
    images: List[str] = Field(default_factory=list)
    starting_price: float = Field(gt=0)
    min_increment: float = Field(gt=0, default=1)
    start_time: datetime
    end_time: datetime
    condition: Literal["New", "Like New", "Used", "Refurbished"] = "Used"


class BidInput(BaseModel):
    amount: float = Field(gt=0)


class FeedbackInput(BaseModel):
    auction_id: str
    to_user_id: str
    rating: int = Field(ge=1, le=5)
    comment: str = Field(default="", max_length=500)


class CategoryInput(BaseModel):
    name: str
    icon: Optional[str] = None


# ---------------------------------------------------------------------------
# Startup
# ---------------------------------------------------------------------------
DEFAULT_CATEGORIES = [
    {"name": "Watches", "icon": "watch"},
    {"name": "Cars", "icon": "car"},
    {"name": "Art", "icon": "palette"},
    {"name": "Furniture", "icon": "armchair"},
    {"name": "Electronics", "icon": "cpu"},
    {"name": "Jewelry", "icon": "gem"},
    {"name": "Collectibles", "icon": "trophy"},
    {"name": "Fashion", "icon": "shirt"},
]


async def seed_admin_and_categories():
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@bidbridge.com").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "Admin@12345")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one({
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "BidBridge Admin",
            "role": "admin",
            "bio": "Platform administrator",
            "created_at": now_utc().isoformat(),
        })
        log.info("Seeded admin user %s", admin_email)
    else:
        if not verify_password(admin_password, existing["password_hash"]):
            await db.users.update_one(
                {"email": admin_email},
                {"$set": {"password_hash": hash_password(admin_password)}},
            )
            log.info("Updated admin password")

    # Default demo seller/bidder
    for demo in [
        {"email": "seller@bidbridge.com", "password": "Seller@12345", "name": "Studio Lumen", "role": "seller"},
        {"email": "bidder@bidbridge.com", "password": "Bidder@12345", "name": "Ava Bidder", "role": "bidder"},
    ]:
        u = await db.users.find_one({"email": demo["email"].lower()})
        if not u:
            await db.users.insert_one({
                "email": demo["email"].lower(),
                "password_hash": hash_password(demo["password"]),
                "name": demo["name"],
                "role": demo["role"],
                "bio": "",
                "created_at": now_utc().isoformat(),
            })

    # Categories
    count = await db.categories.count_documents({})
    if count == 0:
        await db.categories.insert_many([{**c, "created_at": now_utc().isoformat()} for c in DEFAULT_CATEGORIES])
        log.info("Seeded categories")


async def seed_demo_auctions():
    count = await db.auctions.count_documents({})
    if count > 0:
        return
    seller = await db.users.find_one({"email": "seller@bidbridge.com"})
    if not seller:
        return
    now = now_utc()
    demos = [
        {
            "title": "1965 Vintage Chronograph — Swiss Movement",
            "description": "A restored 1965 chronograph with hand-wound Swiss movement. Comes with original leather strap and appraisal certificate. Perfect for collectors seeking a piece of horological history.",
            "category": "Watches",
            "images": [
                "https://images.pexels.com/photos/31513715/pexels-photo-31513715.jpeg",
                "https://images.pexels.com/photos/15074402/pexels-photo-15074402.jpeg",
            ],
            "starting_price": 2400.0,
            "min_increment": 50.0,
            "condition": "Refurbished",
            "offset_minutes": -30,
            "duration_hours": 48,
        },
        {
            "title": "Restored 1972 Italian Roadster",
            "description": "Fully restored red Italian roadster, matching numbers, freshly serviced. A head-turning classic ready for the open road. Includes full restoration documentation.",
            "category": "Cars",
            "images": [
                "https://images.pexels.com/photos/30287465/pexels-photo-30287465.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
                "https://images.pexels.com/photos/35505802/pexels-photo-35505802.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
            ],
            "starting_price": 48000.0,
            "min_increment": 500.0,
            "condition": "Refurbished",
            "offset_minutes": -60,
            "duration_hours": 72,
        },
        {
            "title": "Minimalist Sculptural Chair — Studio Piece",
            "description": "Studio-crafted minimalist chair in matte white. Hand-finished solid ash with a bent-plywood seat. A rare piece from a small European workshop.",
            "category": "Furniture",
            "images": [
                "https://images.pexels.com/photos/32562036/pexels-photo-32562036.jpeg",
                "https://images.pexels.com/photos/11591259/pexels-photo-11591259.jpeg",
            ],
            "starting_price": 620.0,
            "min_increment": 20.0,
            "condition": "New",
            "offset_minutes": 15,  # upcoming
            "duration_hours": 24,
        },
        {
            "title": "Mid-Century Dining Set — Yellow Ash",
            "description": "Complete mid-century dining set featuring yellow ash chairs and a matching table. Sourced from a private estate. Excellent original condition.",
            "category": "Furniture",
            "images": [
                "https://images.pexels.com/photos/11591259/pexels-photo-11591259.jpeg",
            ],
            "starting_price": 1200.0,
            "min_increment": 25.0,
            "condition": "Used",
            "offset_minutes": -10,
            "duration_hours": 6,
        },
    ]
    docs = []
    for d in demos:
        start = now + __import__("datetime").timedelta(minutes=d.pop("offset_minutes"))
        end = start + __import__("datetime").timedelta(hours=d.pop("duration_hours"))
        docs.append({
            **d,
            "start_time": start.isoformat(),
            "end_time": end.isoformat(),
            "seller_id": str(seller["_id"]),
            "seller_name": seller.get("name", "Seller"),
            "current_bid": d["starting_price"],
            "bid_count": 0,
            "highest_bidder_id": None,
            "highest_bidder_name": None,
            "status": compute_status({"start_time": start, "end_time": end}),
            "created_at": now.isoformat(),
        })
    await db.auctions.insert_many(docs)
    log.info("Seeded %d demo auctions", len(docs))


@fastapi_app.on_event("startup")
async def on_startup():
    await db.users.create_index("email", unique=True)
    await db.auctions.create_index([("status", 1), ("end_time", 1)])
    await db.bids.create_index([("auction_id", 1), ("created_at", -1)])
    await db.notifications.create_index([("user_id", 1), ("created_at", -1)])
    await db.watchlist.create_index([("user_id", 1), ("auction_id", 1)], unique=True)
    await db.login_attempts.create_index("identifier")
    await seed_admin_and_categories()
    await seed_demo_auctions()
    # background auction status updater
    asyncio.create_task(auction_ticker())


@fastapi_app.on_event("shutdown")
async def on_shutdown():
    mongo_client.close()


# ---------------------------------------------------------------------------
# Notifications helper
# ---------------------------------------------------------------------------
async def create_notification(user_id: str, kind: str, title: str, message: str, auction_id: Optional[str] = None):
    doc = {
        "user_id": user_id,
        "kind": kind,
        "title": title,
        "message": message,
        "auction_id": auction_id,
        "read": False,
        "created_at": now_utc().isoformat(),
    }
    result = await db.notifications.insert_one(doc)
    payload = {**doc, "id": str(result.inserted_id)}
    payload.pop("_id", None)
    await sio.emit("notification", payload, room=f"user:{user_id}")
    return payload


# ---------------------------------------------------------------------------
# Auction background ticker — auto-transition status & notify winners
# ---------------------------------------------------------------------------
async def auction_ticker():
    while True:
        try:
            now = now_utc()
            # transition upcoming -> live
            cursor = db.auctions.find({"status": "upcoming"})
            async for a in cursor:
                if parse_dt(a["start_time"]) <= now:
                    await db.auctions.update_one({"_id": a["_id"]}, {"$set": {"status": "live"}})
                    await sio.emit("auction_status", {"auction_id": str(a["_id"]), "status": "live"})
            # transition live -> ended
            cursor2 = db.auctions.find({"status": "live"})
            async for a in cursor2:
                if parse_dt(a["end_time"]) <= now:
                    await db.auctions.update_one({"_id": a["_id"]}, {"$set": {"status": "ended"}})
                    await sio.emit("auction_status", {"auction_id": str(a["_id"]), "status": "ended"})
                    if a.get("highest_bidder_id"):
                        await create_notification(
                            a["highest_bidder_id"],
                            "won",
                            "You won an auction!",
                            f"You are the winning bidder for '{a['title']}' at ${a['current_bid']:.2f}.",
                            auction_id=str(a["_id"]),
                        )
                        await create_notification(
                            a["seller_id"],
                            "sold",
                            "Your auction ended",
                            f"'{a['title']}' sold for ${a['current_bid']:.2f}.",
                            auction_id=str(a["_id"]),
                        )
        except Exception as e:  # pragma: no cover
            log.exception("ticker error: %s", e)
        await asyncio.sleep(3)


# ---------------------------------------------------------------------------
# Brute force helpers
# ---------------------------------------------------------------------------
MAX_ATTEMPTS = 5
LOCK_MINUTES = 15


async def check_lockout(identifier: str) -> None:
    doc = await db.login_attempts.find_one({"identifier": identifier})
    if not doc:
        return
    if doc["count"] >= MAX_ATTEMPTS:
        last = parse_dt(doc["last_attempt"])
        if (now_utc() - last).total_seconds() < LOCK_MINUTES * 60:
            raise HTTPException(status_code=429, detail="Too many attempts. Try again later.")
        else:
            await db.login_attempts.delete_one({"identifier": identifier})


async def record_failure(identifier: str) -> None:
    await db.login_attempts.update_one(
        {"identifier": identifier},
        {"$inc": {"count": 1}, "$set": {"last_attempt": now_utc().isoformat()}},
        upsert=True,
    )


async def clear_attempts(identifier: str) -> None:
    await db.login_attempts.delete_one({"identifier": identifier})


# ---------------------------------------------------------------------------
# AUTH routes
# ---------------------------------------------------------------------------
@api.post("/auth/register")
async def register(body: RegisterInput, request: Request, response: Response):
    email = body.email.lower()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    doc = {
        "email": email,
        "password_hash": hash_password(body.password),
        "name": body.name.strip(),
        "role": body.role,
        "bio": "",
        "created_at": now_utc().isoformat(),
    }
    res = await db.users.insert_one(doc)
    uid = str(res.inserted_id)
    access = create_access_token(uid, email, body.role)
    refresh = create_refresh_token(uid)
    set_auth_cookies(response, access, refresh)
    return {"user": serialize_user({**doc, "_id": res.inserted_id}), "access_token": access}


@api.post("/auth/login")
async def login(body: LoginInput, request: Request, response: Response):
    email = body.email.lower()
    identifier = email  # email-only identifier; behind ingress request.client.host is unstable
    await check_lockout(identifier)
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(body.password, user["password_hash"]):
        await record_failure(identifier)
        raise HTTPException(status_code=401, detail="Invalid email or password")
    await clear_attempts(identifier)
    uid = str(user["_id"])
    access = create_access_token(uid, email, user["role"])
    refresh = create_refresh_token(uid)
    set_auth_cookies(response, access, refresh)
    return {"user": serialize_user(user), "access_token": access}


@api.post("/auth/logout")
async def logout(response: Response, user=Depends(get_current_user)):
    clear_auth_cookies(response)
    return {"success": True}


@api.get("/auth/me")
async def me(user=Depends(get_current_user)):
    return serialize_user(user)


@api.post("/auth/refresh")
async def refresh(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="No refresh token")
    try:
        payload = decode_token(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    if payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid token type")
    user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    access = create_access_token(str(user["_id"]), user["email"], user["role"])
    new_refresh = create_refresh_token(str(user["_id"]))
    set_auth_cookies(response, access, new_refresh)
    return {"success": True}


@api.patch("/auth/profile")
async def update_profile(body: ProfileUpdate, user=Depends(get_current_user)):
    update = {k: v for k, v in body.model_dump().items() if v is not None}
    if update:
        await db.users.update_one({"_id": ObjectId(user["id"])}, {"$set": update})
    doc = await db.users.find_one({"_id": ObjectId(user["id"])})
    return serialize_user(doc)


# ---------------------------------------------------------------------------
# Categories
# ---------------------------------------------------------------------------
@api.get("/categories")
async def list_categories():
    docs = await db.categories.find({}).to_list(200)
    return [{"id": str(d["_id"]), "name": d["name"], "icon": d.get("icon")} for d in docs]


@api.post("/categories")
async def create_category(body: CategoryInput, admin=Depends(get_current_admin)):
    doc = {"name": body.name, "icon": body.icon, "created_at": now_utc().isoformat()}
    res = await db.categories.insert_one(doc)
    return {"id": str(res.inserted_id), "name": body.name, "icon": body.icon}


# ---------------------------------------------------------------------------
# AUCTIONS
# ---------------------------------------------------------------------------
@api.get("/auctions")
async def list_auctions(
    q: Optional[str] = None,
    category: Optional[str] = None,
    status: Optional[Literal["live", "upcoming", "ended"]] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    seller_id: Optional[str] = None,
    sort: Literal["ending_soon", "newest", "price_asc", "price_desc"] = "ending_soon",
    limit: int = Query(50, le=100),
):
    query: dict = {}
    if q:
        query["$or"] = [
            {"title": {"$regex": q, "$options": "i"}},
            {"description": {"$regex": q, "$options": "i"}},
        ]
    if category and category != "All":
        query["category"] = category
    if status:
        query["status"] = status
    if seller_id:
        query["seller_id"] = seller_id
    price_q: dict = {}
    if min_price is not None:
        price_q["$gte"] = min_price
    if max_price is not None:
        price_q["$lte"] = max_price
    if price_q:
        query["current_bid"] = price_q

    sort_map = {
        "ending_soon": [("end_time", 1)],
        "newest": [("created_at", -1)],
        "price_asc": [("current_bid", 1)],
        "price_desc": [("current_bid", -1)],
    }
    cursor = db.auctions.find(query).sort(sort_map[sort]).limit(limit)
    return [serialize_auction(a) for a in await cursor.to_list(limit)]


@api.get("/auctions/{auction_id}")
async def get_auction(auction_id: str):
    try:
        oid = ObjectId(auction_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Auction not found")
    a = await db.auctions.find_one({"_id": oid})
    if not a:
        raise HTTPException(status_code=404, detail="Auction not found")
    # latest bids
    bid_cursor = db.bids.find({"auction_id": auction_id}).sort("created_at", -1).limit(20)
    bids = [{
        "id": str(b["_id"]),
        "user_id": b["user_id"],
        "user_name": b.get("user_name", "Bidder"),
        "amount": b["amount"],
        "created_at": iso(parse_dt(b["created_at"])),
    } for b in await bid_cursor.to_list(20)]
    return serialize_auction(a, extra={"recent_bids": bids})


@api.post("/auctions")
async def create_auction(body: AuctionInput, user=Depends(get_current_user)):
    if user["role"] not in ("seller", "admin"):
        raise HTTPException(status_code=403, detail="Only sellers can create auctions")
    start = body.start_time if body.start_time.tzinfo else body.start_time.replace(tzinfo=timezone.utc)
    end = body.end_time if body.end_time.tzinfo else body.end_time.replace(tzinfo=timezone.utc)
    if end <= start:
        raise HTTPException(status_code=400, detail="End time must be after start time")
    if end <= now_utc():
        raise HTTPException(status_code=400, detail="End time must be in the future")
    doc = {
        "title": body.title,
        "description": body.description,
        "category": body.category,
        "images": body.images,
        "starting_price": body.starting_price,
        "current_bid": body.starting_price,
        "min_increment": body.min_increment,
        "start_time": start.isoformat(),
        "end_time": end.isoformat(),
        "seller_id": user["id"],
        "seller_name": user["name"],
        "condition": body.condition,
        "bid_count": 0,
        "highest_bidder_id": None,
        "highest_bidder_name": None,
        "status": "upcoming" if start > now_utc() else "live",
        "created_at": now_utc().isoformat(),
    }
    res = await db.auctions.insert_one(doc)
    doc["_id"] = res.inserted_id
    return serialize_auction(doc)


@api.delete("/auctions/{auction_id}")
async def delete_auction(auction_id: str, user=Depends(get_current_user)):
    try:
        oid = ObjectId(auction_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Auction not found")
    a = await db.auctions.find_one({"_id": oid})
    if not a:
        raise HTTPException(status_code=404, detail="Auction not found")
    if a["seller_id"] != user["id"] and user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not your auction")
    if a.get("bid_count", 0) > 0 and user["role"] != "admin":
        raise HTTPException(status_code=400, detail="Cannot delete auction with existing bids")
    await db.auctions.delete_one({"_id": oid})
    await db.bids.delete_many({"auction_id": auction_id})
    return {"success": True}


# ---------------------------------------------------------------------------
# BIDS
# ---------------------------------------------------------------------------
_bid_lock = asyncio.Lock()

# Soft-close: any bid landing within this window extends end_time by the same
# window. Prevents "sniping" the last second and keeps auctions fair.
SOFT_CLOSE_WINDOW_SECONDS = 60


@api.post("/auctions/{auction_id}/bids")
async def place_bid(auction_id: str, body: BidInput, user=Depends(get_current_user)):
    if user["role"] == "admin":
        raise HTTPException(status_code=403, detail="Admin cannot place bids")
    try:
        oid = ObjectId(auction_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Auction not found")

    async with _bid_lock:
        a = await db.auctions.find_one({"_id": oid})
        if not a:
            raise HTTPException(status_code=404, detail="Auction not found")
        current_status = compute_status(a)
        if current_status != "live":
            raise HTTPException(status_code=400, detail=f"Auction is {current_status}, cannot bid")
        if a["seller_id"] == user["id"]:
            raise HTTPException(status_code=400, detail="Sellers cannot bid on their own auctions")
        current = float(a.get("current_bid", a["starting_price"]))
        min_next = current + float(a.get("min_increment", 1)) if a.get("bid_count", 0) > 0 else current
        if body.amount < min_next:
            raise HTTPException(status_code=400, detail=f"Bid must be at least ${min_next:.2f}")

        previous_bidder = a.get("highest_bidder_id")

        # Soft-close extension logic ------------------------------------------------
        end_dt = parse_dt(a["end_time"])
        seconds_remaining = (end_dt - now_utc()).total_seconds()
        extended = False
        new_end_iso = a["end_time"]
        if 0 < seconds_remaining <= SOFT_CLOSE_WINDOW_SECONDS:
            new_end_dt = now_utc() + timedelta(seconds=SOFT_CLOSE_WINDOW_SECONDS)
            # Only push out (never pull in) — extension always moves forward
            if new_end_dt > end_dt:
                new_end_iso = new_end_dt.isoformat()
                extended = True

        bid_doc = {
            "auction_id": auction_id,
            "user_id": user["id"],
            "user_name": user["name"],
            "amount": body.amount,
            "created_at": now_utc().isoformat(),
        }
        res = await db.bids.insert_one(bid_doc)
        update_set: dict = {
            "current_bid": body.amount,
            "highest_bidder_id": user["id"],
            "highest_bidder_name": user["name"],
            "status": "live",
        }
        if extended:
            update_set["end_time"] = new_end_iso
        await db.auctions.update_one(
            {"_id": oid},
            {"$set": update_set, "$inc": {"bid_count": 1}},
        )

    bid_payload = {
        "id": str(res.inserted_id),
        "auction_id": auction_id,
        "user_id": user["id"],
        "user_name": user["name"],
        "amount": body.amount,
        "created_at": bid_doc["created_at"],
        "current_bid": body.amount,
        "bid_count": a.get("bid_count", 0) + 1,
        "end_time": iso(parse_dt(new_end_iso)),
        "extended": extended,
        "extension_seconds": SOFT_CLOSE_WINDOW_SECONDS if extended else 0,
    }
    # Broadcast bid update to everyone in the auction room
    await sio.emit("new_bid", bid_payload, room=f"auction:{auction_id}")

    # Notify previous highest bidder
    if previous_bidder and previous_bidder != user["id"]:
        outbid_msg = f"Your bid on '{a['title']}' was outbid. New high bid: ${body.amount:.2f}."
        if extended:
            outbid_msg += f" Auction extended by {SOFT_CLOSE_WINDOW_SECONDS}s — you still have time to bid back."
        await create_notification(
            previous_bidder,
            "outbid",
            "You've been outbid!",
            outbid_msg,
            auction_id=auction_id,
        )
    # Notify seller
    if a["seller_id"] != user["id"]:
        seller_msg = f"{user['name']} bid ${body.amount:.2f} on '{a['title']}'."
        if extended:
            seller_msg += f" Auction extended by {SOFT_CLOSE_WINDOW_SECONDS}s (soft-close)."
        await create_notification(
            a["seller_id"],
            "new_bid",
            "New bid on your auction",
            seller_msg,
            auction_id=auction_id,
        )
    return bid_payload


@api.get("/auctions/{auction_id}/bids")
async def list_bids(auction_id: str, limit: int = Query(50, le=200)):
    cursor = db.bids.find({"auction_id": auction_id}).sort("created_at", -1).limit(limit)
    return [{
        "id": str(b["_id"]),
        "user_id": b["user_id"],
        "user_name": b.get("user_name", "Bidder"),
        "amount": b["amount"],
        "created_at": iso(parse_dt(b["created_at"])),
    } for b in await cursor.to_list(limit)]


@api.get("/my/bids")
async def my_bids(user=Depends(get_current_user)):
    # aggregate: user's max bid per auction
    pipeline = [
        {"$match": {"user_id": user["id"]}},
        {"$sort": {"created_at": -1}},
        {"$group": {"_id": "$auction_id", "amount": {"$max": "$amount"}, "created_at": {"$first": "$created_at"}}},
    ]
    grouped = await db.bids.aggregate(pipeline).to_list(200)
    results = []
    for g in grouped:
        try:
            a = await db.auctions.find_one({"_id": ObjectId(g["_id"])})
        except Exception:
            continue
        if not a:
            continue
        item = serialize_auction(a)
        item["my_bid"] = g["amount"]
        item["is_winning"] = a.get("highest_bidder_id") == user["id"]
        results.append(item)
    return results


@api.get("/my/won")
async def my_won(user=Depends(get_current_user)):
    cursor = db.auctions.find({"highest_bidder_id": user["id"], "status": "ended"})
    return [serialize_auction(a) for a in await cursor.to_list(200)]


# ---------------------------------------------------------------------------
# WATCHLIST
# ---------------------------------------------------------------------------
@api.get("/watchlist")
async def get_watchlist(user=Depends(get_current_user)):
    items = await db.watchlist.find({"user_id": user["id"]}).to_list(200)
    results = []
    for it in items:
        try:
            a = await db.auctions.find_one({"_id": ObjectId(it["auction_id"])})
        except Exception:
            continue
        if a:
            results.append(serialize_auction(a))
    return results


@api.post("/watchlist/{auction_id}")
async def add_watchlist(auction_id: str, user=Depends(get_current_user)):
    try:
        oid = ObjectId(auction_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Auction not found")
    if not await db.auctions.find_one({"_id": oid}):
        raise HTTPException(status_code=404, detail="Auction not found")
    try:
        await db.watchlist.insert_one({
            "user_id": user["id"],
            "auction_id": auction_id,
            "created_at": now_utc().isoformat(),
        })
    except Exception:
        pass  # already exists
    return {"success": True}


@api.delete("/watchlist/{auction_id}")
async def remove_watchlist(auction_id: str, user=Depends(get_current_user)):
    await db.watchlist.delete_one({"user_id": user["id"], "auction_id": auction_id})
    return {"success": True}


# ---------------------------------------------------------------------------
# NOTIFICATIONS
# ---------------------------------------------------------------------------
@api.get("/notifications")
async def list_notifications(user=Depends(get_current_user)):
    cursor = db.notifications.find({"user_id": user["id"]}).sort("created_at", -1).limit(50)
    docs = await cursor.to_list(50)
    return [{
        "id": str(n["_id"]),
        "kind": n["kind"],
        "title": n["title"],
        "message": n["message"],
        "auction_id": n.get("auction_id"),
        "read": n.get("read", False),
        "created_at": iso(parse_dt(n["created_at"])),
    } for n in docs]


@api.post("/notifications/{notif_id}/read")
async def mark_read(notif_id: str, user=Depends(get_current_user)):
    try:
        oid = ObjectId(notif_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Not found")
    await db.notifications.update_one(
        {"_id": oid, "user_id": user["id"]},
        {"$set": {"read": True}},
    )
    return {"success": True}


@api.post("/notifications/read-all")
async def read_all(user=Depends(get_current_user)):
    await db.notifications.update_many({"user_id": user["id"]}, {"$set": {"read": True}})
    return {"success": True}


# ---------------------------------------------------------------------------
# FEEDBACK
# ---------------------------------------------------------------------------
@api.post("/feedback")
async def create_feedback(body: FeedbackInput, user=Depends(get_current_user)):
    doc = {
        "auction_id": body.auction_id,
        "from_user_id": user["id"],
        "from_user_name": user["name"],
        "to_user_id": body.to_user_id,
        "rating": body.rating,
        "comment": body.comment,
        "created_at": now_utc().isoformat(),
    }
    res = await db.feedback.insert_one(doc)
    return {"id": str(res.inserted_id), **{k: v for k, v in doc.items() if k != "_id"}}


@api.get("/feedback/user/{user_id}")
async def user_feedback(user_id: str):
    cursor = db.feedback.find({"to_user_id": user_id}).sort("created_at", -1).limit(50)
    docs = await cursor.to_list(50)
    return [{
        "id": str(f["_id"]),
        "from_user_id": f["from_user_id"],
        "from_user_name": f.get("from_user_name", ""),
        "rating": f["rating"],
        "comment": f.get("comment", ""),
        "created_at": iso(parse_dt(f["created_at"])),
    } for f in docs]


# ---------------------------------------------------------------------------
# ADMIN
# ---------------------------------------------------------------------------
@api.get("/admin/stats")
async def admin_stats(admin=Depends(get_current_admin)):
    return {
        "users": await db.users.count_documents({}),
        "auctions": await db.auctions.count_documents({}),
        "live_auctions": await db.auctions.count_documents({"status": "live"}),
        "bids": await db.bids.count_documents({}),
        "notifications": await db.notifications.count_documents({}),
    }


@api.get("/admin/users")
async def admin_users(admin=Depends(get_current_admin)):
    users = await db.users.find({}).sort("created_at", -1).to_list(500)
    return [serialize_user(u) for u in users]


@api.delete("/admin/users/{user_id}")
async def admin_delete_user(user_id: str, admin=Depends(get_current_admin)):
    if user_id == admin["id"]:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    await db.users.delete_one({"_id": ObjectId(user_id)})
    return {"success": True}


@api.get("/admin/auctions")
async def admin_auctions(admin=Depends(get_current_admin)):
    cursor = db.auctions.find({}).sort("created_at", -1)
    return [serialize_auction(a) for a in await cursor.to_list(500)]


# ---------------------------------------------------------------------------
# Socket.IO events
# ---------------------------------------------------------------------------
@sio.event
async def connect(sid, environ, auth):
    """Client can pass auth={'token': access_token} to authenticate the socket."""
    user_id = None
    try:
        token = None
        if auth and isinstance(auth, dict):
            token = auth.get("token")
        # fallback: read cookie
        if not token:
            cookie_header = environ.get("HTTP_COOKIE", "")
            for c in cookie_header.split(";"):
                c = c.strip()
                if c.startswith("access_token="):
                    token = c.split("=", 1)[1]
                    break
        if token:
            payload = decode_token(token)
            if payload.get("type") == "access":
                user_id = payload.get("sub")
    except Exception:
        pass
    if user_id:
        await sio.save_session(sid, {"user_id": user_id})
        await sio.enter_room(sid, f"user:{user_id}")
        log.info("socket %s authenticated as user %s", sid, user_id)
    else:
        log.info("socket %s connected anonymously", sid)


@sio.event
async def disconnect(sid):
    log.info("socket %s disconnected", sid)


@sio.event
async def join_auction(sid, data):
    auction_id = data.get("auction_id") if isinstance(data, dict) else None
    if auction_id:
        await sio.enter_room(sid, f"auction:{auction_id}")


@sio.event
async def leave_auction(sid, data):
    auction_id = data.get("auction_id") if isinstance(data, dict) else None
    if auction_id:
        await sio.leave_room(sid, f"auction:{auction_id}")


# ---------------------------------------------------------------------------
# Wire everything up
# ---------------------------------------------------------------------------
@api.get("/")
async def root():
    return {"service": "bidbridge", "status": "ok"}


fastapi_app.include_router(api)

frontend_origin = os.environ.get("FRONTEND_URL", "http://localhost:3000")
allowed = [frontend_origin, "http://localhost:3000"]
fastapi_app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Combine FastAPI + Socket.IO. Mount socket.io under /api/socket.io so ingress
# forwards it to backend.
app = socketio.ASGIApp(sio, other_asgi_app=fastapi_app, socketio_path="/api/socket.io")
