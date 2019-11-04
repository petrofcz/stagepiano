import {MidiAdapter} from '../../../automap/midi-adapter';
import {Knobs} from './knobs';
import {Display} from './display';
import {Injectable} from '@angular/core';
import {ButtonMatrix} from '../common/button/buttonMatrix';

@Injectable({
	providedIn: 'root'
})
export class DisplayRegionDriver {

	private _buttonMatrix: ButtonMatrix;
	private _knobs: Knobs;
	private _display: Display;

	constructor(midiAdapter: MidiAdapter) {
		this._buttonMatrix = new ButtonMatrix(8, 2, 24, midiAdapter);
		this._buttonMatrix.buttons.turnOffAllLeds();
		this._buttonMatrix.buttons.disableAllButtons();

		this._knobs = new Knobs(midiAdapter);

		this._display = new Display(midiAdapter);
		this._display.clearDisplay();
	}

	get buttonMatrix(): ButtonMatrix {
		return this._buttonMatrix;
	}

	get knobs(): Knobs {
		return this._knobs;
	}

	get display(): Display {
		return this._display;
	}
}