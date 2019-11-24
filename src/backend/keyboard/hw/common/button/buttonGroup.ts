import {CCMessage, MidiAdapter} from '../../../../automap/midi-adapter';
import {EventEmitter} from '@angular/core';
import {SimpleClickHandler} from './simpleClickHandler';
import {ButtonClickEvent, ButtonPressEvent, ClickHandlerInterface} from '../../../model/buttons';

export class ButtonGroup {

	private activeButtonIds: number[] = [];

	protected _onButtonClick = new EventEmitter<ButtonClickEvent>();

	protected _globalClickHandler: ClickHandlerInterface;

	protected _clickHandlerByButton: { [key: number]: ClickHandlerInterface } = { };

	protected enabledButtonIds: number[];

	// all buttons are explicitly disabled!
	constructor(protected midiAdapter: MidiAdapter, private buttonCCs: number[]) {
		this._globalClickHandler = new SimpleClickHandler();
		this.disableAllButtons();
		midiAdapter.onCC.subscribe((message: CCMessage) => {
			// highlighting on press
			if (this.buttonCCs.indexOf(message.cc) !== -1) {
				const buttonId = this.buttonCCs.indexOf(message.cc) + 1;

				if (message.value === 0) {
					// highlight off
					if (this.activeButtonIds.indexOf(buttonId) === -1) {
						this.midiAdapter.sendCC(new CCMessage(16, message.cc, 0));
					}
				} else {
					// highlight on
					if (this.enabledButtonIds.indexOf(buttonId) > -1) {
						this.midiAdapter.sendCC(new CCMessage(16, message.cc, 1));
					}
				}

				// pass to click handler
				if (this.enabledButtonIds.indexOf(buttonId) > -1) {
					const buttonPressEvent = new ButtonPressEvent(buttonId, message.value > 0);
					if (buttonId in this._clickHandlerByButton && this._clickHandlerByButton[buttonId] !== null) {
						this._clickHandlerByButton[buttonId].handle(
							buttonPressEvent, this._onButtonClick
						);
					} else {
						this._globalClickHandler.handle(buttonPressEvent, this._onButtonClick);
					}
				}
			}
		});
	}

	public setLed(buttonId: number, on: boolean) {
		const activePosition = this.activeButtonIds.indexOf(buttonId);
		if (on) {
			if (activePosition === -1) {
				this.activeButtonIds.push(buttonId);
			}
		} else {
			if (activePosition > -1) {
				this.activeButtonIds.filter((iId: number) => {
					return iId !== buttonId;
				});
			}
		}
		this.midiAdapter.sendCC(new CCMessage(16, this.buttonCCs[buttonId - 1], on ? 1 : 0));
	}

	public turnOffAllLeds(force: boolean = false) {
		const toTurnOff = force ? this.buttonCCs : this.getAllButtonIds();
		for (const cc of toTurnOff) {
			this.setLed(cc, false);
		}
	}

	public setButtonEnabled(buttonId: number, enabled: boolean) {
		if (enabled) {
			if (this.enabledButtonIds.indexOf(buttonId) === -1) {
				this.enabledButtonIds.push(buttonId);
			}
		} else {
			this.enabledButtonIds = this.enabledButtonIds.filter((iButtonId: number) => {
				return iButtonId !== buttonId;
			});
		}
		// console.log('SET BUTTON ENABLED ' + buttonId + ' ' + enabled);
		// console.log(this.enabledButtonIds);
	}

	public enableAllButtons() {
		this.enabledButtonIds = this.getAllButtonIds();
	}

	public disableAllButtons() {
		this.enabledButtonIds = [];
		console.log('disabled buttons');
	}

	public setGlobalClickHandler(clickHandler?: ClickHandlerInterface) {
		this._globalClickHandler = clickHandler ? clickHandler : new SimpleClickHandler();
	}

	public setButtonClickHandler(buttonId: number, clickHandler?: ClickHandlerInterface) {
		this._clickHandlerByButton[buttonId] = clickHandler;
	}

	public getButtonIds(): number[] {
		return this.buttonCCs;
	}

	get onButtonClick(): EventEmitter<ButtonClickEvent> {
		return this._onButtonClick;
	}

	public getAllButtonIds(): number[] {
		const out = [];
		for (let i = 1; i <= this.buttonCCs.length; i++) {
			out.push(i);
		}
		return out;
	}
}
