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
