import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { toast } from 'react-hot-toast';

const Donate = () => {
  const { items, deleteItem } = useInventory();
  const [isDonating, setIsDonating] = useState(false);
  const [donatingId, setDonatingId] = useState(null);

  const getDaysLeft = (expiry) => {
    const days = Math.ceil((new Date(expiry) - new Date()) / (1000 * 60 * 60 * 24));
    return days < 0 ? 0 : days; // Ensure we don't show negative days
  };

  // Filter items expiring in 3 days or less
  const expiringItems = items.filter(item => {
    const daysLeft = getDaysLeft(item.expiry);
    return daysLeft <= 3;
  }).sort((a, b) => getDaysLeft(a.expiry) - getDaysLeft(b.expiry)); // Sort by closest to expiry

  const handleDonate = async (id) => {
    setIsDonating(true);
    setDonatingId(id);
    try {
      await deleteItem(id);
      toast.success('🎁 Item successfully donated!', {
        style: {
          background: '#4CAF50',
          color: '#fff',
          borderRadius: '10px',
          padding: '16px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        },
        duration: 4000,
      });
    } catch (err) {
      console.error('Donation error:', err);
      toast.error('❌ Failed to mark as donated. Please try again.', {
        style: {
          background: '#F44336',
          color: '#fff',
          borderRadius: '10px',
          padding: '16px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        },
        duration: 4000,
      });
    } finally {
      setIsDonating(false);
      setDonatingId(null);
    }
  };


  return (
    <div className="p-6 max-w-5xl mx-auto bg-white rounded-xl shadow-sm">
      {/* Header Section with Decorative Elements */}
      <div className="mb-8 relative">
        <div className="absolute -top-6 -left-6 w-24 h-24 bg-purple-100 rounded-full opacity-70 blur-md"></div>
        <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-yellow-100 rounded-full opacity-70 blur-md"></div>
        
        <div className="relative z-10">
          <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 mb-2">
            🎁 Donate Expiring Items
          </h2>
          <p className="text-gray-600 text-lg">
            Help reduce food waste by donating items that are about to expire to those in need.
          </p>
          <div className="h-1 w-32 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full mt-3"></div>
        </div>
      </div>

      {expiringItems.length === 0 ? (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-8 text-center shadow-sm transition-all duration-300 hover:shadow-md">
          <img 
            src="https://cdn.jsdelivr.net/npm/emoji-datasource-apple@7.0.2/img/apple/64/1f389.png" 
            alt="celebration" 
            className="w-16 h-16 mx-auto mb-3"
          />
          <p className="text-green-700 text-xl font-medium">
            No expiring items to donate right now!
          </p>
          <p className="text-green-600 mt-2">
            Check back later or add more items to your inventory.
          </p>
          <button 
            onClick={() => window.location.href = '/inventory/add'} 
            className="mt-4 px-6 py-2 bg-green-600 text-white rounded-full font-medium hover:bg-green-700 transform transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
          >
            Add New Items
          </button>
        </div>
      ) : (
        <>
          <div className="mb-6 p-4 bg-indigo-50 rounded-lg border-l-4 border-indigo-500">
            <p className="text-indigo-800">
              <span className="font-bold">🔔 Quick Tip:</span> Items expiring within 3 days appear here. Donate them before they go to waste!
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            {expiringItems.map((item) => {
              const daysLeft = getDaysLeft(item.expiry);
              const urgencyColor = daysLeft <= 1 
                ? 'from-red-50 to-rose-50 border-red-200' 
                : daysLeft <= 2 
                  ? 'from-orange-50 to-amber-50 border-orange-200' 
                  : 'from-yellow-50 to-amber-50 border-yellow-200';
              
              // Removed unused variable 'categoryBg'
              
              return (
                <div
                  key={item._id}
                  className={`border rounded-xl p-5 bg-gradient-to-r ${urgencyColor} shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">{item.name}</h3>
                      <div className="flex items-center mt-2">
                        <span className="inline-block w-3 h-3 rounded-full mr-2" style={{
                          backgroundColor: daysLeft <= 1 ? '#ef4444' : daysLeft <= 2 ? '#f97316' : '#eab308'
                        }}></span>
                        <p className="text-gray-600">
                          <span className="font-medium">Expires:</span> {new Date(item.expiry).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className={`inline-flex items-center px-3 py-1 mt-2 rounded-full text-sm font-medium ${
                        item.category.toLowerCase().includes('fruit') || item.category.toLowerCase().includes('vegetable')
                          ? 'bg-green-100 text-green-800'
                          : item.category.toLowerCase().includes('meat')
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                      }`}>
                        {item.category}
                      </div>
                    </div>
                    <div className={`flex items-center justify-center w-12 h-12 rounded-full text-sm font-bold ${
                      daysLeft <= 1 
                        ? 'bg-red-500 text-white animate-pulse' 
                        : daysLeft <= 2 
                          ? 'bg-orange-500 text-white' 
                          : 'bg-yellow-500 text-white'
                    }`}>
                      {daysLeft}d
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-gray-600 text-sm mb-3">
                      {daysLeft <= 1 
                        ? "⚠️ Urgent: This item expires today or tomorrow!" 
                        : daysLeft <= 2 
                          ? "This item will expire soon. Consider donating it."
                          : "This item is approaching expiration."}
                    </p>
                    <button
                      onClick={() => handleDonate(item._id)}
                      disabled={isDonating && donatingId === item._id}
                      className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center ${
                        isDonating && donatingId === item._id
                          ? 'bg-purple-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'
                      } text-white transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 shadow-sm`}
                    >
                      {isDonating && donatingId === item._id ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing Donation...
                        </>
                      ) : (
                        <>
                          <span className="text-xl mr-2">🤝</span>
                          Donate This Item
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Impact Counter Section */}
          <div className="mt-10 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-100 shadow-sm">
            <h3 className="text-xl font-semibold text-center text-purple-800 mb-4">Your Donation Impact</h3>
            <div className="flex flex-wrap justify-around text-center">
              <div className="px-4 py-2">
                <p className="text-3xl font-bold text-indigo-600">{expiringItems.length}</p>
                <p className="text-gray-600">Items Ready to Donate</p>
              </div>
              <div className="px-4 py-2">
                <p className="text-3xl font-bold text-green-600">{items.length - expiringItems.length}</p>
                <p className="text-gray-600">Items Tracked</p>
              </div>
              <div className="px-4 py-2">
                <p className="text-3xl font-bold text-amber-600">100%</p>
                <p className="text-gray-600">Waste Reduction</p>
              </div>
            </div>
          </div>
        </>
      )}
      
      {/* Footer Section */}
      <div className="mt-10 text-center text-gray-500 text-sm">
        <p>Thank you for reducing food waste and helping your community! 💚</p>
      </div>
    </div>
  );
};

export default Donate;