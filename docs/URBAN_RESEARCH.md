# Urban Research

This is the evidence base for every civic improvement in *Trash Panda: Right of Way*.

**Rules:**
- Never invent statistics.
- Say when evidence is mixed or thin, and label uncertain claims as uncertain.
- Present opposing arguments fairly.
- In-game text (blurbs, "did you know?" cards) may only use claims recorded here, with a source.
- M3.3: every upgrade names its source in the game (`source` in `src/data/upgrades.ts`), on the results card and under ABOUT > SOURCES. The links are here; the game shows names, because opening web pages from a fullscreen phone game is awkward.
- The Livability numbers in the game are **game abstractions**, not measurements. The game does not claim to rank real cities.

**Release check (2026-11-23):** every claim the game shows (upgrade blurbs, plaques, captions) was reread against this file, and the ones that can change were searched again. Results:
- Still true, nothing newer found: the speed-camera ban (§2), the Ontario Line's cost and schedule (§8, nothing after August 2026), the Science Centre's interim site and 2029 date (§5), Ottawa's no to jets at the island airport (§23, nothing after early August 2026).
- Updated: the bike-lane fight (§1: the Supreme Court leave application, and how much has been removed).
- Changed in the game: the Gardiner payoff (§9: the deck stays as a park; new sources).
- Fixed: the CN Tower plaque (§20: the 2007 record was "tallest free-standing structure", not "tallest tower").
- Verified: the 🟡 plaques in §18 and §20.

Status legend: ✅ researched (enough for the game's claims) · 🟡 partial (more research before content ships) · ⬜ not started

**Research last reviewed: 2026-11-23** (the release check above, plus an outside audit of this file: see "Audit, 2026-11-23" at the end).

| # | Intervention | Mission | Status |
|---|---|---|---|
| 1 | Protected bike lanes (+ the 2024–26 provincial laws) | The Bike Lane War (main 1) | ✅ checked 2026-11-23 |
| 2 | School-zone speed cameras (automated speed enforcement) + traffic calming | *Slow Down, Dog* (main 4) | ✅ checked 2026-11-23 |
| 3 | Transit signal priority | Let the Streetcar Through (main 2) | ✅ (1991 result via a secondary summary, flagged) |
| 4 | Transit-priority corridor (King St pilot) | King of the Street (main 3) | ✅ checked 2026-11-23 |
| 5 | The Ontario Science Centre (closure, storage, interim site, relocation) | Save the Science (main 6) | ✅ checked 2026-11-23 |
| 6 | Parking → public space (parking minimums) | The Great Parking Lot (main 7) | ✅ (appeal outcome 🟡, not used in game) |
| 7 | Waterfront public space (Ontario Place) | The Waterfront Heist (main 8) | ✅ checked 2026-11-23 |
| 8 | Ontario Line / rapid transit | Finish the Line (main 9) | ✅ checked 2026-11-23 |
| 9 | Highway transformation (Gardiner) | Death by Highway (main 10) | ✅ checked 2026-11-23 |
| 10 | Pedestrian streets | (cut) | ⬜ |
| 11 | Protected intersections | (cut) | ⬜ |
| 12 | GO electrification | (cut) | ⬜ |
| 13 | Rail Deck Park | (cut) | ⬜ |
| 14 | Induced demand ("another car lane") | Intro cutscene, Death by Highway | ✅ (qualitative) |
| 15 | Trinity Bellwoods gates (landmark plaque) | Queen West map | ✅ |
| 16 | The Parkside Drive speed camera | Slow Down, Dog + High Park plaque | ✅ checked 2026-11-23 |
| 17 | High Park flavour (Howards, car-free roads, capybaras) | High Park map | ✅ checked 2026-11-23 |
| 18 | Downtown + Roncesvalles landmark plaques | Downtown / High Park maps | ✅ checked 2026-11-23 |
| 19 | The Lane Eater (Bloor) | The Lane Eater (main 5) | ✅ via §1 |
| 20 | Waterfront + East End landmark plaques | East End / Waterfront maps | ✅ checked 2026-11-23 |
| 21 | M3.1 landmarks | East End / Waterfront maps | ✅ checked 2026-11-12 |
| 22 | M3.2 Waterfront quays | Waterfront map | ✅ checked 2026-11-13 |
| 23 | The island airport, jets and Little Norway Park (2026) | *Grounded* (main 11) | ✅ checked 2026-11-23 |
| 24 | Bike buses + School Streets | The Bike Bus (East End, on the map) | ✅ for the game's claims |
| 25 | Bike share | Dock Drop (Downtown, on the map) | ✅ checked 2026-11-23 |
| 26 | Strachan's bike lanes + the game's bike network | every mission's payoff | 🟡 Strachan's current lanes not rechecked on a map; the network is fiction |

**What ✅ means:** the claims the game actually shows are backed by a source good enough for that claim. Background facts that rest on Wikipedia or a secondary summary are labelled where they appear; they are context, not the basis of in-game text.

---

## 1. Protected bike lanes ✅

**PROJECT:** Physically separated (curb, bollard or planter) bike lanes on a main street, replacing painted lanes or a car or parking lane.

**TORONTO EXAMPLES**
- **Bloor Street West pilot (2016) → made permanent.** The City's 2017 evaluation recommended permanence. It found a safer, more comfortable environment for cyclists, "with acceptable trade-offs in motorist traffic flow and parking convenience". Cycling rose about **49%** on the corridor, roughly a quarter of that from new riders. Some of the increase was riders shifting from parallel Harbord and Dupont.
  - **The trade-off, in the same evaluation (added 2026-11-23):** car traffic on Bloor fell from about 24,300 to 20,000 vehicles a day (**−16%**). Dupont rose 7% and Harbord 4%, and the three corridors together fell 3%. Car travel times on Bloor between Bay and Ossington rose by about 2.5 to 8.5 minutes at first; after operational changes (turn restrictions, loading and parking rules) the increase was roughly halved. [City of Toronto: Bloor Street bike lanes](https://www.toronto.ca/services-payments/streets-parking-transportation/cycling-in-toronto/cycle-track-projects/bloor-street-bike-lanes/); [Global News, preliminary data](https://globalnews.ca/news/3270161/bloor-street-bicycle-lanes-have-increased-driving-times); [UrbanToronto](https://urbantoronto.ca/news/2017/02/bloor-bike-lanes-changes-coming-after-data-hints-impacts). [City of Toronto 2017 staff report background file](https://www.toronto.ca/legdocs/mmis/2017/pw/bgrd/backgroundfile-107739.pdf); [The Varsity summary](https://thevarsity.ca/2017/10/16/city-report-supports-permanent-implementation-of-bloor-bike-lanes)
- **Bloor economic impact study** (Toronto Centre for Active Transportation). Using Danforth Ave as a control street, all four economic indicators pointed to *increased* activity after the lane was installed, despite removing 136 on-street parking spots and a traffic lane. Merchants were more worried than visitors.
  - **Limits (added 2026-11-23):** spending on Danforth, which got no bike lane, rose at a similar rate, so the study shows Bloor stayed economically healthy; it can't show the lane *caused* the growth. It was commissioned by the City, the Metcalf Foundation and the Bloor Annex and Korea Town BIAs. [TCAT: business is up on Bloor](https://tcat.ca/business-is-up-on-bloor-after-bike-lane-new-study-finds/); [City summary (2019)](https://www.toronto.ca/wp-content/uploads/2019/12/8e2c-Bloor-West-Economic-Impacts-Summary-FINAL-Nov2019.pdf). [TCAT project page](https://tcat.ca/project/bloor-street-west-bike-lane-pilot-economic-impact-study/); [full report (2019)](https://ero.ontario.ca/public/public_uploads/2024-11/Bloor-Economic-Impact-Study-Full-Report-2019-09-03_4.pdf)
- **Bill 212 (2024), the province's bike-lane removal law.** The *Reducing Gridlock, Saving You Time Act* directed removal of about 19 km of protected lanes on Bloor, Yonge and University and required provincial approval for new lanes that remove a car lane.
  - April 2025: an injunction paused removals.
  - **July 30, 2025:** the Ontario Superior Court (Justice Schabas) found the removal provisions violated s.7 of the Charter (security of the person).
  - **August 14, 2026:** the **Ontario Court of Appeal unanimously overturned** that ruling, holding that the trial judge had effectively created a right to bike lanes.
  - **October 2026:** removal work began on a stretch of Bloor West in Etobicoke, with protests and arrests. Cycle Toronto and two co-applicants applied for leave to appeal to the Supreme Court of Canada (mid-October). Asking for leave doesn't stop the removals, and the applicants hadn't sought a stay; a decision on leave typically takes about five months.
  - **October 30, 2026:** the Transportation Minister announced the removal was complete on the **1.2 km of Bloor West between Clissold Rd and Royal York Rd**: curbs, delineators and bus pads out, repaved, car lanes restored. The province also posted a proposed regulation requiring removal on Bloor, Yonge and University (comment period into November). 🟡 An outside audit gave its number as O. Reg. 327/26; I couldn't confirm the number. [CP24, Oct 30 2026](https://www.cp24.com/local/toronto/2026/10/30/bloor-west-bike-lane-removal-complete-ontario-transportation-minister-confirms/); [NOW Toronto](https://nowtoronto.com/news/ontario-completes-bloor-street-bike-lane-removal/).
  - **November 2026 (checked 2026-11-23):** no decision on leave reported. A Cycle Toronto op-ed said **1.2 km** of the targeted lanes were gone and work on University, Yonge and Bloor could resume as early as spring 2027. [CBC: cyclists ask the Supreme Court](https://www.cbc.ca/news/canada/toronto/supreme-court-bicycle-lanes-9.7378765); [Globe and Mail](https://www.theglobeandmail.com/canada/toronto/article-supreme-court-toronto-bike-lanes/); [Canadian Cycling Magazine](https://cyclingmagazine.ca/sections/news/toronto-bike-lane-advocates-take-fight-to-supreme-court/). The game's text says only what had happened by October 2026 (§19), so nothing in the game changes.

  - **September 2026:** the province issued an RFP to restore motor-vehicle lanes on Bloor, Yonge, University Avenue, Queen's Park and Avenue Road, and to identify where lanes could be retained or reconfigured. **Dundas Street West is not on the list** (checked at Ivan's question during the M0 review: the removal fight belongs on Bloor, i.e. the High Park district, not Dundas). [insauga, Sep 1 2026](https://www.insauga.com/bike-lanes-to-be-removed-on-major-toronto-streets/); [The Eyeopener, Oct 2026](https://theeyeopener.com/2026/10/province-continues-removal-of-bike-lanes-amid-backlash-from-protestors-cyclists/)

  Sources: [Wikipedia: Reducing Gridlock, Saving You Time Act](https://en.wikipedia.org/wiki/Reducing_Gridlock,_Saving_You_Time_Act); [Cycle Toronto v. Ontario](https://www.cycleto.ca/cycle_toronto_v_ontario); [National Observer, Aug 14 2026](https://www.nationalobserver.com/2026/08/14/news/ontarios-court-ford-toronto-bike-lanes); [Globe and Mail](https://www.theglobeandmail.com/canada/toronto/article-ontarios-top-court-clears-way-for-toronto-bike-lane-approval/); [National Observer, Oct 13 2026](https://www.nationalobserver.com/2026/10/13/news/cyclists-court-battle-toronto-bike-lane-removals); [CP24, Oct 14 2026](https://www.cp24.com/politics/queens-park/2026/10/14/cycling-protest-blocks-toronto-bike-lane-removal-work-along-bloor-street-stretch/)

- **Bill 60, the *Fighting Delays, Building Faster Act, 2025*** (Royal Assent **November 27, 2025**; added 2026-11-23). Its Schedule 5 amends the Highway Traffic Act so that no Ontario municipality may reduce the number of motor-vehicle lanes to install a new bike lane; the province says cities can still add bike lanes where no car lane is lost. This is province-wide and separate from Bill 212, which targets Toronto's existing lanes on Bloor, Yonge and University (Bill 212's s.195.6 was itself amended in June 2025). Ottawa staff found 27 active bike projects affected, 20 able to proceed with minor design changes. [Legislative Assembly: Bill 60](https://www.ola.org/en/legislative-business/bills/parliament-44/session-1/bill-60); [Environmental Registry notice](https://ero.ontario.ca/notice/025-1071); [McMillan LLP](https://mcmillan.ca/insights/publications/bill-60-becomes-law-updated-on-the-fighting-delays-building-faster-act-2025/); [Ottawa projects (Yahoo/CBC)](https://ca.news.yahoo.com/seven-ottawa-bike-lane-projects-204431867.html).
  - **What it means for the game:** the game's lanes mostly replace **curb parking lanes**, which on its wording Bill 60 doesn't cover; lanes that took a travel lane would now need a provincial exemption. The game's network is labelled fiction (§26), and no in-game text claims these lanes could be built under today's law.

**CANADIAN / NORTH AMERICAN EXAMPLES:** Montréal's REV network and Vancouver's separated lanes. 🟡 Specific outcome figures are still to be sourced before they're used in game text.

**INTERNATIONAL EXAMPLES:** Copenhagen and the Netherlands (separated cycle tracks as the default on busy streets). 🟡 Figures still to be sourced.

**EVIDENCE (safety)**
- **Teschke et al. 2012, *American Journal of Public Health* 102(12):2336–43.** A case-crossover study of 690 injured cyclists in **Toronto and Vancouver**:
  - **Cycle tracks** had the lowest injury risk of 14 route types: adjusted OR **0.11** (95% CI 0.02–0.54), about **1/9** the risk of major streets with parked cars and no bike infrastructure. Strictly this is an adjusted *odds* ratio from a case-crossover design, not a measured absolute risk; "about 1/9 the risk" is the common reading of it.
  - Painted bike lanes on major streets: OR 0.54 (CI 0.29–1.01).
  - **Streetcar or train tracks raised risk about 3×** (OR 3.0, CI 1.8–5.1). That's for the route category "streetcar or train tracks" in both cities, not a Queen St estimate; it's why Queen's tracks matter, not a measure of Queen.
  - Caveats: the CI is wide because Toronto and Vancouver had few cycle tracks at the time; the study is observational.

  [PMC full text](https://pmc.ncbi.nlm.nih.gov/articles/PMC3519333)

**BENEFITS:** Lower cyclist injury risk (Teschke); more people cycling on the corridor (Bloor +49%); neutral-to-positive local business indicators (TCAT Bloor study).

**TRADEOFFS:** Removes on-street parking and/or a general traffic lane; can reduce motorist convenience. The City called these trade-offs acceptable on Bloor. Loading and accessible pick-up need careful curbside design.

**CRITICISMS (stated fairly)**
- The Ontario government argues bike lanes on major arterials worsen congestion. Its law's title frames removal as "reducing gridlock".
- Some merchants fear lost customers when parking is removed. The TCAT data did not show losses on Bloor, but merchant concern was real.
- Critics of the Charter case argued courts shouldn't decide street design. The Court of Appeal agreed that there's no constitutional right to bike lanes.
- 🟡 Whether removing these specific lanes measurably improves traffic is disputed. Find the province's own analysis and the City's response before writing game text on it.

**TORONTO-SPECIFIC CONSIDERATIONS:** Streetcar tracks on many main streets (a crash risk for cyclists, and space conflicts); winter maintenance of separated lanes; deliveries and Wheel-Trans curb access; the provincial approval requirement (Bill 212) for any lane that removes car space.

**QUEEN WEST TODAY (the mission's premise):** the stretch of Queen St W along Trinity Bellwoods has **no bike lanes**: cyclists ride in the curb lane between parked cars and the 501's tracks (the track hazard above: OR 3.0). Painted lanes do exist further west (Brock to Sorauren: a September 2026 TTC track-repair notice mentions them), so in-game copy says "this stretch", never "Queen has no bike lanes anywhere". [TTC notice, Queen W Brock–Sorauren](https://www.ttc.ca/service-advisories/construction-notices/Queen-and-Brock-and-Sorauren-Ave)

**GAME IMPLEMENTATION:** Mission 1, *The Bike Lane War* (Queen West, M1 version after Ivan's review). The before vignette shows a parent with a child seat squeezed between a streetcar and parked cars, while Dog Fjord's rats declare the curb lane "ANOTHER CAR LANE". The player clears the rats, and the curb **parking lanes become protected bike lanes** (green paint, curb, bollards, planters on the traffic side), swept in across the map while the parked cars drive off. Afterwards, cyclists appear in the new lanes. Before it, the few cyclists ride in the streetcar lane and cars queue behind them honking.

**GAME EFFECT:** Livability +4 (cycling +14, safety +8, walking +2, less car dependence +4). The game abstraction says nothing about real-world magnitudes. End-of-game stat: +2 protected bike lanes.

**In-game blurb (must stay sourced):** "IN A TORONTO + VANCOUVER STUDY, SEPARATED CYCLE TRACKS HAD ABOUT 1/9 THE ODDS OF INJURY OF BUSY STREETS WITH PARKED CARS." (Teschke 2012)

**Tone note:** The game is satire and the antagonist is fictional. Dog Fjord is a cartoon and not a depiction of any real person. The real-world dispute is live, so the game shows the evidence and lets the visual payoff carry the argument rather than making claims about real individuals.

---

## 2. School-zone speed cameras (automated speed enforcement) ✅ for the game's claims

**PROJECT:** Automated speed enforcement (ASE) cameras in school and community-safety zones.

**TORONTO / ONTARIO**
- **The ban:** Ontario banned municipal ASE through **Bill 56**, the *Building a More Competitive Economy Act, 2025*.
  - Enforcement ended **November 14, 2025**. Toronto stopped issuing penalty orders and began removing cameras.
  - The City said school-zone signage would go up at former permanent camera sites.
  - The province said 37 municipalities had cameras, and it set up a fund for alternatives (speed bumps, signage, curb extensions, education).
  - School-bus stop-arm cameras remain legal.
  - **Royal Assent: November 3, 2025** (resolved 2026-11-23; October 30 was the vote, 69–41). The ban took effect on November 14. [Legislative Assembly: Bill 56 status](https://www.ola.org/en/legislative-business/bills/parliament-44/session-1/bill-56/status); [insauga](https://www.insauga.com/speed-cameras-are-now-banned-across-ontario/).
  - **Checked 2026-11-23:** the ban stands. The province's alternatives fund is $210 million; Toronto got a one-time ~$30 million top-up for the crossing guards the fines used to pay for; some councils want the cameras back. No reversal found. [Toronto's crossing-guard top-up](https://ca.news.yahoo.com/toronto-receive-29m-top-crossing-090000787.html); [the "banniversary"](https://ca.news.yahoo.com/speed-camera-banniversary-ottawa-calling-212216300.html)

  Sources: [City of Toronto ASE page](https://www.toronto.ca/services-payments/streets-parking-transportation/road-safety/vision-zero/safety-initiatives/automated-speed-enforcement/); [CP24, Nov 14 2025](https://www.cp24.com/local/toronto/2025/11/14/speed-enforcement-cameras-officially-banned-across-ontario/); [TorontoToday](https://www.torontotoday.ca/ontario-news/ontario-tables-bill-to-ban-speed-cameras-premier-calls-them-cash-grabs-11372120); [CARSP commentary](https://carsp.ca/en/news/carsp-news/evaluating-the-decision-to-ban-automated-speed-enforcement-in-ontario/)

**EVIDENCE**
- **SickKids + Toronto Metropolitan University, published in *Injury Prevention* (2025).** The study covered mobile ASE across **250 Toronto school zones**, July 2020 to December 2022.
  - The **proportion** of vehicles speeding fell by **45%** (a rate, not a count).
  - 85th-percentile speed fell by **10.7 km/h**.
  - Vehicles going 20+ km/h over the limit fell by about **87–88%** (sources differ slightly).
  - Speeding returned after cameras were moved, which supports a causal reading.
  - Caveats: the study did not measure injuries directly, and it overlapped with COVID-era traffic changes.

  [SickKids news release](https://www.sickkids.ca/en/news/archive/2025/automated-speed-enforcement-significantly-reduces-speeding-in-toronto-school-zones); [TMU release](https://www.torontomu.ca/news-events/news/2025/07/cameras-cut-speeding-by-45-per-cent-in-toronto-school-zones/); [City of Toronto news release](https://www.toronto.ca/news/automated-speed-enforcement-data-highlight-significant-speed-reduction-impact/)

**CRITICISMS (stated fairly):** The provincial government called the cameras a "cash grab" that functioned mainly as revenue. Some drivers objected to a high volume of tickets from particular units (the province cited one Toronto camera issuing over 65,000 tickets). Supporters included the Ontario Association of Chiefs of Police and public-health researchers.

**STILL TO RESEARCH (🟡):** international ASE evidence (e.g. systematic reviews); whether the replacement fund's measures (speed humps, curb extensions) have comparable evidence; and the injury link between speed and pedestrian fatality risk, from an authoritative source.

**CLAIM USED IN GAME (blurb):** "TORONTO SCHOOL-ZONE CAMERAS CUT SPEEDING 45%... AND IT CAME BACK WHEN THEY WENT. HUMPS AND RAISED CROSSINGS KEEP WORKING WITHOUT TICKETS." The first two sentences are the SickKids/TMU findings; the third is a design statement, not a statistic. 🟡 (audit, 2026-11-23) The third sentence implies humps are a like-for-like substitute, which this file hasn't shown (see STILL TO RESEARCH); M4.18: now "HUMPS AND RAISED CROSSINGS KEEP WORKING WITHOUT TICKETS." (Ivan's call).

**GAME IMPLEMENTATION (built in M2):** see §16. Upgrade *School zone, slowed by design*: Safety +12, Walking +5, Livability +3.

---

## 3. Transit signal priority (TSP) ✅ (for the game's claim)

**PROJECT:** Traffic signals that detect an approaching streetcar and hold the green (or shorten the red) so it doesn't wait at the light. Toronto streetcars get a separate white vertical "transit bar" signal.

**TORONTO EVIDENCE**
- **1991 TTC/MTO demonstration, six intersections** (via a secondary summary; the original report wasn't found): total streetcar delay at the equipped intersections fell by about **35%**, with no significant effect on side-street queues. Bus TSP in the same era gave smaller gains (about 2–6% of round-trip time). Source: US DOT ITS Knowledge Resources, [benefit entry 2007-B00362](https://www.itskrs.its.dot.gov/2007-b00362).
- **2025–26 City pilots (505 Dundas, 510 Spadina):** the City's initial findings report up to **5 minutes** of improvement on the modified segments in the peak periods. That covers only the changed segments, not whole routes, and the City is still monitoring. Source: [City of Toronto background file 288607 (2026)](https://www.toronto.ca/legdocs/mmis/2026/te/bgrd/backgroundfile-288607.pdf).
- **Independent tracking is less rosy:** Steve Munro's 510 Spadina travel-time analysis found results "not as good as I had hoped" after three intersections were changed. Per-intersection effects are hard to isolate, and priority is "absent or ineffective" at many locations. Sources: [stevemunro.ca, Apr 2026](https://stevemunro.ca/2026/04/13/faster-streetcars-someday-maybe/); [How slow is my streetcar, Aug 2026](https://stevemunro.ca/2026/08/17/how-slow-is-my-streetcar-overview/).
- **Modelling:** a 510 Spadina simulation estimates end-to-end trips **19–38% faster** if priority is extended to major intersections. This is a model result, not a measurement.

**CLAIM USED IN GAME (blurb):** "WHEN TORONTO TESTED STREETCAR SIGNAL PRIORITY AT SIX INTERSECTIONS, STREETCAR DELAY THERE FELL ABOUT 35%." This is the 1991 measured result, scoped to the intersections tested.

**CRITICISMS / NUANCE:** TSP works best where it's applied widely and alongside other fixes (stop consolidation, turn restrictions, all-door boarding). Side-street delay can rise at busy crossings. The game's escort shows the mechanism (the light waits for the streetcar) and doesn't claim a route-wide speed-up.

**GAME IMPLEMENTATION:** *Let the Streetcar Through* (main 2, Queen West). The 501 rolls along behind you. You pump signal call boxes to grant priority (the white transit bar), move a double-parked van and a left-turner off the tracks, and swat away the cones rats drop on the rails. Delay counts against the schedule. **Map payoff:** streetcars on Queen no longer stop at red lights and run a little faster; transit-bar signal heads and detector loops appear at Ossington and Bellwoods. 🟡 (audit, 2026-11-23) Real TSP extends greens and shortens reds; it doesn't remove every red. The map's "never stops" is a game exaggeration; Ivan kept it (M4.18).

---

## 4. Transit-priority corridor (King St) ✅

**PROJECT:** The King Street Transit Pilot (November 2017) took through traffic off King between Bathurst and Jarvis. Cars must turn right at most intersections; local access, deliveries and pick-ups remain, and curb lanes on some blocks became public space and patios. King did not become car-free. Council made it permanent on **April 16, 2019**.

**EVIDENCE**
- **Ridership:** about 72,000 → **84,000** weekday riders on the 504 King (+~17%). The City calls it the **busiest surface transit route in the city**; only the two main subway lines carry more. Sources: [City of Toronto, "The future is King"](https://www.toronto.ca/news/the-future-is-king-king-street-transit-pilot-made-permanent/); [King St pilot page + dashboards](https://www.toronto.ca/services-payments/streets-parking-transportation/transportation-projects/king-street-pilot/); [2019 staff report](https://www.toronto.ca/legdocs/mmis/2019/cc/bgrd/backgroundfile-132032.pdf).
- **Travel time:** rush-hour trips about **4 minutes** faster end to end (≈16%); afternoon peak 4–5 minutes. A Ryerson (TMU) study found 4–7 minutes off evening commutes.
- **Reliability:** about a third fewer delayed trips; 85% of westbound AM-peak streetcars arrived within 4 minutes.
- **Cost:** about $1.5M, using low-cost materials. Sources: [Streetsblog, Jan + Nov 2018](https://usa.streetsblog.org/2018/11/13/toronto-cleared-cars-off-a-major-transit-corridor-and-it-worked/); [NACTO case study](https://nacto.org/latest/king-street-transit-priority-corridor-toronto/).

**CLAIM USED IN GAME (blurb):** "THE KING ST PILOT CUT RUSH-HOUR STREETCAR TRIPS BY ABOUT 4 MINUTES, AND RIDERSHIP GREW. COUNCIL MADE IT PERMANENT IN 2019." Briefing caption: "THE BUSIEST STREETCAR LINE IN TOWN" (City wording: busiest surface transit route).

**CRITICISMS (stated fairly):** Some businesses opposed the change. In a 2018 City update (Moneris card data), spending on King grew 0.3% above the prior year's average while the area around the pilot grew 5.7% and the city 3.8% over the same months; the City's 2018 annual summary reported total King St spending down 0.8% year over year, mostly in restaurants. Comparing a corridor with the whole city doesn't establish cause either way. [Global News](https://globalnews.ca/news/4030259/spending-king-street-pilot-toronto); [City annual dashboard (2019)](https://www.toronto.ca/wp-content/uploads/2019/04/8fb5-TS_King-Street-Annual-Dashboard_Final.pdf). Also: and restaurants complained about lost car traffic (some later embraced the patios). Enforcement of the turn rules was uneven at first. A TMU CUR&LD post argued the pilot still fell short of transit needs.

**GAME IMPLEMENTATION:** *King of the Street* (main 3, Downtown). Arena waves of rats, then **SUV Rats** (through-traffic: stomp the roof or pump the bumper until it gives up and turns off: "RIGHT TURN ONLY!"), then the **Bureaucrat Rat** boss ("PERMIT DENIED"). **Map payoff:** red TTC lanes at intersections, through-car traffic gone from King, curb lanes turned into wooden patio decks with umbrellas.

---

## 5. The Ontario Science Centre ✅ checked 2026-11-15

- **The building:** Raymond Moriyama's brutalist complex on Don Mills Road opened on **September 28, 1969**. Its three main buildings step down the Don ravine, joined by bridges and escalators, placed so mature trees could stay. [Ontario Science Centre (Wikipedia)](https://en.wikipedia.org/wiki/Ontario_Science_Centre).
- **The closure:** on **June 21, 2024** the Ministry of Infrastructure closed it with a few hours' notice, citing an engineering report (Rimkus) that found water damage on **2–6 %** of the roofs and RAAC roof panels at risk under snow load; repairs were estimated at **at least $22 million** and two years. Workers and critics disputed that the whole site had to close at once rather than be repaired in parts. Over 95,000 people petitioned to repair and reopen it. (An earlier line here said it was the only Ontario public building closed over RAAC; no authoritative inventory confirms that, so it's removed.) [Wikipedia](https://en.wikipedia.org/wiki/Ontario_Science_Centre); [Global News, a year on](https://globalnews.ca/news/11252077/ont-science-centre/).
- **The Auditor General:** in December 2023 the relocation decision was found "not fully informed" (incomplete costing, little consultation); in December 2024 the Auditor General found the estimated cost to build and maintain the new centre at Ontario Place had risen by **$397 million over 50 years (+47%)**, while the government never updated the **$257 million** saving it announced in 2023. [Global News, Dec 2024](https://globalnews.ca/news/10899041/ontario-science-centre-relocation-cost). The new building at Ontario Place is expected to open in **2029**; the province announced the groundbreaking in May 2026. Its cost appears as **$1.04 billion** (the fixed-price contract to design, build, finance and maintain it, February 2026) and about $1.4 billion elsewhere; these measure different things, and the game uses neither. 2029 is the province's target ("as early as 2029"), not a guarantee. [CBC: opening 2029](https://www.cbc.ca/news/canada/toronto/science-centre-ontario-place-opening-delayed-1.7414677); [Globe and Mail](https://www.theglobeandmail.com/canada/toronto/article-new-ontario-science-centre-at-ontario-place-to-open-in-2029-auditor/); [NOW Toronto: timeline](https://nowtoronto.com/news/ontario-science-centre-to-open-temporary-waterfront-hub-heres-a-timeline-from-closure-to-new-home/).
- **The exhibits went into storage** when the building emptied in late 2024: to sites in Guelph, northern Toronto (101 Resources Road, government-owned storage) and a pop-up at Sherway Gardens. [CBC: workers say goodbye](https://www.cbc.ca/news/canada/toronto/workers-say-goodbye-ontario-science-centre-1.7383016); [CP24](https://www.cp24.com/local/toronto/2024/11/14/workers-say-goodbye-to-an-almost-empty-ontario-science-centre-as-repairs-get-underway/).
- **The interim site opened at Harbourfront Centre on June 29, 2026** (checked 2026-11-16; this resolves the earlier 🟡): about 86,000 sq ft against the old building's 568,000, with a space exhibit, KidSpark and an Innovation Station, while the Ontario Place building goes up for 2029. [Global News, June 29, 2026](https://globalnews.ca/news/11942987/interim-ontario-science-centre-opens/).

**FICTION LABEL (M4.1):** the mission moved to the Waterfront when the North district was dropped (Ivan's call). The Queens Quay warehouse of exhibits, the guards, the moving truck, the Wrecker and the pop-up the payoff opens are the game's. The closure, the storage, the real interim site at Harbourfront and the 2029 date are fact, and the blurb ends "THE RATS AND THE WAREHOUSE ARE FICTION." (M4 reopened the Don Mills building as the game's wish; that framing is gone with the North.)

**GAME IMPLEMENTATION:** *Save the Science* (main 6; Waterfront since M4.1, a warehouse on Queens Quay across from the Power Plant). Guard rats stand watch with flashlights that swing left and right; caught in the beam (and not crouched behind a crate) and the guard calls for backup. Rats carry the Van de Graaff generator toward a moving truck: catch them. Then **the Wrecker**, a crane with a wrecking ball: jump the ball, pump the engine while it reloads, stomp the cab. **Map payoff:** the boards and the CLOSED sign come down, an OPEN banner goes up, the Van de Graaff stands outside: SCIENCE BY THE LAKE.

## 8. The Ontario Line ✅ checked 2026-11-15

- **The line:** **15.6 km**, **15 stations**, from Exhibition to Science Centre station (at Don Mills + Eglinton): Exhibition, King West, Queen-Spadina (Chinatown), Osgoode, Queen, Moss Park, Corktown (Distillery), East Harbour, Leslieville, Gerrard, Pape, Cosburn, Thorncliffe Park, Flemingdon Park, Science Centre. Groundbreaking March 27, 2022; downtown tunnelling started **April 20, 2026** with the boring machines *Libby* and *Corkie*. [Ontario Line (Wikipedia)](https://en.wikipedia.org/wiki/Ontario_Line). *(Station names vary between sources; the game shows entrances, not names.)*
- **Cost and schedule:** announced in 2019 at **$10.9 billion**, due 2027. In August 2026 Metrolinx's CEO confirmed a current price tag of about **$34 billion**, after the $4.32 billion Pape tunnel contract, and said the budget remained "under pressure" with the elevated-section contract still to come, so it's not a final figure. A June 2026 Metrolinx report had about $29.7–29.8 billion; the two weren't presented on a stated like-for-like basis. He said the line "should open by the early 2030s". [The Hub, Aug 12 2026](https://thehub.ca/2026/08/12/ontario-line-cost-climbs-to-34-billion-as-critics-fault-procurement-rules-and-runaway-budgets/).

**FICTION LABEL:** the game opens it today; the blurb gives the real schedule.

**GAME IMPLEMENTATION:** *Finish the Line* (main 9, Downtown). A wave, a locked arena of five rail piles to pump into track while rats defend them, a wave with a lobbyist, then the **Mega Rat**: road chunks, a shove, and a leap that POUNDS the ground and sends shockwaves both ways. **Map payoff:** station entrances on Queen (Downtown), Queen + Carlaw and Gerrard (East End), and beside the Science Centre (North).

## 9. Highway transformation: the Gardiner ✅ for the game's claims (partly secondary, flagged)

- **Toronto's decision:** on **June 11, 2015** City Council voted **24–21** for the "hybrid" option, keeping and rebuilding the elevated Gardiner East between Jarvis and the DVP; the removal-and-boulevard option failed 19–26. In March 2016 council endorsed the Hybrid 3 design. [CP24](https://www.cp24.com/mobile/news/council-votes-in-favour-of-hybrid-option-for-eastern-gardiner-1.2417368); [blogTO](https://blogto.com/city/2015/06/toronto_votes_for_hybrid_option_on_east_gardiner); [CBC](https://amp.cbc.ca/news/canada/toronto/hybrid-gardiner-expressway-imagined-3-ways-by-city-staff-1.3231461). The Gardiner and the DVP were later uploaded to the province under the Toronto–Ontario deal. [CBC](https://www.cbc.ca/news/canada/toronto/costs-dvp-gardiner-ontario-1.7010542).
- **Seoul, Cheonggyecheon:** Seoul removed **5.8 km** of elevated highway (and surface lanes) to restore the Cheonggyecheon stream. A peer-reviewed study in *Transport Policy* (2012) concluded that, nine years on, "the anxiety about additional traffic problems due to the associated decrease in road capacity was unfounded". An OECD review of the monitoring found most former traffic did not reappear on nearby streets; people shifted departure times and used the Metro more. [Transport Policy abstract (ScienceDirect)](https://www.sciencedirect.com/science/article/abs/pii/S0967070X12000108); [Global Designing Cities Initiative](https://globaldesigningcities.org/publication/global-street-design-guide/streets/special-conditions/elevated-structure-removal/case-study-cheonggyecheon-seoul-korea/). 🟡 The OECD summary is secondary; the study's abstract is the primary claim used.
- **A park on a highway deck: Seoullo 7017** (M4.17, checked 2026-11-23). Seoul turned the Seoul Station overpass, a highway flyover from **1970**, into an elevated garden walk that opened on **May 20, 2017** (design by MVRDV). Its length is given as 983 m to 1,042 m depending on the source, so the game says "1 KM". The closure year is also reported differently (2009 or 2015), so the game doesn't use it. The name: "70" for 1970, "17" for 2017 and its 17 walkways. [Seoullo 7017 (Wikipedia)](https://en.wikipedia.org/wiki/Seoullo_7017); [Seoul Solution: opening on May 20](https://seoulsolution.kr/en/node/6745); [World-Architects](https://www.world-architects.com/en/architecture-news/headlines/seoul-opens-its-own-high-line); [Structurae](https://structurae.net/en/structures/seoullo-7017).
- **The Bentway, under the Gardiner:** its first phase opened on **January 6, 2018** with a 220 m figure-eight skating trail around the deck's piers by Fort York, funded by a $25 million donation from Judy and Wil Matthews; it has been a public space for programs and events since. [The Bentway (Wikipedia)](https://en.wikipedia.org/wiki/The_Bentway); [CP24](https://www.cp24.com/news/bentway-skate-trail-officially-opens-underneath-gardiner-expressway-1.3748396); [Waterfront Toronto](https://www.waterfrontoronto.ca/our-projects/bentway-project-under-gardiner).
- **Transferability (added 2026-11-23):** Seoul is evidence that removing elevated road capacity didn't bring the feared jams *there*; it's not a prediction for Toronto, whose transit, street grid, density and alternative routes differ. The game no longer cites Cheonggyecheon in its text.
- **Elsewhere (not used in game text):** a review of 70+ road-capacity reductions found on average about a quarter of the traffic "disappeared" (secondary summary, unverified). Rochester's Inner Loop East (2014–2017) shows rising population and property values; traffic findings are only suggestive. San Francisco's Embarcadero boulevard carries a share of the old freeway's trips (a secondary figure, unverified). [Rochester (UC eScholarship)](https://escholarship.org/content/qt3v1245pc/qt3v1245pc.pdf); [RPA](https://rpa.org/reports/reimagining-the-bqe).
- **Induced demand (the intro's joke, §14):** Duranton & Turner (2011).

**FICTION LABEL (M4.17, Ivan: "I want the pillars to stay, but they would have a park rather than a highway"):** the game keeps the piers and turns the deck into a park. The blurb opens by calling that fiction and says what Toronto actually chose, then gives the two real precedents: "THE PARK ON THE DECK IS FICTION. IN 2015 TORONTO VOTED 24-21 TO REBUILD THE GARDINER FROM JARVIS TO THE DON VALLEY PARKWAY, NOT TEAR IT DOWN. BUT IN 2017 SEOUL TURNED A 1970 HIGHWAY OVERPASS INTO A 1 KM GARDEN WALK, AND UNDER THE GARDINER THE BENTWAY HAS BEEN PUBLIC SPACE SINCE 2018." (Until M4.17 the game took the whole deck down and cited Cheonggyecheon; that evidence stays above, no longer in game text.)

**GAME IMPLEMENTATION:** *Death by Highway* (main 10, Waterfront, unlocks last). The "...another lane?" scene: Dog Fjord adds lanes to the highway shot twice and it never moves. Three waves under the deck, then **the Highway Mech**, a walking stretch of expressway with a highway sign for a head: it stomps (shockwaves), flings cars from its claw, then overheats with its chest vent glowing (pump it); jump onto its deck from the slabs it drops at 2/3 and 1/3 health ("ANOTHER LANE!"). **Map payoff (M4.17):** the cars leave the deck and it becomes a park (lawn, a path, trees, planters, a bench) on the same piers; Lake Shore gets protected bike lanes, and the sidewalk under the deck gets lawn and benches. The after-vignette shows the deck from the side with trees along its railing: "THE PILLARS STAYED. THE CARS DIDN'T." / "A PARK IN THE SKY." Then Dog Fjord concedes, and the report card and the credits roll.


---

## 14. Induced demand ("another car lane") ✅ (qualitative)

**CLAIM USED IN GAME:** The intro's highway shot is satire of the idea that widening a congested road fixes congestion: a sixth lane is paved in and fills with the same crawl. Since the M1.1 review it is **wordless** (the "SIX LANES. STILL NOT MOVING." caption was cut as too direct), so no statistic is claimed.

**EVIDENCE:** Duranton & Turner (2011), "The Fundamental Law of Road Congestion", *American Economic Review* 101(6): 2616–52. Across US metro areas, vehicle-kilometres travelled on interstates rose roughly one-for-one with lane-kilometres (a long-run, metro-wide finding about highways, not a prediction for a particular Toronto road). New road capacity fills with new traffic, so congestion is not relieved in the long run.

**CRITICISMS / NUANCE:** Short-term relief can occur, and the effect size varies by context. Widening can also serve freight or safety goals. The game uses the finding as a gag in the intro and as the thesis of *Death by Highway*. Before any numeric claim ships, add a Toronto/Ontario-specific source (e.g. the Gardiner/DVP or Highway 401 widening history). 🟡

---

## 15. Trinity Bellwoods gates (landmark plaque) ✅

**IN-GAME PLAQUE (shortened at Ivan's M1 review):** "THE UNIVERSITY OF / TRINITY COLLEGE / 1852 - 1925"

**SOURCES:** The plaque's 1852–1925 are the college's years on the Queen St site, not its founding. Trinity College was founded by Bishop John Strachan in 1851 and stood on the Queen St site until moving to the University of Toronto in 1925. Most college buildings were demolished in the 1950s. The stone-and-iron gates and St. Hilda's survive, and the gates were restored in 2007. [Wikipedia: Trinity Bellwoods Park](https://en.wikipedia.org/wiki/Trinity_Bellwoods_Park); [Friends of Trinity Bellwoods Park: history](https://trinitybellwoods.ca/nature-and-park-history/); [Taylor on History](https://tayloronhistory.com/2016/01/24/the-lost-trinity-college-of-bellwoods-parktoronto/)

**UNCERTAIN (not used in game):** The gates' construction date. Sources give 1900 (ACO), 1903 (historical marker) and 1905–06 (Taylor on History, designed by Frank Darling), so the plaque avoids it. [ACO Toronto](https://acotoronto.ca/building.php?ID=3048); [HMdb marker](https://www.hmdb.org/m.asp?m=259655)

**OTHER LOCAL DETAILS IN THE MAP:**
- the **dog bowl**, the hollow left by buried Garrison Creek
- the park's **white squirrel**, a local celebrity
- **Little Portugal's** tiled facades on Dundas W
- the **505 Dundas** and **501 Queen** streetcars
- a graffiti laneway behind Queen, inspired by Graffiti Alley (Rush Lane), which is further east near Spadina, technically downtown, as Ivan noted. It stays here for now and may move to the Downtown district

These are scenery, not factual claims.

---

## 16. The Parkside Drive speed camera (landmark plaque + mission 4 story) ✅

The camera on Parkside Drive, along High Park's east edge, was cut down again and again:
- First cut down days after Council **endorsed the Parkside Drive Study in principle** (November 2024, 19–7): a redesign with a two-way cycle track that would cut car lanes from three to two in places. The City now says it can't complete the project because of changes to the Highway Traffic Act (Bill 60, §1), and Council direction is needed to revise the design. [City of Toronto: Parkside Drive Study](https://www.toronto.ca/community-people/get-involved/public-consultations/infrastructure-projects/parkside-drive-study); [CBC](https://www.cbc.ca/1.7385226).
- In late December 2024 it was dragged about 200 m into High Park and **dumped in a pond**.
- By September 2025 it had been cut down for the **7th time in less than a year**. Police opened a criminal investigation.
- Parkside is a City-designated Community Safety Zone. Residents' group Safe Parkside argues that the lack of physical safety measures is the real problem.

Sources: [CP24, Sept 7 2025](https://www.cp24.com/local/toronto/2025/09/07/torontos-parkside-speed-camera-cut-down-for-7th-time-in-recent-months/); [Global News, pond](https://globalnews.ca/news/10937865/toronto-speed-camera-chopped-down-thrown-into-pond); [CBC, third time + pond](https://www.cbc.ca/1.7420342); [CP24, Nov 30 2024](https://www.cp24.com/local/toronto/2024/11/30/disappointing-parkside-drive-speed-camera-cut-down-less-than-24-hours-after-being-reinstalled/).

**PLAQUE:** "PARKSIDE SPEED CAMERA / CUT DOWN 7 TIMES IN / LESS THAN A YEAR. ONCE / DUMPED IN A PARK POND."

**GAME IMPLEMENTATION:** *Slow Down, Dog* (main 4). The briefing shows rats sawing the camera down with Dog Fjord cheering. The mission opens with a **chase**: catch the haulers before they reach the pond. Then you **build**: pump the stakes to raise a speed hump, a raised crosswalk and a curb extension while SUV Rats speed through. Each finished piece slows the cars that cross it. **Map payoff:** humps, a raised school crosswalk, SLOW stencils, curb-extension planters, and the camera back on its pole. The game is fiction here: the camera returns even though Ontario's ban stands (§2). Parkside's traffic now drives at half speed.

**GAME FICTION (Ivan, M2 review):** the payoff headline says *THE CAMERA BAN IS LIFTED*. That is the game's fantasy outcome, not a claim about Ontario, where the ban stands as of this writing.

**WHY THE PAYOFF LEANS ON DESIGN, NOT JUST THE CAMERA:** the SickKids/TMU study (§2) found speeding returned when cameras left. Physical calming stays put. The blurb says exactly that, and nothing more: no unsourced injury numbers.

---

## 17. High Park (district flavour) ✅

- **The Howards' land:** in 1873 John George Howard and Jemima Howard agreed to convey their High Park property to the City as a public park, in exchange for a pension, keeping Colborne Lodge for life. Sources disagree on the acreage (120 of 165 acres is the common reading). The park opened to the public in 1876. Sources: [City of Toronto, Colborne Lodge](https://www.toronto.ca/explore-enjoy/history-art-culture/museums/colborne-lodge); [High Park Nature Centre](https://highparknature.org/article-topic/cultural-history-of-toronto-high-park); [Wikipedia, J. G. Howard](https://en.wikipedia.org/wiki/John_George_Howard). Plaque wording ("AGREED IN 1873 TO PASS THEIR LAND TO THE CITY") avoids the disputed "gift" framing.
- **Car-free roads:** park roads have been closed to visitor vehicles on weekends and holidays since March 2020. Council's High Park Movement Strategy (2023) closed West Road and portions of Colborne Lodge Drive to cars seven days a week as its immediate actions, and kept the weekend and holiday closures for the rest. Sources: [City news release](https://www.toronto.ca/news/toronto-city-council-endorses-phased-improvements-to-how-people-move-around-and-access-high-park); [CTV, phase one](https://www.ctvnews.ca/toronto/article/toronto-implements-first-phase-of-its-high-park-car-free-plan/).
  - **Checked 2026-11-23:** the permanent road redesign is still in consultation (Phase 2 public meeting, spring 2026), with construction after detailed design. An outside audit said the 2023 closures weren't in place; the City's own pages say they were, so this stays. A fully car-free park remains a longer-term goal. [City: implementation](https://www.toronto.ca/city-government/planning-development/construction-new-facilities/parks-facility-plans-strategies/high-park-movement-strategy-implementation/). The map draws the park roads car-free (no traffic lanes on them).
- **Bonnie + Clyde:** two capybaras escaped the High Park Zoo on May 24, 2016 and were both recaptured weeks later. Source: [Global News](https://globalnews.ca/news/2718477/2-capybaras-on-the-lam-after-escaping-pen-at-high-park-zoo); [CP24](https://www.cp24.com/mobile/news/bonnie-and-clyde-capybaras-who-escaped-from-high-park-zoo-still-on-the-loose-1.2915880).
- **Bloor's bike lanes:** drawn as they are today. Their removal fight is mission 5 (§1).

---

## 18. Downtown + Roncesvalles landmarks (plaques) ✅ checked 2026-11-23

Checked for the release (sources below the list):
- **Toronto City Hall** (Viljo Revell) opened in **1965**. The Nathan Phillips Square pool becomes a skating rink in winter, and three concrete Freedom Arches span it.
- **Old City Hall** (E. J. Lennox) opened in **1899**.
- **299 Queen St W** (the CHUM-City building) has a news van bursting out of its wall at Queen + John.
- **The Revue Cinema** on Roncesvalles opened in **1912**.
- **The Jamie Bell Adventure Playground** in High Park was destroyed by fire in 2012 and rebuilt by community volunteers (M2.1 plaque).
- **The Grenadier Cafe** sits at the bottom of West Road (from the City's High Park map).
- **Graffiti Alley** (Rush Lane) runs south of Queen, west of Spadina. It moved here from the Queen West map after Ivan's M1 note.

Sources: City Hall formally opened **September 13, 1965**; Old City Hall officially opened **September 18, 1899** ([Toronto City Hall (Wikipedia)](https://en.wikipedia.org/wiki/Toronto_City_Hall); [City of Toronto: tours + points of interest](https://www.toronto.ca/services-payments/venues-facilities-bookings/booking-city-facilities/city-hall/tours-points-of-interest/); [The Canadian Encyclopedia: Old City Hall](https://thecanadianencyclopedia.ca/en/article/toronto-feature-old-city-hall)). The Revue was built 1911–12 and opened in **1912** ([Revue Cinema (Wikipedia)](https://en.wikipedia.org/wiki/Revue_Cinema); [Revue Cinema: history](https://revuecinema.ca/history/)). The Jamie Bell castle burned in an arson on **March 17, 2012** and was rebuilt with donated materials and volunteers ([CTV: community rallies](https://toronto.ctvnews.ca/community-rallies-to-rebuild-torched-playground-1.787060); [CTV: opening delayed](https://toronto.ctvnews.ca/opening-delayed-as-torched-playground-gets-final-touches-1.869496)). 299 Queen W's van and the Grenadier Cafe are descriptions, not dated claims.

---

## 6. Parking → public space: Toronto's parking minimums ✅

- **December 15–17, 2021:** City Council adopted item PH29.3, removing **minimum parking requirements for most land uses** in new developments. The exceptions were **visitor parking and accessible parking**. Parking **maximums** were introduced at the same time.
- **February 3, 2022:** Council enacted **By-law 89-2022**, amending Zoning By-law 569-2013. It was appealed to the Ontario Land Tribunal, and technical corrections followed (By-law 125-2022; MM47.70, July 2022). 🟡 We did not find the outcome of the appeal. An outside audit (2026-11-23) said the appeal was later narrowed to a site-specific matter and the city-wide rules are in force; I couldn't confirm the narrowing, but the 2025 staff report below treats the new rules as applying to applications, and the game says only that Council voted in 2021.
- **2025 staff report:** most applications submitted after July 2022 fit within the remaining minimums and the new maximums.

Sources: [By-law 89-2022 (PDF)](https://www.toronto.ca/legdocs/bylaws/2022/law0089.pdf); [Ontario Bar Association summary](https://www.oba.org/city-of-toronto-abandons-minimum-parking-standards-to-advance-environmental-sustainability-and-resid); [MM47.70 background file](https://www.toronto.ca/legdocs/mmis/2022/mm/bgrd/backgroundfile-228892.pdf); [2025 staff report](https://www.toronto.ca/legdocs/mmis/2025/ph/bgrd/backgroundfile-252037.pdf).

**BLURB (upgrade `parking_to_park`):** "IN DECEMBER 2021 TORONTO STOPPED REQUIRING MOST NEW BUILDINGS TO INCLUDE CAR PARKING. LESS ASPHALT BY LAW: MORE ROOM FOR HOMES, TREES AND PARKS." The second sentence is the policy's intent, not a measured outcome.

**GAME IMPLEMENTATION:** *The Great Parking Lot* (mission 7, East End). Beats: two rat waves, then a locked **depave** arena where you pump five cracked asphalt patches into soil and saplings. The boss is the **Monster SUV**: it charges, stalls at the arena edge, and while it's stalled you stomp its roof and pump its tyres. **Map payoff:** MEGAMART's lot becomes a park with lawns, paths, trees, a playground and picnic tables. MEGAMART is fictional.

**COUNTERPOINTS:** removing minimums doesn't remove parking. Developers can still build it (up to the maximums), and existing lots stay. The game's lot-to-park swap is the hopeful version of a slow, parcel-by-parcel change.

---

## 7. Waterfront public space: Ontario Place ✅ for the game's claims

- **95-year lease:** in October 2024 the Province released the terms of its **95-year lease** with Therme Canada for a private spa/waterpark on Ontario Place's West Island. The often-quoted ~$1.96 billion adds two nominal 95-year totals: about **$1.1 billion in rent** and about **$855 million in common-area maintenance**. The Auditor General put the rent's **present value at about $163 million** (about 15% of the nominal total), and the maintenance payments reimburse costs the province carries, so they aren't a net gain. [Auditor General: Ontario Place performance audit (2024)](https://www.auditor.on.ca/en/content/annualreports/arreports/en24/pa_OntarioPlace_en24.pdf); [Canadian Architect](https://www.canadianarchitect.com/the-auditor-generals-report-part-1-the-cost-of-privatizing-ontario-place/).
- **The Auditor General (Dec 2024)** concluded the selection process and realty decisions "were not fair, transparent, or accountable to all participants"; Infrastructure Ontario's former CEO said they stand by the process.
- **The Standing Committee on Public Accounts (report, October 27, 2026)**, on that audit:
  - the lease itself doesn't specify a required investment amount, though Therme's proposal included about $700 million in upfront capital;
  - if Therme defaults, the Province pays Therme 50% of the value of the facility and the business and leases it to someone else;
  - the Province owed Therme $250,000 every 180 days if the site wasn't ready by January 1, 2025, and renegotiated the handover period, which Infrastructure Ontario said effectively waived those payments;
  - the *Rebuilding Ontario Place Act* exempts the site from the Environmental Assessment Act and the Ontario Heritage Act;
  - the ownership and operating experience in Therme's submission "was not accurate for five of the six spas cited"; Infrastructure Ontario replied that the submission included partners with European spa experience.
  [Committee report, Oct 27 2026](https://www.ola.org/en/legislative-business/committees/public-accounts/parliament-44/reports/2026-oct-27-performance-audit-ontario-place-redevelopment-2024-annual-report-office-auditor-general-)
- **Parking:** the lease requires Ontario to provide at least 1,800 parking spaces at Ontario Place, **1,600 of them reserved for Therme**. A provincially funded garage was initially budgeted at about $400 million.
- **Trees:** Infrastructure Ontario began removing roughly **850–865 trees** (sources differ) on the evening of October 2, 2024, with replacement planting promised. Critics pointed out that some of the trees were around 50 years old.
- **Timeline:** officials said construction could start as soon as spring 2026, with a hoped-for opening around 2029 (not an official projection). 🟡 Not rechecked for 2026 progress.
- **Opposing view:** the Province argues the deal revitalizes a long-neglected site at no cost to taxpayers for the spa itself. Critics (e.g. TVO opinion, advocacy groups) argue the public subsidizes a private attraction on public waterfront land.

Sources: [CBC, lease details (Oct 2024)](https://www.cbc.ca/lite/story/1.7341585); [CTV, 1,600 parking spots](https://toronto.ctvnews.ca/ontario-promises-1-600-dedicated-parking-spots-for-therme-spa-at-ontario-place-lease-1.7061075); [Global News, parking contract](https://globalnews.ca/news/10151490/ontario-therme-spa-contract-parking); [The Trillium, revenue estimate](https://thetrillium.ca/news/municipalities-transit-and-infrastructure/province-estimates-therme-will-pay-it-11b-in-direct-revenue-over-95-year-ontario-place-lease-9608292); [TVO opinion](https://amp.tvo.org/article/opinion-the-ontario-place-spa-is-a-costly-extravagance-well-be-subsidizing-forever); [CTV, final designs (June 2025)](https://www.ctvnews.ca/toronto/politics/queens-park/article/ontario-place-final-designs-revealed/).

**FICTION LABEL:** the **MEGA SPA is fictional**: its name, its sign and its rats are Dog Fjord's. The game never names Therme. The upgrade blurb says so explicitly: "THE MEGA SPA IS FICTION. BUT IN 2024 ONTARIO SIGNED A 95-YEAR LEASE FOR A PRIVATE SPA AT ONTARIO PLACE, AND ABOUT 850 TREES THERE WERE CUT DOWN. WHO IS THE WATERFRONT FOR?" "About 850" is the conservative end of the reported range. The vignette's rat line ("95-YEAR LEASE. MEMBERS ONLY!") is satire built on the same reported fact. No prices are quoted.

**GAME IMPLEMENTATION:** *The Waterfront Heist* (mission 8, Waterfront). Lobbyist rats hang back and shield nearby rats (half damage), so you have to corner them first. A locked arena has four MEGA SPA fence panels across the promenade to pump down. **Map payoff:** the fences across the boardwalk and the island causeway disappear, the island gets a public beach (sand, umbrellas), trees and picnic tables, and a bike ring appears on the promenade.

---

## 19. The Lane Eater (mission 5) ✅ via §1

Mission 5 dramatizes the Bloor bike lanes' removal fight. All facts it uses are in §1: the pilot's +49% cycling, permanence in 2017, the TCAT economic study, the Court of Appeal ruling (August 14, 2026), and removal work starting in October 2026. The headline "THE PELOTON FILLS BLOOR. THE BIKE LANES STAY." is the **game's fantasy outcome**, not a prediction.

**BLURB (M4.18, after the audit):** "AFTER BLOOR GOT BIKE LANES IN 2016, CYCLING ON IT ROSE 49%, AND BUSINESSES HELD UP: SPENDING GREW ABOUT AS MUCH AS ON THE DANFORTH, WHICH GOT NO LANES." It used to say the study "found more economic activity along the street, not less", which read as the lane causing it.

---

## 20. Waterfront + East End landmarks (plaques) ✅ checked 2026-11-23

- **The CN Tower** opened in **1976** and is **553 m** tall. It was the world's tallest **free-standing structure** from 1975 until the Burj Khalifa passed it in September 2007; it stayed the tallest **tower** until the Canton Tower (2009 or 2010, sources differ). **Fixed in M4.17:** the plaque said "THE WORLD'S TALLEST TOWER UNTIL 2007"; it now says "THE WORLD'S TALLEST FREE-STANDING STRUCTURE UNTIL 2007". [CN Tower (Wikipedia)](https://en.wikipedia.org/wiki/CN_Tower); [Britannica](https://www.britannica.com/topic/CN-Tower); [The Canadian Encyclopedia](https://thecanadianencyclopedia.ca/en/article/cn-tower).
- **Sugar Beach** (Canada's Sugar Beach): pink umbrellas beside the Redpath sugar refinery.
- **The Queen St bridge over the Don** (the Queen Street Viaduct, 1911) carries Eldon Garnet's **1996** public art: "this river I step in is not the river I stand in", lettered across it (after Heraclitus), with a clock whose hands were removed in 2010. [Queen Street Viaduct (Wikipedia)](https://en.wikipedia.org/wiki/Queen_Street_Viaduct); [ACO Toronto](https://acotoronto.ca/building.php?ID=2897).
- **The Broadview Hotel** at Queen + Broadview: built as Dingman's Hall in **1891–93** (sources differ on the year), a hotel from 1907/08, restored in 2017. "SINCE THE 1890S" covers the range. [Broadview Hotel (Wikipedia)](https://en.wikipedia.org/wiki/Broadview_Hotel_(Toronto)); [Heritage Toronto](https://www.heritagetoronto.org/explore-learn/heritage-toronto-awards-architecture/broadview-hotel-toronto-architecture).
- **Sugar Beach** and **Riverdale Park East** are descriptions, not dated claims.
- **Riverdale Park East**: known for its skyline view.

## 21. M3.1 landmarks (plaques + map) ✅ checked 2026-11-12

Facts added in M3.1 for Ivan's M3 review, each checked against at least one source this session:
- **The Don Jail** (550 Gerrard St E): built 1858-64 to William Thomas's design, opened **1864** with **184 cells**, closed **1977**; now the administration building of Hennick Bridgepoint Hospital. Sources: [Don Jail (Wikipedia)](https://en.wikipedia.org/wiki/Don_Jail), [Sinai Health: the historic Don Jail](https://www.sinaihealth.ca/patients-and-visitors/the-historic-don-jail), [Read the Plaque: The Don Jail 1859-1864](https://readtheplaque.com/plaque/the-don-jail-1859-1864). Plaque: "OPENED IN 1864 WITH 184 CELLS. CLOSED IN 1977. NOW THE HOSPITAL NEXT DOOR'S OFFICES."
- **The Riverdale Park pedestrian bridge** joins Riverdale Park West and East over Bayview Ave, the rail corridor, the Don and the DVP. Sources: [City of Toronto, Lower Don Trail bulletin](https://www.toronto.ca/wp-content/uploads/2021/03/96f1-lower-don-trail-improvements-phase-2-site-info-bulletin.pdf), [City notice: Gerrard, Riverdale + Dundas bridges](https://www.toronto.ca/wp-content/uploads/2024/06/969e-24ECS-BE-11PM-info-w13-w14-gerrard-riverdale-dundas-bridges-cons-june6-aoda.pdf). The game shows it crossing the river + the DVP (the map has no Bayview or rail corridor there).
- **Gerrard St E runs north of Dundas St E** east of the Don (Ivan's correction; the map was re-laid).
- **The Sundial Folly** (1995, John Fung + Paul Figueiredo): a concrete-and-steel sphere in a pool at Harbour Square Park West. Sources: [Toronto Sculpture: The Sundial Folly](https://sculpture.dittwald.com/sculptures/the-sundial-folly), [Sika: Sundial Folly restoration](https://can.sika.com/en/construction/concrete-repair-protection/projects/Sundia-Folly-Restoration.html). *The real park is at the foot of Bay/York; the game puts it at the foot of University, as Ivan asked (the map compresses).*
- **Ripley's Aquarium of Canada** opened **October 16, 2013** at the base of the CN Tower (288 Bremner Blvd, just south-east of the tower). Sources: [Ripley's Aquarium of Canada (Wikipedia)](https://en.wikipedia.org/wiki/Ripley%27s_Aquarium_of_Canada), [UrbanToronto, opening](https://urbantoronto.ca/news/2013/10/ripleys-aquarium-canada-opens-base-cn-tower).
- **The Rogers Centre (SkyDome)** opened in **1989** (June 3) with the first fully retractable motorized stadium roof; it stands west of the CN Tower. Sources: [Rogers Centre (Wikipedia)](https://en.wikipedia.org/wiki/Rogers_Centre), [CTV: SkyDome turns 25](https://toronto.ctvnews.ca/toronto-s-skydome-turns-25-1.1850507).
- **The Jack Layton Ferry Terminal**: island ferries leave from the foot of Bay St (renamed for Jack Layton in 2013). Source: [Jack Layton Ferry Terminal (Wikipedia)](https://en.wikipedia.org/wiki/Jack_Layton_Ferry_Terminal).
- **The Cinesphere** (Ontario Place, opened May 22, **1971**) was the world's **first permanent IMAX theatre**; Ontario Place itself opened in 1971. Sources: [Cinesphere (Wikipedia)](https://en.wikipedia.org/wiki/Cinesphere), [The Canadian Encyclopedia: Ontario Place](https://www.thecanadianencyclopedia.ca/en/article/ontario-place).
- **Billy Bishop airport (the island airport) bans jets**, so its airliners are turboprops (Porter's Q400s). That's why mission 8's big plane is a turboprop, not a jet. Sources: [City of Toronto background file (2014)](https://www.toronto.ca/legdocs/mmis/2014/ex/bgrd/backgroundfile-64907.pdf), [Wings Magazine](https://www.wingsmagazine.com/making-new-waves-on-the-island-8692/).
- **The 510 Spadina streetcar** turns from Spadina onto Queens Quay and runs east to Union through the Bay St tunnel; the Queens Quay median carries the 509 west. That's the curve the map's streetcars now take. Sources: [510 Spadina (Wikipedia)](https://en.wikipedia.org/wiki/510_Spadina), [Toronto streetcar loops](https://www.wikiwand.com/en/articles/Toronto_streetcar_loops).
- **The Gibraltar Point lighthouse** on Toronto Island appears in mission 8's background as scenery only (no plaque, no claim).

Fiction, labelled as such in the game: the MEGA SPA and its excavator (the Pink Digger boss).

## 22. M3.2 Waterfront quays (plaques + map) ✅ checked 2026-11-13

- **HTO Park** (Queens Quay W at Rees St) opened in **2007** as an urban beach on old shipping quays. Its fixed **yellow umbrellas** and Muskoka chairs deliberately recall Seurat's *A Sunday Afternoon on the Island of La Grande Jatte*. Sources: [HTO Park (Wikipedia)](https://en.wikipedia.org/wiki/HTO_Park), [The Cultural Landscape Foundation: HTO Park](https://www.tclf.org/hto-park). Plaque: "AN URBAN BEACH (2007). THE YELLOW UMBRELLAS NOD TO SEURAT'S GRANDE JATTE."
- **The Power Plant** (Harbourfront Centre) opened to the public on **1 May 1987** in a converted **1920s** power plant; its smokestack and exterior were restored to keep the building's history visible. Sources: [The Power Plant: our history](https://www.thepowerplant.org/about/our-history), [The Power Plant (Wikipedia)](https://en.wikipedia.org/wiki/The_Power_Plant), [Toronto Biennial: The Power Plant](https://torontobiennial.org/site/the-power-plant/). Plaque: "A 1920S POWER STATION. A CONTEMPORARY ART GALLERY SINCE 1987." *One listing gives a 1926 build year; I couldn't confirm it from a primary source, so the plaque says "1920s".*
- **Strachan Ave** runs south from Queen to Lake Shore by Exhibition Place, near the Ontario Place entrance; the game lines it up with the Ontario Place causeway. *Compression: in reality Queens Quay W ends near Bathurst, so Strachan never meets it; the game's Queens Quay runs the whole width so every street has a corner to turn.*
- **The Harbourfront quays and slips:** the real waterfront between Spadina and Yonge is a row of quays (piers) with boat slips between them. The game's row (HTO Park, the Power Plant, a quay of trees, Harbour Square Park West, the ferry terminal, Sugar Beach) keeps the real west-to-east order but compresses the distances; Sugar Beach is really much further east, at Jarvis.

## 23. The island airport, jets and Little Norway Park ✅ checked 2026-11-15

**The 2026 story (M3.4, mission 11 *Grounded*):**
- **March 2026:** the Premier said the province would take over the City of Toronto's stake in Billy Bishop Toronto City Airport to extend the runway for jets. Mayor Chow opposed jets downtown over noise. [CBC: what happens now](https://www.cbc.ca/news/canada/toronto/ford-billy-bishop-airport-take-years-9.7125053); [Wings Magazine](https://www.wingsmagazine.com/ontario-to-take-control-of-torontos-stake-in-city-airport-lands-ford/).
- **April 2026:** the province said it intended to expropriate about a third of **Little Norway Park**; on **April 23** City Council voted to contest it. [Little Norway Park (Wikipedia)](https://en.wikipedia.org/wiki/Little_Norway_Park).
- **June 2, 2026:** **Bill 110, the Building Billy Bishop Airport Act** received Royal Assent (S.O. 2026, c. 9; May was its passage through the House). It removes the City from the tripartite agreement that governs the airport, puts the province in its place, and lets the Minister prescribe City-owned lands that then vest in the Crown, with compensation at market value; the Act says this is not an expropriation (many reports still call it one). Land moves only as it's prescribed, not all at once. The Act doesn't itself allow jets: that needs federal approval. The Premier said the park would not be developed. [Globe and Mail](https://www.theglobeandmail.com/canada/article-ontario-introduces-promised-bill-to-take-torontos-stake-in-billy/); [CBC, May](https://www.cbc.ca/news/canada/toronto/ford-ontario-little-norway-park-billy-bishop-airport-expansion-9.7187067); [National Observer, May 5](https://www.nationalobserver.com/2026/05/05/news/doug-ford-toronto-billy-bishop-airport-takeover-plans).
- **July 24, 2026 (the Friday before the reports; the date is inferred):** federal Transport Minister **Steven MacKinnon** said Ottawa, which has the final say under the tripartite agreement, is "exclusively" focused on approved safety upgrades already under way, not on jets: "We will not pursue any plans that infringe on treasured public spaces like Little Norway Park or Hanlan's Point Beach, result in elevated noise, have significant environmental impacts or hinder Toronto's ability to build much-needed housing." The consultation drew more than **87,000** responses; CBC reported nearly **87 %** of them opposed changes for jets (a share of submissions, not a poll). Ottawa declined the expansion "at this stage"; Bill 110 still stands. The province said it would keep pushing. [Global News / The Canadian Press, July 27](https://globalnews.ca/news/11995764/olivia-chow-motion-return-toronto-island-land-billy-bishop-expansion-blocked/); [Travelweek, July 27](https://www.travelweek.ca/news/airlines/advocates-hail-feds-rejection-of-billy-bishop-airport-expansion-plan-others-pan-it/); [CBC: federal decision](https://www.cbc.ca/news/canada/toronto/billy-bishop-airport-federal-government-9.7283568); [Globe and Mail: advocates](https://www.theglobeandmail.com/canada/toronto/article-rejection-billy-bishop-expansion-environmental-advocates-celebrate/).
- **Late July 2026:** Council voted **25–1** for the Mayor's motion demanding the repeal of Bill 110, the return of the land and the City's seat in the agreement. [CBC: council motion](https://www.cbc.ca/news/canada/toronto/city-council-billy-bishop-expansion-plan-9.7289624); [National Observer, July 29](https://www.nationalobserver.com/2026/07/29/news/toronto-city-council-passes-motion-demanding-ford-repeal-billy-bishop-act-return).
- **Figures (reported, not verified against a primary document):** the Port Authority's CEO put the expansion at **$4–5 billion over 25 years**, paid by passengers and airlines; the Premier's proposal was a **600 m** runway extension to the west; separately, **runway end safety areas (RESAs)** of 150 m at each end, a federal safety requirement due by **July 12, 2027**, continue; they're safety zones, not the jet runway extension. [City of Toronto: RESAs at Billy Bishop](https://www.toronto.ca/city-government/planning-development/waterfront/current-projects/billy-bishop-toronto-city-airport-initiatives/runway-end-safety-areas-at-billy-bishop-toronto-city-airport). 🟡 Nothing newer than July 2026 was found; the law stands as of these reports.

**Little Norway Park:** the site of *Little Norway*, the Royal Norwegian Air Force's exiled training base in the Second World War. A 3,000-pound boulder from Norway was unveiled as its monument by Crown Prince Harald on **September 18, 1976**; the park opened in **1986** and was dedicated by King Olav V on **November 20, 1987**. It has a ball diamond, a soccer pitch, playgrounds, a wading pool and a totem pole. [Little Norway Park (Wikipedia)](https://en.wikipedia.org/wiki/Little_Norway_Park). *Plaque:* "A ROYAL NORWEGIAN AIR FORCE CAMP IN WWII. A PARK SINCE 1986, ACROSS FROM THE AIRPORT."

**FICTION LABEL:** the survey stakes through the park, the Jet Tug and "Air Fjord" are Dog Fjord's. In reality the province said it would not develop the park. The upgrade blurb says so: "THE STAKES ARE FICTION. BUT IN 2026 ONTARIO PASSED A LAW TO TAKE THE CITY'S PLACE AT THE ISLAND AIRPORT AND PUSHED FOR JETS. IN JULY OTTAWA, WHICH HAS THE FINAL SAY, SAID NO FOR NOW: SAFETY WORK ONLY." Source line in the game: Transport Canada (Minister Steven MacKinnon, July 2026), as reported by CBC, Global News and The Canadian Press.

**GAME IMPLEMENTATION:** *Grounded* (main 11, Waterfront, after *The Waterfront Heist*). Beats: a wave with **Baggage Rats** (they roll suitcases along the ground: jump them), a locked arena of four **survey stakes** to pump out of the ground while **Barrier Rats** (a ROAD CLOSED board that blocks hits from the front; they turn slowly) defend them, a mixed wave, then the **Jet Tug**: a baggage tug towing a private jet across the park. Its jet blast blows you back without hurting; it hurts on contact while it taxis; it stops to refuel at the edge, when the tug can be pumped; the cabin can be stomped any time; below half health it taxis faster and rolls a suitcase at you at each stop. **Map:** Little Norway Park on the quay across from the island airport, staked out; the payoff removes the stakes and adds trees, a bench and a picnic table. **Vignettes:** turboprops land quietly in the background; the after-caption reads "OTTAWA SAID NO TO JETS, FOR NOW. THE PARK STAYED A PARK."

## 24. Bike buses + School Streets ✅ checked 2026-11-16

- **What a bike bus is:** a group ride to school that works like a school bus on bikes: a predefined route with a start, an end and scheduled stops, where the stops are meeting points for kids to join the ride, led by adults. [Green Communities Canada: Ontario bike buses](https://greencommunitiescanada.org/ontario-bike-buses-are-revamping-students-routes-to-school/); a school-travel guide from Waterloo Region describes the same pattern and how organisers map routes from where families live: [STSWR Bike Bus](https://www.stswr.ca/walkzone/programs/bike-bus/).
- **In Toronto:** parent-run. The Toronto Star reported two parents leading one every Tuesday and Thursday morning from April 2023, with 20 to 25 kids on its busiest days, and a grassroots Scarborough bike bus funded by a city Neighbourhood Climate Action Grant. [Toronto Star, "Wheels of change", April 28, 2024](https://www.pressreader.com/canada/toronto-star/20240428/281702619782458). Ivan pointed to an East York bike bus's Instagram as the inspiration (instagram.com/bikebus_eastyork); the game names no real group.
- **School Streets:** closing the street outside a school to cars at drop-off and pick-up. In Toronto, 8 80 Cities ran a four-day pilot in October 2019 on Mountview Ave outside Keele Street Public School, closed 8 to 9 am and 3 to 4 pm. [8 80 Cities](https://www.880cities.org/new-pilot-project-bans-vehicles-from-street-in-front-of-toronto-school/); [CTV](https://toronto.ctvnews.ca/street-in-front-of-high-park-school-blocks-off-cars-during-morningafternoon-rush-1.4658524). The Ontario School Streets Pilot (Green Communities Canada) ran School Streets in Hamilton, Mississauga, Kingston and Markham. [Green Communities Canada: School Streets](https://greencommunitiescanada.org/programs/school-streets).
- 🟡 Not used: an 8 80 Cities page says a Toronto School Street ran daily from September 2025 and will run all year in 2026–27, but it doesn't clearly name the school. The game says only that Toronto tried one in 2019.

**FICTION LABEL:** the route, its stops, the school (unnamed, on Dundas west of Leslie), the SUVs parked in the bike lane and the School Street the payoff makes are the game's.

**GAME IMPLEMENTATION:** *The Bike Bus* (M4.1, East End), the first mission played on the map (top-down). From Broadview + Dundas, lead the bus up Carlaw, along Gerrard and down Leslie to the school before the bell: stop beside the kids at four stops (nine kids join and ride in a line behind you), and ring your bell at three SUVs parked in the bike lane to move them. Late for the bell: back to the first stop. **Map payoff:** a School Street: barriers at both ends of the block outside the school and full bike racks. **Upgrade:** A SCHOOL STREET (safety, cycling, walking).

## 25. Bike share ✅ checked 2026-11-17

- **Toronto's bike share** launched in **2011** (as BIXI Toronto); it is now run by the Toronto Parking Authority. [Bike Share Toronto (Wikipedia)](https://en.wikipedia.org/wiki/Bike_Share_Toronto).
- **2025, its biggest year:** **7.8 million rides**, **180 new stations** ("the largest single year expansion in system history"), and stations in **all 25 wards**, completing the Four-Year Growth Plan (2022–2025). [City of Toronto, 2025 Toronto Cycling Year in Review (March 2026)](https://www.toronto.ca/wp-content/uploads/2026/03/8fa8-2025-Toronto-Cycling-Year-in-Review-FINAL.pdf); the 7.8 million matches [Toronto Open Data: Bike Share ridership](https://open.toronto.ca/dataset/bike-share-toronto-ridership-data/) (7,812,520 trips).
- **2024 → 2025:** 6.9 million rides → 7.8 million (the City's 13 %). [City of Toronto, 2024 Cycling Year in Review](https://www.toronto.ca/wp-content/uploads/2025/04/97a9-2024-Toronto-Cycling-Year-in-Review-FINAL.pdf).
- 🟡 Not used: the station total (1,018 installed vs about 1,060 in the network, depending on what's counted), and the 2030 projections (12 to 16 million rides), which come from reporting on a report, not the report itself ([Global News](https://globalnews.ca/news/11469542/bike-share-toronto-projections)).

**UNBRANDED (Ivan: "I wouldn't brand them"):** the game's share bikes are generic green step-throughs with a basket; no logo or name. The blurb names no operator.

**GAME IMPLEMENTATION:** *Dock Drop* (M4.3, Downtown, after *King of the Street*), the second mission played on the map. You tow a trailer of docks to six gaps (Chinatown, City Hall, Old City Hall, Graffiti Alley, King + John, King + Bay) and stop at each to set a station down; two share bikes ride out of each new station. Dog Fjord's "clutter crew" (rats in hard hats) come for three of the new stations and cart them off unless you ring your bell at them. 90 seconds. **Payoff:** stations on every map (two or three per district) and share-bike riders in traffic. **Upgrade:** BIKE SHARE, EVERYWHERE (cycling, less car dependence, transit). **Fiction:** the gaps, the clutter crew and the "clutter" complaint are the game's.

## 26. Strachan's bike lanes, and the game's bike network 🟡 (Strachan's current lanes not rechecked on a map)

- **Strachan Ave has painted bike lanes south of King** (Ivan: "I think Strachan has bike lanes in reality"). Advocates have asked for them to be made protected since at least 2016, and in 2018 Council asked staff to look at converting them to cycle tracks from King south to Lake Shore. [ibiketo (2016)](https://www.ibiketo.ca/comment/9946); [City of Toronto background file (2020)](https://www.toronto.ca/legdocs/mmis/2020/ie/bgrd/backgroundfile-157817.pdf); nearby, the Douro / Wellington lanes that meet Strachan were upgraded to two-way cycle tracks: [City of Toronto](https://www.toronto.ca/services-payments/streets-parking-transportation/cycling-in-toronto/torontos-cycling-infrastructure/douro-st-wellington-st-bike-lanes/). 🟡 I found no current City page for a Strachan cycle-track project; the game shows painted lanes from the start and makes them protected in mission 7.
- **Slow streets have Toronto precedents:** in 2020 ActiveTO's **Quiet Streets** put signs and barricades on **65 km of 32 neighbourhood routes** to slow cars and make room for people walking and cycling ([City of Toronto news release, June 2020](https://www.toronto.ca/news/activeto-delivers-65-kilometres-of-quiet-streets-along-32-neighbourhood-routes-across-toronto/)); under **Vision Zero 2.0** Council approved **30 km/h on all local roads**, rolled out area by area ([City of Toronto: reducing the limit on local roads](https://www.toronto.ca/services-payments/streets-parking-transportation/road-safety/vision-zero/educational-campaigns/reducing-speed-limits-on-local-roads/)).

**WHY (Ivan, M4.3):** "comparing Toronto to Amsterdam/Copenhagen is very broad when we didn't change the bike infrastructure to their level." The Livability tier names ("AMSTERDAM/COPENHAGEN TERRITORY", "WORLD-CLASS TORONTO"...) are gone: the score is out of 100, and beside it the HUD counts the streets on the bike network.

**RACCOON TRANSIT PLAN — PROPOSED (fiction):** every street on the five maps (28) ends up either **PROTECTED** (a curb-separated lane each way; on the E-W streets the parking lanes become the bike lanes and the parked cars drive off) or **SLOW** (humps and sharrows: cars at cycling speed and half as many of them, bikes take the lane; King's transit corridor counts as slow). Each mission adds two or three streets, across the city: `src/data/network.ts` lists which. At the start only Queens Quay's Martin Goodman Trail is on the network; Strachan's painted lanes are shown but don't count. What each street is like today is simplified (several real streets, like Bloor, University and Roncesvalles, already have lanes of some kind). It's a game idea, not a feasibility study: road widths, emergency access, loading, transit operations and Bill 60 (§1) aren't assessed.

---

## Audit, 2026-11-23

Ivan ran this file past an outside AI audit (ChatGPT). Each point was checked against a primary or reliable source before anything here changed:
- **Confirmed and added:**
  - Bill 56's Royal Assent date (§2) and Bill 60 (§1; the audit didn't give its date, which is November 27, 2025)
  - the completed 1.2 km Bloor removal (§1)
  - the Bloor traffic trade-offs and the TCAT study's limits (§1)
  - the speed-camera "proportion" wording (§2)
  - King St access and the spending figures' basis (§4)
  - the Science Centre cost bases (§5)
  - Ontario Place: the Auditor General's present values and the Oct 2026 committee findings (§7)
  - the Ontario Line cost basis (§8)
  - Parkside's "endorsed in principle" and its stalled status (§16)
  - Bill 110's mechanism and date, the RESAs, and the consultation share (§23)
  - Bike Share 2024 (§25)
- **Removed:** the unsupported "only public building closed over RAAC" (§5).
- **Not confirmed, noted as such:** the regulation number O. Reg. 327/26 (§1); a Supreme Court docket number and a November 20 filing (not used); the parking appeal's narrowing (§6).
- **Disagreed:** the audit said High Park's 2023 closures weren't in place. The City's own pages say West Road and parts of Colborne Lodge Drive were closed to cars seven days a week in 2023 (§17).
- **Flagged for Ivan (in-game text or behaviour):** he approved the first four (M4.18) and kept the streetcar behaviour; see `docs/reviews/M4.18.md`:
  - the Teschke "1/9" wording
  - the Lane Eater's economic line
  - the speed-camera blurb's last sentence
  - the TSP map behaviour
  - the island-airport blurb and caption
- **Suggested, not adopted:** splitting every section into fact / evidence / interpretation / game fiction. The sections already carry FICTION LABEL and GAME IMPLEMENTATION parts, and in-game text only uses recorded claims.
