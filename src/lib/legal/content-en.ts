// English translation of the legal texts. The Spanish version (content.ts) is the binding one.
// Like the Spanish texts, they adapt to what is active (advertising, donations).
import type { Bloque } from "@/lib/guides/content";
import type { Activos, TextoLegal } from "./content";
import { TITULAR as T } from "./titular";

const p = (texto: string): Bloque => ({ tipo: "p", texto });
const lista = (...items: string[]): Bloque => ({ tipo: "lista", items });
const si = <X,>(condicion: boolean, ...x: X[]): X[] => (condicion ? x : []);
const TRADUCCION = p("This is a translation for information purposes. In case of doubt, the Spanish version prevails.");

const FICHAS = "the public pages of guides, recipes, exercises, foods and routines";
const SIN_ANUNCIOS = "the home page, the lists, your personal area (dashboard, diary, calendar, workouts, statistics, measurements), sign-in and these legal texts";
const ENLACE_AJUSTES = "“Privacy and cookies”, in the footer of every page";

export function avisoLegalEn({ anuncios, donaciones }: Activos): TextoLegal {
  const financiacion =
    anuncios && donaciones
      ? " It is funded by Google AdSense advertising and voluntary donations."
      : anuncios
        ? " It is funded by Google AdSense advertising."
        : donaciones
          ? " It is funded by voluntary donations and shows no advertising."
          : " It shows no advertising.";
  return {
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
          p(
            "KleyBom is a free fitness and health website: exercise catalogue, routines, calendar, food database, food diary, workout log and statistics. It does not sell products or services and has no paid plans." +
              financiacion,
          ),
        ],
      },
      {
        titulo: "Health notice",
        bloques: [
          p("The information on KleyBom is general and does not replace a doctor, dietitian or trainer. The calculations (calories, macronutrients, estimated strength) are approximations. If you have an illness, are pregnant, take medication or haven't exercised for a long time, check with a health professional first."),
        ],
      },
      ...si(anuncios, {
        titulo: "Advertising",
        bloques: [
          p(`Ads appear only on ${FICHAS}, always labelled “Advertising”. Never on ${SIN_ANUNCIOS}.`),
          p("Ads are selected and served by Google. KleyBom does not choose the advertisers or endorse their products: an ad shown next to health content does not mean KleyBom recommends it. Before buying a health-related product, check with a professional."),
          p("KleyBom does not share your account data or your health data with Google or with advertisers."),
        ],
      }),
      ...si(donaciones, {
        titulo: "Donations",
        bloques: [
          lista(
            "Donations are voluntary and give access to nothing: everyone gets the same website, whether they donate or not.",
            "Payment is made on Stripe's page, which handles it. KleyBom never sees or stores your card details.",
            "KleyBom is not a non-profit organisation: donations are not tax-deductible and no donation receipts are issued.",
            "If you made a mistake when donating, write to the contact email as soon as possible with the date and amount.",
          ),
        ],
      }),
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
        titulo: "Contact and applicable law",
        bloques: [
          p("For any question or complaint, or to report illegal content or a security problem, write to the contact email; we will answer as soon as possible, in Spanish or English. This notice is governed by Spanish law."),
        ],
      },
    ],
  };
}

export function privacidadEn({ anuncios, donaciones }: Activos): TextoLegal {
  return {
    slug: "privacidad",
    titulo: "Privacy policy",
    resumen: "What data KleyBom keeps, what for, for how long and how to exercise your rights.",
    secciones: [
      {
        titulo: "Data controller",
        bloques: [TRADUCCION, lista(`${T.nombre} (NIF ${T.nif})`, `Address: ${T.domicilio}`, `Email: ${T.correo}`)],
      },
      {
        titulo: "What data we process",
        bloques: [
          lista(
            anuncios
              ? `Without an account: KleyBom keeps no personal data about you. It uses no analytics. On ${FICHAS}, Google may use cookies and device identifiers according to what you choose in the consent notice (see “Advertising” below).`
              : "Without an account: no personal data. KleyBom uses no analytics, advertising or tracking cookies.",
            "Account: email address and password (stored encrypted, we never see it), and the date you accepted this policy.",
            "If you sign in with Google: Google sends us your email, your name and your profile picture. We do not receive your Google password or any other data from your account.",
            "Profile (optional): name, sex, date of birth, height and time zone.",
            "Health data you record: weight and body measurements, meals, nutrition goals, workouts and sets. They are a special category of data (article 9 GDPR).",
            ...si(donaciones, "If you donate: Stripe gives us the name and email you give it, the amount, the date and the country of the payment. We never receive your card details."),
            "Technical data: the hosting provider logs the IP address and time of each visit for security and operation.",
          ),
        ],
      },
      {
        titulo: "Purposes and legal basis",
        bloques: [
          lista(
            "Creating and keeping your account and showing you your routines, calendar and diary: performance of the service you request (art. 6.1.b GDPR).",
            "Storing and showing your health data and statistics: your explicit consent, given when you sign up (art. 9.2.a GDPR). You can withdraw it at any time by deleting that data or your account, without affecting what was done before.",
            "Security and abuse prevention (technical logs): legitimate interest (art. 6.1.f GDPR).",
            ...si(
              donaciones,
              "Handling your donation and answering your questions about it: the donation you make (art. 6.1.b GDPR). Keeping accounts and meeting tax obligations: legal obligation (art. 6.1.c GDPR).",
            ),
            ...si(anuncios, "Advertising on the public pages: your consent, which you give or refuse in the cookie notice (art. 6.1.a GDPR and art. 22.2 LSSI). You can change it at any time."),
          ),
          p("Your data is not sold or passed on to third parties for commercial purposes. Your account data and health data are not used for advertising or shared with advertisers, and no automated decisions with effects on you are made."),
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
          ...si(
            donaciones,
            p("Donations: Stripe Payments Europe, Limited (Ireland) processes the payment as controller of its own processing, under its privacy policy (stripe.com/privacy). It may transfer data to Stripe, Inc. (United States) with the safeguards required by the GDPR."),
          ),
        ],
      },
      ...si(anuncios, {
        titulo: "Advertising",
        bloques: [
          p(`The ads on ${FICHAS} are served by Google Ireland Limited (Google AdSense). Google and its advertising partners act as controllers of their own processing: depending on what you choose in the consent notice, they may use cookies and identifiers to show ads, limit how often you see the same one, measure their performance, prevent fraud and, if you accept, show you personalised ads. The notice lists each provider and its purpose.`),
          p("Google may transfer data to the United States with the safeguards of the EU-US Data Privacy Framework. More information: “How Google uses information from sites or apps that use our services” (policies.google.com/technologies/partner-sites) and Google's privacy policy (policies.google.com/privacy)."),
          p(`You can change your choice at any time from ${ENLACE_AJUSTES}. Refusing personalised advertising does not limit anything on the website.`),
        ],
      }),
      {
        titulo: "How long we keep it",
        bloques: [
          p("As long as you keep your account. You can delete any measurement, meal or workout at any time. If you delete your account from your profile, your account and all your data are deleted immediately. The provider's backups are overwritten in their usual cycle."),
          ...si(donaciones, p("Donation data is kept for as long as tax and commercial law requires (usually four to six years) and then deleted.")),
          ...si(anuncios, p("Advertising cookies last as long as each provider states in the consent notice; you can delete them from your browser.")),
        ],
      },
      {
        titulo: "Your rights",
        bloques: [
          p("You can exercise the rights of access, rectification, erasure, objection, restriction of processing and portability:"),
          lista(
            "On the website: edit your profile, delete individual records, download all your data as JSON from your dashboard or delete your account.",
            ...si(anuncios, `Advertising: change or withdraw your consent from ${ENLACE_AJUSTES}.`),
            `By email: write to ${T.correo} from your account's email address. We will reply within one month at most.`,
            "If you think we have not handled your request properly, you can complain to the Spanish Data Protection Agency (www.aepd.es).",
          ),
        ],
      },
      {
        titulo: "Minimum age",
        bloques: [
          p("You must be 14 or older to create an account (article 7 of Spanish Organic Law 3/2018). The nutrition calculations are designed for adults."),
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
}

export function cookiesEn({ anuncios, donaciones }: Activos): TextoLegal {
  return {
    slug: "cookies",
    titulo: "Cookie policy",
    resumen: anuncios
      ? "Technical cookies for your session and language, and Google advertising cookies only if you accept them."
      : "KleyBom only uses the technical cookies needed to keep you signed in and remember your language.",
    secciones: [
      {
        titulo: anuncios ? "Technical cookies" : "Which cookies we use",
        bloques: [
          TRADUCCION,
          p(
            anuncios
              ? "They are needed so you can sign in and so your language is remembered. They are on every page:"
              : "KleyBom only uses technical cookies, needed so you can sign in to your account and to remember the language you choose. It uses no analytics, advertising or social media cookies, and there is no third-party content that sets them.",
          ),
          lista(
            "sb-…-auth-token (first-party, from Supabase): keeps your session when you sign in. It is deleted when you sign out or when the session expires.",
            "idioma (first-party): remembers the language you choose (Spanish or English). It is created when you change language or open the English version (/en) and lasts one year.",
          ),
          p("Fonts are served from our own server, so your browser does not connect to Google Fonts."),
          p("Technical cookies needed to provide a service you request, such as keeping you signed in or remembering the language you chose, are exempt from consent (article 22.2 LSSI). That is why we don't ask for permission for them; we just inform you."),
        ],
      },
      ...si(anuncios, {
        titulo: "Advertising cookies (Google AdSense)",
        bloques: [
          p(`Only on ${FICHAS}. Google and its advertising partners may set cookies or read device identifiers to show ads, limit how often you see the same one, measure their performance and prevent fraud and, if you accept, to show you personalised ads based on your interests. They are third-party cookies.`),
          p(`They are not set until you choose in the consent notice, which appears the first time you open one of those pages. It shows the full list of providers, their purposes and how long their cookies last, and lets you accept, refuse or choose by purpose. Refusing is as easy as accepting and the website works the same. There is never advertising on ${SIN_ANUNCIOS}.`),
          p("More about Google's advertising cookies: business.safety.google/adscookies."),
        ],
      }),
      ...si(anuncios, {
        titulo: "How to change your choice",
        bloques: [p(`You can change or withdraw your consent at any time from ${ENLACE_AJUSTES}.`)],
      }),
      ...si(donaciones, {
        titulo: "Donations",
        bloques: [p("The donate button takes you to Stripe's page (stripe.com). KleyBom does not set Stripe cookies; Stripe uses its own on its page, under its cookie policy.")],
      }),
      ...si(!anuncios, {
        titulo: "Why there is no cookie banner",
        bloques: [p("Because we only use technical cookies, we don't need to ask for permission. If we ever add cookies that are not technical, we will ask for your consent before setting them.")],
      }),
      {
        titulo: "How to delete them",
        bloques: [p("You can delete or block cookies in your browser settings. If you block the session cookie, you can still browse exercises, foods, recipes and guides, but you won't be able to sign in.")],
      },
    ],
  };
}
