import { HttpError, InvalidResponseError } from '../../../shared/lib/errors';
import fixture from './__fixtures__/forecast-jakarta.json';
import { ForecastParams, getForecast } from './weatherRepository';

const PARAMS: ForecastParams = {
  latitude: -6.2,
  longitude: 106.8,
  temperatureUnit: 'celsius',
  windSpeedUnit: 'kmh',
};

const originalFetch = globalThis.fetch;
const fetchMock = jest.fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>();

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });

// the url of the first request, so a test can look at its query params
const requestedUrl = () => new URL(String(fetchMock.mock.calls[0][0]));

beforeEach(() => {
  fetchMock.mockReset();
  globalThis.fetch = fetchMock;
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe('getForecast', () => {
  it('asks open-meteo for the variables from the PRD', async () => {
    fetchMock.mockResolvedValue(jsonResponse(fixture));

    await getForecast(PARAMS);

    const url = requestedUrl();
    const query = Object.fromEntries(url.searchParams);
    expect(`${url.origin}${url.pathname}`).toBe(
      'https://api.open-meteo.com/v1/forecast',
    );
    expect(query).toEqual({
      latitude: '-6.2',
      longitude: '106.8',
      current:
        'temperature_2m,apparent_temperature,relative_humidity_2m,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m',
      hourly: 'temperature_2m,precipitation_probability,weather_code,is_day',
      daily:
        'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset,uv_index_max',
      timezone: 'auto',
      forecast_hours: '48',
      temperature_unit: 'celsius',
      wind_speed_unit: 'kmh',
    });
  });

  it('sends the chosen units to the api', async () => {
    fetchMock.mockResolvedValue(jsonResponse(fixture));

    await getForecast({
      ...PARAMS,
      temperatureUnit: 'fahrenheit',
      windSpeedUnit: 'mph',
    });

    const query = requestedUrl().searchParams;
    expect(query.get('temperature_unit')).toBe('fahrenheit');
    expect(query.get('wind_speed_unit')).toBe('mph');
  });

  it('returns the mapped forecast', async () => {
    fetchMock.mockResolvedValue(jsonResponse(fixture));

    const forecast = await getForecast(PARAMS);

    expect(forecast.timezone).toBe('Asia/Jakarta');
    expect(forecast.current.condition).toBe('overcast');
    expect(forecast.hourly).toHaveLength(48);
    expect(forecast.daily).toHaveLength(7);
  });

  it('throws InvalidResponseError when the response has the wrong shape', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ ...fixture, current: null }));

    await expect(getForecast(PARAMS)).rejects.toBeInstanceOf(
      InvalidResponseError,
    );
  });

  it('passes an api error through as HttpError', async () => {
    const reason = 'Latitude must be in range of -90 to 90°. Given: 91.0.';
    fetchMock.mockResolvedValue(jsonResponse({ error: true, reason }, 400));

    const error = await getForecast({ ...PARAMS, latitude: 91 }).catch(
      (e: unknown) => e,
    );

    expect(error).toBeInstanceOf(HttpError);
    expect(error).toMatchObject({ status: 400, reason });
  });

  it('cancels the request when the caller aborts', async () => {
    // a fetch that only ends when its signal is aborted
    fetchMock.mockImplementation(
      (_input, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () =>
            reject(Object.assign(new Error('Aborted'), { name: 'AbortError' })),
          );
        }),
    );
    const controller = new AbortController();

    const request = getForecast(PARAMS, controller.signal);
    controller.abort();

    await expect(request).rejects.toMatchObject({ name: 'AbortError' });
  });
});
