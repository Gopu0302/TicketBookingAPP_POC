export interface BusRoute {
  from: string;
  to: string;
}

export const routes: Record<string, BusRoute> = {
  hyderabadToBengaluru: { from: 'Hyderabad', to: 'Bengaluru' },
};
