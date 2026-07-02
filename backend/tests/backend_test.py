"""BidBridge backend integration tests.

Tests cover: health, auth (register/login/me/logout/brute-force lockout),
auctions list & filters, auction detail, create auction, bidding rules,
watchlist, notifications, feedback, my/bids my/won and admin routes.
"""
import os
import time
import uuid

import pytest
import requests

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/") if os.environ.get("REACT_APP_BACKEND_URL") else None
if not BASE_URL:
    # fall back to reading frontend .env
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
                break

API = f"{BASE_URL}/api"

ADMIN = {"email": "admin@bidbridge.com", "password": "Admin@12345"}
SELLER = {"email": "seller@bidbridge.com", "password": "Seller@12345"}
BIDDER = {"email": "bidder@bidbridge.com", "password": "Bidder@12345"}


def make_session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


def login_session(creds):
    s = make_session()
    r = s.post(f"{API}/auth/login", json=creds, timeout=15)
    assert r.status_code == 200, f"Login failed: {r.status_code} {r.text}"
    token = r.json().get("access_token")
    if token:
        s.headers["Authorization"] = f"Bearer {token}"
    return s


# ---------------- Health ----------------
def test_root():
    r = requests.get(f"{API}/", timeout=10)
    assert r.status_code == 200
    assert r.json().get("status") == "ok"


def test_list_auctions_seeded():
    r = requests.get(f"{API}/auctions", timeout=10)
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) >= 1, "Seeded demo auctions should exist"
    a = data[0]
    for k in ["id", "title", "current_bid", "status", "start_time", "end_time"]:
        assert k in a


# ---------------- Auth ----------------
def test_login_admin_seller_bidder():
    for creds in [ADMIN, SELLER, BIDDER]:
        s = make_session()
        r = s.post(f"{API}/auth/login", json=creds, timeout=15)
        assert r.status_code == 200, f"{creds['email']} login failed: {r.text}"
        me = s.get(f"{API}/auth/me", timeout=10)
        assert me.status_code == 200
        assert me.json()["email"] == creds["email"]


def test_login_wrong_password():
    r = requests.post(f"{API}/auth/login", json={"email": ADMIN["email"], "password": "wrong"}, timeout=10)
    assert r.status_code == 401


def test_register_and_me():
    email = f"test_{uuid.uuid4().hex[:10]}@example.com"
    s = make_session()
    r = s.post(f"{API}/auth/register", json={
        "email": email, "password": "Passw0rd!", "name": "Test Bidder", "role": "bidder"
    }, timeout=15)
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["user"]["email"] == email
    # session cookie persists
    me = s.get(f"{API}/auth/me", timeout=10)
    assert me.status_code == 200
    assert me.json()["email"] == email


def test_brute_force_lockout():
    # unique email that shouldn't exist to avoid affecting real accounts
    fake = f"bruteforce_{uuid.uuid4().hex[:6]}@example.com"
    last_status = None
    for _ in range(6):
        r = requests.post(f"{API}/auth/login", json={"email": fake, "password": "x"}, timeout=10)
        last_status = r.status_code
    # After 5 attempts should be locked (429)
    assert last_status == 429, f"Expected 429 lockout, got {last_status}"


# ---------------- Auction filters ----------------
def test_auction_filter_status_live():
    r = requests.get(f"{API}/auctions", params={"status": "live"}, timeout=10)
    assert r.status_code == 200
    for a in r.json():
        assert a["status"] == "live"


def test_auction_filter_sort_price_asc():
    r = requests.get(f"{API}/auctions", params={"sort": "price_asc"}, timeout=10)
    assert r.status_code == 200
    prices = [a["current_bid"] for a in r.json()]
    assert prices == sorted(prices)


def test_auction_detail():
    lst = requests.get(f"{API}/auctions", timeout=10).json()
    assert lst
    aid = lst[0]["id"]
    r = requests.get(f"{API}/auctions/{aid}", timeout=10)
    assert r.status_code == 200
    body = r.json()
    assert "recent_bids" in body and isinstance(body["recent_bids"], list)


# ---------------- Create auction ----------------
def test_create_auction_as_seller_and_end_before_start():
    s = login_session(SELLER)
    from datetime import datetime, timezone, timedelta
    now = datetime.now(timezone.utc)
    valid = {
        "title": f"TEST Auction {uuid.uuid4().hex[:6]}",
        "description": "A test auction created by backend_test.py",
        "category": "Electronics",
        "images": [],
        "starting_price": 100.0,
        "min_increment": 5.0,
        "start_time": (now - timedelta(minutes=1)).isoformat(),
        "end_time": (now + timedelta(hours=2)).isoformat(),
        "condition": "New",
    }
    r = s.post(f"{API}/auctions", json=valid, timeout=15)
    assert r.status_code == 200, r.text
    created = r.json()
    assert created["title"] == valid["title"]

    # verify appears in listing
    lst = requests.get(f"{API}/auctions", timeout=10).json()
    assert any(a["id"] == created["id"] for a in lst)

    # invalid: end before start
    bad = dict(valid)
    bad["end_time"] = (now - timedelta(hours=1)).isoformat()
    bad["start_time"] = now.isoformat()
    r2 = s.post(f"{API}/auctions", json=bad, timeout=10)
    assert r2.status_code == 400


# ---------------- Bidding ----------------
def _get_live_auction_not_by(seller_id=None):
    lst = requests.get(f"{API}/auctions", params={"status": "live"}, timeout=10).json()
    for a in lst:
        if seller_id is None or a["seller_id"] != seller_id:
            return a
    return None


def test_bid_flow():
    # Login bidder
    b_sess = login_session(BIDDER)
    me = b_sess.get(f"{API}/auth/me", timeout=10).json()
    bidder_id = me["id"]

    seller_sess = login_session(SELLER)
    seller_id = seller_sess.get(f"{API}/auth/me", timeout=10).json()["id"]

    a = _get_live_auction_not_by(seller_id=None)
    assert a, "Need a live auction to bid on"
    aid = a["id"]

    # (a) below-min bid rejected
    low_amount = float(a["current_bid"]) - 1
    if low_amount < 1:
        low_amount = 0.5
    r_low = b_sess.post(f"{API}/auctions/{aid}/bids", json={"amount": low_amount}, timeout=10)
    assert r_low.status_code == 400

    # (b) seller can't bid on own auction (only if this auction is owned by demo seller)
    if a["seller_id"] == seller_id:
        r_own = seller_sess.post(f"{API}/auctions/{aid}/bids", json={"amount": a["current_bid"] + a.get("min_increment", 1)}, timeout=10)
        assert r_own.status_code == 400

    # (c) valid bid
    cur = float(a["current_bid"])
    inc = float(a.get("min_increment", 1))
    valid_amt = cur + inc if a.get("bid_count", 0) > 0 else cur
    if a.get("bid_count", 0) == 0:
        valid_amt = cur  # first bid can match starting price
    r_ok = b_sess.post(f"{API}/auctions/{aid}/bids", json={"amount": valid_amt}, timeout=15)
    assert r_ok.status_code == 200, r_ok.text
    payload = r_ok.json()
    assert payload["amount"] == valid_amt

    # fetch detail — current_bid updated
    detail = requests.get(f"{API}/auctions/{aid}", timeout=10).json()
    assert detail["current_bid"] == valid_amt
    assert detail["highest_bidder_id"] == bidder_id

    # (e) seller should have a new_bid notification
    time.sleep(0.5)
    notifs = seller_sess.get(f"{API}/notifications", timeout=10).json()
    assert any(n["kind"] == "new_bid" and n["auction_id"] == aid for n in notifs)


def test_my_bids_and_won():
    b_sess = login_session(BIDDER)
    r = b_sess.get(f"{API}/my/bids", timeout=10)
    assert r.status_code == 200
    assert isinstance(r.json(), list)

    r2 = b_sess.get(f"{API}/my/won", timeout=10)
    assert r2.status_code == 200
    assert isinstance(r2.json(), list)


# ---------------- Watchlist ----------------
def test_watchlist_flow():
    b_sess = login_session(BIDDER)
    auctions = requests.get(f"{API}/auctions", timeout=10).json()
    assert auctions
    aid = auctions[0]["id"]

    r_add = b_sess.post(f"{API}/watchlist/{aid}", timeout=10)
    assert r_add.status_code == 200

    r_get = b_sess.get(f"{API}/watchlist", timeout=10)
    assert r_get.status_code == 200
    assert any(a["id"] == aid for a in r_get.json())

    r_del = b_sess.delete(f"{API}/watchlist/{aid}", timeout=10)
    assert r_del.status_code == 200


# ---------------- Notifications ----------------
def test_notifications_mark_read():
    b_sess = login_session(BIDDER)
    r = b_sess.get(f"{API}/notifications", timeout=10)
    assert r.status_code == 200
    notifs = r.json()
    if notifs:
        nid = notifs[0]["id"]
        r2 = b_sess.post(f"{API}/notifications/{nid}/read", timeout=10)
        assert r2.status_code == 200
    r3 = b_sess.post(f"{API}/notifications/read-all", timeout=10)
    assert r3.status_code == 200


# ---------------- Feedback ----------------
def test_feedback_create_and_list():
    b_sess = login_session(BIDDER)
    seller_sess = login_session(SELLER)
    seller_id = seller_sess.get(f"{API}/auth/me", timeout=10).json()["id"]
    auctions = requests.get(f"{API}/auctions", timeout=10).json()
    aid = auctions[0]["id"]
    r = b_sess.post(f"{API}/feedback", json={
        "auction_id": aid,
        "to_user_id": seller_id,
        "rating": 5,
        "comment": "TEST feedback"
    }, timeout=10)
    assert r.status_code == 200
    r2 = requests.get(f"{API}/feedback/user/{seller_id}", timeout=10)
    assert r2.status_code == 200
    assert any(f["comment"] == "TEST feedback" for f in r2.json())


# ---------------- Admin ----------------
def test_admin_endpoints():
    a_sess = login_session(ADMIN)
    r = a_sess.get(f"{API}/admin/stats", timeout=10)
    assert r.status_code == 200
    for k in ["users", "auctions", "live_auctions", "bids"]:
        assert k in r.json()
    r2 = a_sess.get(f"{API}/admin/users", timeout=10)
    assert r2.status_code == 200 and isinstance(r2.json(), list)
    r3 = a_sess.get(f"{API}/admin/auctions", timeout=10)
    assert r3.status_code == 200 and isinstance(r3.json(), list)

    # self-delete rejected
    admin_id = a_sess.get(f"{API}/auth/me", timeout=10).json()["id"]
    r4 = a_sess.delete(f"{API}/admin/users/{admin_id}", timeout=10)
    assert r4.status_code == 400


def test_admin_forbidden_for_bidder():
    b_sess = login_session(BIDDER)
    r = b_sess.get(f"{API}/admin/stats", timeout=10)
    assert r.status_code == 403
