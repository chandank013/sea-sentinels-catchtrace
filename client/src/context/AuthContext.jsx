import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const DEMO_ACCOUNTS = {
  FISHER: {
    pin: '1111',
    user: {
      id: 'usr_fisher_01',
      name: 'Ramesh Naik',
      email: 'ramesh.fisher@gmail.com',
      role: 'FISHER',
      roleLabel: 'Fisher',
      org: 'Sea Queen Trawlers',
      location: 'Mangaluru Harbour',
      avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=120&auto=format&fit=crop&q=80',
    }
  },
  TRADER: {
    pin: '2222',
    user: {
      id: 'usr_trader_01',
      name: 'Ganesh Pai',
      email: 'ganesh.trader@gmail.com',
      role: 'TRADER',
      roleLabel: 'Trader',
      org: 'Coastal Traders & Auctions',
      location: 'Mangaluru Auction Yard',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    }
  },
  PROCESSOR: {
    pin: '3333',
    user: {
      id: 'usr_proc_01',
      name: 'Sunil Shenoy',
      email: 'sunil.processor@gmail.com',
      role: 'PROCESSOR',
      roleLabel: 'Processor',
      org: 'Coastal Foods Pvt Ltd',
      location: 'Baikampady Industrial Estate',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    }
  },
  TRANSPORTER: {
    pin: '4444',
    user: {
      id: 'usr_trans_01',
      name: 'Mohammed Rafi',
      email: 'rafi.logistics@gmail.com',
      role: 'TRANSPORTER',
      roleLabel: 'Transporter',
      org: 'Express Cold Logistics',
      location: 'NH 75 Mangaluru-Bengaluru',
      avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=120&auto=format&fit=crop&q=80',
    }
  },
  SELLER: {
    pin: '5555',
    user: {
      id: 'usr_seller_01',
      name: 'Anand Kumar',
      email: 'anand.seafood@gmail.com',
      role: 'SELLER',
      roleLabel: 'Seller / Vendor',
      org: 'Ocean Fresh Seafood Market',
      location: 'Bengaluru Wholesale Market',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
    }
  },
  ADMIN: {
    pin: '9999',
    user: {
      id: 'usr_admin_01',
      name: 'Dr. K. V. Adiga',
      email: 'adiga.fisheries@gmail.com',
      role: 'ADMIN',
      roleLabel: 'System Administrator',
      org: 'Karnataka Fisheries Dept',
      location: 'Mangaluru Regional Office',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    }
  }
};

const ROLE_LABELS = {
  FISHER: 'Fisher',
  TRADER: 'Trader',
  PROCESSOR: 'Processor',
  TRANSPORTER: 'Transporter',
  SELLER: 'Seller / Vendor',
  ADMIN: 'System Administrator',
};

const DEFAULT_AVATARS = {
  FISHER: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=120&auto=format&fit=crop&q=80',
  TRADER: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
  PROCESSOR: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
  TRANSPORTER: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=120&auto=format&fit=crop&q=80',
  SELLER: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
  ADMIN: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('catchtrace_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('catchtrace_token') || null;
  });

  // Registered custom users list
  const [registeredUsers, setRegisteredUsers] = useState(() => {
    try {
      const stored = localStorage.getItem('catchtrace_registered_users');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [notifications, setNotifications] = useState([]);

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return 'Recently';
    const diffMs = Date.now() - new Date(dateStr).getTime();
    if (isNaN(diffMs) || diffMs < 0) return 'Just now';
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const syncAlertNotifications = useCallback(async (isInitial = false) => {
    try {
      const alerts = await api.getAlerts();
      if (!Array.isArray(alerts)) return;

      const readSet = new Set(
        JSON.parse(localStorage.getItem('catchtrace_read_notifs') || '[]')
      );

      const mapped = alerts.map((a) => {
        const isUnread = !readSet.has(a.id) && !a.resolved;
        return {
          id: a.id,
          batchId: a.batch_id,
          type: a.type,
          title: a.typeLabel || a.type || 'System Alert',
          text: a.description || a.message || 'Audit anomaly flagged',
          severity: a.severity || 'HIGH',
          time: a.time && a.time !== 'Just now' ? a.time : formatTimeAgo(a.detected_at),
          unread: isUnread,
          resolved: !!a.resolved,
          status: a.status || (a.resolved ? 'RESOLVED' : 'OPEN'),
          detectedAt: a.detected_at,
        };
      });

      setNotifications(mapped);

      // Notify on new unread alerts detected during active session
      const seenAlertIds = JSON.parse(sessionStorage.getItem('catchtrace_seen_alert_ids') || '[]');
      const seenSet = new Set(seenAlertIds);
      const newArrivals = mapped.filter((n) => n.unread && !n.resolved && !seenSet.has(n.id));

      if (!isInitial && newArrivals.length > 0) {
        newArrivals.slice(0, 2).forEach((newAlert) => {
          toast(
            (t) => (
              <div
                onClick={() => {
                  toast.dismiss(t.id);
                  if (newAlert.batchId) window.location.href = `/batches/${newAlert.batchId}`;
                  else window.location.href = '/alerts';
                }}
                className="flex items-start gap-2.5 cursor-pointer text-left"
              >
                <span className="text-lg">⚠️</span>
                <div>
                  <p className="font-bold text-xs text-navy-900">{newAlert.title}</p>
                  <p className="text-[11px] text-slate-600 line-clamp-2">{newAlert.text}</p>
                  {newAlert.batchId && (
                    <span className="text-[10px] text-ocean-600 font-bold font-mono mt-0.5 block">
                      {newAlert.batchId}
                    </span>
                  )}
                </div>
              </div>
            ),
            { duration: 6000, position: 'top-right' }
          );
        });
      }

      const allIds = mapped.map((m) => m.id);
      sessionStorage.setItem('catchtrace_seen_alert_ids', JSON.stringify(allIds));
    } catch (err) {
      console.warn('Failed to sync alert notifications:', err);
    }
  }, []);

  // Poll alerts periodically and listen for live alert-updated events
  useEffect(() => {
    syncAlertNotifications(true);
    const interval = setInterval(() => {
      syncAlertNotifications(false);
    }, 8000);

    const handleAlertEvent = () => syncAlertNotifications(false);
    window.addEventListener('catchtrace:alert-updated', handleAlertEvent);

    return () => {
      clearInterval(interval);
      window.removeEventListener('catchtrace:alert-updated', handleAlertEvent);
    };
  }, [syncAlertNotifications]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('catchtrace_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('catchtrace_user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('catchtrace_token', token);
    } else {
      localStorage.removeItem('catchtrace_token');
    }
  }, [token]);

  useEffect(() => {
    localStorage.setItem('catchtrace_registered_users', JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  // Login with Role & PIN
  const loginWithRoleAndPin = async (roleKey, pin) => {
    const roleUpper = roleKey.toUpperCase();

    // 1. Attempt real backend authentication first to obtain signed JWT
    try {
      const data = await api.login({ role: roleUpper, pin });
      if (data && data.token && data.user) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('catchtrace_token', data.token);
        localStorage.setItem('catchtrace_user', JSON.stringify(data.user));
        return data.user;
      }
    } catch (err) {
      console.warn('Backend login unavailable or returned error, evaluating local state:', err);
    }

    // 2. Check if any custom registered user matches role & PIN
    const customMatch = registeredUsers.find(
      (u) => u.role.toUpperCase() === roleUpper && u.pin === pin
    );
    if (customMatch) {
      const mockToken = `jwt_${customMatch.role.toLowerCase()}_custom_${Date.now()}`;
      const { pin: _p, ...safeUser } = customMatch;
      setUser(safeUser);
      setToken(mockToken);
      localStorage.setItem('catchtrace_token', mockToken);
      localStorage.setItem('catchtrace_user', JSON.stringify(safeUser));
      return safeUser;
    }

    const account = DEMO_ACCOUNTS[roleUpper];
    if (!account) {
      throw new Error('Invalid role selected');
    }
    if (account.pin !== pin) {
      throw new Error('Invalid security PIN for the selected role. Please verify your credentials.');
    }

    const mockToken = `jwt_${roleKey.toLowerCase()}_${Date.now()}`;
    setUser(account.user);
    setToken(mockToken);
    localStorage.setItem('catchtrace_token', mockToken);
    localStorage.setItem('catchtrace_user', JSON.stringify(account.user));
    return account.user;
  };

  // Login with custom registered credentials (Username / Name / Email / Role + PIN)
  const loginWithCredentials = async (identifier, pin) => {
    const rawId = (identifier || '').trim();
    const rawPin = (pin || '').trim();

    if (!rawId) {
      throw new Error('Please enter your email address.');
    }
    if (!rawPin || rawPin.length < 4) {
      throw new Error('Please enter your 4-digit security PIN.');
    }

    // 1. Attempt real backend authentication first to obtain signed JWT
    try {
      const data = await api.login({ email: rawId, pin: rawPin });
      if (data && data.token && data.user) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('catchtrace_token', data.token);
        localStorage.setItem('catchtrace_user', JSON.stringify(data.user));
        return data.user;
      }
    } catch (err) {
      if (err.response?.status === 401) {
        throw new Error(err.response.data?.error || 'Incorrect PIN. Please try again.');
      }
      // If 404 or backend unavailable, continue to local store verification before failing
    }

    // 2. Check custom registered users first (local state)
    const foundCustom = registeredUsers.find(
      (u) =>
        (u.name.toLowerCase() === rawId.toLowerCase() ||
          u.id === rawId ||
          (u.email && u.email.toLowerCase() === rawId.toLowerCase()) ||
          (u.phone && u.phone === rawId) ||
          u.role.toLowerCase() === rawId.toLowerCase()) &&
        u.pin === rawPin
    );

    if (foundCustom) {
      const mockToken = `jwt_${foundCustom.role.toLowerCase()}_custom_${Date.now()}`;
      const { pin: _p, ...safeUser } = foundCustom;
      setUser(safeUser);
      setToken(mockToken);
      localStorage.setItem('catchtrace_token', mockToken);
      localStorage.setItem('catchtrace_user', JSON.stringify(safeUser));
      return safeUser;
    }

    // 3. Check demo accounts by role key
    const roleKey = rawId.toUpperCase();
    if (DEMO_ACCOUNTS[roleKey]) {
      return loginWithRoleAndPin(roleKey, rawPin);
    }

    // 4. Check by demo user names or email
    for (const key of Object.keys(DEMO_ACCOUNTS)) {
      const demo = DEMO_ACCOUNTS[key];
      if (
        demo.user.name.toLowerCase() === rawId.toLowerCase() ||
        (demo.user.email && demo.user.email.toLowerCase() === rawId.toLowerCase())
      ) {
        if (demo.pin === rawPin) {
          return loginWithRoleAndPin(key, rawPin);
        } else {
          throw new Error(`Incorrect PIN for ${demo.user.name}. Please try again.`);
        }
      }
    }

    throw new Error('No account found with this email and PIN combination. Please check your credentials or register.');
  };

  // Register New User
  const registerUser = async ({ name, role, org, location, pin, phone, email }) => {
    if (!name || !role || !pin || pin.length < 4) {
      throw new Error('Name, role, and a 4-digit PIN are required');
    }

    const roleUpper = role.toUpperCase();
    const cleanPin = pin.trim();
    const userEmail = email?.trim() || `${name.trim().toLowerCase().replace(/\s+/g, '.')}@gmail.com`;

    const newUser = {
      id: `usr_${roleUpper.toLowerCase()}_${Date.now()}`,
      name: name.trim(),
      email: userEmail,
      role: roleUpper,
      roleLabel: ROLE_LABELS[roleUpper] || roleUpper,
      org: org?.trim() || `${name.trim()}'s Facility`,
      location: location?.trim() || 'Mangaluru Region',
      phone: phone?.trim() || '',
      pin: cleanPin,
      avatar: DEFAULT_AVATARS[roleUpper] || DEFAULT_AVATARS.FISHER,
      isRegistered: true,
      registeredAt: new Date().toISOString(),
    };

    // 1. Attempt real backend registration first
    try {
      const data = await api.register({
        name: newUser.name,
        role: newUser.role,
        org: newUser.org,
        location: newUser.location,
        pin: cleanPin,
        phone: newUser.phone,
        email: newUser.email,
      });
      if (data && data.token && data.user) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('catchtrace_token', data.token);
        localStorage.setItem('catchtrace_user', JSON.stringify(data.user));
        // Keep user with pin in registeredUsers for local login recovery
        setRegisteredUsers((prev) => [{ ...data.user, pin: cleanPin }, ...prev.filter((u) => u.email !== newUser.email)]);
        return data.user;
      }
    } catch (err) {
      console.warn('Backend registration failed, saving locally:', err.message);
    }

    setRegisteredUsers((prev) => [newUser, ...prev.filter((u) => u.email !== newUser.email)]);

    // Automatically log in the newly registered user
    const mockToken = `jwt_${newUser.role.toLowerCase()}_custom_${Date.now()}`;
    const { pin: _p, ...safeUser } = newUser;
    setUser(safeUser);
    setToken(mockToken);
    localStorage.setItem('catchtrace_token', mockToken);
    localStorage.setItem('catchtrace_user', JSON.stringify(safeUser));

    return safeUser;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('catchtrace_user');
    localStorage.removeItem('catchtrace_token');
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => {
      const allIds = prev.map((n) => n.id);
      localStorage.setItem('catchtrace_read_notifs', JSON.stringify(allIds));
      return prev.map((n) => ({ ...n, unread: false }));
    });
  };

  const markNotificationRead = (id) => {
    setNotifications((prev) => {
      const readList = JSON.parse(localStorage.getItem('catchtrace_read_notifs') || '[]');
      if (!readList.includes(id)) {
        readList.push(id);
        localStorage.setItem('catchtrace_read_notifs', JSON.stringify(readList));
      }
      return prev.map((n) => (n.id === id ? { ...n, unread: false } : n));
    });
  };

  const addNotification = (notif) => {
    const formatted = {
      id: notif.id || `notif_${Date.now()}`,
      batchId: notif.batchId || notif.batch_id,
      type: notif.type || 'SYSTEM_ALERT',
      title: notif.title || notif.typeLabel || 'System Alert',
      text: notif.text || notif.description || notif.message,
      severity: notif.severity || 'HIGH',
      time: 'Just now',
      unread: true,
      resolved: false,
      status: 'OPEN',
    };
    setNotifications((prev) => [formatted, ...prev.filter((p) => p.id !== formatted.id)]);
  };

  const unreadCount = notifications.filter((n) => n.unread && !n.resolved).length;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        registeredUsers,
        loginWithRoleAndPin,
        loginWithCredentials,
        registerUser,
        logout,
        notifications,
        unreadCount,
        markAllNotificationsRead,
        markNotificationRead,
        addNotification,
        refreshNotifications: syncAlertNotifications,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
