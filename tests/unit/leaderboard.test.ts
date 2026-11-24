// 1.0: a finished game has 13 missions; the first Firestore rules took at most 12, so the final score was refused.
import { describe, it, expect, vi, afterEach } from 'vitest';
import { submitRun } from '../../src/core/Leaderboard';
import { newGame } from '../../src/core/GameState';
import { MISSIONS } from '../../src/data/missions';

const missionsSent = (call: unknown[]) => JSON.parse((call[1] as { body: string }).body).writes[0].update.fields.missions.integerValue;
const nameSent = (call: unknown[]) => JSON.parse((call[1] as { body: string }).body).writes[0].update.fields.name.stringValue;

describe('leaderboard submit', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('the game has 13 missions (the rules in docs/LEADERBOARD.md must take 13)', () => {
    expect(Object.keys(MISSIONS).length).toBe(13);
  });

  it('a finished game posts 13, and when the old rules refuse it, retries with 12', async () => {
    const fetch = vi.fn().mockResolvedValueOnce({ ok: false, status: 403 }).mockResolvedValueOnce({ ok: true, status: 200 });
    vi.stubGlobal('fetch', fetch);
    const s = newGame('normal', 'RAC');
    s.completedMissions = Object.keys(MISSIONS); s.score = 50000;
    expect(await submitRun(s)).toBe(true);
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(missionsSent(fetch.mock.calls[0])).toBe('13');
    expect(missionsSent(fetch.mock.calls[1])).toBe('12');
    expect(nameSent(fetch.mock.calls[1])).toBe('RAC');
  });

  it('a long name refused by the old rules retries with its first three letters', async () => {
    const fetch = vi.fn().mockResolvedValueOnce({ ok: false, status: 403 }).mockResolvedValueOnce({ ok: true, status: 200 });
    vi.stubGlobal('fetch', fetch);
    const s = newGame('normal', 'RACCOON');
    s.completedMissions = ['bike_lane_war']; s.score = 900;
    expect(await submitRun(s)).toBe(true);
    expect(nameSent(fetch.mock.calls[1])).toBe('RAC');
    expect(missionsSent(fetch.mock.calls[1])).toBe('1');
  });

  it('a short name with 12 or fewer missions does not retry', async () => {
    const fetch = vi.fn().mockResolvedValue({ ok: false, status: 403 });
    vi.stubGlobal('fetch', fetch);
    const s = newGame('normal', 'RAC');
    s.completedMissions = ['bike_lane_war']; s.score = 900;
    expect(await submitRun(s)).toBe(false);
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
