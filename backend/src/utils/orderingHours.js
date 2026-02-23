const DEFAULT_TIME_ZONE = 'America/New_York';
const OPEN_HOUR = 11;
const COOP_CLOSE_HOUR = 19;
const DEFAULT_CLOSE_HOUR = 21;

function isCoop(restaurantName = '') {
  return restaurantName.trim().toLowerCase() === 'the coop';
}

function getOrderingHours(restaurantName) {
  return {
    openHour: OPEN_HOUR,
    closeHour: isCoop(restaurantName) ? COOP_CLOSE_HOUR : DEFAULT_CLOSE_HOUR
  };
}

function getCurrentMinutesInTimeZone(timeZone = DEFAULT_TIME_ZONE) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  const parts = formatter.formatToParts(new Date());
  const hour = Number(parts.find((part) => part.type === 'hour')?.value || '0');
  const minute = Number(parts.find((part) => part.type === 'minute')?.value || '0');
  return hour * 60 + minute;
}

function isWithinOrderingHours(restaurantName, timeZone = DEFAULT_TIME_ZONE) {
  const { openHour, closeHour } = getOrderingHours(restaurantName);
  const currentMinutes = getCurrentMinutesInTimeZone(timeZone);
  const openMinutes = openHour * 60;
  const closeMinutes = closeHour * 60;
  return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
}

function formatOrderingHours(restaurantName) {
  const { closeHour } = getOrderingHours(restaurantName);
  return `11:00 AM - ${closeHour === COOP_CLOSE_HOUR ? '7:00 PM' : '9:00 PM'} ET`;
}

module.exports = {
  DEFAULT_TIME_ZONE,
  getOrderingHours,
  isWithinOrderingHours,
  formatOrderingHours
};
