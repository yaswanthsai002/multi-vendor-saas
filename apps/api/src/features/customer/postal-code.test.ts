import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import app from '../../app.js';

describe('Postal code lookup API', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret-at-least-32-characters-long-key';
  });

  afterEach(() => vi.unstubAllGlobals());

  it('rejects malformed PINs before calling the postal service', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const response = await request(app).get('/api/locations/pincodes/123');

    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns locality, district, and state from postal records', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [
          {
            Status: 'Success',
            PostOffice: [
              { Name: 'KPHB Colony', District: 'Hyderabad', State: 'Telangana' },
              { Name: 'KPHB Colony', District: 'Hyderabad', State: 'Telangana' },
            ],
          },
        ],
      }),
    );

    const response = await request(app).get('/api/locations/pincodes/500072');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      items: [{ area: 'KPHB Colony', city: 'Hyderabad', state: 'Telangana' }],
    });
  });

  it('returns a safe error when postal records cannot be reached', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('provider details')));

    const response = await request(app).get('/api/locations/pincodes/500072');

    expect(response.status).toBe(502);
    expect(response.body.error).toBe('Could not verify this PIN code right now.');
    expect(JSON.stringify(response.body)).not.toContain('provider details');
  });
});
