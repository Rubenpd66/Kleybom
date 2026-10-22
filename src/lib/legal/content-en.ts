// English translation of the legal texts. The Spanish version (content.ts) is the binding one.
import type { Bloque } from "@/lib/guides/content";
import type { TextoLegal } from "./content";
import { TITULAR as T } from "./titular";

const p = (texto: string): Bloque => ({ tipo: "p", texto });
const lista = (...items: string[]): Bloque => ({ tipo: "lista", items });
const TRADUCCION = p("This is a translation for information purposes. In case of doubt, the Spanish version prevails.");

export const AVISO_LEGAL_EN: TextoLegal = {
  slug: "aviso-legal",
  titulo: "Legal notice",
  resumen: "Who is behind KleyBom, terms of use and where the exercise and food data come from.",
  secciones: [
    {
      titulo: "Website owner",
      bloques: [
        TRADUCCION,
        p("In compliance with article 10 of Spanish Law 34/2002 on information society services and e-commerce (LSSI), these are the owner's details:"),
        lista(`Name: ${T.nombre}`, `Tax ID (NIF): ${T.nif}`, `Address: ${T.domicilio}`, `Contact email: ${T.correo}`),
      ],
    },
    {
      titulo: "What KleyBom is",
      bloques: [
        p("KleyBom is a free fitness and health website: exercise catalogue, routines, calendar, food database, food diary, workout log and statistics. It does not sell products or services, has no paid plans and shows no advertising."),
      ],
    },
    {
      titulo: "Health notice",
      bloques: [
        p("The information on KleyBom is general and does not replace a doctor, dietitian or trainer. The calculations (calories, macronutrients, estimated strength) are approximations. If you have an illness, are pregnant, take medication or haven't exercised for a long time, check with a health professional first."),
      ],
    },
    {
      titulo: "Terms of use",
      bloques: [
        lista(
          "You can use KleyBom free of charge for personal purposes.",
          "You may not try to access other people's data, overload the service by automated means or use it for illegal purposes.",
          "The owner may change, extend or stop offering features, and will try to give advance notice of important changes.",
          "The owner is not liable for damage resulting from using the information in a way other than described in the health notice.",
        ),
      ],
    },
    {
      titulo: "Data sources and licences",
      bloques: [
        lista(
          "Exercises: wger (wger.de), under Creative Commons BY-SA and CC0 licences. Each exercise page shows its author and licence; derived texts are shared under the same licence.",
          "Foods: USDA FoodData Central, SR Legacy (public domain, CC0). Spanish names translated by KleyBom.",
          "Packaged products: Open Food Facts (ODbL licence), queried live and linked to their product page.",
          "Photos of foods and recipes: Wikimedia Commons, under free licences; each page shows the author and licence.",
          "Guides, template routines and recipes: written by KleyBom, with their sources cited.",
        ),
        p("The design, code and original texts of KleyBom belong to its owner, except as indicated above."),
      ],
    },
    {
      titulo: "Applicable law",
      bloques: [p("This notice is governed by Spanish law. For any question or complaint you can write to the contact email.")],
    },
  ],
};

export const PRIVACIDAD_EN: TextoLegal = {
  slug: "privacidad",
  titulo: "Privacy policy",
  resumen: "What data KleyBom stores, what for, for how long and how to exercise your rights.",
  secciones: [
    {
      titulo: "Data controller",
      bloques: [TRADUCCION, lista(`${T.nombre} (NIF ${T.nif})`, `Address: ${T.domicilio}`, `Email: ${T.correo}`)],
    },
    {
      titulo: "What data we process",
      bloques: [
        lista(
          "Without an account: no personal data. KleyBom uses no analytics, advertising or tracking cookies.",
          "Account: email and password (stored encrypted, we never see it), and the date you accepted this policy.",
          "If you sign in with Google: Google sends us your email, your name and your profile picture. We don't receive your Google password or any other data from your account.",
          "Profile (optional): name, sex, date of birth, height and time zone.",
          "Health data you enter: weight and body measurements, meals, nutrition goals, workouts and sets. This is a special category of data (article 9 GDPR).",
          "Technical data: the hosting provider logs the IP address and time of each visit for security and operation.",
        ),
      ],
    },
    {
      titulo: "Purposes and legal basis",
      bloques: [
        lista(
          "Creating and maintaining your account and showing you your routines, calendar and diary: performance of the service you request (art. 6.1.b GDPR).",
          "Storing and showing you your health data and statistics: your explicit consent, given when you sign up (art. 9.2.a GDPR). You can withdraw it whenever you want by deleting that data or your account, without affecting what was done before.",
          "Security and abuse prevention (technical logs): legitimate interest (art. 6.1.f GDPR).",
        ),
        p("Your data is not sold, not shared with third parties for commercial purposes, and not used for advertising or for automated decisions that affect you."),
      ],
    },
    {
      titulo: "Who helps us provide the service",
      bloques: [
        lista(
          "Supabase (database, accounts and confirmation emails). Data is stored on servers in the European Union (Frankfurt, Germany).",
          "Vercel (website hosting). It may process technical data outside the European Economic Area with the safeguards required by the GDPR, such as the European Commission's standard contractual clauses.",
        ),
        p("Both act as data processors and only use the data to provide their service to KleyBom."),
        p("If you choose to sign in with Google, Google verifies your identity under its own privacy policy. It is optional: you can always use your email and a password."),
      ],
    },
    {
      titulo: "How long we keep it",
      bloques: [
        p("For as long as you keep your account. You can delete any measurement, meal or workout at any time. If you delete your account from your profile, your account and all your data are deleted immediately. The provider's backups are overwritten in their usual cycle."),
      ],
    },
    {
      titulo: "Your rights",
      bloques: [
        p("You can exercise the rights of access, rectification, erasure, objection, restriction of processing and portability:"),
        lista(
          "On the website: edit your profile, delete individual entries, download all your data as JSON from your dashboard or delete your account.",
          `By email: write to ${T.correo} from your account's email address. We will reply within one month at most.`,
          "If you think we haven't handled your request properly, you can complain to the Spanish Data Protection Agency (www.aepd.es).",
        ),
      ],
    },
    {
      titulo: "Minimum age",
      bloques: [
        p("To create an account you must be 14 or older (article 7 of Spanish Organic Law 3/2018). The nutrition calculations are designed for adults."),
      ],
    },
    {
      titulo: "Security",
      bloques: [
        p("The connection is encrypted (HTTPS) and the database only lets each person read and change their own data. If we detect a security breach affecting your data, we will tell you and report it to the supervisory authority when the law requires it."),
      ],
    },
  ],
};

export const COOKIES_EN: TextoLegal = {
  slug: "cookies",
  titulo: "Cookie policy",
  resumen: "KleyBom only uses the technical cookies needed to keep you signed in and remember your language.",
  secciones: [
    {
      titulo: "Which cookies we use",
      bloques: [
        TRADUCCION,
        p("KleyBom only uses technical cookies, needed so you can sign in to your account and to remember the language you choose. It uses no analytics, advertising or social media cookies, and there is no third-party content that sets them."),
        lista(
          "sb-…-auth-token (first-party, from Supabase): keeps you signed in. It is deleted when you sign out or when the session expires.",
          "idioma (first-party): remembers the language you choose (Spanish or English). It is only created if you change the language and lasts one year.",
        ),
        p("Fonts are served from our own server, so your browser does not connect to Google Fonts."),
      ],
    },
    {
      titulo: "Why there is no cookie banner",
      bloques: [
        p("Technical cookies needed to provide a service you request, such as keeping you signed in or remembering the language you chose, are exempt from consent (article 22.2 of the Spanish LSSI). That's why we don't ask for permission; we only inform you. If we ever add non-technical cookies, we will ask for your consent before setting them."),
      ],
    },
    {
      titulo: "How to delete them",
      bloques: [p("You can delete or block cookies in your browser settings. If you block the session cookie, you can still browse exercises, foods, recipes and guides, but you won't be able to sign in.")],
    },
  ],
};
