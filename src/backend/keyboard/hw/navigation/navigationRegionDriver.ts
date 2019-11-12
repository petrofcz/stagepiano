import {EventEmitter, Injectable} from '@angular/core';
import {MidiAdapter} from '../../../automap/midi-adapter';
import {ButtonGroup} from '../common/button/buttonGroup';

@Injectable({
	providedIn: 'root'
})
export class NavigationRegionDriver {

	private _leftRow: ButtonGroup;

	private _pageNavigation: ButtonGroup;

	constructor(midiAdapter: MidiAdapter) {
		this._leftRow = new ButtonGroup(midiAdapter, [0x50, 0x51, 0x52, 0x53]);
		this._leftRow.turnOffAllLeds();
		this._leftRow.disableAllButtons();

		this._pageNavigation = new ButtonGroup(midiAdapter, [0x58, 0x59]);
		this._pageNavigation.turnOffAllLeds();
		this._pageNavigation.disableAllButtons();
	}

	get leftRow(): ButtonGroup {
		return this._leftRow;
	}

	get pageNavigation(): ButtonGroup {
		return this._pageNavigation;
	}
}