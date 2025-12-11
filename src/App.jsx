// src/App.js
import React, { useState, useCallback } from 'react';
import { Package, TrendingUp, Users } from 'lucide-react';

import CONFIG from './AppConfig';
import MatchingSheet from './MatchingSheet';
import VendorCRMView from './VendorCRMView';
import LoginPage from './LoginPage'; // Make sure this import is correct

// ============================================
// 📊 MAIN APPLICATION COMPONENT
// ============================================

const App = () => {
  // State: This manages the login status
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  
  // State: View only for dashboard
  const [currentView, setCurrentView] = useState('matching'); 

  // Handler passed to LoginPage to switch view on successful login
  const handleLoginSuccess = useCallback(() => {
    setIsLoggedIn(true);
    setCurrentView('matching'); // Ensure dashboard starts on the matching sheet
  }, []);


  // --- Render Login Page if not logged in ---
  if (!isLoggedIn) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }
  // ------------------------------------------


  // --- Render Main Dashboard if logged in ---
  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-100 overflow-hidden">
      <aside className="w-full lg:w-72 bg-white border-b lg:border-r lg:border-b-0 border-indigo-100 flex-shrink-0 shadow-lg">
        <div className="p-4 border-b border-indigo-100">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mr-3">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Opt2Deal</h1>
              <p className="text-xs text-gray-500">App Navigation</p>
            </div>
          </div>
        </div>

        <nav className="p-3 space-y-2">
          {/* Matching Sheet Tab */}
          <button
            onClick={() => setCurrentView('matching')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all font-semibold text-sm ${currentView === 'matching'
                ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            <div className="flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              <span>Matching Requests</span>
            </div>
          </button>

          {/* Vendor Sheet (CRM) Tab */}
          <button
            onClick={() => setCurrentView('vendor-crm')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all font-semibold text-sm ${currentView === 'vendor-crm'
                ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-2" />
              <span>Vendor CRM</span>
            </div>
          </button>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        {currentView === 'matching' && <MatchingSheet />}
        {currentView === 'vendor-crm' && (
          <VendorCRMView baseApiUrl={CONFIG.VENDOR_API_BASE_URL} />
        )}
      </main>
    </div>
  );
};

export default App;