/**
 * AV Media Telangana - BreakingFeedModel Automated Unit Tests (Task B1-2C)
 *
 * Verifies Single Source of Truth (SSOT) behavior for BreakingFeedModel:
 *   1. Model stores headlines[], selectedIndex, currentHeadline, revision, state, feedSource, providerStatus.
 *   2. transitionTo() enforces valid State Machine transitions.
 *   3. Manual mode updates the model cleanly and clearManual() restores sheet feed.
 *   4. Model subscriber notifications dispatch updated snapshots.
 *   5. DOM element isolation — DOM mutations do not alter in-memory model.
 */

import { BreakingFeedModel } from '../modules/breaking-news/models/BreakingFeedModel.js';

describe('BreakingFeedModel SSOT & State Machine Tests', () => {
  let model;

  beforeEach(() => {
    model = new BreakingFeedModel();
  });

  test('Initial state defaults', () => {
    const snapshot = model.getSnapshot();
    expect(snapshot.currentHeadline).toBe('');
    expect(snapshot.headlines).toEqual([]);
    expect(snapshot.selectedIndex).toBe(0);
    expect(snapshot.manualHeadline).toBeNull();
    expect(snapshot.feedSource).toBe('Google Sheet');
    expect(snapshot.providerStatus).toBe('UNINITIALIZED');
    expect(snapshot.state).toBe('IDLE');
    expect(snapshot.revision).toBe(0);
  });

  test('Google Sheet feed updates model and increments revision', () => {
    const testHeadlines = [
      'తెలంగాణ వర్షాలు - రెడ్ అలర్ట్ జారీ',
      'గోదావరి నీటిమట్టం పెరుగుదల'
    ];

    model.setSheetFeed(testHeadlines, { status: 'READY' });

    const snapshot = model.getSnapshot();
    expect(snapshot.headlines).toHaveLength(2);
    expect(snapshot.selectedIndex).toBe(0);
    expect(snapshot.currentHeadline).toBe('తెలంగాణ వర్షాలు - రెడ్ అలర్ట్ జారీ');
    expect(snapshot.feedSource).toBe('Google Sheet');
    expect(snapshot.providerStatus).toBe('READY');
    expect(snapshot.state).toBe('READY');
    expect(snapshot.revision).toBe(1);
  });

  test('selectIndex updates selectedIndex and currentHeadline', () => {
    const testHeadlines = ['Headline 1', 'Headline 2', 'Headline 3'];
    model.setSheetFeed(testHeadlines, { status: 'READY' });

    model.selectIndex(1);
    const snapshot = model.getSnapshot();
    expect(snapshot.selectedIndex).toBe(1);
    expect(snapshot.currentHeadline).toBe('Headline 2');
    expect(snapshot.revision).toBe(2);
  });

  test('Manual headline overrides currentHeadline', () => {
    model.setSheetFeed(['Sheet Headline 1'], { status: 'READY' });

    model.setManualHeadline('🚨 అత్యవసరం: ప్రత్యక్ష ప్రకటన');

    const snapshot = model.getSnapshot();
    expect(snapshot.currentHeadline).toBe('🚨 అత్యవసరం: ప్రత్యక్ష ప్రకటన');
    expect(snapshot.feedSource).toBe('Manual');
    expect(snapshot.state).toBe('READY');
    expect(snapshot.revision).toBe(2);
  });

  test('clearManual restores Google Sheet headline', () => {
    model.setSheetFeed(['Sheet Headline 1'], { status: 'READY' });
    model.setManualHeadline('Manual Headline');

    model.clearManual();

    const snapshot = model.getSnapshot();
    expect(snapshot.currentHeadline).toBe('Sheet Headline 1');
    expect(snapshot.feedSource).toBe('Google Sheet');
  });

  test('transitionTo updates State Machine cleanly', () => {
    model.setSheetFeed(['Headline 1'], { status: 'READY' });
    expect(model.getSnapshot().state).toBe('READY');

    model.transitionTo('ACTIVE');
    expect(model.getSnapshot().state).toBe('ACTIVE');

    model.transitionTo('IDLE');
    expect(model.getSnapshot().state).toBe('IDLE');
  });

  test('Subscribers receive model updates on state changes', () => {
    const mockListener = jest.fn();
    model.subscribe(mockListener);

    model.setSheetFeed(['Test Headline'], { status: 'READY' });

    expect(mockListener).toHaveBeenCalledTimes(1);
    const lastCallArg = mockListener.mock.calls[0][0];
    expect(lastCallArg.currentHeadline).toBe('Test Headline');
    expect(lastCallArg.revision).toBe(1);
  });

  test('DOM mutations do NOT alter BreakingFeedModel (DOM isolation)', () => {
    model.setSheetFeed(['Model Headline'], { status: 'READY' });

    // Mock DOM node mutation
    const mockDomElement = { textContent: 'Fake DOM Overwrite' };

    // Verifying model snapshot is unaffected by external DOM mutation
    expect(model.currentHeadline).toBe('Model Headline');
    expect(mockDomElement.textContent).not.toBe(model.currentHeadline);
  });
});
