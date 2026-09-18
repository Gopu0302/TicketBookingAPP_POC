export interface BusRoute {
  from: string;
  to: string;
}

/** Extra IDs redBus's /search URL requires; used to jump straight to a results state (e.g. a far-future date) without driving the slow/flaky calendar widget. */
export interface BusRouteQuery extends BusRoute {
  fromCityId: number;
  fromCityType: 'CITY' | 'AREA';
  toCityId: number;
  toCityType: 'CITY' | 'AREA';
}

export const routes: Record<string, BusRoute> = {
  hyderabadToBengaluru: { from: 'Hyderabad', to: 'Bengaluru' },
};

export const routeQueries: Record<string, BusRouteQuery> = {
  hyderabadToBengaluru: {
    from: 'Kukatpally',
    fromCityId: 66030,
    fromCityType: 'AREA',
    to: 'Bengaluru',
    toCityId: 122,
    toCityType: 'CITY',
  },
};
