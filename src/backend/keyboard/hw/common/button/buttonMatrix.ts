import {MidiAdapter} from '../../../../automap/midi-adapter';
import {EventEmitter} from '@angular/core';
import {ButtonGroup} from './buttonGroup';
import {ButtonClickEvent} from '../../../model/buttons';

export class ButtonMatrix {

	private _onButtonClick = new EventEmitter<ButtonMatrixEvent>();

	private _buttons: ButtonGroup;

	protected getNumRows() {
		return this.numRows;
	}

	protected getNumColumns() {
		return this.numColumns;
	}

	get buttons(): ButtonGroup {
		return this._buttons;
	}

	public getButtonId(column: number, row: number): number {
		return (this.numColumns * (row - 1)) + column;
	}

	constructor(private numColumns: number, private numRows: number, firstCC: number, midiAdapter: MidiAdapter) {

		const buttonCCs = [];
		for (let y = 0; y < this.numRows; y++) {
			for (let x = 0; x < this.numColumns; x++) {
				buttonCCs.push(firstCC + (this.numColumns * y) + x);
			}
		}
		this._buttons = new ButtonGroup(
			midiAdapter, buttonCCs
		);

		this._buttons.onButtonClick.subscribe((event: ButtonClickEvent) => {
			this.onButtonClick.emit(
				new ButtonMatrixEvent(
					Math.floor((event.buttonId - 1) / this.numColumns) + 1,
					((event.buttonId - 1) % this.numColumns) + 1,
					event
				)
			);
		});
	}

	public getIdsForRow(row: number): number[] {
		const ids = [];
		for (let x = 0; x < this.numColumns; x++) {
			ids.push(((row - 1) * this.numColumns) + x + 1);
		}
		return ids;
	}

	get onButtonClick(): EventEmitter<ButtonMatrixEvent> {
		return this._onButtonClick;
	}
}

export class ButtonMatrixEvent extends ButtonClickEvent {

	constructor(protected _row: number, protected _col: number, protected _originalEvent: ButtonClickEvent) {
		super(_originalEvent.buttonId);
	}

	// 1-st indexed
	get row() {
		return this._row;
	}

	// 1-st indexed
	get col() {
		return this._col;
	}

	get originalEvent(): ButtonClickEvent {
		return this._originalEvent;
	}
}
