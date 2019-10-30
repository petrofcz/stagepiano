import {MidiAdapter} from '../../../automap/midi-adapter';
import {Knobs} from './knobs';
import {Display} from './display';
import {Injectable} from '@angular/core';
import {Buttons} from './buttons';

@Injectable({
	providedIn: 'root'
})
export class DisplayRegionDriver {

	private _buttons: Buttons;
	private _knobs: Knobs;
	private _display: Display;

	constructor(midiAdapter: MidiAdapter) {
		this._buttons = new Buttons(midiAdapter);
		this._knobs = new Knobs(midiAdapter);
		this._display = new Display(midiAdapter);
	}


	get buttons(): Buttons {
		return this._buttons;
	}

	get knobs(): Knobs {
		return this._knobs;
	}

	get display(): Display {
		return this._display;
	}
}