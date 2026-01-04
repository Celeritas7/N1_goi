import React, { useState, useEffect } from 'react';
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.0/+esm';

export default function MarkingViewer() {
  const [localStorageMarkings, setLocalStorageMarkings] = useState([]);
  const [supabaseMarkings, setSupabaseMarkings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('localStorage');

  // Initialize Supabase client
  const supabase = createClient(
    'https://zyvrdtcfxqbwvwevgsgk.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5dnJkdGNmeHFid3Z3ZXZnc2drIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYwNjMzOTksImV4cCI6MjA1MTYzOTM5OX0.uX6kSQQg9zRXdlbDjKhBCTWW1Yzk31YuvdVEsL_u1OY'
  );

  useEffect(() => {
    loadMarkings();
  }, []);

  const loadMarkings = async () => {
    try {
      // Load from localStorage
      const localData = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('marking_')) {
          const value = localStorage.getItem(key);
          const wordId = key.replace('marking_', '');
          localData.push({
            wordId,
            marking: value,
            key
          });
        }
      }
      setLocalStorageMarkings(localData.sort((a, b) => a.wordId.localeCompare(b.wordId)));

      // Load from Supabase
      const { data: supabaseData, error: supabaseError } = await supabase
        .from('markings')
        .select('*')
        .order('word_id', { ascending: true });

      if (supabaseError) {
        console.error('Supabase error:', supabaseError);
        setError(`Supabase error: ${supabaseError.message}`);
      } else {
        setSupabaseMarkings(supabaseData || []);
      }

      setLoading(false);
    } catch (err) {
      setError(`Error loading markings: ${err.message}`);
      setLoading(false);
    }
  };

  const clearLocalStorage = () => {
    if (confirm('Are you sure you want to clear all localStorage markings?')) {
      localStorageMarkings.forEach(item => {
        localStorage.removeItem(item.key);
      });
      setLocalStorageMarkings([]);
      alert('LocalStorage markings cleared!');
    }
  };

  const exportToJSON = () => {
    const data = {
      localStorage: localStorageMarkings,
      supabase: supabaseMarkings,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `markings-export-${Date.now()}.json`;
    a.click();
  };

  const getMarkingColor = (marking) => {
    const colors = {
      'known': 'bg-green-100 text-green-800 border-green-300',
      'learning': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'difficult': 'bg-red-100 text-red-800 border-red-300',
      'review': 'bg-blue-100 text-blue-800 border-blue-300'
    };
    return colors[marking] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-8 flex items-center justify-center">
        <div className="text-xl text-gray-700">Loading your markings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-800">📊 Your Vocabulary Markings</h1>
            <button
              onClick={exportToJSON}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              📥 Export JSON
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Tab Navigation */}
          <div className="flex gap-4 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('localStorage')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'localStorage'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              💾 LocalStorage ({localStorageMarkings.length})
            </button>
            <button
              onClick={() => setActiveTab('supabase')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'supabase'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              ☁️ Supabase Cloud ({supabaseMarkings.length})
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'stats'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              📈 Statistics
            </button>
          </div>

          {/* LocalStorage View */}
          {activeTab === 'localStorage' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-600">
                  Markings stored locally on this device (browser)
                </p>
                <button
                  onClick={clearLocalStorage}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                >
                  🗑️ Clear All
                </button>
              </div>
              
              {localStorageMarkings.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No markings found in localStorage
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {localStorageMarkings.map((item) => (
                    <div
                      key={item.key}
                      className={`p-4 rounded-lg border-2 ${getMarkingColor(item.marking)}`}
                    >
                      <div className="font-mono text-sm text-gray-600 mb-1">
                        ID: {item.wordId}
                      </div>
                      <div className="text-lg font-bold capitalize">
                        {item.marking}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Supabase View */}
          {activeTab === 'supabase' && (
            <div>
              <p className="text-gray-600 mb-4">
                Markings synced to cloud (accessible from all devices)
              </p>
              
              {supabaseMarkings.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No markings found in Supabase cloud storage
                </div>
              ) : (
                <div className="space-y-3">
                  {supabaseMarkings.map((item) => (
                    <div
                      key={item.id}
                      className={`p-4 rounded-lg border-2 ${getMarkingColor(item.marking)} flex items-center justify-between`}
                    >
                      <div className="flex-1">
                        <div className="font-mono text-sm text-gray-600">
                          Word ID: {item.word_id}
                        </div>
                        <div className="text-lg font-bold capitalize mt-1">
                          {item.marking}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.user_id && (
                          <div>User: {item.user_id.substring(0, 8)}...</div>
                        )}
                        {item.created_at && (
                          <div className="mt-1">
                            {new Date(item.created_at).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Statistics View */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
                  <div className="text-3xl font-bold text-blue-800">
                    {localStorageMarkings.length}
                  </div>
                  <div className="text-blue-600 font-medium mt-1">
                    LocalStorage Markings
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
                  <div className="text-3xl font-bold text-purple-800">
                    {supabaseMarkings.length}
                  </div>
                  <div className="text-purple-600 font-medium mt-1">
                    Cloud Markings
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  📊 LocalStorage Breakdown
                </h3>
                {renderMarkingStats(localStorageMarkings)}
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  ☁️ Supabase Breakdown
                </h3>
                {renderMarkingStats(supabaseMarkings.map(m => ({
                  marking: m.marking
                })))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  function renderMarkingStats(markings) {
    const stats = markings.reduce((acc, item) => {
      acc[item.marking] = (acc[item.marking] || 0) + 1;
      return acc;
    }, {});

    const types = ['known', 'learning', 'difficult', 'review'];
    
    if (Object.keys(stats).length === 0) {
      return <div className="text-gray-500">No markings to analyze</div>;
    }

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {types.map(type => (
          <div key={type} className={`p-4 rounded-lg border-2 ${getMarkingColor(type)}`}>
            <div className="text-2xl font-bold">{stats[type] || 0}</div>
            <div className="text-sm capitalize mt-1">{type}</div>
            {markings.length > 0 && (
              <div className="text-xs mt-2 opacity-75">
                {((stats[type] || 0) / markings.length * 100).toFixed(1)}%
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }
}
