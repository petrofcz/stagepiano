import {CCMessage} from '../../../../automap/midi-adapter';
import {EventEmitter} from '@angular/core';
import {ButtonClickEvent, ButtonPressEvent, ClickHandlerInterface} from '../../../model/buttons';

export class SimpleClickHandler implements ClickHandlerInterface {

	constructor() {
	}

	handle(pressEvent: ButtonPressEvent, emitter: EventEmitter<ButtonClickEvent>) {
		if (pressEvent.pressed) {  // button pressed, not released
			emitter.emit(new ButtonClickEvent(pressEvent.buttonId));
		}
	}
}