import fixture from './__fixtures__/forecast-jakarta.json';
import { forecastResponseSchema } from './forecastSchema';

// fresh copy of the fixture that a test can break on purpose
const cloneFixture = () => JSON.parse(JSON.stringify(fixture));

describe('forecastResponseSchema', () => {
  it('accepts a real open-meteo response', () => {
    expect(forecastResponseSchema.safeParse(fixture).success).toBe(true);
  });

  it('keeps the values we use', () => {
    const data = forecastResponseSchema.parse(fixture);

    expect(data.timezone).toBe('Asia/Jakarta');
    expect(data.utc_offset_seconds).toBe(25200);
    expect(data.current.temperature_2m).toBe(27.8);
    expect(data.hourly.time).toHaveLength(48);
    expect(data.daily.time).toHaveLength(7);
  });

  it('accepts null for values a weather model may not provide', () => {
    const data = cloneFixture();
    data.hourly.precipitation_probability[0] = null;
    data.daily.precipitation_probability_max[0] = null;
    data.daily.uv_index_max[0] = null;

    expect(forecastResponseSchema.safeParse(data).success).toBe(true);
  });

  it('rejects a response without the current block', () => {
    const data = cloneFixture();
    delete data.current;

    expect(forecastResponseSchema.safeParse(data).success).toBe(false);
  });

  it('rejects a null temperature', () => {
    const data = cloneFixture();
    data.hourly.temperature_2m[3] = null;

    expect(forecastResponseSchema.safeParse(data).success).toBe(false);
  });
});
