import { CountryDto } from "../models/dto_models/country_dto";
import { RegionDto } from "../models/dto_models/region_dto";

function getCountryDto(country: any, lang: string): CountryDto {
    return {
        id: country.id,
        name: lang == "en" ? country.displayNameEn : country.displayNameSr,
        isoCode: country.isoCode,
        mcc: country.mcc,
        supportedRegions: country.supportedRegions.map((r: { region: any; }) => getRegionDto(r.region, lang))

    }

}
function getRegionDto(region: any, lang: string): RegionDto {
    console.log(region)
    return {
        id: region.id,
        name: lang == "en" ? region.displayNameEn : region.displayNameSr,
        code: region.code,
        supportedCountries: region.supportedCountries.map((c: { country: any; }) => getCountryDto(c.country, lang))


    }

}



export default {
    getCountryDto,
    getRegionDto
};