const ALLOWED_DORM_CAMPUSES = [
  'North Campus',
  'Northwest Halls',
  'Werth Towers',
  'Towers Quad',
  'Alumni Quad',
  'Buckley/Shippee',
  'McMahon Hall',
  'East Campus'
];

function isAllowedDormCampus(campus) {
  return ALLOWED_DORM_CAMPUSES.includes(campus);
}

function buildDeliveryAddress({ campus, building, room }) {
  return `${campus} - ${building}, Room ${room}`;
}

module.exports = {
  ALLOWED_DORM_CAMPUSES,
  isAllowedDormCampus,
  buildDeliveryAddress
};
