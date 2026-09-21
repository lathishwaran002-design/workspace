import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChefHat, Clock, CheckCircle, RefreshCw, ArrowLeft, Flame, AlertCircle, UtensilsCrossed } from 'lucide-react';

export default function KitchenDashboard() {
  const navigate = useNavigate();
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const [now, setNow] = useState(Math.floor(Date.now() / 1000));

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders/queue');
      const data = await res.json();
      setQueue(data.queue || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to fetch kitchen queue:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(() => {
      fetchQueue();
      setNow(Math.floor(Date.now() / 1000));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await fetch('/api/orders/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId, status: newStatus })
      });
      fetchQueue();
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  const queuedCount = queue.filter(o => o.status === 'queued').length;
  const preparingCount = queue.filter(o => o.status === 'preparing').length;
  const readyCount = queue.filter(o => o.status === 'ready').length;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-12">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 p-4 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => navigate('/home')}
              className="p-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-slate-300 transition-colors"
              title="Return to Customer App"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="p-2 bg-orange-500/20 text-orange-400 rounded-xl">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-wide text-white flex items-center">
                Kitchen Priority Queue
                <span className="ml-3 px-2 py-0.5 text-xs bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-full font-mono">
                  ML JIT Engine
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Automated preparation start times based on customer distance & prep load
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">
              Updated: {lastUpdated.toLocaleTimeString()}
            </span>
            <button 
              onClick={fetchQueue}
              className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-2 rounded-xl text-xs font-semibold flex items-center transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Queued (Waiting for Start Time)</p>
              <p className="text-3xl font-extrabold text-amber-400 font-mono mt-1">{queuedCount}</p>
            </div>
            <div className="p-3 bg-amber-400/10 text-amber-400 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Now Preparing (On Grill)</p>
              <p className="text-3xl font-extrabold text-orange-500 font-mono mt-1">{preparingCount}</p>
            </div>
            <div className="p-3 bg-orange-500/10 text-orange-500 rounded-xl">
              <Flame className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Ready for Customer Pickup</p>
              <p className="text-3xl font-extrabold text-emerald-400 font-mono mt-1">{readyCount}</p>
            </div>
            <div className="p-3 bg-emerald-400/10 text-emerald-400 rounded-xl">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Order Cards List */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-slate-200 flex items-center">
            <UtensilsCrossed className="w-5 h-5 mr-2 text-orange-400" />
            Live Priority Queue Stream
          </h2>

          {queue.length === 0 ? (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-3xl p-12 text-center text-slate-400">
              <AlertCircle className="w-10 h-10 mx-auto mb-3 text-slate-500" />
              <p className="text-base font-semibold">No active orders in the queue</p>
              <p className="text-xs text-slate-500 mt-1">Place an order from the customer app to see it calculate live target start times.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {queue.map((order, idx) => {
                const secondsUntilStart = order.target_start_time - now;
                const minsUntilStart = Math.ceil(secondsUntilStart / 60);

                return (
                  <div 
                    key={order.order_id}
                    className={`bg-slate-800 rounded-2xl p-5 border transition-all shadow-md relative overflow-hidden ${
                      order.status === 'preparing' 
                        ? 'border-orange-500/80 shadow-orange-500/10' 
                        : order.status === 'ready'
                        ? 'border-emerald-500/60 shadow-emerald-500/10 opacity-80'
                        : 'border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    {/* Priority badge */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 bg-slate-700 text-slate-300 text-xs font-mono font-bold rounded-lg">
                          #{idx + 1}
                        </span>
                        <h3 className="font-bold font-mono text-white text-base">{order.order_id}</h3>
                      </div>

                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize flex items-center ${
                        order.status === 'ready' 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : order.status === 'preparing'
                          ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30 animate-pulse'
                          : 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                      }`}>
                        {order.status}
                      </span>
                    </div>

                    {/* Order Items */}
                    <div className="bg-slate-900/60 rounded-xl p-3 mb-4 space-y-1.5 border border-slate-700/40">
                      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Items to Cook</p>
                      {order.items?.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-slate-200 font-medium">
                            <span className="text-orange-400 font-bold mr-2">{item.quantity}x</span> 
                            {item.recipe_name}
                          </span>
                          <span className="text-slate-400 font-mono text-xs">${(item.price || 10).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Predictive Stats */}
                    <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                      <div className="bg-slate-700/40 p-2.5 rounded-xl border border-slate-700/50">
                        <span className="text-slate-400 block mb-0.5">Est. Customer Arrival</span>
                        <span className="font-mono font-bold text-slate-200 text-sm">{order.eta_mins} mins away</span>
                      </div>

                      <div className="bg-slate-700/40 p-2.5 rounded-xl border border-slate-700/50">
                        <span className="text-slate-400 block mb-0.5">Predicted Prep Time</span>
                        <span className="font-mono font-bold text-orange-400 text-sm">{order.prep_time_mins} mins</span>
                      </div>
                    </div>

                    {/* Target Start Time / Status override */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-700/60">
                      <div>
                        {order.status === 'queued' && (
                          <p className="text-xs text-amber-300 font-mono">
                            {minsUntilStart <= 0 ? '⚠️ Should Start Now!' : `Start in ~${minsUntilStart} mins`}
                          </p>
                        )}
                        {order.status === 'preparing' && (
                          <p className="text-xs text-orange-400 font-mono flex items-center">
                            <Flame className="w-3.5 h-3.5 mr-1 animate-bounce" /> Cooking in progress
                          </p>
                        )}
                        {order.status === 'ready' && (
                          <p className="text-xs text-emerald-400 font-mono">
                            Ready & waiting for customer
                          </p>
                        )}
                      </div>

                      <div className="flex space-x-2">
                        {order.status === 'queued' && (
                          <button
                            onClick={() => handleStatusChange(order.order_id, 'preparing')}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow"
                          >
                            Start Cooking
                          </button>
                        )}
                        {order.status === 'preparing' && (
                          <button
                            onClick={() => handleStatusChange(order.order_id, 'ready')}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow"
                          >
                            Mark Ready
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
