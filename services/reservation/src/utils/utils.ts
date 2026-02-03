export function responseReservation(reservation: any) {
	const response = {
		id: reservation.id,
		status: reservation.status,
		slot: reservation.slot,
		sellerContactVisible: reservation.sellerContactVisible,
		message: "reservation.created_success"
	};

	return response;
}

export function parseHourMinute(val: number | string): { hour: number, minute: number } {
	if (typeof val === 'number') return { hour: val, minute: 0 };
	if (typeof val === 'string') {
		const [h, m] = val.split(':').map(Number);
		return { hour: h, minute: m || 0 };
	}
	return { hour: 0, minute: 0 };
}

export function toGmt3String(date: Date): string {
	const gmt3 = new Date(date.getTime() + 3 * 60 * 60 * 1000);
	const pad = (n: number) => n.toString().padStart(2, '0');
	const year = gmt3.getUTCFullYear();
	const month = pad(gmt3.getUTCMonth() + 1);
	const day = pad(gmt3.getUTCDate());
	const hour = pad(gmt3.getUTCHours());
	const min = pad(gmt3.getUTCMinutes());
	const sec = pad(gmt3.getUTCSeconds());
	return `${year}-${month}-${day}T${hour}:${min}:${sec}+03:00`;
}

export function generateSlotsForDay(dayDateUtc: Date, startTime: number, startMinute: number, endTime: number, endMinute: number, GMT_OFFSET: number): Date[] {
	const slots: Date[] = [];
	for (let hour = startTime; hour <= endTime; hour++) {
		for (let minute = (hour === startTime ? startMinute : 0); minute < 60; minute += 30) {
			if (hour === endTime && minute >= endMinute) break;
			const slotUtc = new Date(Date.UTC(
				dayDateUtc.getUTCFullYear(),
				dayDateUtc.getUTCMonth(),
				dayDateUtc.getUTCDate(),
				hour - GMT_OFFSET,
				minute,
				0,
				0
			));
			slots.push(slotUtc);
		}
	}
	return slots;
}