const listeners = [];

export const AppState = {
  user: null,
  currentPage: 'dashboard',
  pendingDocuments: null,
  pendingFileName: null,
  loading: {},

  set(key, value) {
    const old = this[key];
    this[key] = value;
    listeners.forEach(fn => fn(key, value, old));
  },

  onChange(fn) {
    listeners.push(fn);
    return () => {
      const idx = listeners.indexOf(fn);
      if (idx >= 0) listeners.splice(idx, 1);
    };
  },

  isAdmin() {
    return this.user && this.user.role === 'admin';
  },

  setLoading(key, isLoading) {
    this.loading[key] = isLoading;
    this.loading = { ...this.loading };
  },

  isLoading(key) {
    return !!this.loading[key];
  }
};
