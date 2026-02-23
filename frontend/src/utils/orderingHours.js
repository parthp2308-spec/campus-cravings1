const ORDERING_TIME_ZONE = 'America/New_York';
const OPEN_HOUR = 11;
const COOP_CLOSE_HOUR = 19;
const DEFAULT_CLOSE_HOUR = 21;

function isCoop(restaurantName = '') {
  return restaurantName.trim().toLowerCase() === 'the coop';
}

export function getOrderingHours(restaurantName) {
  return {
    openHour: OPEN_HOUR,
    closeHour: isCoop(restaurantName) ? COOP_CLOSE_HOUR : DEFAULT_CLOSE_HOUR
  };
}

export function getOrderingHoursLabel(restaurantName) {
  return isCoop(restaurantName) ? '11:00 AM - 7:00 PM ET' : '11:00 AM - 9:00 PM ET';
}

function getCurrentMinutes() {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: ORDERING_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  const parts = formatter.formatToParts(new Date());
  const hour = Number(parts.find((part) => part.type === 'hour')?.value || '0');
  const minute = Number(parts.find((part) => part.type === 'minute')?.value || '0');
  return hour * 60 + minute;
}

export function isOrderingOpen(restaurantName) {
  const { openHour, closeHour } = getOrderingHours(restaurantName);
  const current = getCurrentMinutes();
  return current >= openHour * 60 && current <= closeHour * 60;
}
