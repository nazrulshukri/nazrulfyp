const [totalAmount, setTotalAmount] = useState(baseFare + taxes);

const handleAddOnSelect = (addOnPrice) => {
  setTotalAmount(prevAmount => prevAmount + addOnPrice);
};
