const RouteSummary = ({ travelTime, arrivalTime }) => (
    <div className="route-summary">
      <h2>{travelTime}</h2>
      <p>Arrival time: {arrivalTime}</p>
    </div>
  );
  
  export default RouteSummary;
  