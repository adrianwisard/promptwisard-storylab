import { useState } from "react";

// ─── API ─────────────────────────────────────────────────────────────────────
// Läuft über den eigenen Vercel-Proxy (/api/chat), der den Anthropic-Key serverseitig hält.
async function callAPI(system, userMsg, maxTokens = 1200) {
  const payload = {
    model: "claude-sonnet-4-6",
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content: [{ type: "text", text: userMsg }] }],
  };

  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  let d;
  try { d = await res.json(); }
  catch(e) { throw new Error("Server-Antwort konnte nicht gelesen werden (kein JSON)."); }

  if (d.error) throw new Error(d.error.message || "API-Fehler");
  return (d.content || []).map(b => b.type === "text" ? b.text : "").join("").trim();
}

// ─── THEME ───────────────────────────────────────────────────────────────────
const ACCENT     = "#A4168B";
const TAB_COLORS = ["#F5E5FF", "#CDD0FF", "#FAFFDC"];

// ─── i18n ────────────────────────────────────────────────────────────────────
const LANGS = { en:"English", de:"Deutsch", fr:"Français", it:"Italiano" };

const UI = {
  en: {
    title:"PromptWisard", sub:"StoryLab", ver:"1.1",
    tabs:["Film","Product","Ad Spot"],
    options:"Options", generate:"Generate", generating:"Generating…",
    clearSel:"Clear selection", result:"Result",
    copy:"Copy", copied:"Copied!",
    contextLabel:"Context:", placeholderCtx:"Variable / context:",
    placeholder:"e.g. film premise, genre, character concept…",
    outputLang:"Output language", length:"Length", ideas:"Ideas",
    short:"Short", medium:"Medium", long:"Long",
    bwToggle:["B&W","Color"],
    none:"–", noneTip:"No selection from this category",
    resetAll:"Reset", resetTip:"Clear all selections",
    randomize:"Random", randomizeTip:"Randomize all settings (except output options)",
    sections:{
      outputopts:"Output settings",
      genre:"Genre", writers:"Screenwriters", char:"Characters", plot:"Plot & Structure",
      world:"World & Atmosphere", hooks:"Hooks & Twists",
      concept:"Concept", audience:"Audience & Market", prodcat:"Product Category", strategy:"Go-to-Market", brand:"Branding",
      ad_concept:"Concept", ad_style:"Film Language", ad_directors:"Ad Directors", brand_dna:"Brand DNA",
    },
  },
  de: {
    title:"PromptWisard", sub:"StoryLab", ver:"1.1",
    tabs:["Film","Produkt","Werbespot"],
    options:"Optionen", generate:"Generieren", generating:"Generiere…",
    clearSel:"Auswahl löschen", result:"Ergebnis",
    copy:"Kopieren", copied:"Kopiert!",
    contextLabel:"Kontext:", placeholderCtx:"Platzhalter / Kontext:",
    placeholder:"z.B. Filmprämisse, Genre, Figur, Produktname…",
    outputLang:"Ausgabesprache", length:"Länge", ideas:"Anzahl Ideen",
    short:"Kurz", medium:"Mittel", long:"Lang",
    bwToggle:["S/W","Farbe"],
    none:"–", noneTip:"Keine Auswahl aus dieser Kategorie",
    resetAll:"Reset", resetTip:"Alles zurücksetzen",
    randomize:"Zufall", randomizeTip:"Alle Einstellungen zufällig (ausser Ausgabe-Optionen)",
    sections:{
      outputopts:"Ausgabe-Einstellungen",
      genre:"Genre", writers:"Drehbuchautoren", char:"Figuren", plot:"Plot & Struktur",
      world:"Welt & Atmosphäre", hooks:"Hooks & Twists",
      concept:"Konzept", audience:"Zielpublikum & Markt", prodcat:"Produkt-Kategorie", strategy:"Go-to-Market", brand:"Branding",
      ad_concept:"Konzept", ad_style:"Filmsprache", ad_directors:"Werbespot-Regisseure", brand_dna:"Brand-DNA",
    },
  },
  fr: {
    title:"PromptWisard", sub:"StoryLab", ver:"1.1",
    tabs:["Film","Produit","Spot Pub"],
    options:"Options", generate:"Générer", generating:"Génération…",
    clearSel:"Effacer la sélection", result:"Résultat",
    copy:"Copier", copied:"Copié!",
    contextLabel:"Contexte:", placeholderCtx:"Variable / contexte:",
    placeholder:"ex. prémisse, genre, personnage…",
    outputLang:"Langue de sortie", length:"Longueur", ideas:"Nombre d'idées",
    short:"Court", medium:"Moyen", long:"Long",
    bwToggle:["N&B","Couleur"],
    none:"–", noneTip:"Aucune sélection dans cette catégorie",
    resetAll:"Reset", resetTip:"Tout réinitialiser",
    randomize:"Aléatoire", randomizeTip:"Paramètres aléatoires (sauf options de sortie)",
    sections:{
      outputopts:"Paramètres de sortie",
      genre:"Genre", writers:"Scénaristes", char:"Personnages", plot:"Intrigue & Structure",
      world:"Monde & Atmosphère", hooks:"Hooks & Twists",
      concept:"Concept", audience:"Audience & Marché", prodcat:"Catégorie produit", strategy:"Go-to-Market", brand:"Branding",
      ad_concept:"Concept", ad_style:"Langage filmique", ad_directors:"Réalisateurs pub", brand_dna:"ADN de marque",
    },
  },
  it: {
    title:"PromptWisard", sub:"StoryLab", ver:"1.1",
    tabs:["Film","Prodotto","Spot Pub"],
    options:"Opzioni", generate:"Genera", generating:"Generazione…",
    clearSel:"Cancella selezione", result:"Risultato",
    copy:"Copia", copied:"Copiato!",
    contextLabel:"Contesto:", placeholderCtx:"Segnaposto / contesto:",
    placeholder:"es. premessa, genere, personaggio…",
    outputLang:"Lingua di output", length:"Lunghezza", ideas:"Numero idee",
    short:"Breve", medium:"Medio", long:"Lungo",
    bwToggle:["B&N","Colore"],
    none:"–", noneTip:"Nessuna selezione in questa categoria",
    resetAll:"Reset", resetTip:"Reimposta tutto",
    randomize:"Casuale", randomizeTip:"Impostazioni casuali (tranne opzioni di output)",
    sections:{
      outputopts:"Impostazioni output",
      genre:"Genere", writers:"Sceneggiatori", char:"Personaggi", plot:"Trama & Struttura",
      world:"Mondo & Atmosfera", hooks:"Hooks & Twists",
      concept:"Concetto", audience:"Pubblico & Mercato", prodcat:"Categoria prodotto", strategy:"Go-to-Market", brand:"Branding",
      ad_concept:"Concetto", ad_style:"Linguaggio filmico", ad_directors:"Registi pubblicitari", brand_dna:"DNA di brand",
    },
  },
};
const tr = (l,k) => UI[l]?.[k] ?? UI.en[k] ?? k;

// ─── GENRE DATA ───────────────────────────────────────────────────────────────
const GENRE_GROUPS = [
  { g:{ en:"Drama & Human", de:"Drama & Mensch", fr:"Drame & Humain", it:"Dramma & Umano" },
    genres:["Drama","Melodrama","Tragedy","Social Drama","Courtroom Drama","Family Drama","Coming-of-Age","Biographical","Historical Drama","Rehabilitation"] },
  { g:{ en:"Thriller & Suspense", de:"Thriller & Spannung", fr:"Thriller & Suspense", it:"Thriller & Suspense" },
    genres:["Thriller","Psychological Thriller","Crime Thriller","Tech Thriller","Paranoia Thriller","Political Thriller","Legal Thriller","Conspiracy"] },
  { g:{ en:"Horror", de:"Horror", fr:"Horreur", it:"Horror" },
    genres:["Horror","Slasher","Body Horror","Cosmic Horror","Folk Horror","Psychological Horror","Found Footage","Gothic Horror","Creature Feature","Zombie"] },
  { g:{ en:"Comedy", de:"Komödie", fr:"Comédie", it:"Commedia" },
    genres:["Comedy","Romantic Comedy","Dark Comedy","Satire","Absurdist Comedy","Slapstick","Mockumentary","Buddy Comedy","Parody"] },
  { g:{ en:"Action & Adventure", de:"Action & Abenteuer", fr:"Action & Aventure", it:"Azione & Avventura" },
    genres:["Action","Adventure","Heist","Spy","Martial Arts","Disaster","Survival","War","Superhero","Revenge"] },
  { g:{ en:"Sci-Fi & Speculative", de:"Sci-Fi & Spekulativ", fr:"SF & Spéculatif", it:"Sci-Fi & Speculativo" },
    genres:["Science Fiction","Near-Future","Dystopia","Utopia","Space Opera","Time Travel","Cyberpunk","Biopunk","First Contact","Post-Apocalyptic","AI & Robots"] },
  { g:{ en:"Fantasy & Myth", de:"Fantasy & Mythos", fr:"Fantaisie & Mythe", it:"Fantasy & Mito" },
    genres:["Fantasy","Epic Fantasy","Urban Fantasy","Dark Fantasy","Fairy Tale","Mythology","Magic Realism","Sword & Sorcery"] },
  { g:{ en:"Crime & Noir", de:"Crime & Noir", fr:"Crime & Noir", it:"Crime & Noir" },
    genres:["Crime","Noir","Neo-Noir","Gangster","Mystery","Whodunit","Detective","True Crime","Prison Film"] },
  { g:{ en:"Romance & Relationship", de:"Romantik & Beziehung", fr:"Romance & Relations", it:"Romance & Relazioni" },
    genres:["Romance","Romantic Drama","Forbidden Love","Love Triangle","Road Romance","Coming-Out","Breakup Film","Erotic Drama"] },
  { g:{ en:"Arthouse & Experimental", de:"Arthouse & Experimentell", fr:"Arthouse & Expérimental", it:"Arthouse & Sperimentale" },
    genres:["Arthouse","Experimental","Surrealism","Essay Film","Slow Cinema","Docufiction","Silent Film Style","Poetic Realism"] },
  { g:{ en:"Documentary & Hybrid", de:"Dokumentar & Hybrid", fr:"Documentaire & Hybride", it:"Documentario & Ibrido" },
    genres:["Documentary","Docudrama","True Crime Doc","Nature Doc","Music Doc","Activism Doc","Mockumentary","Talking Heads"] },
  { g:{ en:"Other", de:"Weitere", fr:"Autres", it:"Altri" },
    genres:["Western","Musical","Sports","Road Movie","Holiday Film","Animation","Anthology","Biopic","Epic","War Drama"] },
];

// ─── TABS DATA ────────────────────────────────────────────────────────────────
const TABS_DATA = [
  {
    id:"film",
    groups:[
      { id:"char", prompts:[
        { id:"c1",
          label:{ en:"Develop protagonist", de:"Protagonist entwickeln" },
          tip:{ en:"Build a full protagonist: backstory, goal,…" },
          t:"My concept: [CONCEPT]" },
        { id:"c2",
          label:{ en:"Secondary characters", de:"Nebenfiguren" },
          tip:{ en:"3 supporting characters, each with a disti…" },
          t:"My concept: [CONCEPT]" },
        { id:"ant1",
          label:{ en:"Human antagonist", de:"Menschl. Antagonist" },
          tip:{ en:"The best villains believe they are right" },
          t:"My concept: [CONCEPT]" },
        { id:"ant5",
          label:{ en:"Inner conflict", de:"Innerer Konflikt" },
          tip:{ en:"The real enemy is inside the protagonist" },
          t:"My concept: [CONCEPT]" },
        { id:"c3",
          label:{ en:"Character arc", de:"Figuren-Arc" },
          tip:{ en:"Map the protagonist's transformation in 4 …" },
          t:"My concept: [CONCEPT]" },
      ]},
      { id:"plot", prompts:[
        { id:"p2",
          label:{ en:"3-act structure", de:"Drei-Akt-Struktur" },
          tip:{ en:"Setup → Confrontation → Resolution" },
          t:"Film premise: [PREMISE]" },
        { id:"p3",
          label:{ en:"Hero's journey", de:"Heldenreise" },
          tip:{ en:"Campbell's 12-stage monomyth" },
          t:"Create a 12-part Hero's Journey outline for: [PREMISE]" },
        { id:"p5",
          label:{ en:"Save the Cat beats", de:"Save the Cat Beats" },
          tip:{ en:"Blake Snyder's 15-beat screenplay structure" },
          t:"Apply Blake Snyder's Save the Cat beat sheet to this premise: [PREMISE]" },
        { id:"p6",
          label:{ en:"Non-linear structure", de:"Nicht-lineare Struktur" },
          tip:{ en:"Fragmented time, parallel timelines, rever…" },
          t:"My premise: [PREMISE]" },
        { id:"p7",
          label:{ en:"Tone evolution", de:"Ton-Entwicklung" },
          tip:{ en:"How should the emotional temperature shift…" },
          t:"Film premise: [PREMISE]" },
      ]},
      { id:"world", prompts:[
        { id:"w1",
          label:{ en:"World building", de:"Weltenbau" },
          tip:{ en:"Rules, history, visual language, atmosphere" },
          t:"Describe a rich, visually compelling world for this story: [CONCEPT]" },
        { id:"w2",
          label:{ en:"Locations", de:"Schauplätze" },
          tip:{ en:"5 specific locations, each mirroring a the…" },
          t:"For this story: [CONCEPT]" },
        { id:"w3",
          label:{ en:"Unusual location", de:"Ungewöhnlicher Ort" },
          tip:{ en:"The setting becomes the story" },
          t:"Create [N] film concepts built around a unique or unconventional location as …" },
        { id:"w4",
          label:{ en:"Chamber piece", de:"Kammerspiel" },
          tip:{ en:"One location, few characters, maximum tension" },
          t:"Develop [N] intense chamber piece film concepts set in a single location with…" },
      ]},
      { id:"hooks", prompts:[
        { id:"h1",
          label:{ en:"Opening hook", de:"Opening Hook" },
          tip:{ en:"Design the first 3 minutes" },
          t:"Film premise: [PREMISE]" },
        { id:"h2",
          label:{ en:"Midpoint twist", de:"Midpoint-Twist" },
          tip:{ en:"At the midpoint the story shifts direction…" },
          t:"Film premise: [PREMISE]" },
        { id:"h3",
          label:{ en:"False protagonist", de:"Falscher Protagonist" },
          tip:{ en:"We follow one character — then they exit" },
          t:"My premise: [PREMISE]" },
        { id:"h4",
          label:{ en:"Identity reveal", de:"Identitäts-Enthüllung" },
          tip:{ en:"A character is revealed to be someone else…" },
          t:"My premise: [PREMISE]" },
        { id:"h5",
          label:{ en:"Unreliable narrator", de:"Unzuverlässiger Erzähler" },
          tip:{ en:"The story we've been told is wrong" },
          t:"My premise: [PREMISE]" },
        { id:"h6",
          label:{ en:"Red herring", de:"Red Herring" },
          tip:{ en:"Plant a convincing false trail that leads …" },
          t:"My premise: [PREMISE]" },
        { id:"h7",
          label:{ en:"Twist ending", de:"Twist am Ende" },
          tip:{ en:"The final revelation that reframes the ent…" },
          t:"Film premise: [PREMISE]" },
        { id:"h8",
          label:{ en:"Flashback reveal", de:"Flashback-Enthüllung" },
          tip:{ en:"A flashback deployed as a weapon — drops t…" },
          t:"My premise: [PREMISE]" },
      ]},
      { id:"writers", prompts:[
        { id:"wr1", label:{ en:"Quentin Tarantino", de:"Quentin Tarantino" },
          tip:{ en:"Nonlinear chapters, pop-culture dialogue, …" },
          t:"Write a film concept in the style of Quentin Tarantino: nonlinear chapter str…" },
        { id:"wr2", label:{ en:"Charlie Kaufman", de:"Charlie Kaufman" },
          tip:{ en:"Meta-narratives, existential dread, self-r…" },
          t:"Write a film concept in the style of Charlie Kaufman: meta-fictional layers, …" },
        { id:"wr3", label:{ en:"Coen Brothers", de:"Coen Brothers" },
          tip:{ en:"Dark absurdist comedy, morally ambiguous c…" },
          t:"Write a film concept in the style of the Coen Brothers: darkly comic, fatalis…" },
        { id:"wr4", label:{ en:"Aaron Sorkin", de:"Aaron Sorkin" },
          tip:{ en:"Walk-and-talk dialogue, rapid-fire wit, id…" },
          t:"Write a film concept in the style of Aaron Sorkin: rapid overlapping dialogue…" },
        { id:"wr5", label:{ en:"Christopher Nolan", de:"Christopher Nolan" },
          tip:{ en:"Non-linear time, unreliable memory, high-c…" },
          t:"Write a film concept in the Christopher Nolan style: high-concept premise inv…" },
        { id:"wr6", label:{ en:"Emerald Fennell", de:"Emerald Fennell" },
          tip:{ en:"Surface sweetness hiding rage, feminist ge…" },
          t:"Write a film concept in the style of Emerald Fennell: a genre that seems swee…" },
        { id:"wr7", label:{ en:"Ingmar Bergman", de:"Ingmar Bergman" },
          tip:{ en:"Death as interlocutor, spiritual crisis, m…" },
          t:"Write a film concept in the style of Ingmar Bergman: a spare chamber drama co…" },
        { id:"wr8", label:{ en:"Greta Gerwig", de:"Greta Gerwig" },
          tip:{ en:"Female interiority, coming-of-age ambivale…" },
          t:"Write a film concept in the style of Greta Gerwig: a young woman navigating s…" },
        { id:"wr9", label:{ en:"Jordan Peele", de:"Jordan Peele" },
          tip:{ en:"Social horror as precise allegory, sustain…" },
          t:"Write a film concept in the style of Jordan Peele: a genre-horror premise tha…" },
        { id:"wr10", label:{ en:"Wes Anderson", de:"Wes Anderson" },
          tip:{ en:"Symmetrical framing, deadpan melancholy, f…" },
          t:"Write a film concept in the Wes Anderson style: whimsical ensemble, hyper-sty…" },
      ]},
    ],
  },
  {
    id:"product",
    groups:[
      { id:"concept", prompts:[
        { id:"pc1", label:{ en:"Combine industries", de:"Branchen kombinieren" }, tip:{ en:"What happens when wellness meets fintech? …" }, t:"Describe [N] completely new products combining two existing industries in an …" },
        { id:"pc2", label:{ en:"Everyday problem", de:"Alltags-Problem" }, tip:{ en:"Solve a mundane problem so elegantly peopl…" }, t:"Develop [N] product ideas that solve a classic everyday problem in a surprisi…" },
        { id:"pc3", label:{ en:"Future trend", de:"Zukunftstrend" }, tip:{ en:"Anchor in real trends: longevity, climate …" }, t:"Describe [N] innovative product ideas based on emerging trends: sustainabilit…" },
        { id:"pc6", label:{ en:"Target audience", de:"Zielgruppe" }, tip:{ en:"Get specific: single dads 40s, Gen Z athle…" }, t:"Develop [N] products tailored to a very specific underserved audience: [AUDIE…" },
      ]},
      { id:"audience", prompts:[
        { id:"au1", label:{ en:"Age & life stage", de:"Alter & Lebensphase" },
          tip:{ en:"Gen Z, Millennials, Gen X, Boomers — radic…" },
          t:"Develop [N] product concepts specifically designed for [AUDIENCE]" },
        { id:"au2", label:{ en:"Psychographic profile", de:"Psychografisches Profil" },
          tip:{ en:"Beyond demographics: values, lifestyle, be…" },
          t:"Create [N] product concepts for a psychographic niche: [AUDIENCE]" },
        { id:"au3", label:{ en:"Underserved niche", de:"Vergessene Nische" },
          tip:{ en:"Who does every product ignore? Left-hander…" },
          t:"Identify [N] underserved audience niches and design a product for each" },
        { id:"au4", label:{ en:"B2B customer", de:"B2B-Kunde" },
          tip:{ en:"Products sold to businesses: procurement p…" },
          t:"Develop [N] product concepts for a B2B context: [AUDIENCE]" },
      ]},
      { id:"prodcat", prompts:[
        { id:"pcat1", label:{ en:"Food & Beverage", de:"Food & Beverage" },
          tip:{ en:"One of the most competitive categories" },
          t:"Develop [N] innovative product concepts in Food & Beverage" },
        { id:"pcat2", label:{ en:"Health & Longevity", de:"Health & Longevity" },
          tip:{ en:"Fastest-growing consumer category: sleep, …" },
          t:"Create [N] product concepts in Health & Longevity" },
        { id:"pcat3", label:{ en:"Tech & AI", de:"Tech & KI" },
          tip:{ en:"AI-native products, smart devices, ambient…" },
          t:"Develop [N] product concepts that are genuinely AI-native — not just AI-enhanced" },
        { id:"pcat4", label:{ en:"Sustainability", de:"Nachhaltigkeit" },
          tip:{ en:"Products where sustainability is the compe…" },
          t:"Create [N] product concepts where sustainability is the core commercial advan…" },
        { id:"pcat5", label:{ en:"Fashion & Beauty", de:"Fashion & Beauty" },
          tip:{ en:"Identity, self-expression, status, ritual" },
          t:"Develop [N] product concepts in Fashion or Beauty that redefine identity, rit…" },
        { id:"pcat6", label:{ en:"Finance & Fintech", de:"Finance & Fintech" },
          tip:{ en:"Money is emotional. Best fintech reduces a…" },
          t:"Create [N] fintech or financial product concepts that reduce money anxiety or…" },
        { id:"pcat7", label:{ en:"Home & Living", de:"Home & Living" },
          tip:{ en:"Products that change how people cook, slee…" },
          t:"Develop [N] Home & Living product concepts that transform a specific domestic…" },
      ]},
      { id:"strategy", prompts:[
        { id:"st1", label:{ en:"Pricing strategy", de:"Preisstrategie" },
          tip:{ en:"Price is a brand signal" },
          t:"Analyze [N] pricing strategy options for [PRODUCT]: premium, freemium, subscr…" },
        { id:"st2", label:{ en:"Launch strategy", de:"Launch-Strategie" },
          tip:{ en:"How does the product enter the world? Stea…" },
          t:"Design [N] launch strategy scenarios for [PRODUCT]: how does it enter the wor…" },
        { id:"st3", label:{ en:"USP & differentiation", de:"USP & Differenzierung" },
          tip:{ en:"What is the ONE thing this product does th…" },
          t:"Define the sharpest possible USP for [PRODUCT]" },
        { id:"st4", label:{ en:"Distribution channel", de:"Vertriebskanal" },
          tip:{ en:"Where and how the product reaches the cust…" },
          t:"Develop [N] distribution strategy concepts for [PRODUCT]" },
      ]},
      { id:"brand", prompts:[
        { id:"pb1", label:{ en:"Brand names", de:"Markennamen" }, tip:{ en:"Names that carry emotion and benefit: memo…" }, t:"Find [N] creative brand names for [PRODUCT] combining emotion and benefit" },
        { id:"pb2", label:{ en:"Brand personality", de:"Brand-Persönlichkeit" }, tip:{ en:"Tone of voice, values, archetypes (Rebel, …" }, t:"Define the brand personality for [PRODUCT]: tone of voice, values, archetypes." },
        { id:"pb3", label:{ en:"Positioning", de:"Positionierung" }, tip:{ en:"3 strategies: premium vs accessible, chall…" }, t:"How should [PRODUCT] be positioned versus competitors? Develop 3 distinct pos…" },
        { id:"cc1", label:{ en:"Ad message", de:"Werbebotschaft" }, tip:{ en:"One product, three emotional registers: to…" }, t:"Write a short advertising message for [PRODUCT] in three tones: emotional, hu…" },
        { id:"cc3", label:{ en:"Brand story", de:"Brand Story" }, tip:{ en:"Why does this brand exist? What wound gave…" }, t:"Write a compelling origin story for [PRODUCT] — why does it exist? What probl…" },
      ]},
    ],
  },
  {
    id:"adspot",
    groups:[
      { id:"ad_concept", prompts:[
        { id:"ac1", label:{ en:"5 concepts", de:"5 Konzepte" }, tip:{ en:"5 radically different directions" }, t:"Develop [N] very different ad spot concepts for [PRODUCT]" },
        { id:"ac3", label:{ en:"30-second spot", de:"30-Sek-Spot" }, tip:{ en:"Problem → Tension → Resolution → Emotional…" }, t:"Describe a tight 30-second spot for [PRODUCT]: Problem — Tension — Resolution…" },
        { id:"ac4", label:{ en:"Without words", de:"Ohne Worte" }, tip:{ en:"No dialogue, no voiceover" }, t:"Describe an ad for [PRODUCT] that works entirely without dialogue — only imag…" },
        { id:"ac5", label:{ en:"Surprising twist", de:"Überraschende Wendung" }, tip:{ en:"Set up one expectation, shatter it in the …" }, t:"Write an ad concept for [PRODUCT] that subverts expectations with a twist in …" },
      ]},
      { id:"brand_dna", prompts:[
        { id:"bd1", label:{ en:"Nike", de:"Nike" },
          tip:{ en:"Emotional empowerment, universal athletici…" },
          t:"Create an ad concept for [PRODUCT] in the Nike style: emotional empowerment, …" },
        { id:"bd2", label:{ en:"Apple", de:"Apple" },
          tip:{ en:"Radical simplicity, product as philosophy,…" },
          t:"Create an ad concept for [PRODUCT] in the Apple style: radical simplicity, mi…" },
        { id:"bd3", label:{ en:"Dove", de:"Dove" },
          tip:{ en:"Real people, radical authenticity, emotion…" },
          t:"Create an ad concept for [PRODUCT] in the Dove style: radical authenticity wi…" },
        { id:"bd4", label:{ en:"Old Spice", de:"Old Spice" },
          tip:{ en:"Absurdist humor, fourth-wall breaks, self-…" },
          t:"Create an ad concept for [PRODUCT] in the Old Spice style: absurdist escalati…" },
        { id:"bd5", label:{ en:"VW / Bernbach", de:"VW / Bernbach" },
          tip:{ en:"Honest self-deprecating wit, admitting fla…" },
          t:"Create an ad concept for [PRODUCT] in the Volkswagen/Bernbach style: radical …" },
        { id:"bd6", label:{ en:"Patagonia", de:"Patagonia" },
          tip:{ en:"Anti-consumption activism, radical corpora…" },
          t:"Create an ad concept for [PRODUCT] in the Patagonia style: radical corporate …" },
        { id:"bd7", label:{ en:"Coca-Cola", de:"Coca-Cola" },
          tip:{ en:"Shared joy, togetherness, universal moment…" },
          t:"Create an ad concept for [PRODUCT] in the Coca-Cola style: shared human momen…" },
      ]},
      { id:"ad_directors", prompts:[
        { id:"adir1", label:{ en:"Ridley Scott", de:"Ridley Scott" },
          tip:{ en:"Epic cinematic scale, atmospheric world-bu…" },
          t:"Create an ad concept for [PRODUCT] directed by Ridley Scott: epic cinematic s…" },
        { id:"adir2", label:{ en:"David Fincher", de:"David Fincher" },
          tip:{ en:"Hyper-controlled perfectionism, cold blue-…" },
          t:"Create an ad concept for [PRODUCT] directed by David Fincher: hyper-controlle…" },
        { id:"adir3", label:{ en:"Spike Jonze", de:"Spike Jonze" },
          tip:{ en:"Surreal emotional gut-punches, weird made …" },
          t:"Create an ad concept for [PRODUCT] directed by Spike Jonze: an unexpected emo…" },
        { id:"adir4", label:{ en:"Wes Anderson", de:"Wes Anderson" },
          tip:{ en:"Symmetrical composition, deadpan narration…" },
          t:"Create an ad concept for [PRODUCT] directed by Wes Anderson: perfect symmetri…" },
        { id:"adir5", label:{ en:"Sofia Coppola", de:"Sofia Coppola" },
          tip:{ en:"Languid feminine interiority, luxury as lo…" },
          t:"Create an ad concept for [PRODUCT] directed by Sofia Coppola: languid feminin…" },
        { id:"adir6", label:{ en:"Michel Gondry", de:"Michel Gondry" },
          tip:{ en:"DIY handmade surrealism, in-camera practic…" },
          t:"Create an ad concept for [PRODUCT] directed by Michel Gondry: handmade practi…" },
        { id:"adir7", label:{ en:"Baz Luhrmann", de:"Baz Luhrmann" },
          tip:{ en:"Maximalist operatic excess, overwhelming s…" },
          t:"Create an ad concept for [PRODUCT] directed by Baz Luhrmann: maximalist opera…" },
      ]},
      { id:"ad_style", prompts:[
        { id:"as1", label:{ en:"Film genre style", de:"Filmgenre-Stil" }, tip:{ en:"Borrow a film genre's visual language" }, t:"Stage an ad for [PRODUCT] in the visual language of a specific film genre (Ac…" },
        { id:"as2", label:{ en:"3 tones", de:"3 Tonlagen" }, tip:{ en:"Same product, three moods: funny / emotion…" }, t:"Develop 3 versions of the same ad for [PRODUCT]: humorous, emotional, and min…" },
        { id:"as3", label:{ en:"Light & color", de:"Licht & Farbe" }, tip:{ en:"Light, color palette, music as brand expre…" }, t:"Describe how light, color palette and music could reflect the character of [P…" },
        { id:"as4", label:{ en:"Soundtrack first", de:"Soundtrack first" }, tip:{ en:"Start with the sonic concept" }, t:"Design a spot for [PRODUCT] where the music drives everything" },
        { id:"aa1", label:{ en:"Audience variants", de:"Zielgruppen-Varianten" }, tip:{ en:"4 audience segments, 4 completely differen…" }, t:"Develop 4 different ad concepts for [PRODUCT] each targeting a completely dif…" },
        { id:"aa3", label:{ en:"Social-native", de:"Social-Native" }, tip:{ en:"Built for TikTok, Reels, Shorts: vertical,…" }, t:"Design a social-native ad campaign for [PRODUCT]: short vertical videos, auth…" },
      ]},
    ],
  },
];

// ─── RANDOMIZE HELPER ────────────────────────────────────────────────────────
const pick = arr => arr[Math.floor(Math.random() * arr.length)];

function randomizeFilm() {
  // Always pick exactly 2 genres from different groups
  const allGenres = GENRE_GROUPS.flatMap(g => g.genres);
  const genres = [];
  while (genres.length < 2) {
    const g = pick(allGenres);
    if (!genres.includes(g)) genres.push(g);
  }

  // Pick 1-2 random prompts from each non-genre group (total 2-4 prompts)
  const groups = TABS_DATA[0].groups;
  const prompts = [];
  groups.forEach(grp => {
    if (Math.random() > 0.4) { // ~60% chance to pick from each group
      prompts.push(pick(grp.prompts));
    }
  });
  if (prompts.length === 0) prompts.push(pick(pick(groups).prompts));

  return { genres, prompts };
}

function randomizeTab(tabIdx) {
  const groups = TABS_DATA[tabIdx].groups;
  const prompts = [];
  groups.forEach(grp => {
    if (Math.random() > 0.35) {
      prompts.push(pick(grp.prompts));
    }
  });
  if (prompts.length === 0) prompts.push(pick(pick(groups).prompts));
  return { genres: [], prompts };
}

// ─── DEFAULTS ────────────────────────────────────────────────────────────────
const GEN_DEFAULTS = { outputLang:"de", length:"medium", numIdeas:5 };
const mkOpen = () => [
  { outputopts:true, genre:false, writers:false, char:false, plot:false, world:false, hooks:false },
  { outputopts:true, concept:false, audience:false, prodcat:false, strategy:false, brand:false },
  { outputopts:true, ad_concept:false, brand_dna:false, ad_directors:false, ad_style:false },
];

// ─── ATOMS ───────────────────────────────────────────────────────────────────
function Chip({ label, active, onClick, dark, tip }) {
  const [hover, setHover] = useState(false);
  const base = dark
    ? { padding:"4px 12px", borderRadius:20, fontSize:12, cursor:"pointer", fontWeight:active?700:400,
        whiteSpace:"nowrap", fontFamily:"inherit",
        border:active?"2px solid #fff":"0.5px solid rgba(255,255,255,0.3)",
        background:active?"#fff":"transparent", color:active?"#222":"#ccc" }
    : { padding:"4px 12px", borderRadius:20, fontSize:12, cursor:"pointer", fontWeight:active?700:400,
        whiteSpace:"nowrap", fontFamily:"inherit",
        border:active?"1.5px solid #222":"0.5px solid #ccc",
        background:active?"#222":"transparent", color:active?"#fff":"#555" };
  return (
    <span style={{ position:"relative", display:"inline-block" }}
      onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}>
      <button onClick={onClick} style={base}>{label}</button>
      {hover && tip && (
        <div style={{ position:"absolute", top:"calc(100% + 5px)", left:0,
          background:"#111", color:"#fff", fontSize:11, padding:"8px 12px", borderRadius:8,
          zIndex:99999, pointerEvents:"none", width:"max-content", maxWidth:260, minWidth:140,
          lineHeight:1.55, whiteSpace:"normal", wordBreak:"keep-all",
          overflowWrap:"break-word", boxShadow:"0 4px 16px rgba(0,0,0,0.4)" }}>
          {tip}
        </div>
      )}
    </span>
  );
}

function GenreChip({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding:"3px 10px", borderRadius:20, fontSize:11, cursor:"pointer",
      fontWeight:active?700:400, whiteSpace:"nowrap", fontFamily:"inherit",
      border:active?"1.5px solid #A4168B":"0.5px solid #ccc",
      background:active?"#A4168B":"transparent",
      color:active?"#fff":"#555", transition:"all 0.12s",
    }}>{label}</button>
  );
}

function Row({ label, children }) {
  return (
    <div style={{ display:"flex", alignItems:"flex-start", gap:8, marginBottom:10 }}>
      {label && <span style={{ fontSize:12, color:"#888", width:130, flexShrink:0, paddingTop:5, lineHeight:1.3 }}>{label}</span>}
      <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>{children}</div>
    </div>
  );
}

function Sect({ label, open, onToggle, badge, onClear, resetTip, children }) {
  return (
    <div style={{ borderTop:"0.5px solid rgba(0,0,0,0.08)" }}>
      <div onClick={onToggle} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"9px 0", cursor:"pointer" }}>
        <div style={{ display:"flex", alignItems:"center", gap:5, minWidth:0, flex:1, flexWrap:"wrap" }}>
          <span style={{ fontSize:12, fontWeight:600, color:"#333", textTransform:"uppercase", letterSpacing:"0.06em", flexShrink:0 }}>{label}</span>
          <span style={{ fontSize:18, color:"#999", lineHeight:1, flexShrink:0, transform:open?"rotate(180deg)":"none", transition:"transform 0.2s" }}>▾</span>
          {badge && (
            <span style={{ fontSize:10, color:"#A4168B", background:"rgba(164,22,139,0.09)", borderRadius:10,
              padding:"1px 8px", marginLeft:2, maxWidth:210,
              overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
              display:"inline-block", verticalAlign:"middle", fontWeight:600 }}>{badge}</span>
          )}
        </div>
        {badge && onClear && (
          <button onClick={e => { e.stopPropagation(); onClear(); }}
            style={{ width:22, height:22, borderRadius:"50%", fontSize:12,
              color:"#bbb", background:"none", border:"0.5px solid #ddd",
              cursor:"pointer", fontFamily:"inherit", flexShrink:0, marginLeft:4,
              display:"flex", alignItems:"center", justifyContent:"center",
              padding:0, lineHeight:1 }}>↺</button>
        )}
      </div>
      {open && <div style={{ paddingBottom:12 }}>{children}</div>}
    </div>
  );
}

function CopyButton({ text, copyLabel, copiedLabel }) {
  const [copied, setCopied] = useState(false);
  const doCopy = () => {
    const fb = () => {
      const ta = document.createElement("textarea");
      ta.value = text; ta.style.cssText = "position:fixed;top:0;left:0;opacity:0;";
      document.body.appendChild(ta); ta.focus(); ta.select();
      try { document.execCommand("copy"); } catch(e) {}
      document.body.removeChild(ta);
      setCopied(true); setTimeout(()=>setCopied(false),2000);
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(()=>{ setCopied(true); setTimeout(()=>setCopied(false),2000); }).catch(fb);
    } else fb();
  };
  return (
    <button onClick={doCopy} style={{
      fontSize:11, padding:"2px 10px", borderRadius:8,
      border:copied?"0.5px solid #111":"0.5px solid #ccc",
      background:copied?"#111":"#f5f5f5",
      cursor:"pointer", color:copied?"#fff":"#444",
      transition:"all 0.15s", minWidth:60, fontWeight:copied?700:400, fontFamily:"inherit",
    }}>
      {copied ? `✓ ${copiedLabel}` : copyLabel}
    </button>
  );
}

function ErrorBox({ msg }) {
  if (!msg) return null;
  return <p style={{ color:"#c0392b", fontSize:13, margin:0, padding:"10px 14px", background:"#fff0f0", borderRadius:8 }}>{msg}</p>;
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
export default function PromptWisardStoryLab() {
  const [uiLang,    setUiLang]    = useState("de");
  const [theme,     setTheme]     = useState("color");
  const [activeTab, setActiveTab] = useState(0);

  const [tabActive, setTabActive] = useState([[], [], []]);
  const [tabCtx,    setTabCtx]    = useState(["", "", ""]);
  const [selGenres, setSelGenres] = useState([]);

  const [result,  setResult]  = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const [optOpen,   setOptOpen]   = useState(true);
  const [sectOpen,  setSectOpen]  = useState(mkOpen());
  const togSect = grpId =>
    setSectOpen(prev => prev.map((tab, i) => i === activeTab ? { ...tab, [grpId]: !tab[grpId] } : tab));

  const [genOpts, setGenOpts] = useState({ ...GEN_DEFAULTS });
  const setOpt = (k,v) => setGenOpts(p => ({ ...p, [k]:v }));

  // Dice animation state
  const [rolling, setRolling] = useState(false);

  const t    = UI[uiLang] || UI.en;
  const getL = obj => obj?.[uiLang] ?? obj?.en ?? "";

  const accent   = theme === "color" ? ACCENT : "#111";
  const tabColor = theme === "color" ? TAB_COLORS[activeTab] : "#fff";

  const curTabData = TABS_DATA[activeTab];
  const active     = tabActive[activeTab];
  const ctx        = tabCtx[activeTab];
  const setActive  = p => setTabActive(prev => prev.map((x,i) => i===activeTab ? p : x));
  const setCtx     = v => setTabCtx(prev => prev.map((x,i) => i===activeTab ? v : x));
  const togglePrompt = p => setActive(active.find(x=>x.id===p.id) ? active.filter(x=>x.id!==p.id) : [...active,p]);
  const toggleGenre  = g => setSelGenres(prev => prev.includes(g) ? prev.filter(x=>x!==g) : [...prev,g]);

  const hasPlaceholder = active.some(p => p.t.match(/\[[A-Z]+\]/));
  const canGen = active.length > 0 || selGenres.length > 0 || ctx.trim().length > 0;

  // ── Randomize ──
  const randomize = () => {
    setRolling(true);
    setTimeout(() => setRolling(false), 600);

    let genres = [], prompts = [];
    if (activeTab === 0) {
      ({ genres, prompts } = randomizeFilm());
    } else {
      ({ genres, prompts } = randomizeTab(activeTab));
    }
    setSelGenres(genres);
    setActive(prompts);
    // Don't change open/closed state of sections
  };

  // ── Global Reset ──
  const globalReset = () => {
    setSelGenres([]);
    setActive([]);
    setCtx("");
    setResult("");
    setError("");
  };

  const getSectBadge = grpId => {
    if (grpId === "genre") {
      if (!selGenres.length) return null;
      return selGenres.slice(0,3).join(" · ") + (selGenres.length > 3 ? ` +${selGenres.length-3}` : "");
    }
    const grp = curTabData.groups.find(g => g.id === grpId);
    if (!grp) return null;
    const sel = active.filter(a => grp.prompts.find(p => p.id === a.id));
    return sel.length ? sel.map(s => getL(s.label)).join(" · ") : null;
  };

  // ── Generate ──
  const generate = async () => {
    if (!canGen || loading) return;
    setLoading(true); setError(""); setResult("");
    try {
      const nStr = String(genOpts.numIdeas || 5);
      const parts = [];

      if (selGenres.length > 0) {
        if (selGenres.length > 1) {
          parts.push(`Develop ${nStr} compelling film concepts that creatively combine the following genres: ${selGenres.join(", ")}. Each concept should genuinely fuse the genres. 2–4 sentences per concept.`);
        } else {
          parts.push(`Develop ${nStr} film concepts in the ${selGenres[0]} genre. 2–3 sentences each.`);
        }
      }

      active.forEach(p => {
        let txt = p.t.replace(/\[N\]/g, nStr);
        if (txt.match(/\[[A-Z]+\]/) && ctx.trim()) txt = txt.replace(/\[[A-Z]+\]/, ctx.trim());
        parts.push(txt);
      });

      if (ctx.trim() && active.length === 0 && selGenres.length === 0) parts.push(ctx.trim());
      else if (ctx.trim() && !hasPlaceholder && (active.length > 0 || selGenres.length > 0)) parts.push("Additional context: " + ctx.trim());

      const lenMap = { short:"1–2 sentences per idea.", medium:"3–4 sentences per idea.", long:"5–7 sentences per idea." };
      const langMap = { de:"German", en:"English", fr:"French", it:"Italian", es:"Spanish" };
      const sys = `You are a creative story, narrative and concept development assistant. Respond in ${langMap[genOpts.outputLang]||"German"}. ${lenMap[genOpts.length]||""} Generate exactly ${genOpts.numIdeas} ideas unless specifically instructed otherwise. Be bold, specific and inspiring. Give concrete usable ideas, not generic advice.`;

      const text = await callAPI(sys, parts.join("\n\n---\n\n"));
      setResult(text);
    } catch(e) { setError(e && e.message ? e.message : String(e)); }
    setLoading(false);
  };

  const langOpts = [
    { id:"en", label:"English" }, { id:"de", label:"Deutsch" },
    { id:"fr", label:"Français" }, { id:"it", label:"Italiano" }, { id:"es", label:"Español" },
  ];
  const lenOpts = [{ id:"short", label:t.short }, { id:"medium", label:t.medium }, { id:"long", label:t.long }];
  const numOpts = [3,5,7,10].map(n => ({ id:String(n), label:String(n) }));

  return (
    <div style={{ width:"100%", fontFamily:"system-ui, -apple-system, sans-serif" }}>

      {/* ── HEADER ── */}
      <div style={{ background:accent, padding:"14px 20px 0" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
          <div style={{ color:"#fff", fontSize:20, lineHeight:1 }}>
            <span style={{ fontWeight:900 }}>Prompt</span>
            <span style={{ fontWeight:400 }}>Wisard</span>{" "}
            <span style={{ opacity:0.55, fontWeight:900, textTransform:"uppercase", letterSpacing:"0.08em" }}>{t.sub}</span>
            <span style={{ fontSize:11, fontWeight:400, opacity:0.4, marginLeft:6 }}>{t.ver}</span>
          </div>
          <div style={{ display:"flex", gap:4, alignItems:"center", flexWrap:"wrap", justifyContent:"flex-end" }}>
            {Object.keys(LANGS).map(l => (
              <button key={l} onClick={() => setUiLang(l)} style={{
                padding:"3px 8px", borderRadius:12, fontSize:10,
                fontWeight:uiLang===l?700:400,
                border:uiLang===l?"1.5px solid #fff":"0.5px solid rgba(255,255,255,0.4)",
                background:uiLang===l?"rgba(255,255,255,0.2)":"transparent",
                color:"#fff", cursor:"pointer", fontFamily:"inherit",
              }}>{LANGS[l].slice(0,2).toUpperCase()}</button>
            ))}
            <button onClick={() => setTheme(x => x==="color"?"bw":"color")} style={{
              padding:"3px 8px", borderRadius:12, fontSize:10,
              border:"0.5px solid rgba(255,255,255,0.4)",
              background:"rgba(255,255,255,0.15)", color:"#fff", cursor:"pointer", fontFamily:"inherit",
            }}>{theme==="color" ? t.bwToggle[0] : t.bwToggle[1]}</button>
          </div>
        </div>
        {/* Tab bar */}
        <div style={{ display:"flex" }}>
          {t.tabs.map((tab,i) => (
            <div key={i} onClick={() => { setActiveTab(i); setResult(""); setError(""); }}
              style={{
                flex:1, padding:"8px 4px", fontSize:11, textAlign:"center",
                cursor:"pointer", fontWeight:i===activeTab?700:600,
                borderRadius:"8px 8px 0 0", marginLeft:i>0?2:0,
                background:i===activeTab?tabColor:"rgba(255,255,255,0.18)",
                color:i===activeTab?"#111":"#fff", transition:"all 0.15s",
              }}>{tab}</div>
          ))}
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{ background:tabColor, padding:"16px" }}>

        {/* ── OPTIONS ACCORDION ── */}
        <div style={{ background:"#2a2a2a", borderRadius:10, overflow:"visible", marginBottom:10 }}>
          {/* Header row with dice button */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 14px" }}>
            <button onClick={() => setOptOpen(o => !o)} style={{
              display:"flex", alignItems:"center", gap:6,
              background:"none", border:"none", cursor:"pointer", padding:0, fontFamily:"inherit",
            }}>
              <span style={{ fontSize:13, fontWeight:600, color:"#fff" }}>{t.options}</span>
              <span style={{ fontSize:18, color:"#ccc", transform:optOpen?"rotate(180deg)":"none", transition:"transform 0.2s", lineHeight:1 }}>▾</span>
            </button>

            {/* ── DICE + RESET BUTTONS ── */}
            <div style={{ display:"flex", gap:6, alignItems:"center" }}>
              {/* Dice first */}
              <button
                onClick={randomize}
                title={t.randomizeTip}
                style={{
                  width:36, height:36, borderRadius:"50%",
                  border:"1.5px solid rgba(255,255,255,0.35)",
                  background: rolling ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.15)",
                  cursor:"pointer", fontSize:20,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  color:"#fff", flexShrink:0,
                  transform: rolling ? "rotate(180deg) scale(1.1)" : "none",
                  transition:"transform 0.4s cubic-bezier(.36,.07,.19,.97), background 0.2s",
                  boxShadow: rolling ? "0 0 0 3px rgba(255,255,255,0.15)" : "none",
                }}
              >⚄</button>
              {/* Reset */}
              <button
                onClick={globalReset}
                title={t.resetTip}
                style={{
                  width:36, height:36, borderRadius:"50%",
                  border:"1.5px solid rgba(255,255,255,0.35)",
                  background:"rgba(255,255,255,0.1)",
                  cursor:"pointer", fontSize:15,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  color:"rgba(255,255,255,0.7)", flexShrink:0,
                  transition:"background 0.2s",
                }}
              >↺</button>
            </div>
          </div>

          {optOpen && (
            <div style={{ background:"#fff", padding:"4px 14px 4px", borderRadius:"0 0 10px 10px" }}>

              {/* OUTPUT SETTINGS — always first, always open by default */}
              <Sect
                label={t.sections.outputopts}
                open={!!sectOpen[activeTab]?.outputopts}
                onToggle={() => togSect("outputopts")}
                badge={[genOpts.outputLang.toUpperCase(), t[genOpts.length], genOpts.numIdeas+" Ideas"].join(" · ")}
              >
                <Row label={t.outputLang}>
                  {langOpts.map(o => <Chip key={o.id} label={o.label} active={genOpts.outputLang===o.id} onClick={() => setOpt("outputLang",o.id)} />)}
                </Row>
                <Row label={t.length}>
                  {lenOpts.map(o => <Chip key={o.id} label={o.label} active={genOpts.length===o.id} onClick={() => setOpt("length",o.id)} />)}
                </Row>
                <Row label={t.ideas}>
                  {numOpts.map(o => <Chip key={o.id} label={o.label} active={String(genOpts.numIdeas)===o.id} onClick={() => setOpt("numIdeas",Number(o.id))} />)}
                </Row>
              </Sect>

              {/* GENRE SECTION (Film tab only) */}
              {activeTab === 0 && (
                <Sect
                  label={t.sections.genre}
                  open={!!sectOpen[0].genre}
                  onToggle={() => togSect("genre")}
                  badge={getSectBadge("genre")}
                  onClear={selGenres.length > 0 ? () => setSelGenres([]) : null}
                  resetTip={t.resetTip}
                >
                  <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:10, flexWrap:"wrap" }}>
                    <GenreChip
                      label={t.none || "–"}
                      active={selGenres.length === 0}
                      onClick={() => setSelGenres([])}
                    />
                    {selGenres.length > 1 && (
                      <span style={{ fontSize:10, color:"#999", fontStyle:"italic" }}>
                        → Genres werden kombiniert
                      </span>
                    )}
                  </div>
                  {GENRE_GROUPS.map(grp => (
                    <div key={grp.g.en} style={{ marginBottom:10 }}>
                      <div style={{ fontSize:10, color:"#aaa", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:5, fontWeight:600 }}>
                        {getL(grp.g)}
                      </div>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                        {grp.genres.map(g => (
                          <GenreChip key={g} label={g} active={selGenres.includes(g)} onClick={() => toggleGenre(g)} />
                        ))}
                      </div>
                    </div>
                  ))}
                </Sect>
              )}

              {/* CONTENT SECTIONS */}
              {curTabData.groups.map(grp => {
                const grpActive = active.filter(a => grp.prompts.find(p => p.id === a.id));
                const clearGrp = () => setActive(active.filter(a => !grp.prompts.find(p => p.id === a.id)));
                return (
                  <Sect key={grp.id}
                    label={t.sections[grp.id] || grp.id}
                    open={!!sectOpen[activeTab]?.[grp.id]}
                    onToggle={() => togSect(grp.id)}
                    badge={getSectBadge(grp.id)}
                    onClear={grpActive.length > 0 ? clearGrp : null}
                    resetTip={t.resetTip}
                  >
                    <div style={{ display:"flex", flexWrap:"wrap", gap:5, paddingTop:2 }}>
                      {/* Neutral / keine Auswahl chip */}
                      <Chip
                        label={t.none || "–"}
                        active={grpActive.length === 0}
                        onClick={clearGrp}
                        tip={t.noneTip || "Keine Auswahl aus dieser Kategorie"}
                      />
                      {grp.prompts.map(p => (
                        <Chip key={p.id}
                          label={getL(p.label)}
                          active={!!active.find(x => x.id===p.id)}
                          onClick={() => togglePrompt(p)}
                          tip={getL(p.tip)} />
                      ))}
                    </div>
                  </Sect>
                );
              })}

            </div>
          )}
        </div>

        {/* ── CONTEXT + GENERATE ── */}
        <div style={{ background:"#3a3a3a", borderRadius:10, padding:"14px", marginBottom:10 }}>
          <p style={{ fontSize:11, color:"#aaa", margin:"0 0 6px", textTransform:"uppercase", letterSpacing:"0.05em", fontWeight:600 }}>
            {hasPlaceholder ? t.placeholderCtx : t.contextLabel}
          </p>
          <textarea value={ctx} onChange={e => setCtx(e.target.value)}
            placeholder={t.placeholder} rows={3}
            onKeyDown={e => { if (e.key==="Enter"&&!e.shiftKey) { e.preventDefault(); if(canGen) generate(); } }}
            style={{ width:"100%", boxSizing:"border-box", resize:"vertical",
              fontFamily:"inherit", fontSize:13, background:"#fff",
              border:"none", borderRadius:7, padding:"8px 10px",
              color:"#222", marginBottom:10, outline:"none" }} />
          <button onClick={generate} disabled={loading||!canGen} style={{
            width:"100%", padding:"10px", fontSize:14, fontWeight:500,
            borderRadius:8, border:"none",
            background:loading||!canGen?"#555":(theme==="color"?accent:"#111"),
            color:"#fff", cursor:loading||!canGen?"default":"pointer",
            transition:"background 0.2s", fontFamily:"inherit",
          }}>
            {loading ? t.generating : t.generate}
          </button>
        </div>

        <ErrorBox msg={error} />

        {result && (
          <div style={{ background:"#fff", border:"0.5px solid #ddd", borderRadius:10,
            padding:"10px 14px 12px", borderLeft:`3px solid ${accent}`, marginBottom:8 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
              <div style={{ fontSize:11, color:"#666", textTransform:"uppercase", letterSpacing:"0.05em", fontWeight:600 }}>{t.result}</div>
              <CopyButton text={result} copyLabel={t.copy} copiedLabel={t.copied} />
            </div>
            <div style={{ fontSize:13, lineHeight:1.8, color:"#111", whiteSpace:"pre-wrap" }}>{result}</div>
          </div>
        )}

      </div>
    </div>
  );
}
