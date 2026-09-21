import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Clock, Star, MapPin, CheckCircle, Utensils, ChefHat, ArrowLeft, ExternalLink } from 'lucide-react';

export default function OrderTracking() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const order = state?.order;
  
  const [eta, setEta] = useState(order?.eta_mins || 25);
  const [prepStatus, setPrepStatus] = useState(order?.status || 'queued');
  const [showReview, setShowReview] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('Great food, arrived perfectly hot!');

  // Live polling status from backend
  useEffect(() => {
    if (!order?.order_id) return;

    const pollStatus = async () => {
      try {
        const res = await fetch(`/api/orders/status/${order.order_id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.order?.status) {
            setPrepStatus(data.order.status);
            if (data.order.status === 'ready' && eta > 5) {
              setEta(0); // If marked ready manually from kitchen, drop ETA
              setShowReview(true);
            }
          }
        }
      } catch (err) {
        console.error("Status sync error:", err);
      }
    };

    pollStatus();
    const statusInterval = setInterval(pollStatus, 3000);
    return () => clearInterval(statusInterval);
  }, [order, eta]);

  // Simulate countdown
  useEffect(() => {
    if (!order) return;
    
    const interval = setInterval(() => {
      setEta((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          setPrepStatus('ready');
          setTimeout(() => setShowReview(true), 1500);
          return 0;
        }
        
        if (prev <= 5 && prepStatus !== 'ready') {
          setPrepStatus('ready');
        } else if (prev <= order.prep_time_mins + 5 && prepStatus === 'queued') {
          setPrepStatus('preparing');
        }
        
        return prev - 1;
      });
    }, 1000); // 1 sec = 1 min demo speed
    
    return () => clearInterval(interval);
  }, [order, prepStatus]);

  const submitReview = async () => {
    try {
      await fetch('/api/reviews/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurant_id: order.restaurant_id,
          order_id: order.order_id,
          rating,
          comment
        })
      });
      alert('Thank you for rating PredictiveEats!');
      navigate('/home');
    } catch (err) {
      console.error(err);
      alert('Could not submit review');
    }
  };

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 shadow-xl text-center max-w-sm">
          <Utensils className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-gray-800">No Active Order Found</h2>
          <p className="text-sm text-gray-500 mt-1 mb-6">Select a restaurant and place an order to track arrival timing.</p>
          <button 
            onClick={() => navigate('/home')}
            className="bg-orange-500 text-white px-6 py-2.5 rounded-xl font-bold shadow-md hover:bg-orange-600 transition-colors text-sm"
          >
            Go to Restaurants
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 py-8">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100">
        
        {/* Navigation Bar */}
        <div className="p-4 bg-gray-900 text-white flex justify-between items-center text-xs">
          <button 
            onClick={() => navigate('/home')}
            className="flex items-center text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Home
          </button>

          <button 
            onClick={() => navigate('/kitchen')}
            className="bg-slate-800 hover:bg-slate-700 text-orange-400 px-2.5 py-1 rounded-lg font-bold flex items-center transition-colors border border-slate-700"
          >
            <ChefHat className="w-3.5 h-3.5 mr-1" /> Kitchen Queue <ExternalLink className="w-3 h-3 ml-1" />
          </button>
        </div>

        {/* Dynamic Timer Banner */}
        <div className={`p-8 text-white text-center transition-colors duration-500 ${prepStatus === 'ready' ? 'bg-emerald-500' : 'bg-orange-500'}`}>
          <Clock className="w-16 h-16 mx-auto mb-4 animate-pulse" />
          <h1 className="text-4xl font-extrabold font-mono tracking-tight">{eta} MIN</h1>
          <p className="mt-1 text-sm opacity-90 font-medium">Estimated Arrival & Ready Time</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Order Summary Header */}
          <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100 text-sm">
            <div>
              <p className="text-xs text-gray-400 font-medium">Order ID</p>
              <p className="font-bold font-mono text-gray-800">{order.order_id}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 font-medium">Kitchen Status</p>
              <p className={`font-bold capitalize ${prepStatus === 'ready' ? 'text-emerald-500' : 'text-orange-500'}`}>
                {prepStatus}
              </p>
            </div>
          </div>

          {/* Item Breakdown List */}
          <div className="bg-orange-50/60 rounded-2xl p-4 border border-orange-100 text-xs space-y-2">
            <p className="font-bold text-gray-700 uppercase tracking-wider">Ordered Items</p>
            {order.items?.map((item, idx) => (
              <div key={idx} className="flex justify-between text-gray-600">
                <span><strong className="text-orange-600">{item.quantity}x</strong> {item.recipe_name}</span>
                <span className="font-mono text-gray-500">${((item.price || 10) * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            {order.total_amount && (
              <div className="pt-2 border-t border-orange-200/60 flex justify-between font-bold text-gray-800 text-sm">
                <span>Total Amount Paid</span>
                <span className="font-mono text-orange-600">${order.total_amount.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* JIT Timeline */}
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-emerald-400 before:via-orange-400 before:to-gray-200">
            {/* Step 1 */}
            <div className="relative flex items-center space-x-3">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white z-10 ${prepStatus !== 'queued' ? 'bg-emerald-500' : 'bg-emerald-500'}`}>
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div className="p-3 rounded-xl border border-gray-100 bg-white shadow-sm flex-1">
                <p className="font-bold text-gray-800 text-sm">Order Placed & Queued</p>
                <p className="text-xs text-gray-500">Sent to Predictive Priority Engine</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative flex items-center space-x-3">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white z-10 ${prepStatus === 'preparing' || prepStatus === 'ready' ? 'bg-orange-500' : 'bg-gray-300'}`}>
                <Utensils className="w-5 h-5 text-white" />
              </div>
              <div className="p-3 rounded-xl border border-gray-100 bg-white shadow-sm flex-1">
                <p className="font-bold text-gray-800 text-sm">Kitchen Cooking</p>
                <p className="text-xs text-gray-500">ML Predicted Prep: {order.prep_time_mins} mins</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative flex items-center space-x-3">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white z-10 ${prepStatus === 'ready' ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div className="p-3 rounded-xl border border-gray-100 bg-white shadow-sm flex-1">
                <p className="font-bold text-gray-800 text-sm">Ready for Pickup</p>
                <p className="text-xs text-gray-500">Food ready right as you arrive!</p>
              </div>
            </div>
          </div>
          
          {/* Rating Modal Section */}
          {showReview && (
            <div className="mt-6 p-5 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl text-center border border-orange-200 shadow-sm animate-in fade-in duration-300">
              <h3 className="font-bold text-base text-gray-800 mb-1">How was your PredictiveEats experience?</h3>
              <p className="text-xs text-gray-500 mb-3">Rate timing accuracy and meal quality</p>
              
              <div className="flex justify-center space-x-2 mb-3">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star 
                    key={star} 
                    className={`w-7 h-7 cursor-pointer transition-colors ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                    onClick={() => setRating(star)}
                  />
                ))}
              </div>

              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-2.5 mb-3 bg-white border border-orange-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                placeholder="Leave feedback..."
              />

              <button 
                onClick={submitReview}
                className="bg-orange-500 text-white px-6 py-2 rounded-xl font-bold w-full hover:bg-orange-600 transition-colors text-xs shadow-md shadow-orange-500/20"
              >
                Submit Review
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
