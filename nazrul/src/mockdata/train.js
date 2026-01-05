import kliaexpress from "../img/assets/train/images (10).png";
import kliaexpress1 from "../img/assets/train/2021_Rapidkl-Featured-Image-pulse_Square.jpg";
import kliaexpress2 from "../img/assets/train/KTMB_Official_Logo.jpg";
import kliaexpress3 from "../img/assets/train/images.jpg";

export const mockTrainData = {
  route: [
    {
      Image: kliaexpress,
      LineID: "ERL",
      Line: "KLIA Ekspres",
      Remark: "",
      Status: "Normal Service",
      price: 25,
      departureTime: "09:00",
      arrivalTime: "10:30",
      travelTime: "1 hr 27 min",
      route: [
        [2.747800, 101.681173],  // Start
        [2.848686, 101.658663],
        [2.830379, 101.660147],  // Mid-point
        [2.923758, 101.604621],  // Mid-point
        [2.931606, 101.624918,],
        [2.944057, 101.632537],
        [2.944764, 101.650862],
        [2.946930, 101.651617],
        [2.971363, 101.667599],
        [2.981492, 101.682441],
        [3.07611, 101.71056 ],  // Terminal Bersepadu Selatan
      ],
      stops: [
        [2.830379, 101.660147],  // Stop 1 
        [2.971363, 101.667599],  // Stop 2 
      ],
    },
    {
      Image: kliaexpress,
      LineID: "ERL",
      Line: "KLIA Ekspres",
      Remark: "",
      Status: "Normal Service",
      price: 35,
      departureTime: "11.00",
      arrivalTime: "12.45",
      travelTime: "1 hr 30 min",
      route: [
        [2.7441,101.6856],  // Start
        [2.82556, 101.71306],  // Mid-point
        [2.908222, 101.660083],  // Mid-point
        [3.07611, 101.71056 ],  // Terminal Bersepadu Selatan
      ],
      stops: [
        [2.908222, 101.660083],  // Stop 1 
        [2.82556, 101.71306],  // Stop 2 
      ],
    },
    {
      Image: kliaexpress,
      LineID: "ERL",
      Line: "KLIA Ekspres",
      Remark: "",
      Status: "Normal Service",
      price: 35,
      departureTime: "13.00",
      arrivalTime: "14.40",
      travelTime: "1 hr 30 min",
      route: [
        [2.7441,101.6856],  // Start
        [2.82556, 101.71306],  // Mid-point
        [2.908222, 101.660083],  // Mid-point
        [3.07611, 101.71056 ],  // Terminal Bersepadu Selatan
      ],
      stops: [
        [2.908222, 101.660083],  // Stop 1 
        [2.82556, 101.71306],  // Stop 2 
      ],
    },
    {
      Image: kliaexpress,
      LineID: "ERL",
      Line: "KLIA Ekspres",
      Remark: "",
      Status: "Normal Service",
      price: 35,
      departureTime: "15:00",
      arrivalTime: "16:45",
      travelTime: "1 hr 30 min",
      route: [
        [2.7441,101.6856],  // Start
        [2.82556, 101.71306],  // Mid-point
        [2.908222, 101.660083],  // Mid-point
        [3.07611, 101.71056 ],  // Terminal Bersepadu Selatan
      ],
      stops: [
        [2.908222, 101.660083],  // Stop 1 
        [2.82556, 101.71306],  // Stop 2 
      ],
    },
  ],
};
