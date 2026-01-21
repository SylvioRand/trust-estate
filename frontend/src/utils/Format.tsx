import i18n from "../i18n/i18n";

export function	CreateDateForMemberSince(data: string | undefined): string {
	if (data === undefined)
		return ("Error, data undefined");

	const	date = new Date(data);

	const	result = new Intl.DateTimeFormat(i18n.language, {
		month: "long",
		year: "numeric"
	}).format(date);

	return (result);
}

export function	CreateDateForPost(data: string): string {
	const	date = new Date(data);

	const	result = new Intl.DateTimeFormat(i18n.language, {
		day: "numeric",
		month: "long",
		year: "numeric"
	}).format(date);

	return (result);
}
