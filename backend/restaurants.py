from fastapi import APIRouter
from pydantic import BaseModel
import math

router = APIRouter()

def generate_mock_restaurants(lat: float, lng: float):
    return [
        {
            "id": "1",
            "name": "Spicy Kitchen",
            "cuisine": "Indian",
            "rating": 4.8,
            "lat": lat + 0.015,
            "lng": lng + 0.015,
            "prep_time_mins": 15,
            "recipes": ["Butter Chicken", "Garlic Naan", "Chicken Biryani", "Mango Lassi"],
            "menu": [
                {"id": "m1", "name": "Butter Chicken", "price": 14.99, "prep_mins": 15, "description": "Tender chicken cooked in rich tomato and butter sauce"},
                {"id": "m2", "name": "Garlic Naan", "price": 3.99, "prep_mins": 5, "description": "Freshly baked oven flatbread brushed with garlic butter"},
                {"id": "m3", "name": "Chicken Biryani", "price": 16.50, "prep_mins": 18, "description": "Fragrant basmati rice infused with aromatic spices"},
                {"id": "m4", "name": "Mango Lassi", "price": 4.50, "prep_mins": 3, "description": "Traditional sweet mango yogurt smoothie"}
            ]
        },
        {
            "id": "2",
            "name": "Sushi Zen",
            "cuisine": "Japanese",
            "rating": 4.9,
            "lat": lat - 0.020,
            "lng": lng - 0.010,
            "prep_time_mins": 10,
            "recipes": ["Spicy Tuna Roll", "Miso Soup", "Salmon Sashimi", "Edamame"],
            "menu": [
                {"id": "m5", "name": "Spicy Tuna Roll", "price": 12.99, "prep_mins": 10, "description": "Fresh tuna, spicy mayo, cucumber, sesame seeds"},
                {"id": "m6", "name": "Miso Soup", "price": 4.00, "prep_mins": 5, "description": "Traditional dashi broth with tofu, seaweed, and scallions"},
                {"id": "m7", "name": "Salmon Sashimi", "price": 15.50, "prep_mins": 8, "description": "6 pieces of sliced fresh Norwegian salmon"},
                {"id": "m8", "name": "Edamame", "price": 5.00, "prep_mins": 4, "description": "Steamed soybean pods sprinkled with sea salt"}
            ]
        },
        {
            "id": "3",
            "name": "Burger Joint",
            "cuisine": "American",
            "rating": 4.7,
            "lat": lat + 0.005,
            "lng": lng - 0.025,
            "prep_time_mins": 8,
            "recipes": ["Smash Cheeseburger", "Truffle Fries", "Chocolate Milkshake"],
            "menu": [
                {"id": "m9", "name": "Smash Cheeseburger", "price": 11.50, "prep_mins": 8, "description": "Double beef patty, melted cheddar, pickles, secret sauce"},
                {"id": "m10", "name": "Truffle Fries", "price": 6.50, "prep_mins": 5, "description": "Crispy golden fries tossed with truffle oil and parmesan"},
                {"id": "m11", "name": "Chocolate Milkshake", "price": 5.50, "prep_mins": 4, "description": "Hand-spun rich chocolate ice cream shake"}
            ]
        },
    ]

def haversine(lat1, lon1, lat2, lon2):
    """
    Calculate the great circle distance in kilometers between two points 
    on the earth (specified in decimal degrees)
    """
    # convert decimal degrees to radians 
    lon1, lat1, lon2, lat2 = map(math.radians, [lon1, lat1, lon2, lat2])

    # haversine formula 
    dlon = lon2 - lon1 
    dlat = lat2 - lat1 
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a)) 
    r = 6371 # Radius of earth in kilometers
    return c * r

@router.get("/nearby")
async def get_nearby_restaurants(lat: float, lng: float, radius_km: float = 10.0):
    nearby = []
    # Generate restaurants dynamically around the user's location so they always see them!
    dynamic_restaurants = generate_mock_restaurants(lat, lng)
    
    for restaurant in dynamic_restaurants:
        dist = haversine(lat, lng, restaurant["lat"], restaurant["lng"])
        if dist <= radius_km:
            restaurant_copy = restaurant.copy()
            restaurant_copy["distance_km"] = round(dist, 2)
            nearby.append(restaurant_copy)
    
    # Sort by distance
    nearby.sort(key=lambda x: x["distance_km"])
    return {"restaurants": nearby}
