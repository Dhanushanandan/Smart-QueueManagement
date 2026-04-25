
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';

const DEFAULT_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM',
  '11:30 AM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM',
];

function getTargetDate(date) {
  if (date) return date;
  const target = new Date();
  target.setDate(target.getDate() + 1);
  return target.toISOString().split('T')[0];
}

function buildSlots(date) {
  return DEFAULT_SLOTS.map((time) => ({
    date,
    time,
    fullSlot: `${date} ${time}`,
  }));
}

function normalizeBookings(bookings = []) {
  return bookings
    .filter(Boolean)
    .map((booking) => ({
      fullSlot: booking?.appointmentInfo?.timeslot || booking?.timeslot || '',
      serviceType: (booking?.serviceType || booking?.service || '').toLowerCase(),
      status: booking?.appointmentInfo?.status || booking?.status || '',
    }))
    .filter((booking) => booking.fullSlot);
}

async function recommendTimeSlot({ serviceType, bookings = [], date }) {
  const targetDate = getTargetDate(date);
  const response = await fetch(`${AI_SERVICE_URL}/recommend-timeslot`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_type: serviceType,
      slots: buildSlots(targetDate),
      existing_bookings: normalizeBookings(bookings),
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`AI service error: ${response.status} ${message}`);
  }

  const result = await response.json();
  return {
    recommended: result.recommended || null,
    allSlots: result.allSlots || [],
  };
}

module.exports = {
  recommendTimeSlot,
  buildSlots,
  normalizeBookings,
};
