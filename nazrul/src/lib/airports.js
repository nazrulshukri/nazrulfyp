// Major airports worldwide for the flight search. The first entries keep the
// exact `value` strings older pages and saved bookings already use.
// Row: [code, city, airport name, country, ISO country code, lat, lon, value?]
const ROWS = [
  // Popular (shown before the traveller types)
  ["KUL", "Kuala Lumpur", "Kuala Lumpur International", "Malaysia", "MY", 2.7456, 101.7099, "Kuala Lumpur International Airport (Malaysia)"],
  ["BKI", "Kota Kinabalu", "Kota Kinabalu International", "Malaysia", "MY", 5.9372, 116.0515, "Kota Kinabalu International Airport (Malaysia)"],
  ["LHR", "London", "Heathrow Airport", "United Kingdom", "GB", 51.47, -0.4543, "London Heathrow Airport (United Kingdom)"],
  ["HND", "Tokyo", "Haneda International", "Japan", "JP", 35.5494, 139.7798, "Haneda International Airport (Japan)"],
  ["DPS", "Bali", "Ngurah Rai International", "Indonesia", "ID", -8.7482, 115.1675, "Ngurah Rai International Airport (Bali)"],
  ["SIN", "Singapore", "Changi Airport", "Singapore", "SG", 1.3644, 103.9915, "Changi Airport (Singapore)"],
  ["BKK", "Bangkok", "Suvarnabhumi Airport", "Thailand", "TH", 13.69, 100.7501, "Bangkok Suvarnabhumi Airport (Thailand)"],
  ["CDG", "Paris", "Charles de Gaulle", "France", "FR", 49.0097, 2.5479, "Charles de Gaulle Airport (France)"],
  ["DXB", "Dubai", "Dubai International", "United Arab Emirates", "AE", 25.2532, 55.3657, "Dubai International Airport (United Arab Emirates)"],
  ["ICN", "Seoul", "Incheon International", "South Korea", "KR", 37.4602, 126.4407, "Incheon International Airport (South Korea)"],
  ["SYD", "Sydney", "Kingsford Smith Airport", "Australia", "AU", -33.9399, 151.1753, "Sydney Kingsford Smith Airport (Australia)"],
  ["PEN", "Penang", "Penang International", "Malaysia", "MY", 5.2971, 100.2769],
  ["LGK", "Langkawi", "Langkawi International", "Malaysia", "MY", 6.3297, 99.7287],
  ["KCH", "Kuching", "Kuching International", "Malaysia", "MY", 1.4847, 110.347],
  ["HKG", "Hong Kong", "Hong Kong International", "Hong Kong", "HK", 22.308, 113.9185],
  ["IST", "Istanbul", "Istanbul Airport", "Turkey", "TR", 41.2753, 28.7519],
  ["JFK", "New York", "John F. Kennedy International", "United States", "US", 40.6413, -73.7781],

  // Malaysia & Brunei
  ["SZB", "Kuala Lumpur", "Sultan Abdul Aziz Shah (Subang)", "Malaysia", "MY", 3.1306, 101.549],
  ["JHB", "Johor Bahru", "Senai International", "Malaysia", "MY", 1.6413, 103.6697],
  ["MKZ", "Melaka", "Melaka International", "Malaysia", "MY", 2.2634, 102.2516],
  ["IPH", "Ipoh", "Sultan Azlan Shah", "Malaysia", "MY", 4.5680, 101.0920],
  ["AOR", "Alor Setar", "Sultan Abdul Halim", "Malaysia", "MY", 6.1897, 100.3981],
  ["KBR", "Kota Bharu", "Sultan Ismail Petra", "Malaysia", "MY", 6.1669, 102.2928],
  ["KUA", "Kuantan", "Sultan Haji Ahmad Shah", "Malaysia", "MY", 3.7754, 103.2094],
  ["TGG", "Kuala Terengganu", "Sultan Mahmud", "Malaysia", "MY", 5.3826, 103.1034],
  ["SDK", "Sandakan", "Sandakan Airport", "Malaysia", "MY", 5.9009, 118.0592],
  ["TWU", "Tawau", "Tawau Airport", "Malaysia", "MY", 4.3133, 118.1219],
  ["MYY", "Miri", "Miri Airport", "Malaysia", "MY", 4.3220, 113.9869],
  ["SBW", "Sibu", "Sibu Airport", "Malaysia", "MY", 2.2616, 111.9853],
  ["BTU", "Bintulu", "Bintulu Airport", "Malaysia", "MY", 3.1239, 113.0203],
  ["BWN", "Bandar Seri Begawan", "Brunei International", "Brunei", "BN", 4.9442, 114.9284],

  // Southeast Asia
  ["CGK", "Jakarta", "Soekarno–Hatta International", "Indonesia", "ID", -6.1256, 106.6559],
  ["SUB", "Surabaya", "Juanda International", "Indonesia", "ID", -7.3798, 112.7869],
  ["KNO", "Medan", "Kualanamu International", "Indonesia", "ID", 3.6422, 98.8853],
  ["JOG", "Yogyakarta", "Yogyakarta International", "Indonesia", "ID", -7.9006, 110.0573],
  ["LOP", "Lombok", "Lombok International", "Indonesia", "ID", -8.7573, 116.2767],
  ["BTH", "Batam", "Hang Nadim International", "Indonesia", "ID", 1.1210, 104.1186],
  ["DMK", "Bangkok", "Don Mueang International", "Thailand", "TH", 13.9126, 100.6068],
  ["HKT", "Phuket", "Phuket International", "Thailand", "TH", 8.1132, 98.3169],
  ["CNX", "Chiang Mai", "Chiang Mai International", "Thailand", "TH", 18.7668, 98.9626],
  ["USM", "Koh Samui", "Samui International", "Thailand", "TH", 9.5478, 100.0623],
  ["HDY", "Hat Yai", "Hat Yai International", "Thailand", "TH", 6.9332, 100.3930],
  ["KBV", "Krabi", "Krabi International", "Thailand", "TH", 8.0991, 98.9862],
  ["SGN", "Ho Chi Minh City", "Tan Son Nhat International", "Vietnam", "VN", 10.8188, 106.6519],
  ["HAN", "Hanoi", "Noi Bai International", "Vietnam", "VN", 21.2212, 105.8072],
  ["DAD", "Da Nang", "Da Nang International", "Vietnam", "VN", 16.0439, 108.1994],
  ["PQC", "Phu Quoc", "Phu Quoc International", "Vietnam", "VN", 10.1698, 103.9931],
  ["MNL", "Manila", "Ninoy Aquino International", "Philippines", "PH", 14.5086, 121.0194],
  ["CEB", "Cebu", "Mactan–Cebu International", "Philippines", "PH", 10.3075, 123.9794],
  ["PNH", "Phnom Penh", "Techo International", "Cambodia", "KH", 11.5466, 104.8441],
  ["REP", "Siem Reap", "Siem Reap–Angkor International", "Cambodia", "KH", 13.3697, 104.2236],
  ["RGN", "Yangon", "Yangon International", "Myanmar", "MM", 16.9073, 96.1332],
  ["VTE", "Vientiane", "Wattay International", "Laos", "LA", 17.9883, 102.5633],

  // East Asia
  ["NRT", "Tokyo", "Narita International", "Japan", "JP", 35.772, 140.3929],
  ["KIX", "Osaka", "Kansai International", "Japan", "JP", 34.4347, 135.244],
  ["CTS", "Sapporo", "New Chitose Airport", "Japan", "JP", 42.7752, 141.6923],
  ["FUK", "Fukuoka", "Fukuoka Airport", "Japan", "JP", 33.5859, 130.4511],
  ["OKA", "Okinawa", "Naha Airport", "Japan", "JP", 26.1958, 127.6459],
  ["NGO", "Nagoya", "Chubu Centrair International", "Japan", "JP", 34.8584, 136.8054],
  ["GMP", "Seoul", "Gimpo International", "South Korea", "KR", 37.5583, 126.7906],
  ["PUS", "Busan", "Gimhae International", "South Korea", "KR", 35.1795, 128.9382],
  ["CJU", "Jeju", "Jeju International", "South Korea", "KR", 33.5113, 126.4930],
  ["PEK", "Beijing", "Beijing Capital International", "China", "CN", 40.0799, 116.6031],
  ["PKX", "Beijing", "Beijing Daxing International", "China", "CN", 39.5098, 116.4105],
  ["PVG", "Shanghai", "Pudong International", "China", "CN", 31.1443, 121.8083],
  ["CAN", "Guangzhou", "Baiyun International", "China", "CN", 23.3924, 113.2988],
  ["SZX", "Shenzhen", "Bao'an International", "China", "CN", 22.6393, 113.8107],
  ["CTU", "Chengdu", "Tianfu International", "China", "CN", 30.3125, 104.4441],
  ["XMN", "Xiamen", "Gaoqi International", "China", "CN", 24.5440, 118.1277],
  ["KMG", "Kunming", "Changshui International", "China", "CN", 25.1019, 102.9292],
  ["MFM", "Macau", "Macau International", "Macau", "MO", 22.1496, 113.5915],
  ["TPE", "Taipei", "Taoyuan International", "Taiwan", "TW", 25.0797, 121.2342],

  // South Asia
  ["DEL", "Delhi", "Indira Gandhi International", "India", "IN", 28.5562, 77.1],
  ["BOM", "Mumbai", "Chhatrapati Shivaji Maharaj International", "India", "IN", 19.0896, 72.8656],
  ["BLR", "Bengaluru", "Kempegowda International", "India", "IN", 13.1986, 77.7066],
  ["MAA", "Chennai", "Chennai International", "India", "IN", 12.9941, 80.1709],
  ["HYD", "Hyderabad", "Rajiv Gandhi International", "India", "IN", 17.2403, 78.4294],
  ["CCU", "Kolkata", "Netaji Subhas Chandra Bose International", "India", "IN", 22.6547, 88.4467],
  ["COK", "Kochi", "Cochin International", "India", "IN", 10.152, 76.4019],
  ["TRZ", "Tiruchirappalli", "Tiruchirappalli International", "India", "IN", 10.7654, 78.7097],
  ["CMB", "Colombo", "Bandaranaike International", "Sri Lanka", "LK", 7.1808, 79.8841],
  ["MLE", "Malé", "Velana International", "Maldives", "MV", 4.1918, 73.5291],
  ["DAC", "Dhaka", "Hazrat Shahjalal International", "Bangladesh", "BD", 23.8433, 90.3978],
  ["KTM", "Kathmandu", "Tribhuvan International", "Nepal", "NP", 27.6966, 85.3591],
  ["ISB", "Islamabad", "Islamabad International", "Pakistan", "PK", 33.5491, 72.8256],
  ["LHE", "Lahore", "Allama Iqbal International", "Pakistan", "PK", 31.5216, 74.4036],
  ["KHI", "Karachi", "Jinnah International", "Pakistan", "PK", 24.9065, 67.1608],

  // Middle East
  ["AUH", "Abu Dhabi", "Zayed International", "United Arab Emirates", "AE", 24.433, 54.6511],
  ["DOH", "Doha", "Hamad International", "Qatar", "QA", 25.2731, 51.6081],
  ["JED", "Jeddah", "King Abdulaziz International", "Saudi Arabia", "SA", 21.6796, 39.1565],
  ["MED", "Madinah", "Prince Mohammad bin Abdulaziz", "Saudi Arabia", "SA", 24.5534, 39.7051],
  ["RUH", "Riyadh", "King Khalid International", "Saudi Arabia", "SA", 24.9576, 46.6988],
  ["MCT", "Muscat", "Muscat International", "Oman", "OM", 23.5933, 58.2844],
  ["BAH", "Manama", "Bahrain International", "Bahrain", "BH", 26.2708, 50.6336],
  ["KWI", "Kuwait City", "Kuwait International", "Kuwait", "KW", 29.2266, 47.9689],
  ["AMM", "Amman", "Queen Alia International", "Jordan", "JO", 31.7226, 35.9932],
  ["TLV", "Tel Aviv", "Ben Gurion Airport", "Israel", "IL", 32.0055, 34.8854],

  // Europe
  ["LGW", "London", "Gatwick Airport", "United Kingdom", "GB", 51.1537, -0.1821],
  ["MAN", "Manchester", "Manchester Airport", "United Kingdom", "GB", 53.365, -2.2728],
  ["EDI", "Edinburgh", "Edinburgh Airport", "United Kingdom", "GB", 55.95, -3.3725],
  ["DUB", "Dublin", "Dublin Airport", "Ireland", "IE", 53.4264, -6.2499],
  ["AMS", "Amsterdam", "Schiphol Airport", "Netherlands", "NL", 52.3105, 4.7683],
  ["BRU", "Brussels", "Brussels Airport", "Belgium", "BE", 50.901, 4.4844],
  ["FRA", "Frankfurt", "Frankfurt Airport", "Germany", "DE", 50.0379, 8.5622],
  ["MUC", "Munich", "Munich Airport", "Germany", "DE", 48.3537, 11.775],
  ["BER", "Berlin", "Berlin Brandenburg", "Germany", "DE", 52.3667, 13.5033],
  ["ZRH", "Zurich", "Zurich Airport", "Switzerland", "CH", 47.4582, 8.5555],
  ["GVA", "Geneva", "Geneva Airport", "Switzerland", "CH", 46.2381, 6.1089],
  ["VIE", "Vienna", "Vienna International", "Austria", "AT", 48.1103, 16.5697],
  ["PRG", "Prague", "Václav Havel Airport", "Czech Republic", "CZ", 50.1008, 14.26],
  ["BUD", "Budapest", "Ferenc Liszt International", "Hungary", "HU", 47.4298, 19.2611],
  ["WAW", "Warsaw", "Chopin Airport", "Poland", "PL", 52.1657, 20.9671],
  ["CPH", "Copenhagen", "Copenhagen Airport", "Denmark", "DK", 55.618, 12.656],
  ["ARN", "Stockholm", "Arlanda Airport", "Sweden", "SE", 59.6498, 17.9238],
  ["OSL", "Oslo", "Gardermoen Airport", "Norway", "NO", 60.1976, 11.1004],
  ["HEL", "Helsinki", "Helsinki Airport", "Finland", "FI", 60.3172, 24.9633],
  ["KEF", "Reykjavík", "Keflavík International", "Iceland", "IS", 63.985, -22.6056],
  ["ORY", "Paris", "Orly Airport", "France", "FR", 48.7262, 2.3652],
  ["NCE", "Nice", "Côte d'Azur Airport", "France", "FR", 43.6584, 7.2159],
  ["MAD", "Madrid", "Adolfo Suárez Madrid–Barajas", "Spain", "ES", 40.4983, -3.5676],
  ["BCN", "Barcelona", "Josep Tarradellas El Prat", "Spain", "ES", 41.2974, 2.0833],
  ["LIS", "Lisbon", "Humberto Delgado Airport", "Portugal", "PT", 38.7742, -9.1342],
  ["FCO", "Rome", "Leonardo da Vinci–Fiumicino", "Italy", "IT", 41.8003, 12.2389],
  ["MXP", "Milan", "Malpensa Airport", "Italy", "IT", 45.6306, 8.7281],
  ["VCE", "Venice", "Marco Polo Airport", "Italy", "IT", 45.5053, 12.3519],
  ["ATH", "Athens", "Athens International", "Greece", "GR", 37.9364, 23.9445],
  ["JTR", "Santorini", "Santorini (Thira) Airport", "Greece", "GR", 36.3992, 25.4793],
  ["SAW", "Istanbul", "Sabiha Gökçen International", "Turkey", "TR", 40.8986, 29.3092],
  ["AYT", "Antalya", "Antalya Airport", "Turkey", "TR", 36.8987, 30.8005],

  // Africa
  ["CAI", "Cairo", "Cairo International", "Egypt", "EG", 30.1219, 31.4056],
  ["CMN", "Casablanca", "Mohammed V International", "Morocco", "MA", 33.3675, -7.5898],
  ["RAK", "Marrakesh", "Marrakesh Menara", "Morocco", "MA", 31.6069, -8.0363],
  ["ADD", "Addis Ababa", "Bole International", "Ethiopia", "ET", 8.9779, 38.7993],
  ["NBO", "Nairobi", "Jomo Kenyatta International", "Kenya", "KE", -1.3192, 36.9278],
  ["JNB", "Johannesburg", "O. R. Tambo International", "South Africa", "ZA", -26.1392, 28.246],
  ["CPT", "Cape Town", "Cape Town International", "South Africa", "ZA", -33.9715, 18.6021],
  ["LOS", "Lagos", "Murtala Muhammed International", "Nigeria", "NG", 6.5774, 3.3212],
  ["MRU", "Mauritius", "Sir Seewoosagur Ramgoolam International", "Mauritius", "MU", -20.4302, 57.6836],
  ["SEZ", "Mahé", "Seychelles International", "Seychelles", "SC", -4.6743, 55.5218],
  ["ZNZ", "Zanzibar", "Abeid Amani Karume International", "Tanzania", "TZ", -6.222, 39.2249],

  // Oceania
  ["MEL", "Melbourne", "Melbourne Airport", "Australia", "AU", -37.669, 144.841],
  ["BNE", "Brisbane", "Brisbane Airport", "Australia", "AU", -27.3842, 153.1175],
  ["PER", "Perth", "Perth Airport", "Australia", "AU", -31.9385, 115.9672],
  ["ADL", "Adelaide", "Adelaide Airport", "Australia", "AU", -34.945, 138.5306],
  ["OOL", "Gold Coast", "Gold Coast Airport", "Australia", "AU", -28.1644, 153.5047],
  ["CNS", "Cairns", "Cairns Airport", "Australia", "AU", -16.8858, 145.7552],
  ["DRW", "Darwin", "Darwin International", "Australia", "AU", -12.4147, 130.8763],
  ["AKL", "Auckland", "Auckland Airport", "New Zealand", "NZ", -37.0082, 174.785],
  ["CHC", "Christchurch", "Christchurch Airport", "New Zealand", "NZ", -43.4894, 172.5322],
  ["ZQN", "Queenstown", "Queenstown Airport", "New Zealand", "NZ", -45.0211, 168.7392],
  ["NAN", "Nadi", "Nadi International", "Fiji", "FJ", -17.7554, 177.4431],

  // Americas
  ["EWR", "New York", "Newark Liberty International", "United States", "US", 40.6895, -74.1745],
  ["LAX", "Los Angeles", "Los Angeles International", "United States", "US", 33.9416, -118.4085],
  ["SFO", "San Francisco", "San Francisco International", "United States", "US", 37.6213, -122.379],
  ["SEA", "Seattle", "Seattle–Tacoma International", "United States", "US", 47.4502, -122.3088],
  ["ORD", "Chicago", "O'Hare International", "United States", "US", 41.9742, -87.9073],
  ["ATL", "Atlanta", "Hartsfield–Jackson International", "United States", "US", 33.6407, -84.4277],
  ["DFW", "Dallas", "Dallas Fort Worth International", "United States", "US", 32.8998, -97.0403],
  ["IAD", "Washington", "Dulles International", "United States", "US", 38.9531, -77.4565],
  ["BOS", "Boston", "Logan International", "United States", "US", 42.3656, -71.0096],
  ["MIA", "Miami", "Miami International", "United States", "US", 25.7959, -80.287],
  ["LAS", "Las Vegas", "Harry Reid International", "United States", "US", 36.084, -115.1537],
  ["HNL", "Honolulu", "Daniel K. Inouye International", "United States", "US", 21.3245, -157.9251],
  ["YYZ", "Toronto", "Pearson International", "Canada", "CA", 43.6777, -79.6248],
  ["YVR", "Vancouver", "Vancouver International", "Canada", "CA", 49.1967, -123.1815],
  ["YUL", "Montreal", "Trudeau International", "Canada", "CA", 45.4706, -73.7408],
  ["MEX", "Mexico City", "Benito Juárez International", "Mexico", "MX", 19.4361, -99.0719],
  ["CUN", "Cancún", "Cancún International", "Mexico", "MX", 21.0365, -86.8771],
  ["GRU", "São Paulo", "Guarulhos International", "Brazil", "BR", -23.4356, -46.4731],
  ["GIG", "Rio de Janeiro", "Galeão International", "Brazil", "BR", -22.809, -43.2506],
  ["EZE", "Buenos Aires", "Ministro Pistarini International", "Argentina", "AR", -34.8222, -58.5358],
  ["SCL", "Santiago", "Arturo Merino Benítez International", "Chile", "CL", -33.393, -70.7858],
  ["LIM", "Lima", "Jorge Chávez International", "Peru", "PE", -12.0219, -77.1143],
  ["BOG", "Bogotá", "El Dorado International", "Colombia", "CO", 4.7016, -74.1469],
];

const POPULAR_COUNT = 17;

const flagFor = (iso) =>
  String.fromCodePoint(...[...iso.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));

export const WORLD_AIRPORTS = ROWS.map(([code, city, name, country, iso, lat, lon, value], i) => ({
  value: value || `${name} (${city}, ${country})`,
  code,
  city,
  name,
  country,
  flag: flagFor(iso),
  lat,
  lon,
  popular: i < POPULAR_COUNT,
}));

const byValue = new Map(WORLD_AIRPORTS.map((a) => [a.value, a]));
export const findAirport = (value) => byValue.get(value) || null;

/** Great-circle distance in km between two airports (or null if unknown). */
export function distanceKm(fromValue, toValue) {
  const a = findAirport(fromValue);
  const b = findAirport(toValue);
  if (!a || !b) return null;
  const rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return Math.round(2 * 6371 * Math.asin(Math.sqrt(h)));
}

// The sample timetables were written for Kuala Lumpur → London (about
// 10,550 km). Scale each flight's time and fare to the chosen route.
const BASE_KM = 10550;
const SHORT_HAUL = ["Malaysia Airlines", "Singapore Airlines", "Cathay Pacific", "Korean Air", "All Nippon Airways"];

export function fitFlightsToRoute(flights, origin, destination) {
  const km = distanceKm(origin, destination);
  if (!km || !flights.length) return flights;
  const cruiseHours = km / 800 + 0.75; // plus taxi, climb and descent
  const baseHours = Math.min(...flights.map((f) => hoursBetween(f)));
  const fareFactor = Math.min(1.7, 0.1 + 0.9 * (km / BASE_KM));
  const list = km < 2500 ? flights.filter((f) => SHORT_HAUL.includes(f.airline)) : flights;
  return (list.length >= 3 ? list : flights).map((f) => {
    // Keep each airline's extra time (stops, longer routings) in proportion.
    const extra = (hoursBetween(f) - baseHours) * Math.min(1, km / BASE_KM);
    const minutes = Math.max(45, Math.round(((cruiseHours + extra) * 60) / 5) * 5);
    const depart = new Date(`${f.departure}Z`);
    const arrival = new Date(depart.getTime() + minutes * 60000).toISOString().slice(0, 19);
    const price = Math.max(129, Math.round((f.price * fareFactor) / 10) * 10 - 1);
    return { ...f, arrival, price, nonStop: km < 2500 ? true : f.nonStop };
  });
}

function hoursBetween(f) {
  return (new Date(`${f.arrival}Z`) - new Date(`${f.departure}Z`)) / 3600000;
}

const byCode = new Map(WORLD_AIRPORTS.map((a) => [a.code, a]));
export const airportByCode = (code) => byCode.get(code) || null;

/** "13h 20m" style estimate of a direct flight between two airports. */
export function flightTimeLabel(fromValue, toValue) {
  const km = distanceKm(fromValue, toValue);
  if (!km) return "";
  const minutes = Math.round(((km / 800 + 0.75) * 60) / 5) * 5;
  return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, "0")}m`;
}
