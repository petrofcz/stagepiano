import {CCMessage, MidiAdapter, SysexMessage} from '../automap/midi-adapter';
import {USBDriver} from '../automap/usb-driver';
import {SlMkII} from './common';
import {Injectable} from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class KeyboardService {

	constructor(protected midiAdapter: MidiAdapter) {
		midiAdapter.onInit.subscribe(() => {
			midiAdapter.sendSysex(new SysexMessage(SlMkII.buildSysex([0x01, 0x01])));
			midiAdapter.sendCC(new CCMessage(16, 0x4E, 0));
		});
	}
}