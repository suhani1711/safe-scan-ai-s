# Safe Scan AI

For building the website, think of it as a “digital safety scanner”, not just an informational website.

1. Main concept

A user comes to the website and sees:

Scan Before You Trust 🛡️
Check a suspicious SMS, QR code, or link before you click or pay.

Then give them 3 major options:

┌─────────────────────────────────────┐
│          🛡️ ScamShield AI           │
│       Scan Before You Trust         │
│                                     │
│  [ 📱 Scan SMS ]                    │
│  [ 🔳 Scan QR ]                     │
│  [ 🔗 Check Link ]                  │
│                                     │
│     Your digital safety shield      │
└─────────────────────────────────────┘

The PPT specifically defines these three detection systems: SMS Detector, QR Verifier and Link Scanner.

2. Website pages

I would build around 5 main pages.

🏠 Home

Hero section:

ScamShield AI
Scan Before You Trust

Subtitle:

AI-powered protection against fake SMS, malicious QR codes and phishing links.

Buttons:

Scan SMS
Scan QR
Check Link

Then show three feature cards:

📱 SMS Scam Detector
Detect fake KYC alerts, banking scams, lottery scams, etc.

🔳 QR Trust Check
Check whether a payment QR contains suspicious UPI information.

🔗 Smart Link Scanner
Detect suspicious domains, fake websites and redirects.

These capabilities are directly described in your PPT.

3. 🔗 Link Scanner

This can be one of the most impressive parts of the website.

User enters:

https://sbi-update-kyc.com

Then clicks:

SCAN LINK

Show an animated scanning screen:

🔍 Analyzing URL...

✓ Domain structure
✓ SSL certificate
✓ Domain age
✓ Redirects
✗ Suspicious domain detected

Then show:

⚠️ HIGH RISK
Trust Score
18 / 100

And:

Why is this dangerous?

❌ Fake/unofficial domain
❌ Suspicious banking keywords
❌ Domain structure resembles a bank website
❌ Community reports detected

Your PPT specifically uses 18/100 as the example Trust Score and gives the fake sbi-update-kyc.com example.

Then:

Recommended Action

🔴 Do NOT open this link

Buttons:

← Scan Another
Report Scam

4. 📱 SMS Scam Detector

This should have a textbox.

Example:

Paste suspicious SMS

┌──────────────────────────────────────┐
│ Your SBI account will be blocked... │
│ Update your KYC immediately...      │
│ Click here: sbi-update-kyc.com      │
└──────────────────────────────────────┘

             [ ANALYZE SMS ]

After clicking:

AI Analysis
Risk Level: HIGH

Trust Score
     18
   /100

Then display the reasons:

🚨 Urgent/coercive language
🌐 Suspicious domain
🏦 Sender doesn't match official bank
👥 Community scam reports

This follows the PPT's SMS detection workflow and example.

5. 🔳 QR Scanner

This could be your most visually interesting feature.

User gets:

       QR SCANNER

       ┌───────────┐
       │           │
       │    QR     │
       │  SCANNER  │
       │           │
       └───────────┘

[ Upload QR Image ]

        OR

[ Open Camera ]

After scanning:

QR ANALYSIS COMPLETE

Merchant:
XYZ Store

UPI ID:
xyzstore@upi

Trust Score:
72 / 100

🟢 LOW RISK

Or:

Trust Score:
21 / 100

🔴 HIGH RISK

⚠️ Suspicious payment handle detected.

The PPT says the QR verifier checks merchant identity and the underlying UPI payment string before payment.

6. 🧠 Trust Score

This should be the main visual identity of your website.

Every scan produces:

       TRUST SCORE

          18
        ─────
        100

      🔴 HIGH RISK

Then:

Threat Breakdown
Domain Safety        █████████░  High Risk
Sender Authenticity  ████████░░  High Risk
Community Reports    █████████░  High Risk
Message Pattern      ███████░░░  Suspicious

And importantly:

"Why is this risky?"

Instead of simply saying SCAM, explain it in simple language.

That's the Explainable AI component from your PPT.

7. 🔄 Overall user flow

Your website should follow this flow:

                 USER
                   ↓
             Choose Scanner
                   ↓
       ┌───────────┼───────────┐
       ↓           ↓           ↓
      SMS          QR         LINK
       ↓           ↓           ↓
       └───────────┼───────────┘
                   ↓
               AI ANALYSIS
                   ↓
            COMMUNITY CHECK
                   ↓
             TRUST SCORE
                   ↓
          THREAT BREAKDOWN
                   ↓
           SAFE ACTION

This matches the workflow in the PPT: Scan → AI Analyze → Community Check → Trust Score → Safe/Block.

8. 🚨 Community Scam Database

This is where your project becomes more than a simple AI chatbot.

Create a page:

Community Scam Intelligence

Example:

🚨 Recent Scam Reports

Fake SBI KYC SMS
Reported: 247 times
Risk: HIGH

Fake Electricity Bill Link
Reported: 183 times
Risk: HIGH

Fake UPI Cashback QR
Reported: 91 times
Risk: MEDIUM

A user could click:

REPORT A SCAM

and submit:

Type:
○ SMS
○ QR
○ Link

Description:
____________________

[ SUBMIT REPORT ]

The PPT describes a Community Scam DB where one user report can be synchronized to protect other users.

9. 👨‍👩‍👧 Family Protection Mode

Add a separate feature:

Family Protection

For example:

Family Protection
────────────────────────

👵 Grandma
Protection: ON 🟢

👴 Grandpa
Protection: ON 🟢

📱 Emergency Alerts
       ON 🟢

If a high-risk scam is detected:

🚨 HIGH-RISK SCAM DETECTED

An emergency alert can be sent
to your selected family guardian.

[ SEND ALERT ]

This is based directly on the PPT's Family Protection Mode concept.

10. 🧬 Scam DNA

This can be a cool dashboard feature.

Suppose 500 different SMS messages are variations of:

"Your bank account will be blocked. Update KYC immediately."

Your system recognizes that they have a similar structure.

Show:

🧬 SCAM DNA DETECTED

Pattern:
Fake KYC + Urgency + Banking + Link

Similar scams:
━━━━━━━━━━━━━━━━━━

247 reports
18 variations
6 domains
3 banks impersonated

Your PPT calls this Scam DNA, which identifies recurring scam templates and structural variations.

11. Dashboard

After login, the user could have:

Hello, Suhani 👋

Your Protection Status
🟢 ACTIVE

────────────────────

Today's Scans

📱 SMS        12
🔗 Links       8
🔳 QR          5

────────────────────

Threats Blocked

🔴 High Risk       3
🟠 Medium Risk     5
🟢 Safe           17

────────────────────

[ Scan Something ]

This makes the website feel like an actual cybersecurity product rather than a college project demo.

12. Technology behind it

According to your PPT, the proposed stack is:

Frontend
React Native

Backend
FastAPI

AI
Gemini + Python

QR Processing
OpenCV

Database
Firebase

Cloud
Google Cloud

For a website prototype, however, I would structure it as:

Frontend
React + Vite
       ↓
FastAPI Backend
       ↓
Python AI Layer
       ↓
Gemini API
       ↓
Firebase

For QR:

QR Image
   ↓
OpenCV / QR Decoder
   ↓
UPI Data
   ↓
Risk Analysis
   ↓
Trust Score
13. Website design style

I'd make it look like a modern cybersecurity dashboard.

Color direction

Use:

Dark navy/black background
White text
Cyan/blue highlights
Green = Safe
Yellow = Warning
Red = Dangerous
UI style

Use:

Glassmorphism + cybersecurity dashboard

For example:

╭─────────────────────────────────────╮
│ 🛡️ ScamShield AI        Dashboard   │
├─────────────────────────────────────┤
│                                     │
│       Scan Before You Trust         │
│                                     │
│  ┌────────┐ ┌────────┐ ┌────────┐ │
│  │   SMS  │ │   QR   │ │  LINK  │ │
│  │   📱   │ │   🔳   │ │   🔗   │ │
│  └────────┘ └────────┘ └────────┘ │
│                                     │
│          AI PROTECTION ACTIVE 🟢    │
╰─────────────────────────────────────╯
14. Most important thing for your hackathon/demo

Don't make 20 pages.

Build a strong working flow:

Demo Flow

Step 1

Open website.

↓

Step 2

Click Check Link.

↓

Step 3

Enter:

https://sbi-update-kyc.com

↓

Step 4

Show animated AI analysis.

↓

Step 5

Display:

🔴 18/100
HIGH RISK

↓

Step 6

Show exactly why:

Fake domain
Urgent KYC language
Community reports
Sender mismatch

↓

Step 7

Show:

🛡️ Recommended Action

Do not open this link.

That single flow will communicate your entire idea very clearly.

Your PPT's core pitch is essentially: protect users from fake SMS, QR codes and phishing links using AI + community intelligence + explainable Trust Scores.

If you're going to build this with an AI website builder, I can next give you a complete copy-paste prompt for Lovable / Bolt / v0 / Replit that tells it exactly what pages, UI, buttons, animations and demo functionality to create.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://safe-scan-ai-s.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/df7bb917-a304-535c-8408-4204305a9b74).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
