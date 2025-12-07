import { CountryDto } from "./country_dto";

export type RegionLightDto = {
    id: number;
    name: string;
    code: string;
    startsFrom: number | null;
    keywords: string | null;

}
