/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

test('renders the dashboard and cleans up its animations on unmount', async () => {
  jest.useFakeTimers();
  let app: ReactTestRenderer.ReactTestRenderer | undefined;
  try {
    await ReactTestRenderer.act(async () => {
      app = ReactTestRenderer.create(<App />);
    });
    expect(app?.toJSON()).not.toBeNull();
  } finally {
    await ReactTestRenderer.act(async () => {
      app?.unmount();
    });
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  }
});
