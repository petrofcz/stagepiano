import {CCMessage} from '../../../../automap/midi-adapter';
import {EventEmitter} from '@angular/core';
import {ButtonEvent, ClickHandlerInterface} from '../../../model/buttons';

export class SimpleClickHandler implements ClickHandlerInterface {

	constructor() {
	}

	handle(ccMessage: CCMessage, emitter: EventEmitter<ButtonEvent>) {
		if (ccMessage.value > 0) {  // button pressed, not released
			emitter.emit(new ButtonEvent(ccMessage.cc));
		}
	}
}