# Software Requirements Specification: StarMatch (working title)

Version 0.1 | October 22, 2026 | Prepared for the founder | Status: draft for validation

## 1. Introduction

### 1.1 Purpose
This document defines the requirements for a web-based love and compatibility astrology product (working title: StarMatch). It records the market inspirations, the competitor gaps found in research, the functional and non-functional requirements, and a phased release plan. It is written so a developer or an AI coding tool can build from it.

### 1.2 Scope
**In scope (v1):** mobile-first web app; two-person compatibility checker; free teaser result; paid full report; subscription with weekly forecasts; share cards for TikTok/Shorts; SEO pages; analytics; admin tools.

**Out of scope (v1):** native iOS/Android apps, live human astrologers, chat with an astrologer, audio readings, tarot/numerology, social network features, marketplace.

### 1.3 Definitions
- **Synastry:** comparing two people's birth charts to assess a relationship.
- **Natal chart:** the planetary positions at a person's birth.
- **Aspect / orb:** an angular relationship between two planets, and the allowed margin for it to count.
- **Teaser:** the free partial result shown before payment.
- **Pair:** two people being compared.
- **MRR:** monthly recurring revenue. **MoR:** merchant of record.

### 1.4 Business goal
Reach **$1,000 MRR**. Arithmetic: about 125 monthly subscribers at $7.99, or about 300 annual subscribers at $39.99 (about $3.33/month each), or a mix. Customers are acquired organically through TikTok and YouTube comments and replies, plus search. No door-to-door or sales calls.

## 2. Overall description

### 2.1 Product perspective
A standalone web app, reached mainly from a link in a TikTok/YouTube bio, a comment reply, or Google search. It is web-first because (a) Google Play merchant registration for Ethiopian developers was reported as unavailable in 2024 and must be re-verified, and (b) a link opens instantly while an app install loses most viewers.

### 2.2 User classes
| User | Description | Needs |
|---|---|---|
| Curious visitor | Arrives from a video or comment reply | Instant result with no signup |
| Paying checker | Wants the full reading on a crush, partner, or ex | Specific, believable, fairly priced report |
| Subscriber | Returns weekly | Forecasts, saved people, unlimited pairs |
| Astrology enthusiast | Knows signs and aspects | Accurate calculations, visible chart data |
| Founder/admin | Runs the business | Analytics, content review, refunds |

### 2.3 Operating environment
Modern mobile browsers (iOS Safari, Android Chrome) first, desktop second. Must work on slow connections, because users are global.

### 2.4 Constraints
- **Payments:** Stripe is the planned processor, reached through a US (Delaware) company. Stripe's documentation says the EIN takes 40-50 business days if the founder has no SSN, and that Atlas cannot guarantee Stripe approval. Eligibility of Ethiopian residents for Atlas and for US business banking (Mercury, Brex) is unverified.
- **Category risk:** Stripe's restricted-businesses list has country-specific bans on psychic services (Thailand, Japan, Mexico). One older article says Stripe removed psychic services from its restricted list; this is unconfirmed on Stripe's current official page. Read the official page and consider contacting Stripe before launch.
- **Legal/tax:** rules on foreign entities and moving money out of Ethiopia have not been researched. Consult a local accountant or lawyer.
- **Positioning:** entertainment only. No medical, financial, or legal claims.

### 2.5 Assumptions and dependencies
- Demand exists for a love-astrology compatibility product (supported by competitor success, not yet proven for this product; see section 10).
- The founder can post short screen-recorded demo videos regularly.
- An ephemeris (planet position) library, an LLM API, Stripe, and email delivery are available.

## 3. Market inspirations and competitor analysis

### 3.1 Astrology products (inspirations)
Prices and ratings are as reported by third-party review sites in October 2026 and conflict between sources. Verify on each app's store page.

| Product | What it is | Reported pricing | What we borrow | How we beat it |
|---|---|---|---|---|
| Co-Star | Social astrology; blunt daily notes; friend chart comparison. About 4.79 stars from about 205,000 ratings | Free core; Pro-Star about $8.99/month | Punchy tone, shareable cards, beginner-friendly design | Pair-specific reports; no friend or account needed |
| The Pattern | Psychological profiling without astrology jargon; relationship analysis | Go Deeper about $14.99/month or $29.99/quarter | Plain-language relationship insight | Transparent cancellation; avoid recycled descriptors |
| Starcrossed | Love and soulmate astrology; grew through TikTok | Annual plan about $107.99; launch readings $6.99 | Love sub-niche; low-priced first purchase; CTA on every video | No friend "crossing"; no trial traps; works in all regions; full price shown upfront |
| Nebula | Astrology plus tarot plus live advisors | About $7.99/week to $49.99/year plus live fees | Cheap entry offers | No live advisors; no weekly billing confusion |
| Sanctuary | Live astrologer sessions | Sanctuary+ about $14.99/month; $4.99 intro reading | Low-friction first purchase | No per-minute pricing |
| Chani | Thoughtful, warm writing | About $11.99/month | Writing-quality benchmark | Focus on one job (compatibility) |
| TimePassages | Professional chart software | One-time from about $79 | Accuracy benchmark | Plain language for non-experts |

### 3.2 Free web tools (also competitors, and SEO rivals)
Astro-Seek, Astro.com, Cafe Astrology, and SynastryChart offer free synastry reports. One review says Astro-Seek's interface feels less modern and assumes astrology knowledge. Opportunity: a clean, mobile-first, plain-language experience.

### 3.3 Distribution inspirations (non-astrology apps)
| App | Pattern we copy |
|---|---|
| GlowUp | Founder studied TikTok comments for repeated problems, then built for one; the product demo is the video |
| Pushscroll | Tested the idea through short videos before building |
| Flamme | Very high volume of hook variations across many accounts |
| ToneAdapt | Result is instantly demonstrable; same content on TikTok, Instagram, YouTube |
| Cal AI / Umax | Shareable results that users post themselves (Umax's face-rating angle is excluded for safety reasons) |
| Starcrossed | Love sub-niche of astrology; link in bio; CTA in every caption. Note: its founder had an audience of 163M+ views first |

### 3.4 Gap analysis (from user complaints) mapped to requirements
| Gap reported by users | Our requirement |
|---|---|
| Free trials that auto-charge; cancellation is hard or buried | FR-25, FR-26 |
| Most features paywalled; extra purchases on top of a subscription | FR-9, FR-24 |
| Features need friends to also use the app | FR-1, FR-6 (works with two birthdays only) |
| Readings feel generic or recycled | FR-12, FR-13 |
| App does not work in some regions; phone-number signup fails for some countries | FR-20 (email login), global web |
| Flat AI voice on long audio readings | Out of scope for v1 (no audio) |
| Free web tools feel dated and technical | NFR-4, NFR-5 |

### 3.5 Evidence quality
Many "best app" rankings are written by competing apps. Ratings conflict by source (for example Starcrossed shows about 4.8 from 4.1K ratings in one place and 2.2 from 173 reviews in another). Revenue figures for competitors are self-reported or estimated. Treat all of it as directional.

## 4. Functional requirements
Priority: M = must, S = should, C = could. Phase: 0 = validation, 1 = MVP, 2 = retention/SEO, 3 = later.

### 4.1 Compatibility engine
| ID | Requirement | Pri | Phase |
|---|---|---|---|
| FR-1 | The user enters two people's birth dates (required). Names, birth time, and birth place are optional and improve detail. | M | 1 |
| FR-2 | Validate dates (1900 to today). If birth time is unknown, mark rising sign and Moon-boundary results as lower confidence and do not state them as fact. | M | 1 |
| FR-3 | Compute planetary positions (Sun through Pluto, Moon, optionally nodes) with an ephemeris library. Deterministic: same input gives same output. | M | 1 |
| FR-4 | Compute synastry aspects between the two charts with configurable orbs. | M | 1 |
| FR-5 | Produce an overall score (0-100) and five category scores: Chemistry, Communication, Emotional Bond, Conflict Style, Long-term Potential, from a weighted rules table. | M | 1 |
| FR-6 | Quick mode: pick two zodiac signs with no birthdays, for comment-reply content. | M | 1 |
| FR-7 | Relationship types: romantic and crush at MVP; ex, friend, family, coworker later. The type changes the framing of the text. | S | 2 |
| FR-8a | Scoring weights are stored as data (not hardcoded) so they can be tuned without redeploy. | S | 2 |

### 4.2 Results and teaser
| ID | Requirement | Pri | Phase |
|---|---|---|---|
| FR-8 | Free result page shows the overall score, one specific insight from the strongest aspect, and category scores with some sections locked. | M | 1 |
| FR-9 | Locked sections are clearly labeled and the price is shown before checkout. No hidden or bait-and-switch content. | M | 1 |
| FR-10 | Each result has a persistent, unguessable URL; the owner can revisit without logging in on the same device, and with login anywhere. | M | 1 |
| FR-11 | Results display an entertainment disclaimer. | M | 1 |

### 4.3 Paid report
| ID | Requirement | Pri | Phase |
|---|---|---|---|
| FR-12 | Full report with sections: Overview, Chemistry, Communication, Emotional Bond, Conflict and Repair, Long-term Potential, Growth Tips for Both. | M | 1 |
| FR-13 | Text is generated by an LLM from structured aspect data using a tone guide and templates. Each report must reference specific aspects of that pair, so two different pairs never receive near-identical text. Cache per pair and type; regenerate only when the content version changes. | M | 1 |
| FR-14 | Safety filter: no predictions about health, money, pregnancy, death, or legal outcomes; no fear-based or manipulative statements. Failing output is regenerated or blocked. | M | 1 |
| FR-15 | Report can be emailed and saved as PDF. | S | 2 |

### 4.4 Sharing
| ID | Requirement | Pri | Phase |
|---|---|---|---|
| FR-16 | Generate a share card (9:16 and 1:1 images) with signs, names or initials, and score. | M | 1 |
| FR-17 | Share links show a rich preview (title, image) on social platforms and messengers. | M | 1 |
| FR-18 | Invite-the-other-person link: the second person enters their own birthday privately, and both see the result. Requires consent from both. | S | 2 |

### 4.5 Accounts and privacy
| ID | Requirement | Pri | Phase |
|---|---|---|---|
| FR-19 | Using the checker and viewing the free result needs no account. | M | 1 |
| FR-20 | Email magic-link login (no passwords, no phone numbers). Required only to purchase or save. | M | 1 |
| FR-21 | Saved people and saved reports; free users have a small limit, subscribers unlimited. | S | 2 |
| FR-22 | Self-serve data export and delete-account, which also deletes all birth data. | M | 1 |
| FR-23 | 18+ confirmation before any purchase. | M | 1 |

### 4.6 Payments and billing
| ID | Requirement | Pri | Phase |
|---|---|---|---|
| FR-24 | Stripe Checkout with: one-off report (initial test price $6.99), monthly plan ($7.99), annual plan ($39.99). Prices are configurable. | M | 1 |
| FR-25 | Show the full price, billing period, and renewal date before payment. No pre-checked add-ons. If a trial exists, send a reminder email at least 2 days before the first charge. | M | 1 |
| FR-26 | Cancel in two clicks or fewer from the account page (Stripe Customer Portal). | M | 1 |
| FR-27 | Webhooks keep entitlements in sync; failed payments trigger a recovery email sequence. | M | 1 |
| FR-28 | Refund policy page and an admin refund action. | S | 1 |
| FR-29 | Decide tax handling (Stripe Tax or a merchant-of-record provider) before launch. | M | 1 |
| FR-30 | Optionally block checkout in countries where processors restrict this category until confirmed. | S | 1 |

### 4.7 Retention
| ID | Requirement | Pri | Phase |
|---|---|---|---|
| FR-31 | Weekly relationship forecast per saved pair, based on current planetary movements, delivered by email. | S | 2 |
| FR-32 | Free personal birth chart page (Sun, Moon, rising) that leads into compatibility checks. | S | 2 |
| FR-33 | Email preferences and one-click unsubscribe. | M | 2 |
| FR-34 | Prompt to check another pair after viewing a result. | C | 2 |

### 4.8 Growth tools
| ID | Requirement | Pri | Phase |
|---|---|---|---|
| FR-35 | Admin-only comment-reply clip maker: enter two signs, get a vertical animated reveal clip ready to post. | S | 1-2 |
| FR-36 | 78 sign-pair landing pages (12 signs, each pair once) with unique copy, internal links, and structured data. | S | 2 |
| FR-37 | Waitlist page with email capture and UTM tracking. | M | 0 |
| FR-38 | Funnel analytics: visit, inputs entered, result viewed, paywall viewed, checkout started, purchase, and 7/30-day return, split by source and video. | M | 1 |
| FR-39 | A/B testing of price points and paywall copy. | C | 3 |

### 4.9 Admin
| ID | Requirement | Pri | Phase |
|---|---|---|---|
| FR-40 | Admin dashboard: signups, revenue, refunds, flagged content. | S | 2 |
| FR-41 | Weekly review queue that samples generated reports for quality and safety. | S | 2 |
| FR-42 | Feature flags and rate-limit settings editable without code changes. | S | 2 |

## 5. Non-functional requirements
| ID | Requirement |
|---|---|
| NFR-1 | Performance: free result in under 2 seconds at the 95th percentile on a mid-range phone over 4G. Paid report generation under 30 seconds, with progress shown. |
| NFR-2 | Availability target 99.5% monthly. Payment webhooks must be idempotent. |
| NFR-3 | Security: HTTPS everywhere, encryption at rest, no card data stored by us, secrets kept out of the client. |
| NFR-4 | Mobile-first design that works from 360 px width; touch targets large enough for thumbs. |
| NFR-5 | Accessibility: aim for WCAG 2.1 AA (contrast, labels, keyboard navigation). |
| NFR-6 | Privacy: birth data is personal data. Collect the minimum, never sell it, honor deletion requests, and publish a clear privacy policy. Review GDPR and CCPA obligations before launch. |
| NFR-7 | Cost control: per-IP and per-account rate limits; a daily cap on LLM spend; cache all generated reports. Measure LLM cost per paid report and keep it well under the revenue per report (target to be set after measurement). |
| NFR-8 | Internationalization readiness: all text in resource files; English first; date formats localized. |
| NFR-9 | SEO: server-rendered pages, fast load, sitemap, structured data. |
| NFR-10 | Observability: error tracking, uptime monitoring, and alerts on failed payments or report generation. |

## 6. Content, safety, and compliance rules
1. Every result and report carries a "for entertainment" notice.
2. Paid features are limited to adults (18+).
3. The LLM prompt and an output filter forbid: health, medical, mental-health diagnoses, financial, legal, pregnancy, and death predictions; instructions to end or stay in a relationship; fear-based or controlling language.
4. Tone: warm, specific, non-judgmental. Avoid claims like "accurate" or "proven".
5. Pricing transparency is a product rule, not just a feature: no surprise charges, no buried cancel button.
6. Do not copy competitors' text, branding, or design. Take ideas, not assets.
7. Include a visible support email and response target.

## 7. Pricing and monetization
| Offer | Initial test price | Purpose |
|---|---|---|
| Free teaser | $0 | Hook and shareable result |
| Single full report | $6.99 | Low-risk first purchase (similar to Starcrossed's launch price point) |
| Monthly plan | $7.99 | Unlimited pairs, saved people, weekly forecasts |
| Annual plan | $39.99 | Lower churn, upfront cash |

Prices are starting hypotheses to test. A one-off compatibility check is a one-time curiosity, so subscription value must come from the weekly forecast and unlimited pairs (FR-21, FR-31).

## 8. Data model (summary)
- **User:** id, email, age_confirmed, created_at.
- **Person:** id, owner, name (optional), birth_date, birth_time (optional), birth_place (optional).
- **Pair:** id, person_a, person_b, relationship_type.
- **Result:** id, pair, scores (JSON), aspects (JSON), engine_version.
- **Report:** id, result, text, content_version, safety_status.
- **Order / Subscription:** Stripe ids, plan, status, renews_at.
- **Entitlement:** user, level, expires_at.
- **ShareCard:** result, image_url, format.
- **Event:** anonymous id, name, source/UTM, timestamp.
- **Waitlist:** email, source, created_at.

## 9. Architecture and suggested stack
- **Web app:** Next.js (server-rendered, mobile-first), hosted on Vercel or Cloudflare.
- **Calculation engine:** a module that computes planet positions with an ephemeris library (Swiss Ephemeris or an open-source alternative). Check the licence terms, since the Swiss Ephemeris has open-source and commercial licences. All scores are computed here, never by the LLM.
- **Report writer:** an LLM API that receives only structured aspect data and a tone guide, followed by a safety filter.
- **Database/auth:** Postgres (for example Supabase) with magic-link login.
- **Payments:** Stripe Checkout, Customer Portal, and webhooks.
- **Email:** a transactional provider (for example Resend or Postmark).
- **Share images:** server-side image rendering for cards and link previews.
- **Analytics:** product analytics (for example PostHog) with UTM and video-id tracking.

Key design rule: the engine is deterministic and the LLM only writes the prose, so scores stay consistent and cheap.

## 10. Growth plan and validation gates
**Channel:** organic short video on TikTok, YouTube Shorts, and Instagram Reels. Format: "Comment your sign and your crush's sign." Reply to comments with a screen recording of the result (faceless). Put the link in the bio and in captions. Also target search through the 78 sign-pair pages.

**Phase 0 test (about 2 weeks, before building the full product):** post around 20 reply-style videos with a waitlist or quick-mode link. As a rule of thumb (not a proven benchmark), if this does not produce roughly 100 waitlist signups, change niche or angle before spending weeks on code.

**Success metrics after launch:** MRR progress toward $1,000; free-to-paid conversion (baseline to be measured, then improved); monthly churn; refund rate; LLM cost per report; share rate of result cards; signups per video.

**Realism note:** the best-known success (Starcrossed) came after its founder built a very large audience first. A new account should expect a slower ramp and a high-volume content effort.

## 11. Release plan (estimates)
| Phase | Timing | Contents |
|---|---|---|
| 0: Validation | Weeks 0-2 | Waitlist page, quick-mode demo, about 20 videos, payments setup started in parallel |
| 1: MVP | Weeks 3-6 | FR-1 to FR-6, FR-8 to FR-14, FR-16, FR-17, FR-19, FR-20, FR-22 to FR-30, FR-37, FR-38 |
| 2: Retention and SEO | Weeks 7-10 | Saved people, weekly forecast, sign-pair pages, invite link, admin tools, clip maker |
| 3: Later | After revenue signal | Mobile wrapper (needs a store-compatible payment setup), more languages, A/B testing, new relationship types |

## 12. Risks and mitigations
| Risk | Mitigation |
|---|---|
| Payment setup delayed or Stripe declines the category | Start early; read Stripe's current restricted list; apply for approval; keep a backup merchant-of-record option |
| Low conversion because free competitors are generous | Win on clarity, speed, pair-specific depth, and honest pricing; test price points |
| One-time use, high churn | Weekly forecast, saved people, unlimited pairs |
| No audience at launch | Phase 0 test; daily volume; many hook variations |
| Generic or repetitive text | Aspect-specific prompts, uniqueness checks, weekly quality sampling |
| Harmful or manipulative content | Safety rules, output filter, review queue |
| Privacy or legal issues with birth data | Minimal data, deletion tool, privacy policy, legal review |
| LLM costs exceed revenue | Caching, rate limits, spend cap, cost-per-report tracking |
| Founder motivation for the niche | Honest check-in after Phase 0; keep the engine reusable for other niches |

## 13. Open questions to verify
1. Does Stripe Atlas (and a US business bank account) accept an Ethiopian resident founder today?
2. Is the psychic-services restriction still on Stripe's current official list, and does astrology fall under it?
3. Has Google Play enabled merchant registration for Ethiopia (needed only for a later mobile app)? Check Play Console directly.
4. What are Ethiopia's rules on foreign companies and receiving foreign income?
5. Which ephemeris library and licence fit a commercial product?
6. What is the real conversion rate? This cannot be known until Phase 0 and Phase 1 data exist.

## Appendix A: Sources consulted
Research gathered October 2026 from: Steal What Works (apps that grew through TikTok); articles on Starcrossed's growth (Medium, Social Growth Engineers); Venture Radar; App Store and Google Play listings for Starcrossed; appshunter and mwm.ai app-review aggregators; iosapplists, Natus Blueprint, joinzodia, unstar.app, My Zodiac AI, AskSoma, and The Oracle comparison articles (several are written by competing apps); Aura Astrology and birthchart.app reviews of Co-Star; stork.ai on free synastry tools; Stripe Atlas documentation; Stripe's restricted-businesses pages and third-party summaries; Shega and Google Play Help on Ethiopian developer registration; Indie Hackers; Redwerk and MicroConf figures cited in earlier research. Prices, ratings, and revenue claims are third-party and conflicting; verify before relying on them.
