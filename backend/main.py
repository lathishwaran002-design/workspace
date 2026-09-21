from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import auth
import restaurants
import orders
import reviews

app = FastAPI(title="Predictive Food Ordering API")

# Setup CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For dev only, should be specific in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(restaurants.router, prefix="/api/restaurants", tags=["Restaurants"])
app.include_router(orders.router, prefix="/api/orders", tags=["Orders"])
app.include_router(reviews.router, prefix="/api/reviews", tags=["Reviews"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the Predictive Food Ordering API"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
