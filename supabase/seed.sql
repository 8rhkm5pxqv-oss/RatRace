-- ============================================================
-- RatRace — Full seed: 20 profiles + 50 listings (idempotent)
-- Run in Supabase SQL Editor: supabase.com → project → SQL Editor
-- ============================================================

-- 1. Fix trigger
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists handle_new_user();

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- 2. Ensure investor enum value exists
alter type role_category add value if not exists 'investor';

-- 3. Seed 20 demo users into auth.users + profiles
do $$
declare
  u record;
  uid uuid;
begin
  for u in (
    select * from (values
      ('meilin_chen',   'Mei-Ling Chen',    'meilin@ratrace.dev',     'Berlin',     'Ex-McKinsey consultant who stopped asking whether the market is big enough. Building stuff I would actually use.',                                                                          array['AI/ML','B2C','Product Strategy']),
      ('tariq_b',       'Tariq Ben-Salem',  'tariq@ratrace.dev',      'Hamburg',    'Dropped out of 3 universities, 0 exits, infinite energy. My grandma says I should get a real job. She is wrong.',                                                                          array['Web3','Mobile','Chaos Engineering']),
      ('anastasia_k',   'Anastasia Kovač',  'anastasia@ratrace.dev',  'München',    '15 years in consulting and all I learned was how to pitch. Now learning what building actually means.',                                                                                     array['Operations','Enterprise Sales','Buzzwords']),
      ('kofi_asante',   'Kofi Asante',      'kofi@ratrace.dev',       'Frankfurt',  'Serial pivot artist. Last three pivots: Metaverse dog salon → NFT bakery → this. This time it will be different.',                                                                          array['Fundraising','Pitching','Pivoting']),
      ('carlos_r',      'Carlos Reyes',     'carlos@ratrace.dev',     'Zürich',     'I thought I was building the next Uber. It was an app for hedgehogs. This time it really is the next Uber.',                                                                                array['Marketplace','Growth','VC Blind Dates']),
      ('yuki_t',        'Yuki Tanaka',      'yuki@ratrace.dev',       'Remote',     'FOMO-driven builder with ADHD. 4th startup idea this week, 3rd last week. We will find one that sticks.',                                                                                   array['React Native','Rapid Prototyping','Sleep Deprivation']),
      ('lena_m',        'Lena Müller',      'lena@ratrace.dev',       'Leipzig',    'Psychologist who read too much Twilight and is now building AI for emotional support. Yes, really.',                                                                                        array['Psychology','UX Research','Empathy-as-a-Service']),
      ('felix_w',       'Felix Weber',      'felix@ratrace.dev',      'Berlin',     'Backend engineer who after 8 years of Google salary finally wants to build something meaningful. Or at least funny.',                                                                       array['Go','Kubernetes','Existential Crisis']),
      ('priya_d',       'Priya Desai',      'priya@ratrace.dev',      'Düsseldorf', 'Product Lead at a unicorn nobody likes. Building on the side what I actually want to build.',                                                                                               array['Product','User Research','Internal Suffering']),
      ('bjoern_l',      'Björn Lindqvist',  'bjoern@ratrace.dev',     'Stuttgart',  'Swede in Germany. Cannot deal with the bureaucracy so building software to fight it.',                                                                                                      array['FinTech','Compliance','Sarcasm']),
      ('amara_o',       'Amara Osei',       'amara@ratrace.dev',      'Köln',       'Doctor who realized the healthcare system is broken and decided to fail at fixing it as a founder rather than as a physician.',                                                             array['HealthTech','Medicine','Systems Thinking']),
      ('sven_k',        'Sven Kraft',       'sven@ratrace.dev',       'Hamburg',    'Founded three startups. Two are dead, one is somehow still alive. Ratio is okay.',                                                                                                          array['B2B SaaS','Customer Success','Resilience']),
      ('nina_v',        'Nina Vogel',       'nina@ratrace.dev',       'Freiburg',   'Climate scientist who got tired of writing reports nobody reads. Now building tools that make people actually act on climate data.',                                                        array['Climate Tech','Data Science','Python']),
      ('marko_n',       'Marko Novak',      'marko@ratrace.dev',      'Dortmund',   'Ex-pro footballer turned full-stack dev. Spent 5 years in Bundesliga 3, now spending 5 years learning TypeScript. Both are painful.',                                                      array['TypeScript','React','Sports Analytics']),
      ('sophie_w',      'Sophie Wagner',    'sophie@ratrace.dev',     'Frankfurt',  'Lawyer who learned to code during lockdown. Now doing both at once which means I am bad at two things simultaneously.',                                                                     array['LegalTech','TypeScript','Contract Law']),
      ('ali_k',         'Ali Karimi',       'ali@ratrace.dev',        'Berlin',     'Refugee turned software architect. Built a fintech in Kabul, escaped in 2021, rebuilt everything from scratch in Berlin. Not stopping.',                                                   array['FinTech','System Design','Resilience']),
      ('elena_p',       'Elena Petrova',    'elena@ratrace.dev',      'Lausanne',   'Food scientist at Nestlé who realized corporations will never fix food. Building the alternative from a 30m² apartment kitchen.',                                                           array['FoodTech','Supply Chain','Chemistry']),
      ('thomas_k',      'Thomas Köhler',    'thomas@ratrace.dev',     'Wien',       'Teacher who spent 12 years watching EdTech companies build for investors not students. Done watching.',                                                                                     array['EdTech','Pedagogy','Curriculum Design']),
      ('zara_f',        'Zara Fischer',     'zara@ratrace.dev',       'München',    'Fashion industry insider who is deeply ashamed of it. Building circular economy tools to clean up the mess I helped make.',                                                                 array['Sustainability','Fashion','B2B Sales']),
      ('leon_g',        'Leon Gruber',      'leon@ratrace.dev',       'Hamburg',    'Architecture student who realized buildings take 10 years to build and pivoted to software. Both involve a lot of frustration with clients.',                                               array['PropTech','3D Modeling','Figma'])
    ) as t(username, full_name, email, location, bio, skills)
  ) loop
    uid := gen_random_uuid();

    if exists (select 1 from auth.users where email = u.email) then
      select id into uid from auth.users where email = u.email;
    else
      insert into auth.users (
        id, instance_id, aud, role, email,
        encrypted_password, email_confirmed_at,
        raw_user_meta_data, created_at, updated_at,
        confirmation_token, recovery_token, email_change_token_new, email_change
      ) values (
        uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
        u.email,
        crypt('Demo1234!', gen_salt('bf')),
        now(),
        jsonb_build_object('username', u.username, 'full_name', u.full_name),
        now() - (random() * interval '60 days'),
        now(),
        '', '', '', ''
      );
    end if;

    insert into public.profiles (id, username, full_name, location, bio, skills)
    values (uid, u.username, u.full_name, u.location, u.bio, u.skills)
    on conflict (id) do update set
      username = u.username, full_name = u.full_name,
      location = u.location, bio = u.bio, skills = u.skills;

  end loop;
end $$;

-- 4. Delete old demo listings and re-insert all 50
delete from public.listings where user_id in (
  select id from public.profiles where username in (
    'meilin_chen','tariq_b','anastasia_k','kofi_asante','carlos_r','yuki_t',
    'lena_m','felix_w','priya_d','bjoern_l','amara_o','sven_k',
    'nina_v','marko_n','sophie_w','ali_k','elena_p','thomas_k','zara_f','leon_g'
  )
);

do $$
declare
  uid_meilin    uuid := (select id from public.profiles where username = 'meilin_chen');
  uid_tariq     uuid := (select id from public.profiles where username = 'tariq_b');
  uid_anastasia uuid := (select id from public.profiles where username = 'anastasia_k');
  uid_kofi      uuid := (select id from public.profiles where username = 'kofi_asante');
  uid_carlos    uuid := (select id from public.profiles where username = 'carlos_r');
  uid_yuki      uuid := (select id from public.profiles where username = 'yuki_t');
  uid_lena      uuid := (select id from public.profiles where username = 'lena_m');
  uid_felix     uuid := (select id from public.profiles where username = 'felix_w');
  uid_priya     uuid := (select id from public.profiles where username = 'priya_d');
  uid_bjoern    uuid := (select id from public.profiles where username = 'bjoern_l');
  uid_amara     uuid := (select id from public.profiles where username = 'amara_o');
  uid_sven      uuid := (select id from public.profiles where username = 'sven_k');
  uid_nina      uuid := (select id from public.profiles where username = 'nina_v');
  uid_marko     uuid := (select id from public.profiles where username = 'marko_n');
  uid_sophie    uuid := (select id from public.profiles where username = 'sophie_w');
  uid_ali       uuid := (select id from public.profiles where username = 'ali_k');
  uid_elena     uuid := (select id from public.profiles where username = 'elena_p');
  uid_thomas    uuid := (select id from public.profiles where username = 'thomas_k');
  uid_zara      uuid := (select id from public.profiles where username = 'zara_f');
  uid_leon      uuid := (select id from public.profiles where username = 'leon_g');
begin
  insert into public.listings (user_id, title, description, role_category, compensation_type, equity_percent, stage, is_active, seeks_investment, investment_round, created_at) values

  (uid_meilin,    'Tinder for lunch breaks — because introverts need to eat too',
   'Matching algorithm for office workers who don''t want to eat alone but also have zero small talk energy. AI picks who can compatibly stay silent together. 340 beta users, 12% conversion to actual meetups. The rest just ate alone. That''s fine too.',
   'developer', 'equity', 12, 'mvp', true, false, null, now() - interval '1 hour'),

  (uid_tariq,     'Blockchain for allotment garden waitlists',
   'In German cities you wait 15–25 years for an allotment garden. We tokenize waiting spots as NFTs — tradeable, loanable, inheritable. Sounds stupid. 400 people on our own waitlist. Looking for a CTO who doesn''t immediately say no.',
   'cofounder', 'equity', 30, 'idea', true, true, 'pre-seed', now() - interval '2 hours'),

  (uid_anastasia, 'SaaS CRM for astrologers',
   'There are 180,000 active astrologers in the DACH region. None of them have a proper booking tool. We are building HubSpot but for people who use Mercury retrograde as an excuse for everything. MRR: €8,400. Looking for a designer who gets the vibe.',
   'designer', 'both', 7, 'revenue', true, false, null, now() - interval '3 hours'),

  (uid_kofi,      'Uber but only for elderly people going to the doctor',
   'My grandma can''t get to chemo because there''s no taxi and she can''t use Uber. Pilot in Frankfurt: 60 elderly users, 94% want to come back. Looking for a co-founder with mobility background or at least empathy.',
   'cofounder', 'equity', 20, 'mvp', true, true, 'seed', now() - interval '4 hours'),

  (uid_carlos,    'AI writes your apologies for every situation in life',
   'GPT-4 generates convincing apologies for: being late, forgetting birthdays, ignoring WhatsApp, skipping the gym, and lying to your boss. 50k downloads, 4.8 stars. "Life-saving" — App Store review. Looking for a growth hacker with as little shame as we have.',
   'marketing', 'both', 9, 'revenue', true, false, null, now() - interval '5 hours'),

  (uid_yuki,      'RentTok — TikTok for seniors, font size 24, no algorithm stress',
   'My grandma needed 4 hours to understand TikTok. We''re building the same thing but without content that pushes after 9pm. 200 beta grandmas. One said "better than TV". We''re using that as a testimonial.',
   'developer', 'equity', 18, 'mvp', true, false, null, now() - interval '7 hours'),

  (uid_lena,      'Therapy app for founders who believe their own pitch',
   'CBT combined with reality checks for founder brains. Module 1: "No, your idea is not the next Google." Module 2: "Your investor update is not a success." 1,200 founders on the waitlist. Need a backend dev who might need therapy themselves.',
   'developer', 'equity', 22, 'idea', true, false, null, now() - interval '9 hours'),

  (uid_tariq,     'DAO for allotment gardeners — finally DeFi for boomers',
   'German gardening clubs collectively hold €2.3B in land but have zero digital infrastructure. Token voting for "who can plant leek next to tomatoes" decisions. Pilot with 3 clubs. Looking for someone who understands both Solidity and gardening law.',
   'cofounder', 'equity', 25, 'mvp', true, true, 'pre-seed', now() - interval '11 hours'),

  (uid_anastasia, 'B2B API for German government forms — Stripe for bureaucracy',
   'All German administrative forms as an API. Sounds boring. €40k MRR after 8 months, zero marketing. Enterprise clients pay because they have no alternative. Looking for a sales person who doesn''t hate bureaucracy.',
   'sales', 'both', 8, 'revenue', true, false, null, now() - interval '14 hours'),

  (uid_felix,     'Duolingo but for tax returns',
   '5-minute lessons explaining what a depreciation allowance is, why you can deduct your office chair, and what "extraordinary burden" actually means. 15k users, 40% now do their taxes themselves. The tax software lobby is not happy. Good sign.',
   'marketing', 'both', 10, 'mvp', true, false, null, now() - interval '16 hours'),

  (uid_priya,     'Anonymous Glassdoor but founders review their investors',
   'Investors can read everything about startups but founders can''t see which VC takes 6 months to say no. We built that. 800 verified reviews in beta. No VC has complained yet because they haven''t found it.',
   'developer', 'equity', 15, 'mvp', true, false, null, now() - interval '20 hours'),

  (uid_bjoern,    'AI assistant that translates German bureaucratic language into German',
   'A "Mahnbescheid" is not a description of someone who nags. We translate government German into language humans understand, in real-time via browser extension. 12k active users. The relevant ministries have asked questions. We replied politely.',
   'cofounder', 'equity', 30, 'mvp', true, false, null, now() - interval '24 hours'),

  (uid_amara,     'Waiting room killer for doctor''s offices — Tetris for the waiting room',
   'Patients wait an average of 43 minutes. We replace 2019 magazines with a tablet showing health explainer videos, prevention checklists and games. 25 practices in pilot. Doctors say "finally". Patients say "already my turn". Looking for a developer.',
   'developer', 'both', 13, 'mvp', true, true, 'seed', now() - interval '30 hours'),

  (uid_sven,      'Slack but for tradespeople — no English, no threads',
   'My dad is an electrician. He uses WhatsApp for everything including quotes and complaints. We''re building an app that looks like WhatsApp but is GDPR-compliant and has quotes, reports and timesheets. 40 businesses are already paying.',
   'cofounder', 'equity', 20, 'revenue', true, false, null, now() - interval '36 hours'),

  (uid_felix,     'Automated code review but for tax returns',
   'We process ELSTER exports and automatically find errors, forgotten deductions and places you can legally save money. Closed beta, 200 tax advisors. Looking for someone who doesn''t shut down when they hear "data protection" but leans in.',
   'designer', 'equity', 17, 'idea', true, false, null, now() - interval '42 hours'),

  (uid_kofi,      'On-demand storage for Berliners without a cellar',
   'Airbnb for basement storage. Berlin apartments have no cellar. Berliners have too much stuff. We match the two. 180 active listings in Berlin, 60% occupancy. Looking for a marketing person who can explain why this isn''t weird.',
   'marketing', 'both', 11, 'mvp', true, false, null, now() - interval '48 hours'),

  (uid_priya,     'AI coach that tells you when to stop working',
   'Not another productivity app. The opposite of that. Detects burnout patterns from calendar + Slack activity and sends you a message at 6:30pm: "Stop now." 3,000 users, 22% fewer overtime hours by self-report. HR teams find this alarming.',
   'developer', 'equity', 14, 'mvp', true, false, null, now() - interval '55 hours'),

  (uid_yuki,      'Fiverr but only for things retirees can do',
   'Marketplace for skills over 65: fix a typewriter, read old German script, bake real bread, fill in tax forms without software. Irony: mostly used by Gen Z. 420 active providers. Looking for a co-founder who can take this seriously without laughing.',
   'cofounder', 'equity', 28, 'mvp', true, false, null, now() - interval '65 hours'),

  (uid_bjoern,    'Tinder for tax advisors and freelancers',
   'Finding the right tax advisor is like dating. Profile matching by industry, communication style and whether you prefer WhatsApp or email. 2,000 successful matches. 0 lawsuits so far. Looking for a backend dev.',
   'developer', 'both', 6, 'revenue', true, false, null, now() - interval '72 hours'),

  (uid_amara,     'Health tracking that doesn''t pretend you''re an athlete',
   'Every fitness app assumes you do 10,000 steps and wake up at 6am. We track whether you drank your water bottle, went outside today and didn''t spend four hours on TikTok. Pilot: 800 users with explicitly low goals. 67% feel better.',
   'designer', 'equity', 16, 'mvp', true, false, null, now() - interval '80 hours'),

  -- New 30 listings (nina, marko, sophie, ali, elena, thomas, zara, leon + extras)
  (uid_nina,      'Carbon footprint tracker that doesn''t make you feel guilty every time',
   'Every climate app shows you a red number and then leaves you alone with it. We calculate your footprint and show you the three cheapest changes you can actually make this week. 2,400 users, avg carbon reduction 18% in 3 months. Need a product designer.',
   'designer', 'both', 12, 'mvp', true, false, null, now() - interval '6 hours'),

  (uid_marko,     'Video analysis platform for amateur football coaches',
   'Pro clubs have Wyscout. Sunday league coaches have nothing. We built automatic video tagging, player heatmaps and tactical boards for €29/month. 600 clubs paying. Bundesliga 3 clubs asking about whitelabeling. Need a backend engineer.',
   'developer', 'both', 10, 'revenue', true, true, 'seed', now() - interval '8 hours'),

  (uid_sophie,    'Legal contract review AI for freelancers who can''t afford a lawyer',
   'Freelancers sign contracts without reading them because lawyers cost €300/hr. We scan any contract in German, flag the dangerous clauses and explain them in plain language. 8k freelancers, €19/month. Big law firms haven''t noticed yet.',
   'marketing', 'both', 8, 'revenue', true, false, null, now() - interval '10 hours'),

  (uid_ali,       'Banking for the unbanked in Europe — refugees and migrants first',
   '15M people in Europe have no bank account. Not because they don''t want one. Because the KYC process was designed for someone with a German address and a Schufa score. We built an alternative. 3,200 active accounts, 0 fraud cases. Raising seed.',
   'cofounder', 'equity', 15, 'revenue', true, true, 'seed', now() - interval '12 hours'),

  (uid_elena,     'Ugly vegetable subscription box — the supermarket rejects',
   'German supermarkets reject 30% of vegetables for aesthetic reasons. We buy them directly from farmers and deliver them. €23/box, 1,400 subscribers, 100% month-on-month growth for 6 months. Need a co-founder to handle everything I am bad at.',
   'cofounder', 'equity', 25, 'revenue', true, false, null, now() - interval '15 hours'),

  (uid_thomas,    'Homework help AI that teaches instead of giving answers',
   'ChatGPT does the homework. We make the AI Socratic — it asks questions until the student figures it out themselves. Teachers love it. Students are annoyed by it. That means it works. 4,000 students, 90 schools piloting. Need a React developer.',
   'developer', 'both', 14, 'mvp', true, false, null, now() - interval '18 hours'),

  (uid_zara,      'Resale infrastructure for fashion brands — returns become revenue',
   'Fashion brands send 30% of returns to landfill because resale is too complex. We built a white-label resale platform they can embed. 12 mid-size brands live, €180k GMV last month. Need a head of partnerships who knows fashion.',
   'sales', 'both', 9, 'revenue', true, true, 'series-a', now() - interval '21 hours'),

  (uid_leon,      '3D apartment configurator for renters before they sign',
   'You sign a lease for a flat you''ve seen once for 20 minutes. We let you walk through a 3D model, place your furniture and see if your IKEA couch fits before you commit. 40 real estate agencies, 12k flat viewings replaced. Need a backend engineer.',
   'developer', 'equity', 20, 'mvp', true, false, null, now() - interval '25 hours'),

  (uid_nina,      'Real-time air quality monitor for schools',
   'CO2 levels above 1,500ppm destroy concentration. Most classrooms hit 2,500ppm by 10am. We install a €49 sensor, it auto-opens the window reminder and logs data for parents. 200 schools, Munich is mandating it district-wide. Need growth.',
   'marketing', 'both', 7, 'revenue', true, false, null, now() - interval '28 hours'),

  (uid_marko,     'Injury prediction model for youth athletes',
   'ACL injuries peak at 14-16. We analyze movement patterns from training video and flag biomechanical red flags 3-6 months before injury. Pilot with 8 academies. 0 flagged athletes have been injured. 2 unflagged ones have. The model works.',
   'cofounder', 'equity', 30, 'mvp', true, true, 'pre-seed', now() - interval '32 hours'),

  (uid_sophie,    'Automated GDPR compliance for SaaS startups',
   'Every SaaS founder knows they should do GDPR properly. None of them do because lawyers want €5k upfront. We scan your codebase and data flows, generate the documentation automatically and keep it updated. 350 startups, €89/month. Looking for a developer co-founder.',
   'cofounder', 'equity', 22, 'revenue', true, false, null, now() - interval '38 hours'),

  (uid_ali,       'Cross-border remittance for DACH diaspora communities',
   'Western Union charges 8% to send money home. We charge 0.5%. Onboarding works with a passport photo, no German ID needed. €2.1M transferred in first 4 months. Zero chargebacks. Licensing in progress. Need a compliance co-founder.',
   'cofounder', 'equity', 18, 'revenue', true, true, 'seed', now() - interval '45 hours'),

  (uid_elena,     'B2B fermentation-as-a-service for food brands',
   'Fermentation is the next big food trend but it requires specialist knowledge. We license our fermentation IP and provide toll-manufacturing for brands who want to add kombucha, kefir or kimchi to their line without the complexity. 6 brand clients, €340k ARR.',
   'sales', 'both', 10, 'revenue', true, false, null, now() - interval '52 hours'),

  (uid_thomas,    'Language learning app built around real news stories',
   'Duolingo teaches you "the duck is under the table". Real language learners want to read the news. We take actual news articles and break them down to your level, track vocabulary and adjust difficulty. 18k active learners, 6 languages. Need a designer.',
   'designer', 'both', 11, 'mvp', true, false, null, now() - interval '58 hours'),

  (uid_zara,      'Rental clothing platform for special occasions in Germany',
   'Germans buy an outfit for one wedding and never wear it again. We run rental logistics for formal wear with same-day delivery in 5 cities. 2,400 rentals, NPS 71, 34% repeat rate within 6 months. Need marketing to scale.',
   'marketing', 'both', 9, 'revenue', true, false, null, now() - interval '62 hours'),

  (uid_leon,      'AI-generated renovation estimates from a single photo',
   'You take a photo of your bathroom, tell us what you want and get a €±15% accurate renovation quote in 90 seconds without a tradesperson visit. 5,000 estimates generated, 12% conversion to actual renovation bookings. Need backend developer.',
   'developer', 'equity', 16, 'mvp', true, true, 'seed', now() - interval '70 hours'),

  (uid_meilin,    'Sleep coaching for founders who treat burnout as a badge of honor',
   'We tracked sleep data from 400 founders for 6 months. The ones sleeping less than 6 hours made 30% worse decisions by their own evaluation. Building a coaching product that uses wearable data to make the business case for sleep. Need a developer.',
   'developer', 'equity', 25, 'idea', true, false, null, now() - interval '75 hours'),

  (uid_sven,      'Customer success platform for B2B SaaS that actually works',
   'Churn happens 60 days before the renewal. Every CS tool shows you the data after it''s too late. We built early warning models trained on 200k SaaS customer journeys. Customers reduce churn 23% on average. €80k ARR, 18 months old. Want a co-founder.',
   'cofounder', 'equity', 35, 'revenue', true, false, null, now() - interval '85 hours'),

  (uid_lena,      'Mental health check-ins embedded in productivity tools',
   'Nobody opens a mental health app when they''re struggling — they open Notion or Linear. We built integrations that insert 30-second check-ins into the tools people already use. 6k users across 40 companies. HR teams paying €8/user/month.',
   'sales', 'both', 8, 'revenue', true, false, null, now() - interval '90 hours'),

  (uid_carlos,    'Verified review platform where only buyers can review',
   'Every review platform is gamed. We verify purchasers via bank transaction data before they can review. 40k verified reviews, 0 incentivized. E-commerce shops pay €199/month because their conversion went up 18%. Need a growth co-founder.',
   'cofounder', 'equity', 20, 'revenue', true, true, 'series-a', now() - interval '96 hours'),

  (uid_amara,     'Remote patient monitoring for chronic disease management',
   'Diabetics visit their doctor 4 times a year for 15 minutes. In between, nothing. We connect wearables to a care coordination platform so GPs can see when patients need intervention before it becomes an emergency. 8 GP practices live, €60k ARR.',
   'developer', 'both', 12, 'revenue', true, true, 'seed', now() - interval '100 hours'),

  (uid_bjoern,    'Visa application tracker for highly skilled migrants',
   'German Fachkräftemangel is real. The visa process is a black box. We map every document required for every visa type, track application status and send alerts when something is missing. 4,200 applicants used it. Employers paying for premium tracking.',
   'marketing', 'both', 10, 'mvp', true, false, null, now() - interval '108 hours'),

  (uid_priya,     'Competitive intelligence tool for B2B SaaS that doesn''t need spies',
   'We aggregate public signals — job postings, pricing pages, G2 reviews, LinkedIn activity — to give you a live competitive picture. 250 SaaS companies paying €290/month. Sequoia portfolio company told their entire portfolio about us. Need a sales hire.',
   'sales', 'both', 7, 'revenue', true, false, null, now() - interval '115 hours'),

  (uid_meilin,    'AI procurement assistant for SMEs who overpay for everything',
   'A 50-person company spends €800k/year on tools, services and supplies. Nobody has time to benchmark prices. We audit spend automatically and surface 15-25% savings on average. Paid by results — 20% of savings. 30 SMEs, €340k saved. Need a developer.',
   'developer', 'both', 13, 'revenue', true, false, null, now() - interval '122 hours'),

  (uid_kofi,      'Event staffing platform — Eventbrite but for the people who run the event',
   'Events need 50 staff with 2 weeks notice. Nobody has a system for this. We built a marketplace that verifies, schedules and pays event staff. €180k GMV in first 6 months, mostly Berlin and Frankfurt. Want a co-founder with operations experience.',
   'cofounder', 'equity', 25, 'revenue', true, false, null, now() - interval '130 hours'),

  (uid_felix,     'Database change management for teams who are scared of migrations',
   'Every startup has a database they''re afraid to touch. We built a tool that generates migration scripts, simulates them on a clone of your production DB and rolls back automatically if something breaks. 800 dev teams, €49/month. Need a designer.',
   'designer', 'both', 8, 'revenue', true, false, null, now() - interval '138 hours'),

  (uid_nina,      'Corporate carbon reporting that doesn''t take 3 months to prepare',
   'CSRD requires Scope 1, 2 and 3 reporting from 2025. Consultants charge €40k to prepare it. We automate 80% of the data collection from existing ERP systems and generate audit-ready reports. 25 mid-size companies in beta. Need a co-founder.',
   'cofounder', 'equity', 30, 'mvp', true, true, 'seed', now() - interval '145 hours'),

  (uid_thomas,    'Corporate training platform that employees actually use',
   'Compliance training completion rates average 34%. Nobody cares. We built 5-minute micro-learning modules with spaced repetition that feel like news, not HR. 12 companies, 4,200 employees, 89% completion. Need a backend engineer.',
   'developer', 'both', 11, 'revenue', true, false, null, now() - interval '155 hours'),

  (uid_zara,      'B2B platform for textile waste exchange between manufacturers',
   'A shirt manufacturer has 3 tons of cotton offcuts. A bag maker needs exactly that. Nobody knows the other exists. We built a marketplace for industrial textile waste. 80 manufacturers, €420k in transactions, 340 tons diverted from landfill. Need growth.',
   'marketing', 'both', 9, 'revenue', true, false, null, now() - interval '162 hours'),

  (uid_leon,      'PropTech for social housing allocation — fair by algorithm',
   'Social housing allocation in Germany is opaque, slow and full of errors. We built a transparent scoring and matching system for municipalities. 3 city districts live. Waiting time reduced from 18 to 11 months average. Need a backend co-founder.',
   'cofounder', 'equity', 28, 'mvp', true, true, 'seed', now() - interval '170 hours');

end $$;
