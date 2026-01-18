import zoneObject from "../../../shared/zones.json"
import type { InputEnumData } from "../components/InputEnum"

export const	ZONE_ENUM: InputEnumData[] = zoneObject.zones.map(zone => ({
	value: zone.id,
	title: zone.displayName
}));