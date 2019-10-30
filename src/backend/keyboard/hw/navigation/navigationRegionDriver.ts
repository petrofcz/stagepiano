import {EventEmitter, Injectable} from '@angular/core';
import {MidiAdapter} from '../../../automap/midi-adapter';
import {Buttons} from '../display/buttons';
import {Knobs} from '../display/knobs';
import {Display} from '../display/display';
import {ButtonGroup} from '../common/button/buttonGroup';
import {ButtonEvent} from '../../model/buttons';

@Injectable({
	providedIn: 'root'
})
export class NavigationRegionDriver {

	private _leftRow: ButtonGroup;

	// 1-indexed
	private _onLeftRowClick: EventEmitter<[number, ButtonEvent]> = new EventEmitter();

	constructor(midiAdapter: MidiAdapter) {
		this._leftRow = new ButtonGroup(midiAdapter, [0x50, 0x51, 0x52, 0x53]);
		this._leftRow.onButtonClick.subscribe((event: ButtonEvent) => {
			console.log('LR CLICK');
			console.log(event);
			console.log(0x50);
			console.log(event.buttonId - 0x50 + 1);
			this._onLeftRowClick.emit([event.buttonId - 0x50 + 1, event]);
		});
	}

	// 1-indexed
	public setLeftRowLed(index: number, on: boolean) {
		console.log('TURN BTN ' + (index - 1 + 0x50) + ' : ' + on);
		this.leftRow.setLed(index - 1 + 0x50, on);
	}

	get leftRow(): ButtonGroup {
		return this._leftRow;
	}

	get onLeftRowClick(): EventEmitter<[number, ButtonEvent]> {
		return this._onLeftRowClick;
	}

}