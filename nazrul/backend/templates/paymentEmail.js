const escapeHtml = (value) => String(value ?? "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#039;");

const valueOrDash = (value) => {
  const normalized = value ?? "";
  return normalized === "" ? "-" : escapeHtml(normalized);
};

const formatMoney = (amount) => {
  const number = Number(amount);

  if (!Number.isFinite(number)) {
    return valueOrDash(amount);
  }

  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
  }).format(number);
};

const formatDateTime = (value) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return valueOrDash(value);
  }

  return new Intl.DateTimeFormat("en-MY", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const buildFlightRow = (label, flight) => `
  <tr>
    <td style="padding: 16px 0; border-bottom: 1px solid #e8edf5;">
      <p style="margin: 0 0 6px; color: #6b7280; font-size: 12px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase;">${label}</p>
      <p style="margin: 0; color: #111827; font-size: 16px; font-weight: 700;">${valueOrDash(flight?.airline)} ${valueOrDash(flight?.flightNumber)}</p>
      <p style="margin: 8px 0 0; color: #374151; font-size: 14px; line-height: 1.5;">
        ${valueOrDash(flight?.origin)} to ${valueOrDash(flight?.destination)}
      </p>
      <p style="margin: 4px 0 0; color: #6b7280; font-size: 13px; line-height: 1.5;">
        ${formatDateTime(flight?.departure)} - ${formatDateTime(flight?.arrival)}
      </p>
    </td>
  </tr>
`;

const buildPaymentEmail = ({
  bookingId,
  paymentMethod,
  amount,
  outboundFlight,
  returnFlight,
  passengerDetails,
  selectedSeats,
  selectedInsurance,
}) => {
  const customerName = passengerDetails?.lastName || passengerDetails?.firstName || "Customer";
  const seats = Array.isArray(selectedSeats) && selectedSeats.length > 0
    ? selectedSeats.map(valueOrDash).join(", ")
    : "-";
  const insurance = selectedInsurance?.name || "No insurance selected";

  return `
<!doctype html>
<html>
  <body style="margin: 0; padding: 0; background: #f3f6fb; font-family: Arial, Helvetica, sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: #f3f6fb; padding: 28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 680px; background: #ffffff; border: 1px solid #dbe4f0; border-radius: 14px; overflow: hidden;">
            <tr>
              <td style="background: #062c57; padding: 24px 28px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="vertical-align: middle;">
                      <img src="cid:malaysiaLogo" width="118" alt="BookingFlex" style="display: block; width: 118px; height: auto;" />
                    </td>
                    <td align="right" style="vertical-align: middle;">
                      <p style="margin: 0; color: #b8d7ff; font-size: 12px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase;">Payment confirmed</p>
                      <p style="margin: 6px 0 0; color: #ffffff; font-size: 20px; font-weight: 700;">Booking ${valueOrDash(bookingId)}</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding: 28px;">
                <p style="margin: 0 0 10px; color: #111827; font-size: 22px; font-weight: 700;">Your ticket is ready</p>
                <p style="margin: 0; color: #4b5563; font-size: 15px; line-height: 1.6;">
                  Hi ${valueOrDash(customerName)}, your payment has been received. We attached your boarding pass PDF to this email.
                </p>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top: 24px; background: #f8fafc; border: 1px solid #e5edf7; border-radius: 10px;">
                  <tr>
                    <td style="padding: 18px; width: 33.33%;">
                      <p style="margin: 0 0 6px; color: #64748b; font-size: 12px;">Amount paid</p>
                      <p style="margin: 0; color: #0f172a; font-size: 17px; font-weight: 700;">${formatMoney(amount)}</p>
                    </td>
                    <td style="padding: 18px; width: 33.33%; border-left: 1px solid #e5edf7;">
                      <p style="margin: 0 0 6px; color: #64748b; font-size: 12px;">Payment method</p>
                      <p style="margin: 0; color: #0f172a; font-size: 17px; font-weight: 700;">${valueOrDash(paymentMethod)}</p>
                    </td>
                    <td style="padding: 18px; width: 33.33%; border-left: 1px solid #e5edf7;">
                      <p style="margin: 0 0 6px; color: #64748b; font-size: 12px;">Seats</p>
                      <p style="margin: 0; color: #0f172a; font-size: 17px; font-weight: 700;">${seats}</p>
                    </td>
                  </tr>
                </table>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top: 22px;">
                  ${buildFlightRow("Outbound flight", outboundFlight)}
                  ${returnFlight ? buildFlightRow("Return flight", returnFlight) : ""}
                </table>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top: 22px; background: #ecfdf5; border: 1px solid #bbf7d0; border-radius: 10px;">
                  <tr>
                    <td style="padding: 16px 18px;">
                      <p style="margin: 0; color: #166534; font-size: 14px; line-height: 1.5;">
                        <strong>Insurance:</strong> ${valueOrDash(insurance)}
                      </p>
                    </td>
                  </tr>
                </table>

                <p style="margin: 24px 0 0; color: #4b5563; font-size: 14px; line-height: 1.6;">
                  Please keep the attached PDF available during check-in. For support, contact BookingFlex at Bookingflex@flex.com.my or (+60)011-6100-7484.
                </p>
              </td>
            </tr>

            <tr>
              <td style="background: #f8fafc; border-top: 1px solid #e5edf7; padding: 18px 28px;">
                <p style="margin: 0; color: #64748b; font-size: 12px; line-height: 1.5;">
                  This is an automated confirmation from BookingFlex. Your booking reference is ${valueOrDash(bookingId)}.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};

const buildPaymentEmailText = ({
  bookingId,
  paymentMethod,
  amount,
  outboundFlight,
  returnFlight,
  passengerDetails,
  selectedSeats,
  selectedInsurance,
}) => {
  const customerName = passengerDetails?.lastName || passengerDetails?.firstName || "Customer";
  const seats = Array.isArray(selectedSeats) && selectedSeats.length > 0 ? selectedSeats.join(", ") : "-";
  const insurance = selectedInsurance?.name || "No insurance selected";

  return [
    `Hi ${customerName}, your payment has been confirmed.`,
    `Booking ID: ${bookingId || "-"}`,
    `Amount paid: ${formatMoney(amount)}`,
    `Payment method: ${paymentMethod || "-"}`,
    `Outbound: ${outboundFlight?.origin || "-"} to ${outboundFlight?.destination || "-"} (${outboundFlight?.flightNumber || "-"})`,
    returnFlight ? `Return: ${returnFlight.origin || "-"} to ${returnFlight.destination || "-"} (${returnFlight.flightNumber || "-"})` : "",
    `Seats: ${seats}`,
    `Insurance: ${insurance}`,
    "Your boarding pass PDF is attached.",
  ].filter(Boolean).join("\n");
};

module.exports = {
  buildPaymentEmail,
  buildPaymentEmailText,
};
