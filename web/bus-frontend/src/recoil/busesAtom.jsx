import { atom } from 'recoil';
import { mockBuses } from '../mocks/data';

export const busesState = atom({
  key: 'busesState',
  default: mockBuses,
});