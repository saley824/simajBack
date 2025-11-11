import { CountryDto } from "./country_dto";

export type RegionDto = {
    id: number;
    name: string;
    code: string;
    supportedCountries: CountryDto[],
}
