import { generateMockHotels } from './mockdata/Hotel';

test('calculates hotel total from nights and guests', () => {
  const [hotel] = generateMockHotels('2026-07-01', '2026-07-03', 'London', 2);

  expect(hotel.pricePerNight).toBe(350);
  expect(hotel.totalPrice).toBe(1400);
});
