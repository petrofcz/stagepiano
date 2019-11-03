import {EventEmitter, Injectable} from '@angular/core';
import {MidiAdapter} from '../../../automap/midi-adapter';
import {ButtonGroup} from '../common/button/buttonGroup';

@Injectable({
	providedIn: 'root'
})
export class NavigationRegionDriver {

	private _leftRow: ButtonGroup;

	constructor(midiAdapter: MidiAdapter) {
		this._leftRow = new ButtonGroup(midiAdapter, [0x50, 0x51, 0x52, 0x53]);
		this.leftRow.turnOffAllLeds();
		this.leftRow.disableAllButtons();
	}

	get leftRow(): ButtonGroup {
		return this._leftRow;
	}
}