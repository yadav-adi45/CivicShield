// Test offline chatbot responses
import { getOfflineResponse, getCrisisGuide } from '../offlineData';

describe('Offline Chatbot', () => {
  test('responds to water shortage query', () => {
    const response = getOfflineResponse('water shortage help');
    expect(response).toContain('water');
    expect(response).toContain('1916');
  });

  test('responds to LPG query', () => {
    const response = getOfflineResponse('lpg gas shortage');
    expect(response).toContain('LPG');
    expect(response).toContain('1906');
  });

  test('responds to emergency query', () => {
    const response = getOfflineResponse('emergency help');
    expect(response).toContain('112');
    expect(response).toContain('Emergency');
  });

  test('returns fallback for unknown query', () => {
    const response = getOfflineResponse('random unrelated question');
    expect(response).toContain('offline mode');
    expect(response).toContain('112');
  });

  test('gets crisis guide for water', () => {
    const guide = getCrisisGuide('water');
    expect(guide).toBeDefined();
    expect(guide.title).toContain('Water');
    expect(guide.steps).toBeInstanceOf(Array);
    expect(guide.emergency).toBeDefined();
  });

  test('returns null for invalid resource', () => {
    const guide = getCrisisGuide('invalid');
    expect(guide).toBeNull();
  });
});
