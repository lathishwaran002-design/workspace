from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

router = APIRouter()

reviews_db = []

class ReviewCreate(BaseModel):
    restaurant_id: str
    order_id: str
    rating: int # 1 to 5
    comment: str

@router.post("/add")
async def add_review(review: ReviewCreate):
    reviews_db.append(review.dict())
    return {"message": "Review submitted successfully"}

@router.get("/{restaurant_id}")
async def get_reviews(restaurant_id: str):
    rest_reviews = [r for r in reviews_db if r["restaurant_id"] == restaurant_id]
    return {"reviews": rest_reviews}
