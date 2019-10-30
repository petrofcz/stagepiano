import {CCMessage, MidiAdapter} from '../../../../automap/midi-adapter';
import {EventEmitter} from '@angular/core';
import {SimpleClickHandler} from './simpleClickHandler';
import {ButtonEvent, ClickHandlerInterface} from '../../../model/buttons';

export class ButtonGroup {

	private activeButtonIds: number[] = [];

	protected _onButtonClick = new EventEmitter<ButtonEvent>();

	protected _globalClickHandler: ClickHandlerInterface;

	protected _clickHandlerByButton: { [key: number]: ClickHandlerInterface } = { };

	constructor(protected midiAdapter: MidiAdapter, private buttonIds: number[]) {
		this._globalClickHandler = new SimpleClickHandler();
		midiAdapter.onCC.subscribe((message: CCMessage) => {
			// highlighting on press
			if (this.buttonIds.indexOf(message.cc) !== -1) {
				if (message.value === 0) {
					// highlight off
					if (this.activeButtonIds.indexOf(message.cc) === -1) {
						this.midiAdapter.sendCC(new CCMessage(16, message.cc, 0));
					}
				} else {
					// highlight on
					this.midiAdapter.sendCC(new CCMessage(16, message.cc, 1));
				}

				// pass to click handler
				if (message.cc in this._clickHandlerByButton && this._clickHandlerByButton[message.cc] !== null) {
					this._clickHandlerByButton[message.cc].handle(message, this._onButtonClick);
				} else {
					this._globalClickHandler.handle(message, this._onButtonClick);
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
		this.midiAdapter.sendCC(new CCMessage(16, buttonId, on ? 1 : 0));
	}

	public turnOffAllLeds(force: boolean = false) {
		const toTurnOff = force ? this.buttonIds : this.activeButtonIds;
		for (const buttonId of toTurnOff) {
			this.setLed(buttonId, false);
		}
	}

	public setGlobalClickHandler(clickHandler?: ClickHandlerInterface) {
		this._globalClickHandler = clickHandler ? clickHandler : new SimpleClickHandler();
	}

	public setButtonClickHandler(buttonId: number, clickHandler?: ClickHandlerInterface) {
		this._clickHandlerByButton[buttonId] = clickHandler;
	}

	public addButtonId(id: number) {
		this.buttonIds.push(id);
	}

	public getButtonIds(): number[] {
		return this.buttonIds;
	}

	get onButtonClick(): EventEmitter<ButtonEvent> {
		return this._onButtonClick;
	}

}
