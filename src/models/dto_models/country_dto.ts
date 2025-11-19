import { RegionDto } from "./region_dto";

export type CountryDto = {
    id: number;
    name: string;
    mcc: string;
    isoCode: string;
    supportedRegions: RegionDto[],

}
