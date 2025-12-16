import i18next from "../i18n";
import i18nextMiddleware from "i18next-http-middleware";

export const i18nMiddleware =
    i18nextMiddleware.handle(i18next);
