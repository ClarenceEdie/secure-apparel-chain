"use client";

import { useState, useEffect, useCallback } from "react";

type Language = "en" | "zh" | "es" | "fr" | "de";

interface Translations {
  [key: string]: {
    [lang in Language]: string;
  };
}

const translations: Translations = {
  // Navigation
  "nav.home": {
    en: "Home",
    zh: "首页",
    es: "Inicio",
    fr: "Accueil",
    de: "Startseite",
  },
  "nav.connect": {
    en: "Connect Wallet",
    zh: "连接钱包",
    es: "Conectar Billetera",
    fr: "Connecter Portefeuille",
    de: "Wallet Verbinden",
  },

  // Form labels
  "form.yesterday": {
    en: "Yesterday's Production",
    zh: "昨天产量",
    es: "Producción de Ayer",
    fr: "Production d'Hier",
    de: "Gestrige Produktion",
  },
  "form.today": {
    en: "Today's Production",
    zh: "今天产量",
    es: "Producción de Hoy",
    fr: "Production d'Aujourd'hui",
    de: "Heutige Produktion",
  },
  "form.submit": {
    en: "Submit Production Data",
    zh: "提交生产数据",
    es: "Enviar Datos de Producción",
    fr: "Soumettre les Données de Production",
    de: "Produktionsdaten Einreichen",
  },

  // Results
  "result.delta": {
    en: "Production Delta",
    zh: "产量差异",
    es: "Delta de Producción",
    fr: "Delta de Production",
    de: "Produktionsdelta",
  },
  "result.increased": {
    en: "Today's production is {value} units higher than yesterday",
    zh: "今天产量比昨天高 {value} 单位",
    es: "La producción de hoy es {value} unidades mayor que ayer",
    fr: "La production d'aujourd'hui est supérieure de {value} unités à hier",
    de: "Die heutige Produktion ist {value} Einheiten höher als gestern",
  },
  "result.decreased": {
    en: "Today's production is {value} units lower than yesterday",
    zh: "今天产量比昨天低 {value} 单位",
    es: "La producción de hoy es {value} unidades menor que ayer",
    fr: "La production d'aujourd'hui est inférieure de {value} unités à hier",
    de: "Die heutige Produktion ist {value} Einheiten niedriger als gestern",
  },
  "result.stable": {
    en: "Today's production matches yesterday's level",
    zh: "今天产量与昨天持平",
    es: "La producción de hoy coincide con el nivel de ayer",
    fr: "La production d'aujourd'hui correspond au niveau d'hier",
    de: "Die heutige Produktion entspricht dem gestrigen Niveau",
  },

  // Errors
  "error.connection": {
    en: "Connection failed. Please try again.",
    zh: "连接失败，请重试。",
    es: "Error de conexión. Por favor, inténtalo de nuevo.",
    fr: "Échec de la connexion. Veuillez réessayer.",
    de: "Verbindung fehlgeschlagen. Bitte versuchen Sie es erneut.",
  },
  "error.validation": {
    en: "Please enter valid production values.",
    zh: "请输入有效的生产值。",
    es: "Por favor, ingrese valores de producción válidos.",
    fr: "Veuillez saisir des valeurs de production valides.",
    de: "Bitte geben Sie gültige Produktionswerte ein.",
  },

  // Status
  "status.loading": {
    en: "Loading...",
    zh: "加载中...",
    es: "Cargando...",
    fr: "Chargement...",
    de: "Laden...",
  },
  "status.processing": {
    en: "Processing...",
    zh: "处理中...",
    es: "Procesando...",
    fr: "Traitement...",
    de: "Verarbeitung...",
  },
};

export const useTranslation = () => {
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    // Load saved language preference
    const savedLang = localStorage.getItem("language") as Language;
    if (savedLang && Object.keys(translations["nav.home"]).includes(savedLang)) {
      setLanguage(savedLang);
    } else {
      // Detect browser language
      const browserLang = navigator.language.split("-")[0] as Language;
      if (Object.keys(translations["nav.home"]).includes(browserLang)) {
        setLanguage(browserLang);
      }
    }
  }, []);

  const t = useCallback((key: string, variables?: Record<string, string | number>) => {
    const translation = translations[key]?.[language] || translations[key]?.en || key;

    if (variables) {
      return Object.entries(variables).reduce((str, [varKey, value]) => {
        return str.replace(`{${varKey}}`, String(value));
      }, translation);
    }

    return translation;
  }, [language]);

  const changeLanguage = useCallback((newLanguage: Language) => {
    setLanguage(newLanguage);
    localStorage.setItem("language", newLanguage);
  }, []);

  const getAvailableLanguages = useCallback(() => {
    return Object.keys(translations["nav.home"]) as Language[];
  }, []);

  const getLanguageName = useCallback((lang: Language) => {
    const names = {
      en: "English",
      zh: "中文",
      es: "Español",
      fr: "Français",
      de: "Deutsch",
    };
    return names[lang] || lang;
  }, []);

  return {
    t,
    language,
    changeLanguage,
    availableLanguages: getAvailableLanguages(),
    getLanguageName,
  };
};

// Language selector component
export const LanguageSelector = () => {
  const { language, changeLanguage, availableLanguages, getLanguageName } = useTranslation();

  return (
    <select
      value={language}
      onChange={(e) => changeLanguage(e.target.value as Language)}
      className="px-3 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {availableLanguages.map((lang) => (
        <option key={lang} value={lang}>
          {getLanguageName(lang)}
        </option>
      ))}
    </select>
  );
};
