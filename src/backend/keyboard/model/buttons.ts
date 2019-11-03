import {EventEmitter} from '@angular/core';

export interface ClickHandlerInterface {
	handle(pressEvent: ButtonPressEvent, emitter: EventEmitter<ButtonClickEvent>);
}

// low level button press event
export class ButtonPressEvent {
	constructor(protected _buttonId: number, protected _pressed: boolean) { }

	get buttonId(): number {
		return this._buttonId;
	}

	get pressed(): boolean {
		return this._pressed;
	}
}

// higher level abstraction button press event
export class ButtonClickEvent {
	constructor(private _buttonId: number) { }

	get buttonId(): number {
		return this._buttonId;
	}

}