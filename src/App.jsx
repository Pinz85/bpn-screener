import { useState, useMemo, useCallback } from "react";

const P = "PROHIBITED";
const E = "HIGH RISK (EDD REQUIRED)";
const A = "ALLOWED";

const STATUS_CONFIG = {
  [P]: { bg: "bg-red-50", badge: "bg-red-600 text-white", row: "hover:bg-red-50" },
  [E]: { bg: "bg-yellow-50", badge: "bg-yellow-400 text-yellow-900", row: "hover:bg-yellow-50" },
  [A]: { bg: "bg-green-50", badge: "bg-green-600 text-white", row: "hover:bg-green-50" },
};

const BODY_COLORS = {
  OFAC: "bg-blue-100 text-blue-800",
  EU: "bg-purple-100 text-purple-800",
  UN: "bg-gray-200 text-gray-800",
  UK: "bg-green-100 text-green-800",
};

const INITIAL_DATA = [
  { name:"Afghanistan", region:"Asia", fatfBlack:false, fatfGrey:false, cryptoBan:true, comp:false, bodies:["OFAC","EU","UK"], status:P, notes:"Full crypto ban reinstated under Taliban decree (2022). OFAC, EU, and UK maintain targeted sanctions on Taliban leadership. No functioning KYC/KYB infrastructure. Business prohibited per BPN compliance policy." },
  { name:"Algeria", region:"Africa", fatfBlack:false, fatfGrey:true, cryptoBan:true, comp:false, bodies:[], status:P, notes:"FATF grey list since October 2024. Full crypto ban in force since 2018 under Finance Law 18-04. Business prohibited due to crypto ban." },
  { name:"Bangladesh", region:"Asia", fatfBlack:false, fatfGrey:false, cryptoBan:true, comp:false, bodies:[], status:P, notes:"Full crypto ban since 2017 under Bangladesh Bank directive. Business prohibited per BPN compliance policy." },
  { name:"Belarus", region:"Europe", fatfBlack:false, fatfGrey:false, cryptoBan:false, comp:false, bodies:["OFAC","EU","UK"], status:P, notes:"Extensive OFAC, EU, and UK sanctions following the fraudulent 2020 presidential election and complicity in Russia's invasion of Ukraine. Business prohibited per BPN compliance policy." },
  { name:"Bolivia", region:"Americas", fatfBlack:false, fatfGrey:true, cryptoBan:true, comp:false, bodies:[], status:P, notes:"FATF grey list since June 2025. Full crypto ban per Central Bank of Bolivia Circular 001-2014. Business prohibited due to crypto ban and FATF grey listing." },
  { name:"Central African Republic", region:"Africa", fatfBlack:false, fatfGrey:false, cryptoBan:false, comp:false, bodies:["OFAC","EU","UN","UK"], status:P, notes:"OFAC, EU, UN, and UK sanctions including arms embargo. Active armed conflict. No functional AML/CFT supervisory framework. Business prohibited per BPN compliance policy." },
  { name:"China", region:"Asia", fatfBlack:false, fatfGrey:false, cryptoBan:true, comp:false, bodies:[], status:P, notes:"Comprehensive crypto ban since September 2021. Note: Hong Kong operates a separate regulated crypto framework and is listed independently as Allowed. Business prohibited per BPN compliance policy." },
  { name:"Cuba", region:"Americas", fatfBlack:false, fatfGrey:false, cryptoBan:false, comp:true, bodies:["OFAC"], status:P, notes:"Longstanding comprehensive US sanctions under CACR. Business prohibited per BPN compliance policy." },
  { name:"Egypt", region:"Africa", fatfBlack:false, fatfGrey:false, cryptoBan:true, comp:false, bodies:[], status:P, notes:"Full crypto ban per Central Bank of Egypt rulings. Business prohibited per BPN compliance policy." },
  { name:"Haiti", region:"Americas", fatfBlack:false, fatfGrey:true, cryptoBan:false, comp:false, bodies:["OFAC","UN"], status:P, notes:"FATF grey list with deferred reporting. No functioning AML/CFT governance. Business prohibited per BPN compliance policy." },
  { name:"Iran", region:"Middle East", fatfBlack:true, fatfGrey:false, cryptoBan:false, comp:true, bodies:["OFAC","EU","UN","UK"], status:P, notes:"FATF blacklist. Comprehensive OFAC/EU/UK/UN sanctions. World's leading state sponsor of terrorism. Business absolutely prohibited." },
  { name:"Iraq", region:"Middle East", fatfBlack:false, fatfGrey:false, cryptoBan:true, comp:false, bodies:["OFAC","EU","UK"], status:P, notes:"Crypto ban since 2017 per Central Bank of Iraq directive. Targeted sanctions on ISIS-linked entities. Business prohibited per BPN compliance policy." },
  { name:"Kuwait", region:"Middle East", fatfBlack:false, fatfGrey:true, cryptoBan:true, comp:false, bodies:[], status:P, notes:"Added to FATF grey list at February 2026 Plenary. Full crypto ban per Central Bank of Kuwait Circular 7/2022. Business prohibited." },
  { name:"Lebanon", region:"Middle East", fatfBlack:false, fatfGrey:true, cryptoBan:false, comp:false, bodies:["OFAC","EU","UK"], status:P, notes:"FATF grey list since October 2024. Banking system in complete collapse. Hezbollah networks embedded in economy. Business prohibited." },
  { name:"Libya", region:"Africa", fatfBlack:false, fatfGrey:false, cryptoBan:false, comp:false, bodies:["OFAC","EU","UN","UK"], status:P, notes:"OFAC, EU, UN, UK sanctions including arms embargo. Two competing governments, no unified financial system. Business prohibited." },
  { name:"Mali", region:"Africa", fatfBlack:false, fatfGrey:false, cryptoBan:false, comp:false, bodies:["EU","UN","UK"], status:P, notes:"Removed from FATF grey list June 2025 but very high risk. EU/UN/UK targeted sanctions. Jihadist groups control northern Mali. Business prohibited per BPN compliance policy." },
  { name:"Morocco", region:"Africa", fatfBlack:false, fatfGrey:false, cryptoBan:true, comp:false, bodies:[], status:P, notes:"Full crypto ban per Bank Al-Maghrib under Foreign Exchange Regulations since 2017. Business prohibited due to crypto ban." },
  { name:"Myanmar (Burma)", region:"Asia", fatfBlack:true, fatfGrey:false, cryptoBan:false, comp:false, bodies:["OFAC","EU","UK"], status:P, notes:"FATF blacklist. Military junta using financial system to fund operations. OFAC designations on military conglomerates. Business prohibited." },
  { name:"Nepal", region:"Asia", fatfBlack:false, fatfGrey:true, cryptoBan:true, comp:false, bodies:[], status:P, notes:"FATF grey list since February 2025. Full crypto ban per Nepal Rastra Bank since 2017. Business prohibited." },
  { name:"Nicaragua", region:"Americas", fatfBlack:false, fatfGrey:false, cryptoBan:false, comp:false, bodies:["OFAC","EU","UK"], status:P, notes:"OFAC, EU, UK targeted sanctions on Ortega regime. Business prohibited per BPN compliance policy." },
  { name:"North Korea (DPRK)", region:"Asia", fatfBlack:true, fatfGrey:false, cryptoBan:true, comp:true, bodies:["OFAC","EU","UN","UK"], status:P, notes:"FATF blacklist. Comprehensive OFAC/EU/UN/UK sanctions. World's most prolific state-sponsored crypto hacker (Lazarus Group, est. $3–4B stolen). Business absolutely prohibited." },
  { name:"North Macedonia", region:"Europe", fatfBlack:false, fatfGrey:false, cryptoBan:true, comp:false, bodies:[], status:P, notes:"Crypto ban enacted 2016, reinforced 2023. Business prohibited due to crypto ban." },
  { name:"Qatar", region:"Middle East", fatfBlack:false, fatfGrey:false, cryptoBan:true, comp:false, bodies:[], status:P, notes:"QFCRA has banned all VASP activity. Qatar Central Bank prohibits digital asset dealings. Business prohibited due to crypto ban." },
  { name:"Russia", region:"Europe", fatfBlack:false, fatfGrey:false, cryptoBan:false, comp:false, bodies:["OFAC","EU","UK","UN"], status:P, notes:"Most extensive sanctions on any major economy following Ukraine invasion. FATF membership suspended February 2024. Business prohibited." },
  { name:"Saudi Arabia", region:"Middle East", fatfBlack:false, fatfGrey:false, cryptoBan:true, comp:false, bodies:[], status:P, notes:"SAMA has banned Bitcoin and cryptocurrencies. No legal framework enacted as of February 2026. Business prohibited due to crypto ban." },
  { name:"Somalia", region:"Africa", fatfBlack:false, fatfGrey:false, cryptoBan:false, comp:false, bodies:["OFAC","EU","UN","UK"], status:P, notes:"Arms embargo and targeted sanctions. Al-Shabaab controls significant territory. No credible KYC/KYB possible. Business prohibited." },
  { name:"South Sudan", region:"Africa", fatfBlack:false, fatfGrey:true, cryptoBan:false, comp:false, bodies:["OFAC","EU","UN","UK"], status:P, notes:"FATF grey list, arms embargo, targeted designations. One of the world's most fragile states. Business prohibited." },
  { name:"Sudan", region:"Africa", fatfBlack:false, fatfGrey:false, cryptoBan:false, comp:false, bodies:["OFAC","EU","UK","UN"], status:P, notes:"Devastating civil war since April 2023. Banking system collapsed. KYC/KYB impossible. Business prohibited." },
  { name:"Syria", region:"Middle East", fatfBlack:false, fatfGrey:true, cryptoBan:false, comp:true, bodies:["EU","UN","UK"], status:P, notes:"FATF grey list. OFAC sanctions suspended July 2025 for post-Assad transition but EU/UK remain. Business prohibited pending stabilisation." },
  { name:"Tunisia", region:"Africa", fatfBlack:false, fatfGrey:false, cryptoBan:true, comp:false, bodies:[], status:P, notes:"Full crypto ban since 2018 per Central Bank of Tunisia. Business prohibited due to crypto ban." },
  { name:"Ukraine (Crimea/Donetsk/Luhansk)", region:"Europe", fatfBlack:false, fatfGrey:false, cryptoBan:false, comp:true, bodies:["OFAC","EU","UK"], status:P, notes:"Comprehensive sanctions on Russian-occupied regions since 2014/2022. Business prohibited." },
  { name:"Venezuela", region:"Americas", fatfBlack:false, fatfGrey:true, cryptoBan:false, comp:false, bodies:["OFAC","EU","UK"], status:P, notes:"FATF grey list since June 2024. Targeted OFAC/EU/UK sanctions on Maduro regime. Business prohibited per BPN compliance policy." },
  { name:"Yemen", region:"Middle East", fatfBlack:false, fatfGrey:true, cryptoBan:false, comp:false, bodies:["OFAC","EU","UN","UK"], status:P, notes:"FATF grey list with deferred reporting. Arms embargo, Houthi sanctions. No viable KYC/KYB infrastructure. Business prohibited." },
  { name:"Zimbabwe", region:"Africa", fatfBlack:false, fatfGrey:false, cryptoBan:false, comp:false, bodies:["OFAC","EU","UK"], status:P, notes:"Targeted sanctions on ZANU-PF linked individuals. Business prohibited per BPN compliance policy." },
  { name:"Angola", region:"Africa", fatfBlack:false, fatfGrey:true, cryptoBan:false, comp:false, bodies:[], status:E, notes:"FATF grey list since October 2024. Major oil economy with high state capture risk. Enhanced due diligence required." },
  { name:"Bulgaria", region:"Europe", fatfBlack:false, fatfGrey:true, cryptoBan:false, comp:false, bodies:[], status:E, notes:"FATF grey list. EU member with AML/CFT effectiveness deficiencies, organised crime and real estate ML risk. EDD required." },
  { name:"Cameroon", region:"Africa", fatfBlack:false, fatfGrey:true, cryptoBan:false, comp:false, bodies:[], status:E, notes:"FATF grey list. Active anglophone separatist conflict creating localised TF risk. EDD required." },
  { name:"Cote d'Ivoire", region:"Africa", fatfBlack:false, fatfGrey:true, cryptoBan:false, comp:false, bodies:[], status:E, notes:"FATF grey list since October 2024. Regional financial hub, West Africa spillover risk from Mali/Burkina Faso. EDD required." },
  { name:"DR Congo", region:"Africa", fatfBlack:false, fatfGrey:true, cryptoBan:false, comp:false, bodies:["OFAC","EU","UN","UK"], status:E, notes:"FATF grey list, arms embargo, targeted sanctions. Conflict minerals exposure (gold, coltan). EDD required." },
  { name:"Ethiopia", region:"Africa", fatfBlack:false, fatfGrey:false, cryptoBan:false, comp:false, bodies:["OFAC","EU"], status:E, notes:"Targeted sanctions related to Tigray conflict. Post-Pretoria Agreement sanctions posture evolving. EDD required." },
  { name:"Kenya", region:"Africa", fatfBlack:false, fatfGrey:true, cryptoBan:false, comp:false, bodies:[], status:E, notes:"FATF grey list. Large crypto/mobile money ecosystem, inadequate VASP supervision. EDD required." },
  { name:"Lao PDR", region:"Asia", fatfBlack:false, fatfGrey:true, cryptoBan:false, comp:false, bodies:[], status:E, notes:"FATF grey list since February 2025. Golden Triangle SEZ known ML/cyber scam hotspot. EDD required." },
  { name:"Macau", region:"Asia", fatfBlack:false, fatfGrey:false, cryptoBan:false, comp:false, bodies:[], status:E, notes:"World's largest gambling hub. Known vehicle for ML and capital flight. Sequence restricted. EDD required." },
  { name:"Moldova", region:"Europe", fatfBlack:false, fatfGrey:false, cryptoBan:false, comp:false, bodies:[], status:E, notes:"Transnistria breakaway region is a known sanctions evasion corridor. Sequence restricted. EDD required." },
  { name:"Monaco", region:"Europe", fatfBlack:false, fatfGrey:true, cryptoBan:false, comp:false, bodies:[], status:E, notes:"FATF grey list since June 2024. UHNW wealth management creates inherent ML risk from complex ownership structures. EDD required." },
  { name:"Namibia", region:"Africa", fatfBlack:false, fatfGrey:true, cryptoBan:false, comp:false, bodies:[], status:E, notes:"FATF grey list. Relatively stable middle-income economy with AML/CFT supervisory deficiencies. EDD required." },
  { name:"Papua New Guinea", region:"Pacific", fatfBlack:false, fatfGrey:true, cryptoBan:false, comp:false, bodies:[], status:E, notes:"Added to FATF grey list at February 2026 Plenary. Large informal economy, extractive industries, BO opacity. EDD required." },
  { name:"Sri Lanka", region:"Asia", fatfBlack:false, fatfGrey:false, cryptoBan:false, comp:false, bodies:[], status:E, notes:"Sequence restricted. Post-2022 economic crisis weakened financial system integrity. EDD required." },
  { name:"Ukraine", region:"Europe", fatfBlack:false, fatfGrey:false, cryptoBan:false, comp:false, bodies:[], status:E, notes:"Sequence restricted. Ongoing war creates AML/CFT risk and proximity to sanctions evasion. Note: occupied regions listed separately as Prohibited. EDD required." },
  { name:"Vietnam", region:"Asia", fatfBlack:false, fatfGrey:true, cryptoBan:false, comp:false, bodies:[], status:E, notes:"FATF grey list. #5 globally in crypto adoption, inadequate VASP supervision. EDD required." },
  { name:"Virgin Islands (UK)", region:"Caribbean", fatfBlack:false, fatfGrey:true, cryptoBan:false, comp:false, bodies:[], status:E, notes:"FATF grey list since June 2025. Major offshore financial centre, complex BVI ownership structures. EDD required." },
  ...([
    ["Albania","Europe"],["Andorra","Europe"],["Anguilla","Caribbean"],["Antigua and Barbuda","Caribbean"],["Argentina","Americas"],["Armenia","Asia"],["Aruba","Caribbean"],["Australia","Pacific"],["Austria","Europe"],["Azerbaijan","Asia"],["Bahamas","Caribbean"],["Bahrain","Middle East"],["Barbados","Caribbean"],["Belgium","Europe"],["Belize","Americas"],["Benin","Africa"],["Bermuda","Caribbean"],["Bhutan","Asia"],["Bosnia and Herzegovina","Europe"],["Botswana","Africa"],["Brazil","Americas"],["Brunei","Asia"],["Burkina Faso","Africa"],["Burundi","Africa"],["Cabo Verde","Africa"],["Cambodia","Asia"],["Canada","Americas"],["Cayman Islands","Caribbean"],["Chad","Africa"],["Chile","Americas"],["Colombia","Americas"],["Comoros","Africa"],["Congo (Republic)","Africa"],["Costa Rica","Americas"],["Croatia","Europe"],["Curcacao","Caribbean"],["Cyprus","Europe"],["Czech Republic","Europe"],["Denmark","Europe"],["Djibouti","Africa"],["Dominica","Caribbean"],["Dominican Republic","Americas"],["Ecuador","Americas"],["El Salvador","Americas"],["Equatorial Guinea","Africa"],["Eritrea","Africa"],["Estonia","Europe"],["Eswatini","Africa"],["Fiji","Pacific"],["Finland","Europe"],["France","Europe"],["French Polynesia","Pacific"],["Gabon","Africa"],["Gambia","Africa"],["Georgia","Asia"],["Germany","Europe"],["Ghana","Africa"],["Gibraltar","Europe"],["Greece","Europe"],["Grenada","Caribbean"],["Guernsey","Europe"],["Guatemala","Americas"],["Guinea","Africa"],["Guinea-Bissau","Africa"],["Guyana","Americas"],["Honduras","Americas"],["Hong Kong","Asia"],["Hungary","Europe"],["Iceland","Europe"],["India","Asia"],["Indonesia","Asia"],["Ireland","Europe"],["Isle of Man","Europe"],["Israel","Middle East"],["Italy","Europe"],["Jamaica","Caribbean"],["Japan","Asia"],["Jersey","Europe"],["Jordan","Middle East"],["Kazakhstan","Asia"],["Kiribati","Pacific"],["Kosovo","Europe"],["Kyrgyzstan","Asia"],["Latvia","Europe"],["Lesotho","Africa"],["Liberia","Africa"],["Liechtenstein","Europe"],["Lithuania","Europe"],["Luxembourg","Europe"],["Madagascar","Africa"],["Malawi","Africa"],["Malaysia","Asia"],["Maldives","Asia"],["Malta","Europe"],["Marshall Islands","Pacific"],["Mauritania","Africa"],["Mauritius","Africa"],["Mexico","Americas"],["Micronesia","Pacific"],["Mongolia","Asia"],["Montenegro","Europe"],["Montserrat","Caribbean"],["Mozambique","Africa"],["Nauru","Pacific"],["Netherlands","Europe"],["New Caledonia","Pacific"],["New Zealand","Pacific"],["Niger","Africa"],["Nigeria","Africa"],["Norway","Europe"],["Oman","Middle East"],["Pakistan","Asia"],["Palau","Pacific"],["Palestine","Middle East"],["Panama","Americas"],["Paraguay","Americas"],["Peru","Americas"],["Philippines","Asia"],["Poland","Europe"],["Portugal","Europe"],["Puerto Rico","Americas"],["Romania","Europe"],["Rwanda","Africa"],["Saint Kitts and Nevis","Caribbean"],["Saint Lucia","Caribbean"],["Saint Vincent and the Grenadines","Caribbean"],["Samoa","Pacific"],["San Marino","Europe"],["Sao Tome and Principe","Africa"],["Senegal","Africa"],["Serbia","Europe"],["Seychelles","Africa"],["Sierra Leone","Africa"],["Singapore","Asia"],["Sint Maarten","Caribbean"],["Slovakia","Europe"],["Slovenia","Europe"],["Solomon Islands","Pacific"],["South Africa","Africa"],["South Korea","Asia"],["Spain","Europe"],["Suriname","Americas"],["Sweden","Europe"],["Switzerland","Europe"],["Taiwan","Asia"],["Tajikistan","Asia"],["Tanzania","Africa"],["Thailand","Asia"],["Timor-Leste","Asia"],["Togo","Africa"],["Tonga","Pacific"],["Trinidad and Tobago","Caribbean"],["Turkey","Middle East"],["Turkmenistan","Asia"],["Turks and Caicos Islands","Caribbean"],["Tuvalu","Pacific"],["Uganda","Africa"],["United Arab Emirates","Middle East"],["United Kingdom","Europe"],["United States","Americas"],["Uruguay","Americas"],["Uzbekistan","Asia"],["Vanuatu","Pacific"],["Vatican City","Europe"],["Zambia","Africa"],
  ].map(([name, region]) => ({ name, region, fatfBlack:false, fatfGrey:false, cryptoBan:false, comp:false, bodies:[], status:A, notes:"No current FATF listing, crypto ban, or sanctions flags. Standard due diligence applies." }))),
];

export default function App() {
  const [data, setData] = useState(INITIAL_DATA);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterFlag, setFilterFlag] = useState("ALL");
  const [filterRegion, setFilterRegion] = useState("ALL");
  const [expanded, setExpanded] = useState(null);
  const [sortBy, setSortBy] = useState("name");
  const [refreshStatus, setRefreshStatus] = useState(null);
  const [refreshLog, setRefreshLog] = useState([]);
  const [pushStatus, setPushStatus] = useState(null);
  const [lastUpdated, setLastUpdated] = useState("February 2026 (hardcoded baseline)");

  const regions = useMemo(() =>
    ["ALL", ...Array.from(new Set(data.map(c => c.region))).sort()], [data]);

  const filtered = useMemo(() => data.filter(c => {
    const s = search.toLowerCase();
    const matchSearch = c.name.toLowerCase().includes(s) || c.region.toLowerCase().includes(s);
    const matchStatus = filterStatus === "ALL" || c.status === filterStatus;
    const matchRegion = filterRegion === "ALL" || c.region === filterRegion;
    const matchFlag =
      filterFlag === "ALL" ||
      (filterFlag === "FATF_BLACK" && c.fatfBlack) ||
      (filterFlag === "FATF_GREY" && c.fatfGrey) ||
      (filterFlag === "CRYPTO_BAN" && c.cryptoBan) ||
      (filterFlag === "COMP" && c.comp) ||
      (filterFlag === "SANCTIONS" && c.bodies.length > 0);
    return matchSearch && matchStatus && matchRegion && matchFlag;
  }).sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "region") return a.region.localeCompare(b.region) || a.name.localeCompare(b.name);
    if (sortBy === "status") {
      const order = { [P]: 0, [E]: 1, [A]: 2 };
      return (order[a.status] ?? 3) - (order[b.status] ?? 3) || a.name.localeCompare(b.name);
    }
    return 0;
  }), [data, search, filterStatus, filterFlag, filterRegion, sortBy]);

  const stats = {
    total: data.length, allowed: data.filter(c => c.status === A).length,
    prohibited: data.filter(c => c.status === P).length, edd: data.filter(c => c.status === E).length,
    fatfBlack: data.filter(c => c.fatfBlack).length, fatfGrey: data.filter(c => c.fatfGrey).length,
    crypto: data.filter(c => c.cryptoBan).length, comp: data.filter(c => c.comp).length,
  };

  const handleRefresh = useCallback(async () => {
    setRefreshStatus('loading');
    setRefreshLog([]);
    try {
      const prompt = `You are a compliance data analyst. The current BPN Country Risk Screener baseline is February 2026:
FATF BLACKLIST: Iran, Myanmar, North Korea
FATF GREYLIST: Algeria, Angola, Bolivia, Bulgaria, Cameroon, Cote d'Ivoire, DR Congo, Haiti, Kenya, Kuwait, Lao PDR, Lebanon, Monaco, Namibia, Nepal, Papua New Guinea, South Sudan, Syria, Ukraine, Venezuela, Vietnam, Virgin Islands (UK), Yemen

Identify any changes since February 2026 to: (1) FATF black/grey lists, (2) new comprehensive sanctions by OFAC/EU/UN/UK, (3) new complete national crypto bans.

Respond ONLY with JSON (no markdown):
{"asOf":"Month YYYY","fatfBlacklistChanges":[{"country":"Name","change":"added"|"removed","notes":"reason"}],"fatfGreylistChanges":[{"country":"Name","change":"added"|"removed","notes":"reason"}],"newComprehensiveSanctions":[{"country":"Name","bodies":["OFAC"],"notes":"reason"}],"newCryptoBans":[{"country":"Name","notes":"reason"}],"noChangesDetected":true|false}`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1000,
          tools: [{ type: "web_search_20250305", name: "web_search" }],
          messages: [{ role: "user", content: prompt }]
        })
      });
      const result = await response.json();
      const textBlock = result.content?.find(b => b.type === "text");
      if (!textBlock) throw new Error("No text response");
      const parsed = JSON.parse(textBlock.text.replace(/```json|```/g, "").trim());
      const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
      setLastUpdated(`AI-checked ${today} (data as of ${parsed.asOf || "unknown"})`);
      const log = [];
      let updated = [...data];
      if (parsed.noChangesDetected) {
        log.push({ type: "info", msg: "No changes detected since February 2026 baseline." });
      } else {
        for (const chg of (parsed.fatfBlacklistChanges || [])) {
          const idx = updated.findIndex(c => c.name.toLowerCase() === chg.country.toLowerCase());
          if (idx >= 0) { updated[idx] = { ...updated[idx], fatfBlack: chg.change === "added" }; if (chg.change === "added" && updated[idx].status === A) updated[idx] = { ...updated[idx], status: P, notes: `[AUTO-UPDATED] FATF Blacklisted. ${chg.notes}` }; log.push({ type: "warn", msg: `FATF Blacklist: ${chg.country} ${chg.change}. ${chg.notes}` }); }
          else log.push({ type: "warn", msg: `FATF Blacklist change — unknown country: ${chg.country}` });
        }
        for (const chg of (parsed.fatfGreylistChanges || [])) {
          const idx = updated.findIndex(c => c.name.toLowerCase() === chg.country.toLowerCase());
          if (idx >= 0) { updated[idx] = { ...updated[idx], fatfGrey: chg.change === "added" }; if (chg.change === "added" && updated[idx].status === A) updated[idx] = { ...updated[idx], status: E, notes: `[AUTO-UPDATED] Added to FATF grey list. ${chg.notes} EDD required.` }; log.push({ type: chg.change === "added" ? "warn" : "ok", msg: `FATF Greylist: ${chg.country} ${chg.change}. ${chg.notes}` }); }
          else log.push({ type: "warn", msg: `FATF Greylist change — unknown country: ${chg.country}` });
        }
        for (const s of (parsed.newComprehensiveSanctions || [])) {
          const idx = updated.findIndex(c => c.name.toLowerCase() === s.country.toLowerCase());
          if (idx >= 0) { updated[idx] = { ...updated[idx], bodies: [...new Set([...updated[idx].bodies, ...s.bodies])], comp: true, status: P, notes: `[AUTO-UPDATED] New comprehensive sanctions: ${s.bodies.join(", ")}. ${s.notes}` }; log.push({ type: "warn", msg: `New sanctions on ${s.country}: ${s.bodies.join(", ")}. ${s.notes}` }); }
        }
        for (const ban of (parsed.newCryptoBans || [])) {
          const idx = updated.findIndex(c => c.name.toLowerCase() === ban.country.toLowerCase());
          if (idx >= 0) { updated[idx] = { ...updated[idx], cryptoBan: true, status: P, notes: `[AUTO-UPDATED] New crypto ban. ${ban.notes} Business prohibited.` }; log.push({ type: "warn", msg: `New crypto ban: ${ban.country}. ${ban.notes}` }); }
        }
        if (log.length === 0) log.push({ type: "info", msg: "Changes returned but none matched known countries. Review manually." });
      }
      setData(updated); setRefreshLog(log); setRefreshStatus('done');
    } catch (err) {
      setRefreshLog([{ type: "error", msg: `Refresh failed: ${err.message}` }]);
      setRefreshStatus('error');
    }
  }, [data]);

  const handlePushToClickUp = useCallback(async () => {
    setPushStatus('loading');
    try {
      const prohibited = data.filter(c => c.status === P).sort((a,b) => a.name.localeCompare(b.name));
      const edd = data.filter(c => c.status === E).sort((a,b) => a.name.localeCompare(b.name));
      const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
      const md = `# BPN Country Business Risk Screener\n**Last updated:** ${today} | ${lastUpdated}\n**Total:** ${data.length} | **Prohibited:** ${prohibited.length} | **EDD:** ${edd.length} | **Allowed:** ${data.filter(c=>c.status===A).length}\n\n---\n\n## 🔴 Prohibited (${prohibited.length})\n\n| Country | Region | Flags | Bodies | Reason |\n|---------|--------|-------|--------|--------|\n${prohibited.map(c=>{const f=[c.fatfBlack&&"FATF Black",c.fatfGrey&&"FATF Grey",c.cryptoBan&&"Crypto Ban",c.comp&&"Comp. Sanctions"].filter(Boolean).join(", ")||"—";return`| **${c.name}** | ${c.region} | ${f} | ${c.bodies.join(", ")||"—"} | ${c.notes.substring(0,100)}… |`;}).join("\n")}\n\n---\n\n## 🟡 High Risk — EDD Required (${edd.length})\n\n| Country | Region | Flags | Bodies | Notes |\n|---------|--------|-------|--------|-------|\n${edd.map(c=>{const f=[c.fatfBlack&&"FATF Black",c.fatfGrey&&"FATF Grey",c.cryptoBan&&"Crypto Ban",c.comp&&"Comp. Sanctions"].filter(Boolean).join(", ")||"—";return`| **${c.name}** | ${c.region} | ${f} | ${c.bodies.join(", ")||"—"} | ${c.notes.substring(0,100)}… |`;}).join("\n")}\n\n---\n*Reference only. Verify against official sources.*`;

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1000,
          mcp_servers: [{ type: "url", url: "https://mcp.clickup.com/mcp", name: "clickup" }],
          messages: [{ role: "user", content: `Create a new page in ClickUp document ID "2ky41vw1-71173", as a sub-page of parent page ID "2ky41vw1-61013". Name it "BPN Country Risk Screener — ${today}". Use content_format text/md with this content:\n\n${md}` }]
        })
      });
      await res.json();
      setPushStatus('done');
    } catch (err) { setPushStatus('error'); }
  }, [data, lastUpdated]);

  const Spinner = () => <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 bg-gray-900 rounded flex items-center justify-center"><span className="text-white text-xs font-bold">BPN</span></div>
                <h1 className="text-xl font-semibold text-gray-900">Country Business Risk Screener</h1>
              </div>
              <p className="text-sm text-gray-500 ml-11">FATF · Crypto Bans · Comprehensive & Targeted Sanctions · {stats.total} jurisdictions</p>
              <p className="text-xs text-gray-400 ml-11 mt-0.5">Last updated: {lastUpdated}</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={handleRefresh} disabled={refreshStatus === 'loading'} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${refreshStatus==='loading'?'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed':refreshStatus==='done'?'bg-green-50 text-green-700 border-green-200 hover:bg-green-100':refreshStatus==='error'?'bg-red-50 text-red-700 border-red-200':'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'}`}>
                {refreshStatus==='loading'?<><Spinner/>Checking…</>:refreshStatus==='done'?'✓ Up to date':refreshStatus==='error'?'⚠ Retry':<><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>Refresh live data</>}
              </button>
              <button onClick={handlePushToClickUp} disabled={pushStatus==='loading'} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${pushStatus==='loading'?'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed':pushStatus==='done'?'bg-green-50 text-green-700 border-green-200 hover:bg-green-100':pushStatus==='error'?'bg-red-50 text-red-700 border-red-200':'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'}`}>
                {pushStatus==='loading'?<><Spinner/>Pushing…</>:pushStatus==='done'?'✓ Pushed to ClickUp':pushStatus==='error'?'⚠ Push failed':<><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>Push to ClickUp</>}
              </button>
            </div>
          </div>
          {refreshLog.length > 0 && (
            <div className="mt-3 ml-11 space-y-1">
              {refreshLog.map((l, i) => (
                <div key={i} className={`text-xs px-3 py-1.5 rounded-lg border ${l.type==='warn'?'bg-amber-50 text-amber-800 border-amber-200':l.type==='ok'?'bg-green-50 text-green-800 border-green-200':l.type==='error'?'bg-red-50 text-red-800 border-red-200':'bg-blue-50 text-blue-800 border-blue-200'}`}>
                  {l.type==='warn'?'⚠ ':l.type==='ok'?'✓ ':l.type==='error'?'✕ ':'ℹ '}{l.msg}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="grid grid-cols-4 md:grid-cols-8 gap-2 mb-6">
          {[
            {label:"Total",val:stats.total,color:"border-gray-300 bg-white",tc:"text-gray-800"},
            {label:"Allowed",val:stats.allowed,color:"border-green-300 bg-green-50",tc:"text-green-700"},
            {label:"Prohibited",val:stats.prohibited,color:"border-red-300 bg-red-50",tc:"text-red-700"},
            {label:"High Risk (EDD)",val:stats.edd,color:"border-yellow-300 bg-yellow-50",tc:"text-yellow-700"},
            {label:"FATF Black",val:stats.fatfBlack,color:"border-gray-300 bg-gray-50",tc:"text-gray-800"},
            {label:"FATF Grey",val:stats.fatfGrey,color:"border-gray-300 bg-gray-50",tc:"text-gray-800"},
            {label:"Crypto Ban",val:stats.crypto,color:"border-gray-300 bg-gray-50",tc:"text-gray-800"},
            {label:"Comp. Sanctions",val:stats.comp,color:"border-gray-300 bg-gray-50",tc:"text-gray-800"},
          ].map(s => (
            <div key={s.label} className={`border rounded-lg p-2.5 ${s.color}`}>
              <div className={`text-xl font-bold ${s.tc}`}>{s.val}</div>
              <div className="text-xs text-gray-500 mt-0.5 leading-tight">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 flex flex-wrap gap-3 items-center">
          <input className="border border-gray-300 rounded px-3 py-2 text-sm flex-1 min-w-40 focus:outline-none focus:ring-1 focus:ring-gray-400" placeholder="Search country or region..." value={search} onChange={e=>{setSearch(e.target.value);setExpanded(null);}}/>
          <select className="border border-gray-300 rounded px-3 py-2 text-sm bg-white" value={filterStatus} onChange={e=>{setFilterStatus(e.target.value);setExpanded(null);}}>
            <option value="ALL">All Statuses</option><option value={A}>Allowed</option><option value={P}>Prohibited</option><option value={E}>High Risk (EDD Required)</option>
          </select>
          <select className="border border-gray-300 rounded px-3 py-2 text-sm bg-white" value={filterRegion} onChange={e=>{setFilterRegion(e.target.value);setExpanded(null);}}>
            {regions.map(r=><option key={r} value={r}>{r==="ALL"?"All Regions":r}</option>)}
          </select>
          <select className="border border-gray-300 rounded px-3 py-2 text-sm bg-white" value={filterFlag} onChange={e=>{setFilterFlag(e.target.value);setExpanded(null);}}>
            <option value="ALL">All Flags</option><option value="FATF_BLACK">FATF Blacklist</option><option value="FATF_GREY">FATF Greylist</option><option value="CRYPTO_BAN">Crypto Ban</option><option value="COMP">Comprehensive Sanctions</option><option value="SANCTIONS">Any Sanctions</option>
          </select>
          <select className="border border-gray-300 rounded px-3 py-2 text-sm bg-white" value={sortBy} onChange={e=>setSortBy(e.target.value)}>
            <option value="name">Sort: A-Z</option><option value="status">Sort: Status</option><option value="region">Sort: Region</option>
          </select>
          <span className="text-sm text-gray-500 ml-auto font-medium">{filtered.length} / {stats.total}</span>
        </div>

        <div className="flex flex-wrap gap-2 mb-4 text-xs">
          {[{label:"FATF Black",color:"bg-red-700 text-white"},{label:"FATF Grey",color:"bg-orange-400 text-white"},{label:"Crypto Ban",color:"bg-violet-600 text-white"},{label:"Comp. Sanctions",color:"bg-rose-600 text-white"},{label:"OFAC",color:"bg-blue-100 text-blue-800"},{label:"EU",color:"bg-purple-100 text-purple-800"},{label:"UN",color:"bg-gray-200 text-gray-800"},{label:"UK",color:"bg-green-100 text-green-800"}].map(l=>(
            <span key={l.label} className={`px-2 py-1 rounded-full font-medium ${l.color}`}>{l.label}</span>
          ))}
        </div>

        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="grid grid-cols-12 bg-gray-50 border-b border-gray-200 px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            <div className="col-span-3">Country</div><div className="col-span-1 text-center">Region</div><div className="col-span-3 text-center">Flags</div><div className="col-span-2 text-center">Sanctioning Bodies</div><div className="col-span-2 text-center">Status</div><div className="col-span-1"></div>
          </div>
          {filtered.length === 0 && <div className="text-center py-12 text-gray-400 text-sm">No countries match your filters.</div>}
          {filtered.map((c, i) => {
            const cfg = STATUS_CONFIG[c.status] || STATUS_CONFIG[A];
            const isOpen = expanded === i;
            return (
              <div key={c.name+i} className={`border-b border-gray-100 last:border-0 ${isOpen?cfg.bg:cfg.row} transition-colors`}>
                <div className="grid grid-cols-12 px-4 py-2.5 items-center gap-1 cursor-pointer" onClick={()=>setExpanded(isOpen?null:i)}>
                  <div className="col-span-3 font-medium text-gray-900 text-sm">{c.name}</div>
                  <div className="col-span-1 text-center text-xs text-gray-500">{c.region}</div>
                  <div className="col-span-3 flex flex-wrap gap-1 justify-center">
                    {c.fatfBlack&&<span className="px-1.5 py-0.5 rounded text-xs font-semibold bg-red-700 text-white">FATF Black</span>}
                    {c.fatfGrey&&<span className="px-1.5 py-0.5 rounded text-xs font-semibold bg-orange-400 text-white">FATF Grey</span>}
                    {c.cryptoBan&&<span className="px-1.5 py-0.5 rounded text-xs font-semibold bg-violet-600 text-white">Crypto Ban</span>}
                    {c.comp&&<span className="px-1.5 py-0.5 rounded text-xs font-semibold bg-rose-600 text-white">Comp. Sanctions</span>}
                    {!c.fatfBlack&&!c.fatfGrey&&!c.cryptoBan&&!c.comp&&c.bodies.length===0&&<span className="text-xs text-gray-300">None</span>}
                  </div>
                  <div className="col-span-2 flex flex-wrap gap-1 justify-center">
                    {c.bodies.map(b=><span key={b} className={`px-1.5 py-0.5 rounded text-xs font-medium ${BODY_COLORS[b]}`}>{b}</span>)}
                    {c.bodies.length===0&&<span className="text-xs text-gray-300">None</span>}
                  </div>
                  <div className="col-span-2 flex justify-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold whitespace-nowrap ${cfg.badge}`}>{c.status}</span>
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <svg className={`w-4 h-4 text-gray-300 transition-transform ${isOpen?"rotate-180":""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
                  </div>
                </div>
                {isOpen&&(
                  <div className={`px-4 pb-3 pt-1 ${cfg.bg}`}>
                    <div className={`text-sm text-gray-700 bg-white border ${c.status===P?"border-red-200":c.status===E?"border-yellow-200":"border-green-200"} rounded-lg p-3 leading-relaxed`}>
                      <span className="font-semibold">Compliance Notes: </span>{c.notes}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <p className="text-xs text-gray-400 mt-4 text-center">{lastUpdated} · Sources: FATF, OFAC, EU Sanctions Map, UK OFSI, UN Security Council · Reference only — always verify against official sources.</p>
      </div>
    </div>
  );
}
