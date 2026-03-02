# Urreal3D — Complete Setup Guide
# Follow these steps ONE BY ONE after downloading the ZIP

=============================================================
WHAT THIS DOES WHEN LIVE:
Someone fills your form → Backend saves it → PDF auto-sent to your Telegram
=============================================================


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 1 — SET UP YOUR TELEGRAM BOT (5 minutes)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Open Telegram on your phone
2. Search for:  @BotFather  (blue tick, official)
3. Tap it → tap START
4. Type:  /newbot
5. It asks for a name — type:  Urreal3D Inquiries
6. It asks for a username — type:  urreal3d_inquiries_bot
   (if taken, try urreal3d_bookings_bot or similar)
7. BotFather gives you a TOKEN — it looks like:
   7123456789:AAFxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   COPY THIS TOKEN — save it somewhere safe

8. Now get your Chat ID:
   - Search for:  @userinfobot  in Telegram
   - Tap START
   - It replies with your ID number — looks like:  123456789
   - COPY THIS NUMBER

You now have:
✅ BOT TOKEN  (from BotFather)
✅ CHAT ID    (from userinfobot)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 2 — CREATE GITHUB ACCOUNT + UPLOAD CODE (10 minutes)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Go to:  https://github.com
2. Click "Sign up" — create a free account
3. After signing in, click the "+" icon (top right) → "New repository"
4. Repository name:  urreal3d
5. Make sure it is set to PUBLIC
6. Click "Create repository"

Now upload your files:
7. On the new repo page, click "uploading an existing file"
8. Unzip the file you downloaded (urreal3d-complete.zip)
9. Drag ALL files and folders into the GitHub upload box:
   - backend/  (folder)
   - public/   (folder)
   - package.json
   - .env.example
   - README.md
10. Scroll down → click "Commit changes"

Your code is now on GitHub ✅

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 3 — DEPLOY ON RENDER.COM (10 minutes)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Go to:  https://render.com
2. Click "Get Started" → sign up with your GitHub account
   (click "Continue with GitHub" — easiest way)
3. Click "New +" (top right) → select "Web Service"
4. Click "Connect" next to your  urreal3d  repository
5. Fill in these settings:
   - Name:             urreal3d
   - Region:           Choose closest (Singapore for India)
   - Branch:           main
   - Build Command:    npm install
   - Start Command:    npm start
   - Instance Type:    FREE  ← make sure this is selected
6. Scroll down to "Environment Variables" section
   Click "Add Environment Variable" and add these one by one:

   Key                    Value
   ─────────────────────────────────────────────────
   TELEGRAM_BOT_TOKEN     (paste your token from Step 1)
   TELEGRAM_CHAT_ID       (paste your chat ID from Step 1)
   ADMIN_KEY              makethissomethingonlyyouknow123
   PORT                   3001

7. Click "Create Web Service"
8. Render will now build your site — takes 2-4 minutes
9. When it says "Live" you'll see a URL like:
   https://urreal3d.onrender.com

OPEN THAT URL — your website is live! 🎉

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 4 — START YOUR TELEGRAM BOT (1 minute)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

IMPORTANT — you must do this or Telegram won't send you messages:

1. In Telegram, search for your bot name (urreal3d_inquiries_bot)
2. Tap it → tap START
3. That's it — the bot can now send you PDFs

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 5 — TEST IT (2 minutes)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Open your live website URL from Render
2. Go to the "Book" page
3. Fill out the form with a test name like "Test Client"
4. Click Send Inquiry
5. Check your Telegram — you should receive:
   - A text message with the inquiry details
   - A PDF file  (Inquiry_Test_Client_1.pdf)

If it works = everything is set up correctly ✅

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OPTIONAL — CUSTOM DOMAIN (if you buy urreal3d.com later)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Buy domain on Namecheap (~₹900/year)
2. In Render dashboard → your service → Settings → Custom Domain
3. Click "Add Custom Domain" → type urreal3d.com
4. Render shows you a CNAME record value
5. In Namecheap → Domain List → Manage → Advanced DNS
6. Add the CNAME record Render gave you
7. Wait 15-30 minutes → your site is on urreal3d.com
8. Render adds HTTPS (padlock) automatically for free

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMMON PROBLEMS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Problem: Site loads slowly the first time
Fix: Normal on free Render — it "sleeps" after inactivity.
     First visitor wakes it up (30-50 sec). After that it's fast.

Problem: PDF not coming to Telegram
Fix: Make sure you did Step 4 (started the bot by clicking START)
     Double-check the TOKEN and CHAT ID in Render environment variables

Problem: Form says "Could not connect to server"
Fix: Your Render deploy might have failed. Check Render dashboard
     → Logs tab to see the error message

Problem: Build failed on Render
Fix: Make sure all files were uploaded correctly in Step 2.
     The backend/ and public/ folders must both be there.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE STRUCTURE REMINDER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

urreal3d/
├── public/
│   └── index.html      ← Your full website (all 7 pages)
├── backend/
│   └── server.js       ← Backend (form + PDF + Telegram)
├── package.json        ← Tells Node which packages to install
├── .env.example        ← Example of environment variables
└── README.md           ← This guide

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SUMMARY — TOTAL TIME: ~25 minutes
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Step 1 — Telegram bot setup          5 min
Step 2 — GitHub upload               10 min
Step 3 — Render deploy               10 min
Step 4 — Start bot in Telegram       1 min
Step 5 — Test                        2 min

TOTAL COST = $0 forever
(until you decide to buy a custom domain)
