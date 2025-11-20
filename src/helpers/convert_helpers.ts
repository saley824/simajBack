import { CountryDto } from "../models/dto_models/country_dto";
import { CountryLightDto } from "../models/dto_models/country_light_dto";
import { RegionDto } from "../models/dto_models/region_dto";
import { RegionLightDto } from "../models/dto_models/region_light_dto";

function getCountryDto(country: any, lang: string): CountryDto {
    return {
        id: country.id,
        name: lang == "en" ? country.displayNameEn : country.displayNameSr,
        isoCode: country.isoCode,
        mcc: country.mcc,
        supportedRegions: country.supportedRegions.map((r: { region: any; }) => getRegionLightDto(r.region, lang)),
        keywords: country.keywords

    }

}
function getCountryLightDto(country: any, lang: string): CountryLightDto {
    return {
        id: country.id,
        name: lang == "en" ? country.displayNameEn : country.displayNameSr,
        isoCode: country.isoCode,
        mcc: country.mcc,
        keywords: country.keywords

    }

}
function getRegionDto(region: any, lang: string): RegionDto {
    console.log(region)
    return {
        id: region.id,
        name: lang == "en" ? region.displayNameEn : region.displayNameSr,
        code: region.code,
        keywords: region.keywords,
        supportedCountries: region.supportedCountries.map((c: { country: any; }) => getCountryLightDto(c.country, lang),),

    }

}
function getRegionLightDto(region: any, lang: string): RegionLightDto {
    console.log(region)
    return {
        id: region.id,
        name: lang == "en" ? region.displayNameEn : region.displayNameSr,
        code: region.code,
        keywords: region.keywords,

    }

}



export default {
    getCountryDto,
    getRegionDto
};