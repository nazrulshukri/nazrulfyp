import { Modal, Button } from 'react-bootstrap';

function SeatSelectionModal({ show, onHide }) {
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Select Your Seat</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Render Seat map here */}
        <div className="seat-map">
          {/* Example of seat layout */}
          <div className="seat-row">
            <button className="seat">A1</button>
            <button className="seat">A2</button>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
