// import { renderHook, act } from '@testing-library/react-native';
// import * as SecureStore from 'expo-secure-store';
// import { useStorageState, setStorageItemAsync } from '@/hooks/useStorageState';

// // Mocking expo-secure-store
// jest.mock('expo-secure-store');

// describe('useStorageState hook', () => {
//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   it('initializes state correctly', async () => {
//     SecureStore.getItemAsync mockResolvedValueOnce(null);

//     const { result, waitForNextUpdate } = renderHook(() => useStorageState('testKey'));
//     await waitForNextUpdate();

//     expect(result.current[0]).toBeNull();
//   });

//   it('sets new value and updates storage', async () => {
//     const { result, waitForNextUpdate } = renderHook(() => useStorageState('testKey'));

//     await act(async () => {
//       result.current[1]('testValue');
//       await waitForNextUpdate();
//     });

//     expect(result.current[0]).toBe('testValue');
//     expect(SecureStore.setItemAsync).toHaveBeenCalledWith('testKey', 'testValue');
//   });

//   it('removes item from storage when setting null value', async () => {
//     const { result, waitForNextUpdate } = renderHook(() => useStorageState('testKey'));

//     await act(async () => {
//       result.current[1](null);
//       await waitForNextUpdate();
//     });

//     expect(result.current[0]).toBeNull();
//     expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('testKey');
//   });

//   it('retrieves value from storage on mount', async () => {
//     SecureStore.getItemAsync.mockResolvedValueOnce('storedValue');

//     const { result, waitForNextUpdate } = renderHook(() => useStorageState('testKey'));
//     await waitForNextUpdate();

//     expect(result.current[0]).toBe('storedValue');
//     expect(SecureStore.getItemAsync).toHaveBeenCalledWith('testKey');
//   });

//   it('handles unavailable storage gracefully', async () => {
//     SecureStore.getItemAsync.mockRejectedValueOnce(new Error('Storage error'));

//     const { result, waitForNextUpdate } = renderHook(() => useStorageState('testKey'));
//     await waitForNextUpdate();

//     expect(result.current[0]).toBeNull();
//     // You might want to assert that the error is logged or handled appropriately
//   });
// });

// describe('setStorageItemAsync function', () => {
//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   it('sets item in storage correctly', async () => {
//     await setStorageItemAsync('testKey', 'testValue');

//     expect(SecureStore.setItemAsync).toHaveBeenCalledWith('testKey', 'testValue');
//   });

//   it('removes item from storage correctly', async () => {
//     await setStorageItemAsync('testKey', null);

//     expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('testKey');
//   });
// });
