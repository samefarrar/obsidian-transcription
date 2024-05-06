import {
  App,
  Editor,
  MarkdownView,
  Modal,
  Notice,
  Plugin,
  PluginSettingTab,
  Setting,
  EditorPosition,
} from "obsidian";
import { createClient, Deepgram, LiveTranscriptionEvents } from "@deepgram/sdk";

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
  apiKey: "",
  summarize: false,
  topic_detection: false,
  intent_detection: false,
  sentiment: false,
  smart_format: false,
  punctuation: false,
  paragraphs: false,
  utterances: false,
  filler_words: false,
};

export default class DeepgramPlugin extends Plugin {
  settings: DeepGramPluginSettings;
  isRecording: boolean = false;
  statusBarItem: HTMLElement;
  initialCursorPosition: EditorPosition;
  transcriptLength: number = 0;
  deepgram: Deepgram; // Add this line to declare the deepgram property
  mediaRecorder: MediaRecorder; // Add this line to declare the mediaRecorder property

  async onload() {
    console.log("Loading Deepgram plugin");

    await this.loadSettings();

    this.addCommand({
      id: "toggle-transcription",
      name: "Toggle Transcription",
      callback: () => {
        if (this.isRecording) {
          this.stopTranscription();
        } else {
          this.startTranscription();
        }
      },
    });

    this.statusBarItem = this.addStatusBarItem();
    this.updateStatusBarItem();

    this.addSettingTab(new DeepgramSettingTab(this.app, this));

    console.log("Deepgram plugin loaded");
  }

  async onunload() {
    console.log("Unloading Deepgram plugin");

    if (this.isRecording) {
      await this.stopTranscription();
    }
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  updateStatusBarItem() {
    this.statusBarItem.setText(
      this.isRecording ? "Recording" : "Not Recording"
    );
  }

  async startTranscription() {
    console.log("Starting transcription");

    const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (activeView) {
      const editor = activeView.editor;
      this.initialCursorPosition = editor.getCursor();
    }

    const options = {
      model: "nova-2",
      language: "en-US",
      smart_format: this.settings.smart_format,
      summarize: this.settings.summarize,
      topic_detection: this.settings.topic_detection,
      intent_detection: this.settings.intent_detection,
      sentiment: this.settings.sentiment,
      punctuation: this.settings.punctuation,
      paragraphs: this.settings.paragraphs,
      utterances: this.settings.utterances,
      filler_words: this.settings.filler_words,
      interim_results: true,
    };

    const deepgramClient = createClient(this.settings.apiKey);
    const deepgram = deepgramClient.listen.live(options);

    this.deepgram = deepgram;

    console.log("Deepgram client created", deepgram);

    deepgram.addListener(LiveTranscriptionEvents.Open, () => {
      console.log("Deepgram connection opened");
      this.isRecording = true;
      this.updateStatusBarItem();
    });

    deepgram.addListener(LiveTranscriptionEvents.Transcript, (data) => {
      const transcript = data.channel.alternatives[0].transcript;
      const isFinal = data.is_final;

      const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
      if (activeView) {
        const editor = activeView.editor;

        const endPosition = {
          line: this.initialCursorPosition.line,
          ch: this.initialCursorPosition.ch + this.transcriptLength,
        };

        console.log(
          "Adding transcript: ",
          transcript,
          " at ",
          this.initialCursorPosition,
          " to ",
          endPosition
        );

        editor.replaceRange(
          transcript,
          this.initialCursorPosition,
          endPosition
        );
        this.transcriptLength = transcript.length;

        if (isFinal) {
          const finalCursorPosition = {
            line: this.initialCursorPosition.line,
            ch: this.initialCursorPosition.ch + this.transcriptLength,
          };
          editor.setCursor(finalCursorPosition);
        }
      }
    });

    deepgram.addListener(LiveTranscriptionEvents.Error, (error) => {
      console.error("Deepgram error:", error);
      this.stopTranscription();
    });

    const mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    const mediaRecorder = new MediaRecorder(mediaStream, {
      mimeType: "audio/webm",
    });

    this.mediaRecorder = mediaRecorder;

    mediaRecorder.addEventListener("dataavailable", (event) => {
      if (event.data.size > 0) {
        deepgram.send(event.data);
      }
    });

    mediaRecorder.start(1000);
  }

  async stopTranscription() {
    console.log("Stopping transcription");
    this.isRecording = false;
    this.updateStatusBarItem();

    this.deepgram.finish();

    // Stop the MediaRecorder
    if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
      this.mediaRecorder.stop();
    }
  }
}

class DeepgramSettingTab extends PluginSettingTab {
  plugin: DeepgramPlugin;

  constructor(app: App, plugin: DeepgramPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    let { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName("Deepgram API Key")
      .setDesc("Enter your Deepgram API key")
      .addText((text) =>
        text
          .setPlaceholder("API Key")
          .setValue(this.plugin.settings.apiKey)
          .onChange(async (value) => {
            console.log("Deepgram API key updated");
            this.plugin.settings.apiKey = value;
            await this.plugin.saveSettings();
          })
      );

    // Add settings for other transcription options
    // ...
  }
}
