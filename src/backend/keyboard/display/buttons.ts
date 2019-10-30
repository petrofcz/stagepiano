import {CCMessage, MidiAdapter} from '../../automap/midi-adapter';
import {EventEmitter} from '@angular/core';
import {ButtonEvent} from '../common';

export class Buttons {
	public static readonly FIRST_BUTTON_CC = 24;
	public static readonly numRows = 2;
	public static readonly numColumns = 8;

	protected _onButtonClick = new EventEmitter<ButtonEvent>();

	constructor(protected midiAdapter: MidiAdapter) {
		midiAdapter.onCC.subscribe((message: CCMessage) => {
			// tslint:disable-next-line:max-line-length
			if (message.cc >= Buttons.FIRST_BUTTON_CC && message.cc <= (Buttons.FIRST_BUTTON_CC + (Buttons.numColumns * Buttons.numRows) - 1) && message.value === 1) {
				this._onButtonClick.emit(new ButtonEvent(
					Math.floor((message.cc - Buttons.FIRST_BUTTON_CC) / Buttons.numColumns) + 1,
					((message.cc - Buttons.FIRST_BUTTON_CC) % Buttons.numColumns) + 1
				));
			}
		});
	}

	public setLed(row: number, column: number, on: boolean) {
		this.midiAdapter.sendCC(new CCMessage(16, Buttons.FIRST_BUTTON_CC + (Buttons.numColumns * (row-1)) + column - 1, on ? 1 : 0));
	}

	public turnOffAllLeds(row: number = null) {
		for (let i = 1; i <= Buttons.numRows; i++) {
			if (i === row || !row) {
				for (let x = 1; x <= Buttons.numColumns; x++) {
					this.setLed(i, x, false);
				}
			}
		}
	}
}
