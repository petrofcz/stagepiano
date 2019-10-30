import {CCMessage} from '../../automap/midi-adapter';
import {EventEmitter} from '@angular/core';

export interface ClickHandlerInterface {
	handle(ccMessage: CCMessage, emitter: EventEmitter<ButtonEvent>);
}

export class ButtonEvent {
	constructor(private _buttonId: number) { }

	get buttonId(): number {
		return this._buttonId;
	}
}