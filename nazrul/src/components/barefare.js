function FareSummary({ baseFare, taxes, totalAmount }) {
  return (
    <div className="fare-summary">
      <h4>Fare Summary</h4>
      <p>Base fare: {baseFare}</p>
      <p>Taxes & fees: {taxes}</p>
      <p>Total amount: {totalAmount}</p>
    </div>
  );
}
