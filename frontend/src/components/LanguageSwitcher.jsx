import { useTranslation } from 'react-i18next'

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()
  return (
    <select
      className="border rounded-lg px-2 py-1"
      value={i18n.language}
      onChange={(e) => i18n.changeLanguage(e.target.value)}
    >
      <option value="en">EN</option>
      <option value="hi">HI</option>
    </select>
  )
}
