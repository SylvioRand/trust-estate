import zoneObject from "../../../shared/zones.json"
import type { InputEnumData } from "../components/InputEnum"

interface Zone {
    id: string;
    displayName: string;
}

export const ZONE_ENUM: InputEnumData[] = (zoneObject.zones as Zone[]).map((zone: Zone) => ({
    value: zone.displayName,
    title: zone.displayName
}));
