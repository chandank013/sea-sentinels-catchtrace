import React, { createContext, useContext, useState, useEffect } from 'react';

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

  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Batch FB-20261028-0015 flagged: Weight loss exceeds 20%', time: '10m ago', unread: true },
    { id: 2, text: 'Batch FB-20261028-0001 completed sale at Bengaluru Market', time: '1h ago', unread: true },
    { id: 3, text: 'Integrity check scheduled for batches', time: '3h ago', unread: false },
  ]);

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

    // Check if any custom registered user matches role & PIN
    const customMatch = registeredUsers.find(
      (u) => u.role.toUpperCase() === roleUpper && u.pin === pin
    );
    if (customMatch) {
      const mockToken = `jwt_${customMatch.role.toLowerCase()}_custom_${Date.now()}`;
      const { pin: _p, ...safeUser } = customMatch;
      setUser(safeUser);
      setToken(mockToken);
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
    return account.user;
  };

  // Login with custom registered credentials (Username / Name / Email / Role + PIN)
  const loginWithCredentials = async (identifier, pin) => {
    // 1. Check custom registered users first
    const foundCustom = registeredUsers.find(
      (u) =>
        (u.name.toLowerCase() === identifier.trim().toLowerCase() ||
          u.id === identifier.trim() ||
          (u.email && u.email.toLowerCase() === identifier.trim().toLowerCase()) ||
          (u.phone && u.phone === identifier.trim()) ||
          u.role.toLowerCase() === identifier.trim().toLowerCase()) &&
        u.pin === pin
    );

    if (foundCustom) {
      const mockToken = `jwt_${foundCustom.role.toLowerCase()}_custom_${Date.now()}`;
      const { pin: _p, ...safeUser } = foundCustom;
      setUser(safeUser);
      setToken(mockToken);
      return safeUser;
    }

    // 2. Check demo accounts by role key
    const roleKey = identifier.trim().toUpperCase();
    if (DEMO_ACCOUNTS[roleKey]) {
      return loginWithRoleAndPin(roleKey, pin);
    }

    // 3. Check by demo user names or email
    for (const key of Object.keys(DEMO_ACCOUNTS)) {
      const demo = DEMO_ACCOUNTS[key];
      if (
        demo.user.name.toLowerCase() === identifier.trim().toLowerCase() ||
        (demo.user.email && demo.user.email.toLowerCase() === identifier.trim().toLowerCase())
      ) {
        if (demo.pin === pin) {
          return loginWithRoleAndPin(key, pin);
        } else {
          throw new Error(`Incorrect PIN for ${demo.user.name}. Please try again.`);
        }
      }
    }

    throw new Error('No account found with this email and PIN combination. Please check your credentials.');
  };

  // Register New User
  const registerUser = async ({ name, role, org, location, pin, phone, email }) => {
    if (!name || !role || !pin || pin.length < 4) {
      throw new Error('Name, role, and a 4-digit PIN are required');
    }

    const roleUpper = role.toUpperCase();
    const newUser = {
      id: `usr_${roleUpper.toLowerCase()}_${Date.now()}`,
      name: name.trim(),
      email: email?.trim() || `${name.trim().toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
      role: roleUpper,
      roleLabel: ROLE_LABELS[roleUpper] || roleUpper,
      org: org?.trim() || `${name.trim()}'s Facility`,
      location: location?.trim() || 'Mangaluru Region',
      phone: phone?.trim() || '',
      pin: pin.trim(),
      avatar: DEFAULT_AVATARS[roleUpper] || DEFAULT_AVATARS.FISHER,
      isRegistered: true,
      registeredAt: new Date().toISOString(),
    };

    setRegisteredUsers((prev) => [newUser, ...prev]);

    // Automatically log in the newly registered user
    const mockToken = `jwt_${newUser.role.toLowerCase()}_custom_${Date.now()}`;
    const { pin: _p, ...safeUser } = newUser;
    setUser(safeUser);
    setToken(mockToken);

    return safeUser;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('catchtrace_user');
    localStorage.removeItem('catchtrace_token');
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

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
        markAllNotificationsRead,
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
