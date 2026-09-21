import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, MapPin, Navigation, Search, Navigation2, Star, ChefHat, LogOut, ShoppingBag, X, Plus, Minus, Utensils } from 'lucide-react';

const DEFAULT_DEMO_LOCATION = {
  name: "Downtown Demo Hub",
  lat: 37.7749,
  lng: -122.4194
};

const CUISINES = ['All', 'Indian', 'Japanese', 'American'];

export default function Home() {
  const navigate = useNavigate();
  const [location, setLocation] = useState(DEFAULT_DEMO_LOCATION);
  const [error, setError] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('All');
  
  // Selected restaurant for Menu Modal
  const [activeRestaurant, setActiveRestaurant] = useState(null);
  const [cart, setCart] = useState({}); // { itemId: { item, quantity } }
  const [ordering, setOrdering] = useState(false);

  useEffect(() => {
    if (location) {
      setLoading(true);
      fetch(`/api/restaurants/nearby?lat=${location.lat}&lng=${location.lng}&radius_km=10`)
        .then(res => res.json())
        .then(data => {
          setRestaurants(data.restaurants || []);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [location]);

  const requestLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            name: "Current GPS Location",
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setError(null);
        },
        (err) => {
          setError(err.message + ". Using fallback location.");
        }
      );
    } else {
      setError("Geolocation is not supported by your browser");
    }
  };

  const handleOpenMenu = (restaurant) => {
    setActiveRestaurant(restaurant);
    // Initialize cart with first item as quantity 1 default for easy ordering
    if (restaurant.menu && restaurant.menu.length > 0) {
      const firstItem = restaurant.menu[0];
      setCart({
        [firstItem.id]: { item: firstItem, quantity: 1 }
      });
    } else {
      setCart({});
    }
  };

  const updateCartQuantity = (item, delta) => {
    setCart(prev => {
      const currentQty = prev[item.id]?.quantity || 0;
      const newQty = currentQty + delta;
      if (newQty <= 0) {
        const copy = { ...prev };
        delete copy[item.id];
        return copy;
      }
      return {
        ...prev,
        [item.id]: { item, quantity: newQty }
      };
    });
  };

  const cartTotal = Object.values(cart).reduce((sum, entry) => sum + (entry.item.price * entry.quantity), 0);
  const totalItemCount = Object.values(cart).reduce((sum, entry) => sum + entry.quantity, 0);

  const handlePlaceOrder = async () => {
    if (!activeRestaurant || totalItemCount === 0) return;
    setOrdering(true);
    
    const formattedItems = Object.values(cart).map(entry => ({
      recipe_name: entry.item.name,
      quantity: entry.quantity,
      price: entry.item.price
    }));

    try {
      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurant_id: activeRestaurant.id,
          user_lat: location.lat,
          user_lng: location.lng,
          items: formattedItems
        })
      });
      const data = await res.json();
      setOrdering(false);
      setActiveRestaurant(null);
      navigate('/track', { state: { order: data.order } });
    } catch (e) {
      console.error(e);
      setOrdering(false);
      alert("Failed to place order. Ensure backend server is running.");
    }
  };

  // Filtered restaurants
  const filteredRestaurants = restaurants.filter(r => {
    const matchesCuisine = selectedCuisine === 'All' || r.cuisine.toLowerCase() === selectedCuisine.toLowerCase();
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.cuisine.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCuisine && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm p-4 sticky top-0 z-20">
        <div className="flex justify-between items-center max-w-4xl mx-auto">
          <div className="flex items-center space-x-2">
            <div className="bg-orange-500 text-white p-2 rounded-xl">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-orange-500 leading-tight">PredictiveEats</h1>
              <p className="text-[10px] text-gray-400 font-medium">Predictive JIT Food Ordering</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button 
              onClick={() => navigate('/kitchen')}
              className="bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs px-3 py-2 rounded-xl font-bold flex items-center transition-colors shadow-sm"
              title="View Live Kitchen Priority Queue"
            >
              <ChefHat className="w-4 h-4 mr-1.5 text-orange-400" />
              Kitchen Live Queue
            </button>

            <button
              onClick={() => navigate('/login')}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-100 rounded-xl transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 mt-2 space-y-6">
        {/* Location & Search Hero Bar */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border border-orange-100 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-800 flex items-center">
                <MapPin className="w-5 h-5 text-orange-500 mr-2" />
                Delivery Location
              </h2>
              <p className="text-gray-600 text-sm mt-0.5">
                {location.name || "Custom GPS Coordinates"}
              </p>
              <p className="text-gray-400 text-xs font-mono">
                ({location.lat.toFixed(4)}, {location.lng.toFixed(4)})
              </p>
              {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            </div>
            
            <button 
              onClick={requestLocation}
              className="bg-orange-50 text-orange-600 px-3.5 py-2 rounded-xl text-xs font-semibold hover:bg-orange-100 transition-colors flex items-center border border-orange-200"
            >
              <Navigation2 className="w-4 h-4 mr-1.5" />
              Use Current GPS
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-3" />
            <input 
              type="text"
              placeholder="Search restaurants, cuisines, or dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
            />
          </div>

          {/* Cuisine Filters */}
          <div className="flex space-x-2 overflow-x-auto pt-1 pb-1 scrollbar-none">
            {CUISINES.map(c => (
              <button
                key={c}
                onClick={() => setSelectedCuisine(c)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors whitespace-nowrap ${
                  selectedCuisine === c
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </section>

        {/* Nearby Restaurants List */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Nearby Restaurants</h2>
            <span className="text-xs text-gray-400 font-medium">Sorted by distance & prep speed</span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-400 animate-pulse font-medium">
              Calculating nearest restaurants & prep times...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRestaurants.map((rest) => (
                <div 
                  key={rest.id} 
                  onClick={() => handleOpenMenu(rest)}
                  className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 hover:shadow-lg hover:border-orange-200 transition-all cursor-pointer group relative overflow-hidden"
                >
                  <div className="h-40 bg-gradient-to-tr from-orange-400 to-amber-300 rounded-2xl mb-4 overflow-hidden relative p-4 flex flex-col justify-between text-white">
                    <div className="flex justify-between items-center">
                      <span className="bg-black/30 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-bold flex items-center">
                        <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300 mr-1" />
                        {rest.rating || 4.8}
                      </span>
                      
                      <div className="bg-white/90 text-gray-800 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-bold flex items-center shadow-sm">
                        <Clock className="w-3.5 h-3.5 mr-1 text-orange-500" />
                        ~{rest.prep_time_mins} min prep
                      </div>
                    </div>

                    <div>
                      <span className="bg-orange-950/40 backdrop-blur-sm px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider">
                        {rest.cuisine}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-bold text-lg text-gray-800 group-hover:text-orange-500 transition-colors">
                    {rest.name}
                  </h3>
                  <p className="text-gray-500 text-sm mb-3">
                    {rest.menu?.length || 3} signature dishes available
                  </p>

                  <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                    <span className="text-gray-500 font-medium text-xs flex items-center">
                      <Navigation className="w-3.5 h-3.5 mr-1 text-orange-500" /> 
                      {rest.distance_km} km away
                    </span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenMenu(rest);
                      }}
                      className="bg-orange-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-orange-500/20 hover:bg-orange-600 transition-colors flex items-center"
                    >
                      View Menu & Order
                    </button>
                  </div>
                </div>
              ))}

              {filteredRestaurants.length === 0 && !loading && (
                <div className="col-span-2 p-8 text-center bg-white rounded-3xl border border-gray-100 text-gray-400">
                  No matching restaurants found. Try adjusting your search query or cuisine filter.
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      {/* Menu & Checkout Modal */}
      {activeRestaurant && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-orange-500 p-5 text-white flex justify-between items-start">
              <div>
                <span className="text-xs uppercase font-bold tracking-wider bg-orange-600 px-2 py-0.5 rounded text-orange-100">
                  {activeRestaurant.cuisine}
                </span>
                <h2 className="text-2xl font-bold mt-1">{activeRestaurant.name}</h2>
                <p className="text-xs text-orange-100 flex items-center mt-1">
                  <Clock className="w-3.5 h-3.5 mr-1" /> Estimated Kitchen Prep: {activeRestaurant.prep_time_mins} mins
                </p>
              </div>
              <button 
                onClick={() => setActiveRestaurant(null)}
                className="p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Menu Items List */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">Select Dishes</h3>
              
              {(activeRestaurant.menu || []).map((menuItem) => {
                const qty = cart[menuItem.id]?.quantity || 0;
                return (
                  <div key={menuItem.id} className="flex justify-between items-center p-3 rounded-2xl bg-gray-50 border border-gray-100 hover:border-gray-200 transition-colors">
                    <div className="flex-1 pr-3">
                      <h4 className="font-bold text-gray-800 text-sm">{menuItem.name}</h4>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{menuItem.description}</p>
                      <span className="text-xs font-bold text-orange-600 font-mono mt-1 block">
                        ${menuItem.price.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 bg-white px-2 py-1 rounded-xl border border-gray-200 shadow-sm">
                      <button 
                        onClick={() => updateCartQuantity(menuItem, -1)}
                        className="p-1 text-gray-500 hover:text-orange-500 disabled:opacity-30"
                        disabled={qty === 0}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-sm font-bold text-gray-800 w-4 text-center font-mono">
                        {qty}
                      </span>
                      <button 
                        onClick={() => updateCartQuantity(menuItem, 1)}
                        className="p-1 text-gray-500 hover:text-orange-500"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer / Checkout */}
            <div className="p-5 bg-gray-50 border-t border-gray-100 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">Subtotal ({totalItemCount} items)</span>
                <span className="font-bold font-mono text-gray-800 text-base">${cartTotal.toFixed(2)}</span>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={totalItemCount === 0 || ordering}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white py-3.5 rounded-2xl font-bold shadow-lg shadow-orange-500/20 flex justify-center items-center transition-all"
              >
                {ordering ? (
                  <span className="flex items-center text-sm">
                    Processing Predictive Priority...
                  </span>
                ) : (
                  <span className="flex items-center text-sm">
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Place Order (${cartTotal.toFixed(2)})
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
