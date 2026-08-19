import { create } from 'zustand';
import { IdentityActions, IdentityState } from './identity.types';

export const initialState: IdentityState = {
  isAuthenticated: false,
  userPermissions: [],
};

export const useIdentityStore = create<IdentityState & IdentityActions>(
  set => ({
    ...initialState,
    setIsAuthenticated: isAuthenticated => set({ isAuthenticated }),
    setUserPermissions: userPermissions => set({ userPermissions }),
    resetIdentity: () => set(initialState),
  }),
);
