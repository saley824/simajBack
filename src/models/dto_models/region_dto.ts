import { CountryLightDto } from "./country_light_dto";

export type RegionDto = {
    id: number;
    name: string;
    code: string;
    keywords: string | null;
    supportedCountries: CountryLightDto[],
}
