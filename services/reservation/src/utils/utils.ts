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