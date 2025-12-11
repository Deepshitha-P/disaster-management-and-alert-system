import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: {
    translation: {
      welcome: "Welcome to RescueLink",
      login: "Login",
      register: "Register",
      dashboard: "Dashboard",
      sos: "Send SOS",
      logout: "Logout"
    }
  },
  hi: {
    translation: {
      welcome: "रेस्क्यू लिंक में आपका स्वागत है",
      login: "लॉगिन",
      register: "रजिस्टर",
      dashboard: "डैशबोर्ड",
      sos: "एसओएस भेजें",
      logout: "लॉगआउट"
    }
  }
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en",
    fallbackLng: "en",
    interpolation: { escapeValue: false }
  })

export default i18n
