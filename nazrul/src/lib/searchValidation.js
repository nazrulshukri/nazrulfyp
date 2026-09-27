export function localDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function isCalendarDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return (
    Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}
export function validateSearch(
  {
    mode,
    origin = "",
    destination = "",
    departureDate = "",
    returnDate = "",
    tripType,
    adults,
    children,
    infants,
  },
  today = localDate(),
) {
  if (typeof origin !== "string" || typeof destination !== "string")
    return "Choose a valid departure point and destination.";
  if (!destination.trim() || (mode !== "hotel" && !origin.trim()))
    return "Choose your departure point and destination.";
  if (
    mode !== "hotel" &&
    origin.trim().toLowerCase() === destination.trim().toLowerCase()
  )
    return "Your departure point and destination must be different.";
  if (!isCalendarDate(departureDate) || departureDate < today)
    return "Choose a departure date today or later.";
  if (mode === "hotel" || tripType === "return") {
    if (!isCalendarDate(returnDate) || returnDate < departureDate)
      return "Choose a return date on or after your departure.";
    if (mode === "hotel" && returnDate === departureDate)
      return "Check-out must be at least one day after check-in.";
  }
  if (
    ![adults, children, infants].every(Number.isInteger) ||
    adults < 1 ||
    children < 0 ||
    infants < 0 ||
    adults + children + infants > 9
  )
    return "Choose 1–9 travellers, including at least one adult.";
  if (infants > adults) return "Each infant must travel with an adult.";
  return "";
}
