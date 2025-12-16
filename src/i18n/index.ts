import i18next from "i18next";
import Backend from "i18next-fs-backend";
import middleware from "i18next-http-middleware";
import path from "path";

i18next
    .use(Backend)
    .use(middleware.LanguageDetector)
    .init({
        fallbackLng: "en",
        preload: ["en", "sr"],
        ns: ["translation"],
        defaultNS: "translation",
        backend: {
            loadPath: path.resolve(process.cwd(), "locales/{{lng}}/translation.json"),
        },
        detection: {
            order: ["header", "querystring"],
            lookupHeader: "accept-language",
            lookupQuerystring: "lang"
        }
    });

export default i18next;
