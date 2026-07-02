"""Pydantic request/response models for BidBridge API."""
from datetime import datetime
from typing import List, Literal, Optional

from pydantic import BaseModel, EmailStr, Field


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
    images: List[str] = Field(default_factory=list, min_length=1)
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


class ContactInput(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: EmailStr
    subject: str = Field(min_length=3, max_length=140)
    message: str = Field(min_length=10, max_length=2000)
