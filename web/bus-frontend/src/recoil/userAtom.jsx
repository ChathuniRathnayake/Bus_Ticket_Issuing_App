import { atom } from 'recoil';

export const userAtom = atom({
  key: 'userAtom',
  default: { isLoggedIn: false, role: 'passenger' },  // Default passenger; change on login
});