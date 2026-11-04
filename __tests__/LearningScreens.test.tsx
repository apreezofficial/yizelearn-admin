import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import {
  LearningProvider,
  LearningScreen,
} from '../src/screens/LearningScreens';
import { BottomButton } from '../src/components/Layout';
import { Fab, Field, Row } from '../src/components/Admin';

test('creates a native cohort with the selected learners and courses', async () => {
  jest.useFakeTimers();
  let app: Renderer.ReactTestRenderer;
  try {
    await act(async () => {
      app = Renderer.create(
        <LearningProvider>
          <LearningScreen
            page="Cohorts"
            onBack={jest.fn()}
            onMessage={jest.fn()}
          />
        </LearningProvider>,
      );
    });
    await act(async () => app.root.findByType(Fab).props.onPress());
    expect(app!.root.findByType(BottomButton).props.disabled).toBe(true);
    await act(async () =>
      app.root
        .findAllByType(Field)
        .find(f => f.props.label === 'Cohort name')!
        .props.onChangeText('November cohort'),
    );
    expect(app!.root.findByType(BottomButton).props.disabled).toBe(false);
    await act(async () => app.root.findByType(BottomButton).props.onPress());
    await act(async () =>
      app.root
        .findAllByType(Row)
        .find(r => r.props.title === 'Mercy Ibe')!
        .props.onPress(),
    );
    expect(app!.root.findByType(BottomButton).props.label).toBe(
      'Add 1 learners',
    );
    await act(async () => app.root.findByType(BottomButton).props.onPress());
    // Toggle the first course through its accessible checkbox control.
    const checkbox = app!.root
      .findAllByProps({ accessibilityRole: 'checkbox' })
      .find(c => typeof c.props.onPress === 'function')!;
    await act(async () => checkbox.props.onPress());
    expect(app!.root.findByType(BottomButton).props.disabled).toBe(false);
    await act(async () => app.root.findByType(BottomButton).props.onPress());
    expect(JSON.stringify(app!.toJSON())).toContain('Cohort created');
    expect(JSON.stringify(app!.toJSON())).toContain(
      'November cohort has 1 learners and 1 courses.',
    );
  } finally {
    await act(async () => app?.unmount());
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  }
});
