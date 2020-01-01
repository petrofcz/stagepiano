import {MidiAdapter, SysexMessage} from '../../../automap/midi-adapter';
import {SlMkII} from '../../common';
import {Injectable} from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class Display {

	static readonly ALIGN_LEFT = 0;
	static readonly ALIGN_CENTER = 1;
	static readonly ALIGN_RIGHT = 2;

	static readonly cols = 8;
	static readonly maxColSize = 8;
	static readonly realColSize = 9;
	static readonly rows = 2;

	protected static readonly SPACES =
		[
			'',
			' ',
			'  ',
			'   ',
			'    ',
			'     ',
			'      ',
			'       ',
			'        ',
			'         '
		];

	protected content: string;

	private readonly emptyRow: string;

	constructor(protected midiAdapter: MidiAdapter) {
		this.content = ' '.repeat(Display.rows * Display.cols * Display.realColSize);
		this.emptyRow = ' '.repeat(Display.cols * Display.realColSize);
	}

	public flushContent() {
		this.midiAdapter.sendSysex(new SysexMessage(
			// tslint:disable-next-line:max-line-length
			SlMkII.buildSysex([0x02, 0x01, 0, 0x01, 0x04].concat(
				this.strToAscii(this.content.substr(0, Display.realColSize * Display.cols))
			))
		));
		this.midiAdapter.sendSysex(new SysexMessage(
			// tslint:disable-next-line:max-line-length
			SlMkII.buildSysex([0x02, 0x01, 0, 0x03, 0x04].concat(
				this.strToAscii(this.content.substr(Display.realColSize * Display.cols))
			))
		));
	}

	/**
	 * @param row 1-indexed row number
	 * @param column 1-indexed column number
	 * @param value string|null value
	 * @param bufferOnly If true, data will not be flushed to the display directly, flushContent method must be called after all updates
	 * @param align Align of the content within cell
	 */
	public setCellContent(row: number, column: number, value?: string, bufferOnly: boolean = false, align = Display.ALIGN_CENTER) {
		const startPos = ((row - 1) * (Display.cols * Display.realColSize)) + ((column - 1) * Display.realColSize);
		const finalValue = this.pad(value, align);
		const endPos = startPos + finalValue.length;
		if (!bufferOnly) {
			if (this.content.substr(startPos, finalValue.length) !== finalValue) {
				this.midiAdapter.sendSysex(new SysexMessage(
					// 0x02 - text commands
					// 0x01 - set cursor position
					// 0x04 - set text
					// tslint:disable-next-line:max-line-length
					SlMkII.buildSysex([0x02, 0x01, (column - 1) * Display.realColSize, row === 1 ? 0x01 : 0x03, 0x04].concat(this.strToAscii(finalValue)))
				));
			}
		}
		this.content = this.content.slice(0, startPos) + finalValue + this.content.slice(endPos);
	}

	public writeMessage(message: string, bufferOnly: boolean = false) {
		this.clearDisplay(bufferOnly);
		console.log('[DISP] WRITE MESSAGE ' + message);
		const position = Math.floor(Math.max(1, (Display.realColSize * Display.cols) - message.length) / 2) - 1;
		if (!bufferOnly) {
			this.midiAdapter.sendSysex(new SysexMessage(
				SlMkII.buildSysex(
					[0x02, 0x01, position, 0x01, 0x04]
						.concat(this.strToAscii(message))
				)
			));
		}
		this.content = ' '.repeat(position) + message + ' '.repeat(Display.realColSize * Display.cols - message.length - position) + this.emptyRow;
	}

	public clearDisplay(bufferOnly: boolean = false) {
		console.log('[DISP] CLEAR DISPLAY');
		const newContent = this.emptyRow.repeat(Display.rows);
		if (!bufferOnly) {
			if (newContent !== this.content) {
				// todo check, didnt work
				this.midiAdapter.sendSysex(new SysexMessage(
					SlMkII.buildSysex([0x02, 0x02, 0x04])
				));
				// this.clearRow(1);
				// this.clearRow(2);
			}
		}
		this.content = newContent;
	}

	public clearRow(row: number, bufferOnly: boolean = false) {
		console.log('[DISP] CLEAR ROW ' + row);
		if (!bufferOnly) {
			if (this.content.substr((row - 1) * Display.cols * Display.realColSize, Display.realColSize * Display.cols) !== this.emptyRow) {
				this.midiAdapter.sendSysex(new SysexMessage(
					// tslint:disable-next-line:max-line-length
					SlMkII.buildSysex([0x02, 0x01, 0, row === 1 ? 0x01 : 0x03, 0x04].concat(this.strToAscii(
						' '.repeat(Display.cols * Display.realColSize)
					)))
				));
			}
		}
		this.content = this.content.slice(0, (row - 1) * Display.cols * Display.realColSize)
			+ this.emptyRow + this.content.slice((row) * Display.cols * Display.realColSize);
	}

	protected pad (str, align) {
		if (typeof (str) === 'undefined' || str === null) {
			str = '';
		}

		if (str.length > 8) {
			str = str.substr(0, 7) + '~';
		}

		const spaceSize = Display.maxColSize - str.length;

		switch (align) {
			case Display.ALIGN_LEFT:
				return str + Display.SPACES[spaceSize];
			case Display.ALIGN_RIGHT:
				return Display.SPACES[spaceSize] + str;
			case Display.ALIGN_CENTER:
				return Display.SPACES[Math.floor(spaceSize / 2)] + str + Display.SPACES[Math.ceil(spaceSize / 2)];
		}

		return str;
	}

	protected strToAscii(finalValue: string): number[] {
		const numbers = [];
		for (let i = 0; i < finalValue.length; i++) {
			numbers.push(finalValue.charCodeAt(i));
		}
		numbers.push(0);
		return numbers;
	}

}