import {App, Modal, PluginSettingTab, Setting, TextComponent} from "obsidian";
import DictionaryPlugin from "./main";
import {LangTypeAndAuto, I18nKey, I18n} from "./util/i18n";
import {EngineConfig, SupportEngine, TranslateEngines} from "./translate/const/translate-engines";
import {createElement, Eye, EyeOff} from "lucide";
import {YoudaoConfigs} from "./translate/engines/youdao/youdao-configs";

export interface DictionarySettings {
	engine: keyof typeof TranslateEngines;
	lang: LangTypeAndAuto,
	config: EngineConfig
}

export const DEFAULT_SETTINGS: DictionarySettings = {
	engine: "youdao",
	lang: "auto",
	config: new YoudaoConfigs("","")
}

export class DictionarySettingTab extends PluginSettingTab {
	plugin: DictionaryPlugin;

	constructor(app: App, plugin: DictionaryPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {

		const {containerEl} = this;

		containerEl.empty();
		const i18n = (x: I18nKey, vars?: any) => {
			return this.plugin.i18n.t(x, vars);
		};

		// title
		containerEl.createEl("h1", {text: "Dictionary Settings"});

		// Div : enginesChooserDiv
		const enginesChooserDiv = containerEl.createDiv();
		enginesChooserDiv.createEl("h2", {text: i18n("engines_chooser_div_title")});

		// TODO enginesChooserDiv插入操作文档

		const engine = new Setting(enginesChooserDiv);
		engine.setName(i18n("translate_engine"))
			.addDropdown(cb => cb.addOptions(this.getEnginesOptions())
				.setValue(`${this.plugin.settings.engine}`)
				.onChange(async (value) => {
					this.plugin.settings.engine = value as SupportEngine;
					await this.plugin.saveSettings();
				})
			);

		// youdao
		const youdaoEngineDiv = containerEl.createDiv();
		youdaoEngineDiv.addClass("youdao-hide")
		new Setting(youdaoEngineDiv)
			.setName(i18n("youdao_app_key"))
			.setDesc(i18n("youdao_app_key"))
			.addText((text) => {
				wrapTextWithPasswordHide(text);
				text
					.setValue(`${this.plugin.settings.config['appKey']}`)
					.onChange(async (value) => {
						this.plugin.settings.config['appKey'] = value
						await this.plugin.saveSettings();
					});
			});

		new Setting(youdaoEngineDiv)
			.setName(i18n("youdao_app_secret"))
			.setDesc(i18n("youdao_app_secret"))
			.addText((text) => {
				wrapTextWithPasswordHide(text);
				text
					.setValue(`${this.plugin.settings.config['appSecret']}`)
					.onChange(async (value) => {
						this.plugin.settings.config['appSecret'] = value
						await this.plugin.saveSettings();
					});
			});

	}

	getEnginesOptions(): Record<string, string> {
		const options: Record<string, string> = {}
		Object.entries(TranslateEngines).forEach(([key, value]) => {
			options[key] = this.plugin.i18n.t(key as I18nKey)
		});
		return options
	}

}

const getEyesElements = () => {
	const eyeEl = createElement(Eye);
	const eyeOffEl = createElement(EyeOff);
	return {
		eye: eyeEl.outerHTML,
		eyeOff: eyeOffEl.outerHTML,
	};
};

const wrapTextWithPasswordHide = (text: TextComponent) => {
	const {eye, eyeOff} = getEyesElements();
	const hider = text.inputEl.insertAdjacentElement("afterend", createSpan())!;
	// the init type of hider is "hidden" === eyeOff === password
	hider.innerHTML = eyeOff;
	hider.addEventListener("click", (e) => {
		const isText = text.inputEl.getAttribute("type") === "text";
		hider.innerHTML = isText ? eyeOff : eye;
		text.inputEl.setAttribute("type", isText ? "password" : "text");
		text.inputEl.focus();
	});

	// the init type of text el is password
	text.inputEl.setAttribute("type", "password");
	return text;
};
