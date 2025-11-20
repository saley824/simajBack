import { RegionDto } from "./region_dto";
import { RegionLightDto } from "./region_light_dto";

export type CountryDto = {
    id: number;
    name: string;
    mcc: string;
    isoCode: string;
    keywords: string | null;
    supportedRegions: RegionLightDto[],

}
