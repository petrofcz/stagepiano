import {EventEmitter} from '@angular/core';
import {buffer, bufferTime, debounce, debounceTime, delay, filter, groupBy, mergeMap, throttleTime} from 'rxjs/operators';
import {ButtonClickEvent, ButtonPressEvent, ClickHandlerInterface} from '../../../model/buttons';

export class MultiClickHandler implements ClickHandlerInterface {

	protected throttleTime = 200; // in ms

	protected emitter: EventEmitter<ButtonClickEvent>;

	protected subscriber: EventEmitter<ButtonPressEvent> = new EventEmitter<ButtonPressEvent>();

	constructor(protected maxClicks: number|null) {
		const buttonPressSubscriber = this.subscriber
			.pipe(filter((evt: ButtonPressEvent) => { return evt.pressed; }))        // btn pressed, not released
			.pipe(
				groupBy((evt: ButtonPressEvent) => { return evt.buttonId;  }),
				mergeMap(
				(group$) => group$.pipe(buffer(group$.pipe(debounceTime(this.throttleTime))))
				)
			).subscribe((events: ButtonPressEvent[]) => {
				if (events.length > 0) {
					this.emitter.emit(
						new MultiClickButtonEvent(events[0].buttonId, this.maxClicks ? Math.min(events.length, this.maxClicks) : events.length)
					);
				}
			});
	}

	handle(pressEvent: ButtonPressEvent, emitter: EventEmitter<ButtonClickEvent>) {
		this.emitter = emitter;
		this.subscriber.emit(pressEvent);
	}
}

export class MultiClickButtonEvent extends ButtonClickEvent {

	constructor(buttonId: number, protected _clickCount: number) {
		super(buttonId);
	}

	get clickCount(): number {
		return this._clickCount;
	}
}
