<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Built with Google AI Studio

The following prompt was provided to Google AI studio + Gemini 3 to build this website.

## First Prompt - corresponds to the current state of the Github Commit

```
I want to build a website that helps users manage the anime they watch. 
### Overall Requirements

1. Users can enter all the anime they watch, enter the episode they are on, and the website will
    a. Prevent them from putting anime on hold
    b. Tell them how many episodes before an arc is complete
2. Users can enter which anime they are about to watch, it will tell them the probability of finishing it
3. Users can also rate the anime
4. Users can list likes and dislikes
5. Users can get recommendation of anime they might like

### UI Instructions

Create a modern website. Use purple, pink, red shades but ensure it is aesthetically pleasing. The page should have samples that show what each feature does. 
Also add a registration page.  Create something modern-looking, aesthetic, new and fresh.

```

## Second Prompt - corresponds to the current state of the Github Commit

```
Starting from the website code you generated in the previous response (the anime management site with features for tracking episodes, arc completion, finish probability, ratings, likes/dislikes, recommendations, and a modern UI in purple/pink/red shades with feature samples), make the following additions and improvements to implement user registration and data persistence:

### Core Additions
1. **Registration Functionality**:
   - Add a prominent "Register" link or button in the header/navigation bar (e.g., next to a "Login" option if it exists, or as a standalone call-to-action on the landing page).
   - When clicked, redirect to a dedicated registration page (build on or refine the one mentioned in the initial requirements if already present).
   - On the registration page:
     - Include form fields for email (required, validated as a proper email format) and password (required, with confirmation field, minimum 8 characters, and strength hints like including numbers/symbols).
     - Use Firebase Authentication for email/password sign-up. Integrate Firebase SDK in the code (assume a web app setup; include initialization code if not already present).
     - Upon successful registration, automatically create a user-specific collection in Firestore database named 'anipink'. The collection name should be based on the user's UID (e.g., 'users/{userUID}'), containing documents like:
       - 'preferences': For likes, dislikes, and ratings (e.g., JSON structure with arrays/objects).
       - 'watch-history': For current anime, episodes watched, on-hold status (enforce no holds via validation), arc progress.
       - 'upcoming': For anime to watch next, with finish probability calculations.
       - 'recommendations': Generated suggestions stored for quick access.
     - After registration, redirect to the main dashboard, log the user in automatically, and display a welcome message like "Welcome, [email]! Your anime journey starts here."

2. **Data Persistence**:
   - All user interactions (e.g., adding anime, updating episodes, ratings) should now save to the user's Firestore collection in real-time (use onAuthStateChanged to detect logged-in state and sync data).
   - For anonymous/guest users (pre-registration), use local storage temporarily, with a prompt to register to save progress.
   - Ensure reads/writes are secure: Use Firebase security rules to restrict access (e.g., only authenticated users can read/write their own collection).

3. **Legalese and Consent**:
   - On the registration form, add a required checkbox for consent: "I consent to Anipink storing and using my data (email, preferences, watch history) for personalized features. Data is stored securely in Firestore and not shared with third parties without consent. View our Privacy Policy [link to a placeholder page]."
   - Include a subtle footer link to a "Privacy Policy" page (generate a simple one with boilerplate text about data usage, GDPR compliance, and deletion options).
   - Prevent form submission without checkbox checked, with a validation message.

### UI/UX Improvements
- Keep the modern, aesthetic theme (purple/pink/red shades). Style the registration page with gradients (e.g., pink-to-purple background), clean forms (rounded inputs, subtle animations on focus), and an anime-themed illustration (e.g., a stylized character waving hello).
- Add error handling: Display user-friendly messages for issues like "Email already in use," "Weak password," or "Network error."
- Make it responsive for mobile/desktop.
- On the main pages, show personalized content only if logged in (e.g., "Your Watch List" vs. sample data for guests).

Provide the full updated code (HTML, CSS, JS, with Firebase config placeholders like API keys). Explain any new dependencies or setup steps briefly. Test for functionality: Ensure registration works, data saves to Firestore, and the site doesn't break existing features.

```

## Third Prompt - corresponds to the current state of the Github Commit

```



Starting from the latest version of the Anipink website code you just generated (including registration, Firebase Authentication, Firestore persistence, consent handling, and all existing features), redesign the **layout and visual design** to feel more like a polished, production-ready site rather than an AI-generated prototype.

Do **not** remove or break any existing functionality, Firebase integration, or data models. Focus on **UI, layout, and interactivity** only.

### Overall Design Goals

* Keep the same overall color scheme (purple / pink / red), but refine it into a cohesive palette with **2–3 primary colors** and **1–2 accent colors**.
* Make the site feel **teenager-friendly** and inspired by **modern Japanese / anime aesthetics** (kawaii but clean, not cluttered):

  * Rounded corners, soft shadows, subtle glassmorphism or neon accents.
  * Anime-style or Japanese-inspired decorative elements (e.g., small icons, subtle patterns, not full-page busy art).
  * Use one clean, readable font for body text and one slightly more expressive display font for headings.

### Layout Redesign

1. **Landing / Dashboard Layout**

   * Add a **hero section** at the top with:

     * App name, tagline, and a short description (e.g., “Track your anime life. Never drop a show again.”).
     * A prominent **primary call-to-action** (“Get Started” / “Go to Dashboard”).
   * Below the hero, organize main features into **distinct sections** with clear visual separation, for example:

     * “Your Watch List” (cards or list with progress bars).
     * “Currently Watching” (highlighted as a main focus area).
     * “Upcoming & Finish Probability”.
     * “Recommendations For You”.
   * Use **card-based layouts** with cover images, progress bars, and small tags (e.g., “Shonen”, “Romance”, “Isekai”) to make it feel like a modern anime dashboard.

2. **Navigation & Header**

   * Improve the header with a **sticky top nav bar** containing:

     * Logo / app name.
     * Links: Dashboard, Explore, Recommendations, Profile.
     * Auth state: show “Register / Login” when logged out, and avatar / email / “Logout” when logged in.
   * Add hover states and small animations to nav items.

3. **Registration / Auth Pages**

   * Redesign the registration and login pages to look like a **dedicated auth screen**:

     * Centered card on a gradient background (pink → purple) with a soft glow.
     * Anime-themed illustration (e.g., a stylized character waving or holding a remote).
     * Keep all existing fields, validation, consent checkbox, and error handling — just restyle them:

       * Rounded inputs, clear labels, helper text.
       * Friendly error messages appearing under fields.
   * Make sure the layout is responsive on mobile and desktop.

### Interactivity & Micro-Animations

* Add tasteful **hover effects and transitions**:

  * Cards scale slightly on hover.
  * Buttons have smooth color transitions and maybe a subtle glow.
* Add visual feedback for actions:

  * When an anime is added or updated, briefly highlight that card or show a small toast-style confirmation.
* For progress toward episode or arc completion, use **animated progress bars** or animated circular progress indicators.

### UX Improvements

* Differentiate between **guest users** and **logged-in users** visually:

  * Guests see sample/demo data with a banner suggesting “Register to save your anime journey.”
  * Logged-in users see their real data with a small “Welcome, [email]” in the header or hero area.
* Maintain all Firestore reads/writes and onAuthStateChanged behavior exactly as before; just adjust how the data is presented visually.

### Technical Constraints

* Do not remove or rename existing Firebase configuration variables, auth handlers, or Firestore code.
* You may refactor HTML structure and CSS classes for better layout, but keep the same logical sections and IDs where possible so the JS continues to work.
* Use only standard web technologies (HTML, CSS, JS) plus any libraries you already introduced; do not add a complex new framework.

After updating the code, explain briefly:

* What layout and styling changes you made (high level).
* How the new design better matches a teenage, anime/Japanese-inspired aesthetic.
* How you ensured that registration, login, and Firestore persistence still work as before.

```

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1N6n7DW2PDrarvnruhIkpnWTHzKLgmWOh

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`