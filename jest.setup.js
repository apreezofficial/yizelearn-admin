// Safe-area insets come from native measurements, which Jest doesn't have; use the library's mock.
jest.mock('@react-native-community/netinfo', () => ({addEventListener: () => () => {}, fetch: () => Promise.resolve({isConnected: true})}));
jest.mock('@react-native-documents/picker', () => ({pick: jest.fn(), types: {}, errorCodes: {}, isErrorWithCode: () => false}));
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);
// Liquid Glass and haptics are native-only; render plain views and skip the taps in Jest.
jest.mock('@callstack/liquid-glass', () => {
  const {View} = require('react-native');
  return {LiquidGlassView: View, LiquidGlassContainerView: View, isLiquidGlassSupported: false};
});
jest.mock('react-native-haptic-feedback', () => ({__esModule: true, default: {trigger: jest.fn()}, HapticFeedbackTypes: {}}));
