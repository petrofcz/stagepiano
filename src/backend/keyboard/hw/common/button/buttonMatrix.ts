import {MidiAdapter} from '../../../../automap/midi-adapter';
import {EventEmitter} from '@angular/core';
import {ButtonGroup} from './buttonGroup';
import {ButtonEvent} from '../../../model/buttons';

export abstract class ButtonMatrix {

	private firstButtonCC;
	private numColumns;
	private numRows;
	private _onButtonClick = new EventEmitter<ButtonMatrixEvent>();

	private buttons: ButtonGroup;

	protected abstract getFirstButtonCC();
	protected abstract getNumRows();
	protected abstract getNumColumns();

	constructor(protected midiAdapter: MidiAdapter) {
		this.firstButtonCC = this.getFirstButtonCC();
		this.numColumns = this.getNumColumns();
		this.numRows = this.getNumRows();

		const buttonIds = [];
		for (let y = 0; y < this.numRows; y++) {
			for (let x = 0; x < this.numColumns; x++) {
				buttonIds.push(this.firstButtonCC + (this.numColumns * y) + x);
			}
		}
		this.buttons = new ButtonGroup(
			midiAdapter, buttonIds
		);



		this.buttons.onButtonClick.subscribe((event: ButtonEvent) => {
			this.onButtonClick.emit(
				new ButtonMatrixEvent(
					Math.floor((event.buttonId - this.firstButtonCC) / this.numColumns) + 1,
					((event.buttonId - this.firstButtonCC) % this.numColumns) + 1,
					event.buttonId
				)
			);
		});
	}

	public setLed(row: number, column: number, on: boolean) {
		this.buttons.setLed(
			this.firstButtonCC + (this.numColumns * (row - 1)) + column - 1, on
		);
	}

	public turnOffAllLedsForRow(row: number = null, force: boolean = false) {
		if (!row) {
			this.buttons.turnOffAllLeds(force);
		} else {
			for (let i = 1; i <= this.numRows; i++) {
				if (i === row) {
					for (let x = 1; x <= this.numColumns; x++) {
						this.setLed(i, x, false);
					}
				}
			}
		}
	}

	get onButtonClick(): EventEmitter<ButtonEvent> {
		return this._onButtonClick;
	}
}

export class ButtonMatrixEvent extends ButtonEvent {

	constructor(protected _row: number, protected _col: number, buttonId: number) {
		super(buttonId);
	}

	// 1-st indexed
	get row() {
		return this._row;
	}

	// 1-st indexed
	get col() {
		return this._col;
	}

}
