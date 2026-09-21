from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
import time
import random

router = APIRouter()

# Mock Global State for Priority Queue
order_queue = []

class OrderItem(BaseModel):
    recipe_name: str
    quantity: int
    price: float = 10.0

class CreateOrderRequest(BaseModel):
    restaurant_id: str
    user_lat: float
    user_lng: float
    items: List[OrderItem]
    payment_method_id: str = "mock_pm_123" # Mock Stripe PM

class StatusUpdateRequest(BaseModel):
    order_id: str
    status: str

# 1. Mock ML - Prep Time Prediction
def predict_prep_time(items: List[OrderItem]) -> int:
    base_time = sum(item.quantity * 5 for item in items)
    kitchen_load_factor = random.uniform(1.0, 1.3) # Simulated load
    return max(5, int(base_time * kitchen_load_factor))

# 2. Mock Google Maps Distance Matrix API & Traffic ML
def calculate_eta(user_lat: float, user_lng: float, rest_lat: float, rest_lng: float) -> int:
    base_eta = random.randint(12, 25)
    traffic_delay = random.randint(1, 8) # Time-Series Deep Learning mock
    return base_eta + traffic_delay

# 3. Mock Stripe Payment
def process_payment(amount: float, pm_id: str) -> bool:
    return True

@router.post("/create")
async def create_order(order: CreateOrderRequest):
    mock_rest_lat = order.user_lat + 0.015
    mock_rest_lng = order.user_lng + 0.015
    
    eta_mins = calculate_eta(order.user_lat, order.user_lng, mock_rest_lat, mock_rest_lng)
    prep_time_mins = predict_prep_time(order.items)
    
    total_amount = sum(item.quantity * item.price for item in order.items)
    if not process_payment(total_amount, order.payment_method_id):
        raise HTTPException(status_code=400, detail="Payment failed")
    
    current_time = int(time.time())
    target_start_time = current_time + ((eta_mins - prep_time_mins) * 60)
    
    new_order = {
        "order_id": f"ORD-{random.randint(1000, 9999)}",
        "restaurant_id": order.restaurant_id,
        "items": [i.dict() for i in order.items],
        "total_amount": round(total_amount, 2),
        "eta_mins": eta_mins,
        "prep_time_mins": prep_time_mins,
        "target_start_time": target_start_time,
        "created_at": current_time,
        "status": "queued" if target_start_time > current_time else "preparing"
    }
    
    order_queue.append(new_order)
    order_queue.sort(key=lambda x: x["target_start_time"])
    
    return {
        "message": "Order placed successfully",
        "order": new_order,
        "queue_position": order_queue.index(new_order) + 1
    }

@router.get("/queue")
async def get_queue():
    return {"queue": order_queue}

@router.get("/status/{order_id}")
async def get_order_status(order_id: str):
    for order in order_queue:
        if order["order_id"] == order_id:
            return {"order": order}
    raise HTTPException(status_code=404, detail="Order not found")

@router.post("/update-status")
async def update_order_status(req: StatusUpdateRequest):
    for order in order_queue:
        if order["order_id"] == req.order_id:
            order["status"] = req.status
            return {"message": f"Order {req.order_id} updated to {req.status}", "order": order}
    raise HTTPException(status_code=404, detail="Order not found")
