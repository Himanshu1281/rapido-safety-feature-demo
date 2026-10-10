// Mock data for the concept demo (Hyderabad: Madhapur -> Gachibowli)
export const PICKUP = { title: 'Inorbit Mall', sub: 'Madhapur, Hyderabad', lat: 17.4344, lng: 78.3867 };
export const DROP = { title: 'DLF Cyber City', sub: 'Gachibowli, Hyderabad', lat: 17.4486, lng: 78.3489 };

// Hand-drawn road-ish route between pickup and drop
export const ROUTE = [
  [17.4344, 78.3867], [17.4362, 78.3841], [17.4381, 78.3812], [17.4396, 78.3779], [17.4409, 78.3742],
  [17.4421, 78.3706], [17.4430, 78.3671], [17.4441, 78.3634], [17.4450, 78.3598], [17.4461, 78.3563],
  [17.4470, 78.3531], [17.4479, 78.3507], [17.4486, 78.3489],
].map(([latitude, longitude]) => ({ latitude, longitude }));

export const RECENTS = [
  { title: 'DLF Cyber City', sub: 'Gachibowli, Hyderabad' },
  { title: 'Hitech City Metro Station', sub: 'Madhapur, Hyderabad' },
  { title: 'Home', sub: 'Kondapur, Hyderabad' },
];

export const SERVICES = [
  { id: 'bike', label: 'Bike', icon: '🏍️' },
  { id: 'auto', label: 'Auto', icon: '🛺' },
  { id: 'cab', label: 'Cab', icon: '🚕' },
  { id: 'parcel', label: 'Parcel', icon: '📦' },
];

export const RIDE_OPTIONS = [
  { id: 'bike', name: 'Bike', icon: '🏍️', seats: 1, tag: 'FASTEST', eta: 2, drop: '4:07 pm', price: 38, was: 48 },
  { id: 'auto', name: 'Auto', icon: '🛺', seats: 3, eta: 2, drop: '4:14 pm', price: 79 },
  { id: 'cab', name: 'Cab Economy', icon: '🚕', seats: 4, desc: 'Affordable car rides', eta: 2, drop: '4:14 pm', price: 113 },
  { id: 'premium', name: 'Cab Premium', icon: '🚘', seats: 4, eta: 3, drop: '4:15 pm', price: 143 },
];

export const RIDER = {
  id: 'R-501', name: 'Dev', phone: '+91-98xxx-xxx01',
  emergencyContacts: [{ name: 'Mom', phone: '+91-98xxx-xxx22' }, { name: 'Roommate', phone: '+91-99xxx-xxx33' }],
};

export const CAPTAIN = {
  id: 'C-7781', name: 'Ravi Kumar', rating: 4.8, rides: '2,140', vehicle: 'TS 09 EK 4471', bike: 'Honda Shine · Black',
  safetyScore: 92, pin: '4827',
};
