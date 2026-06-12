'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

var API = 'http://localhost:5001/api';

var AuthContext = createContext(null);

export function AuthProvider({ children }) {
  var [user, setUser] = useState(null);
  var [loading, setLoading] = useState(true);
  var [isPremium, setIsPremium] = useState(false);
  var [subscriptionTier, setSubscriptionTier] = useState(null);
  var [subExpiresAt, setSubExpiresAt] = useState(null);

  useEffect(function() {
    var token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }
    try {
      var payload = JSON.parse(atob(token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));
      var override = localStorage.getItem('dev_role_override');
      if (override) payload.role = override;
      setUser(payload);
      verifySubFromBackend(payload.email || payload.id);
    } catch (e) {
      localStorage.removeItem('token');
      setLoading(false);
    }
  }, []);

  async function verifySubFromBackend(email) {
    if (!email) { checkLocalFallback(); setLoading(false); return; }
    try {
      var resp = await fetch(API + '/subscription/status?email=' + encodeURIComponent(email));
      if (resp.ok) {
        var data = await resp.json();
        setIsPremium(data.isPremium || false);
        setSubscriptionTier(data.subscriptionTier || 'BASIC');
        setSubExpiresAt(data.expiresAt || null);
        if (data.isPremium && data.subscriptionTier) {
          localStorage.setItem('subscriptionTier', data.subscriptionTier);
          if (data.expiresAt) localStorage.setItem('subExpiresAt', data.expiresAt);
        } else {
          localStorage.removeItem('subscriptionTier');
          localStorage.removeItem('subExpiresAt');
        }
      } else {
        checkLocalFallback();
      }
    } catch (e) {
      checkLocalFallback();
    }
    setLoading(false);
  }

  function checkLocalFallback() {
    var tier = localStorage.getItem('subscriptionTier');
    var hasKey = !!localStorage.getItem('premiumLicenseKey');
    var activated = localStorage.getItem('licenseActivated') === 'true';
    if (tier && tier !== 'BASIC' && tier !== 'STARTER') {
      setIsPremium(true);
      setSubscriptionTier(tier);
    } else if (activated && hasKey) {
      setIsPremium(true);
      setSubscriptionTier('PREMIUM');
    } else {
      setIsPremium(false);
      setSubscriptionTier(tier || 'BASIC');
    }
  }

  var switchRole = function(newRole) {
    localStorage.setItem('dev_role_override', newRole);
    if (newRole === 'PREMIUM_SUBSCRIBER') { setIsPremium(true); }
    var updatedUser = user || { role: newRole, fullName: 'Dev User', email: 'dev@leadarrow.ai' };
    setUser({ ...updatedUser, role: newRole });
  };

  var activatePremium = useCallback(async function({ licenseKey, email, tier }) {
    try {
      localStorage.setItem('premiumLicenseKey', licenseKey);
      if (email) localStorage.setItem('premiumEmail', email);
      localStorage.setItem('licenseActivated', 'true');
      localStorage.setItem('subscriptionTier', tier || 'PREMIUM');
      setIsPremium(true);
      setSubscriptionTier(tier || 'PREMIUM');
      if (user) { setUser({ ...user, role: 'PREMIUM_SUBSCRIBER', subscriptionTier: tier || 'PREMIUM', isActivated: true }); }
      return true;
    } catch (e) { return false; }
  }, [user]);

  var login = function(token) {
    localStorage.setItem('token', token);
    try {
      var payload = JSON.parse(atob(token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));
      setUser(payload);
      setLoading(true);
      verifySubFromBackend(payload.email);
    } catch (e) { setLoading(false); }
  };

  var logout = function() {
    localStorage.removeItem('token');
    localStorage.removeItem('dev_role_override');
    localStorage.removeItem('subscriptionTier');
    localStorage.removeItem('subExpiresAt');
    localStorage.removeItem('premiumLicenseKey');
    localStorage.removeItem('premiumEmail');
    localStorage.removeItem('licenseActivated');
    setUser(null);
    setIsPremium(false);
    setSubscriptionTier(null);
    setSubExpiresAt(null);
  };

  return (
    <AuthContext.Provider value={{
      user, loading, login, logout, switchRole,
      isPremium, subscriptionTier, subExpiresAt, activatePremium,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  var context = useContext(AuthContext);
  if (context === null) { throw new Error('useAuth must be used within an AuthProvider'); }
  return context;
}
