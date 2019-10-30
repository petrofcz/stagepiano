import {CCMessage} from '../../../../automap/midi-adapter';
import {EventEmitter} from '@angular/core';
import {buffer, bufferTime, debounce, debounceTime, delay, filter, groupBy, mergeMap, throttleTime} from 'rxjs/operators';
import {ButtonEvent, ClickHandlerInterface} from '../../../model/buttons';

export class MultiClickHandler implements ClickHandlerInterface {

	protected throttleTime = 360; // in ms

	protected emitter: EventEmitter<ButtonEvent>;

	protected subscriber: EventEmitter<CCMessage> = new EventEmitter<CCMessage>();

	constructor(protected maxClicks: number) {
		const buttonPressSubscriber = this.subscriber
			.pipe(filter((ccMessage: CCMessage) => { return ccMessage.value > 0; }))        // btn pressed, not released
			.pipe(
				groupBy((ccMessage: CCMessage) => { return ccMessage.cc; }),
				mergeMap(
				// (group$) => group$.pipe(buffer(group$.pipe(throttleTime(this.throttleTime))))
					// todo reenable
				(group$) => group$.pipe(buffer(group$.pipe(debounceTime(this.throttleTime))))
				)
			).subscribe((messages: CCMessage[]) => {
				console.log('BPSC');
				console.log(messages);
				if (messages.length > 0) {
					this.emitter.emit(new MultiClickButtonEvent(messages[0].cc, Math.min(messages.length, this.maxClicks)));
				}
			});
	}

	handle(ccMessage: CCMessage, emitter: EventEmitter<ButtonEvent>) {
		this.emitter = emitter;
		this.subscriber.emit(ccMessage);
	}
}

export class MultiClickButtonEvent extends ButtonEvent {

	constructor(buttonId: number, protected _clickCount: number) {
		super(buttonId);
	}

	get clickCount(): number {
		return this._clickCount;
	}
}