import { CountryDto } from "../models/dto_models/country_dto";

function getCountryDto(country: any, lang: string): CountryDto {
    return {
        id: country.id,
        name: lang == "en" ? country.displayNameEn : country.displayNameSr,
        isoCode: country.isoCode,
        mcc: country.mcc

    }

}


export default {
    getCountryDto,
};