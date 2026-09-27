export function flightTotals(
  outboundFlight,
  returnFlight,
  people = 1,
  seatCount = 0,
  insurance = 0,
) {
  const count = Math.max(1, Number(people) || 1);
  const outbound = (Number(outboundFlight?.price) || 0) * count;
  const returning = (Number(returnFlight?.price) || 0) * count;
  const taxes = 50;
  const extras =
    Math.max(0, Number(seatCount) || 0) * 20 +
    Math.max(0, Number(insurance) || 0);
  return {
    outbound,
    returning,
    taxes,
    extras,
    total: outbound + returning + taxes + extras,
  };
}
