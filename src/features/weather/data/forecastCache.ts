// a forecast is cached under the key ['forecast', params]
export const FORECAST_QUERY_KEY = 'forecast';

// a forecast older than this is not shown any more. the app keeps it in memory and on the phone as long as that
export const FORECAST_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
