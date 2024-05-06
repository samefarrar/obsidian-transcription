import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { createClient, Deepgram, LiveTranscriptionEvents } from "@deepgram/sdk";

// Remember to rename these classes and interfaces!

interface DeepGramPluginSettings {
	apiKey: string;
	summarize: boolean;
	topic_detection: boolean;
	intent_detection: boolean;
	sentiment: boolean;
	smart_format: boolean;
	punctuation: boolean;
	paragraphs: boolean;
	utterances: boolean;
	filler_words: boolean;
}

const DEFAULT_SETTINGS: DeepGramPluginSettings = {
	apiKey: '',
	summarize: false,
	topic_detection: false,
	intent_detection: false,
	sentiment: false,
	smart_format: false,
	punctuation: false,
	paragraphs: false,
	utterances: false,
	filler_words: false
}

export default class DeepgramPlugin extends Plugin {
	settings: DeepgramPluginSettings;

	async onload() {
	  await this.loadSettings();

	  this.addCommand({
		id: 'start-transcription',
		name: 'Start Transcription',
		callback: () => {
		  this.startTranscription();
		},
	  });

	  this.addSettingTab(new DeepgramSettingTab(this.app, this));
	}

	async loadSettings() {
	  this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
	  await this.saveData(this.settings);
	}

	async startTranscription() {
	  const deepgramClient = createClient(this.settings.apiKey);
	  const deepgram = deepgramClient.listen.live({
		language: "en",
		punctuate: true,
		smart_format: true,
		model: "nova-2",
	  });

	  deepgram.addListener(LiveTranscriptionEvents.Open, async () => {
		console.log("deepgram: connected");
	  });

	  deepgram.addListener(LiveTranscriptionEvents.Transcript, (data) => {
		console.log("deepgram: transcript received");
		// Insert the transcribed text into the active editor
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (activeView) {
		  const editor = activeView.editor;
		  editor.replaceRange(data.channel.alternatives[0].transcript, editor.getCursor());
		}
	  });

	  deepgram.addListener(LiveTranscriptionEvents.Error, async (error) => {
		console.error("deepgram: error received", error);
	  });

	  // Start recording audio from the microphone
	  const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
	  const mediaRecorder = new MediaRecorder(mediaStream, { mimeType: "audio/webm" });
	  mediaRecorder.addEventListener("dataavailable", (event) => {
		if (event.data.size > 0) {
		  deepgram.send(event.data);
		}
	  });
	  mediaRecorder.start(1000);
	}
  }

  class DeepgramSettingTab extends PluginSettingTab {
	plugin: DeepgramPlugin;

	constructor(app: App, plugin: DeepgramPlugin) {
	  super(app, plugin);
	  this.plugin = plugin;
	}

	display(): void {
	  const { containerEl } = this;

	  containerEl.empty();

	  new Setting(containerEl)
		.setName('Deepgram API Key')
		.setDesc('Enter your Deepgram API key')
		.addText(text => text
		  .setPlaceholder('API Key')
		  .setValue(this.plugin.settings.apiKey)
		  .onChange(async (value) => {
			this.plugin.settings.apiKey = value;
			await this.plugin.saveSettings();
		  }));
	}
  }
