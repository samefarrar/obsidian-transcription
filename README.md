
# Deepgram Transcription Plugin for Obsidian

This plugin for Obsidian leverages the Deepgram API to provide real-time transcription capabilities directly within the Obsidian note-taking application.

## Features

* Real-Time Transcription: Toggle transcription on and off to transcribe audio directly into your Obsidian notes.
* Advanced Transcription Options: Configurable settings for summarization, topic and intent detection, sentiment analysis, and more.
* Status Bar Integration: Easily view transcription status through Obsidian's status bar.
* Customizable Settings: Through the plugin settings tab, adjust transcription features to suit your needs.

## Development Setup

For developers interested in enhancing or customizing the plugin:

* Prerequisites: Ensure you have NodeJS (at least v16). Check with node --version.
* Installation: Run npm install to install dependencies.
* Development: Use npm run dev to compile TypeScript code in watch mode.
* Testing: Place your plugin folder under .obsidian/plugins/your-plugin-id in your Obsidian vault to test it directly.

### How to Use

1. Clone and Setup: Clone this repo and run npm install to install all dependencies.
2. API Key: Get an API key from Deepgram and enter it in the plugin's settings under "Deepgram API Key".
3. Start Transcribing: Use the command "Toggle Transcription" to start or stop the transcription. Speak into your microphone, and the text will appear in your active note.
4. Adjust Settings: Configure transcription settings like summarization, sentiment analysis, etc., from the plugin settings tab.

### Plugin Settings

* API Key: Essential for connecting to Deepgram services.
* Transcription Features: Toggle features like summarization, sentiment analysis, and more to refine the transcription output.

### Installation

* Manual Installation: Copy main.js, styles.css, and manifest.json to your vault's plugin folder under .obsidian/plugins/your-plugin-id/.
* Enable Plugin: In Obsidian, enable the plugin through the settings window under "Community Plugins".

### Releasing Updates

* Versioning: Update manifest.json and versions.json with new version details.
* GitHub Release: Create a release in GitHub and attach the necessary updated files.

### Adding to Community Plugin List

Publish your plugin following the guidelines at https://github.com/obsidianmd/obsidian-releases/blob/master/plugin-review.md.
Create a pull request to the Obsidian community plugin repository to include your plugin in the community list.

### Quality Assurance

* ESLint: Use ESLint to ensure code quality. Install with npm install -g eslint and run eslint main.ts to analyze the code.
* Continuous Integration: Implement CI tools to automate testing and ensure that each build passes before release.

API Documentation
For detailed information about API integration, visit Deepgram API documentation.

This README provides essential information for both users and developers to get started with the Deepgram Transcription Plugin for Obsidian, facilitating easy setup, use, and customization.
