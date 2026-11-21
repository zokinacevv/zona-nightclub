"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Language = "en" | "mk";

const translations: Record<string, string> = {
  Home: "Почетна",
  About: "За нас",
  Gallery: "Галерија",
  Reservations: "Резервации",
  Shop: "Продавница",
  Contact: "Контакт",
  "RESERVE NOW": "РЕЗЕРВИРАЈ",
  "Reserve now": "Резервирај",
  "Discover ZONA": "Откриј ја ZONA",
  "After dark": "По стемнување",
  "Your night starts here.": "Твојата ноќ започнува тука.",
  "Scroll to enter": "Скролувај за да влезеш",
  "The ZONA story": "Приказната на ZONA",
  "This is not a club.": "Ова не е клуб.",
  "It is a moment.": "Ова е момент.",
  "It is a ": "Ова е ",
  "moment.": "момент.",
  "ZONA brings together sound, light, and the people who know how to make a night last. Come early for the atmosphere. Stay late for what happens when the lights disappear.": "ZONA ги спојува звукот, светлото и луѓето кои знаат како да ја продолжат ноќта. Дојди рано за атмосферата. Остани до доцна за она што се случува кога светлата ќе се изгасат.",
  "A private club for great music, late conversations, and nights that are only getting started.": "Приватен клуб за одлична музика, доцни разговори и ноќи што допрва започнуваат.",
  Sound: "Звук",
  Energy: "Енергија",
  Drinks: "Пијалаци",
  "Set the mood": "Создај атмосфера",
  "Bring your people": "Донеси ги своите луѓе",
  "Raise your glass": "Наздрави",
  Light: "Светло",
  People: "Луѓе",
  Capacity: "Капацитет",
  Location: "Локација",
  Since: "Од",
  "Live venue layout": "Мапа на просторот",
  "DJ stage": "DJ бина",
  "pro sound": "професионален звук",
  Bar: "Бар",
  "VIP lounge": "VIP салон",
  "the big booth": "големиот сепаре",
  "Stage booth 01": "Сепаре 01",
  "Stage booth 02": "Сепаре 02",
  "Main floor": "Главен подиум",
  "professional lighting / sound": "професионално светло / звук",
  "Sound · light · after-hours": "Звук · светло · по полноќ",
  "Captured at ZONA": "Снимено во ZONA",
  "No two nights": "Ниту една ноќ",
  "look the same.": "не е иста.",
  "look the ": "не изгледа",
  "same.": "исто.",
  "A glimpse into the energy, the shadows, and the people who make the night move.": "Поглед во енергијата, сенките и луѓето што ја движат ноќта.",
  "Make the night": "Направи ја ноќта",
  yours: "своја.",
  "Choose your date, pick a time, and we’ll take care of the rest.": "Избери датум, одбери време, а ние ќе се погрижиме за останатото.",
  "Choose duration": "Избери времетраење",
  "Choose a date": "Избери датум",
  "Choose start time": "Избери почетно време",
  "Loading times…": "Се вчитуваат термините…",
  "Loading dates…": "Се вчитуваат датумите…",
  "Available times could not be loaded.": "Термините не можеа да се вчитаат.",
  "Choose an available start time.": "Избери достапно почетно време.",
  "Please accept the terms of use before continuing.": "Прифати ги условите за користење пред да продолжиш.",
  "Reservation could not be completed.": "Резервацијата не може да се заврши.",
  "Reservation received": "Резервацијата е примена",
  "Reservation request received.": "Барањето за резервација е примено.",
  "Estimated price:": "Проценета цена:",
  "We will send confirmation details to your email.": "Деталите за потврда ќе ги испратиме на твојот email.",
  "If you cancel less than 7 days before the reservation, 50% of the reservation price is payable.": "Ако откажеш помалку од 7 дена пред резервацијата, се плаќа 50% од цената.",
  "Name & Surname": "Име и презиме",
  Email: "Email",
  "Phone number": "Телефонски број",
  "Number of guests": "Број на гости",
  "What should we know about your reservation? (optional)": "Што треба да знаеме за резервацијата? (опционално)",
  "Reserving…": "Се резервира…",
  "Current photo": "Тековна фотографија",
  "Show photo": "Прикажи фотографија",
  Hoodie: "Дуксер",
  Hat: "Капа",
  "T-Shirt": "Маица",
  Socks: "Чорапи",
  Phone: "Телефон",
  Address: "Адреса",
  "Confirm reservation": "Потврди резервација",
  "I agree to": "Се согласувам со",
  "Terms of use": "Услови за користење",
  "The first ZONA collection is on its way.": "Првата ZONA колекција наскоро пристигнува.",
  "Wear the": "Носи го",
  "after-hours.": "по полноќ.",
  "Coming soon": "Наскоро",
  "Find ZONA": "Најди ја ZONA",
  "Open in Maps ↗": "Отвори во Maps ↗",
  "Opening hours": "Работно време",
  "Monday — Thursday": "Понеделник — четврток",
  "Friday — Sunday": "Петок — недела",
  "All nights reserved.": "Сите ноќи се резервирани.",
  "Cancel reservation": "Откажи резервација",
  "Use the button below to cancel the reservation connected to this private link.": "Кликни на копчето подолу за да ја откажеш резервацијата поврзана со овој приватен линк.",
  "Cancelling…": "Се откажува…",
};

type LanguageContextValue = { language: Language; setLanguage: (language: Language) => void; t: (value: string) => string };
const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const saved = window.localStorage.getItem("zona-language");
    if (saved === "en" || saved === "mk") setLanguageState(saved);
  }, []);

  function setLanguage(next: Language) {
    setLanguageState(next);
    window.localStorage.setItem("zona-language", next);
  }

  const value = useMemo(
    () => ({ language, setLanguage, t: (value: string) => language === "mk" ? translations[value] ?? value : value }),
    [language],
  );
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}
