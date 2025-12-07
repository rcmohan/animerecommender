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
