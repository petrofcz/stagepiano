import {EventEmitter, Injectable} from '@angular/core';
import {KnobEvent} from '../display/knobs';
import {CCMessage, MidiAdapter} from '../../../automap/midi-adapter';

@Injectable({
	providedIn: 'root'
})
export class StaticKnobsDriver {

	private _onKnobTouched = new EventEmitter<KnobEvent>();

	private _onKnobReleased = new EventEmitter<KnobEvent>();

	private _onKnobRotated = new EventEmitter<StaticKnobMoveEvent>();

	constructor(protected readonly midiAdapter: MidiAdapter) {
		this.init();
	}

	protected init() {
		this.midiAdapter.onCC.subscribe((message: CCMessage) => {
			const data = message.data;
			if (message.channel !== 16) {
				return;
			}
			if (message.cc >= 0x08 && message.cc <= 0x0f) {
				this._onKnobRotated.emit(
					new StaticKnobMoveEvent(message.cc - 0x08 + 1, message.value)
				);
			}
			if (message.cc === 0x6d) {
				if (message.value >= 64) {
					this._onKnobTouched.emit(new KnobEvent((message.value % 64) + 1));
				} else {
					this._onKnobReleased.emit(new KnobEvent((message.value % 64) + 1));
				}
			}
		});
	}

	get onKnobTouched(): EventEmitter<KnobEvent> {
		return this._onKnobTouched;
	}

	get onKnobReleased(): EventEmitter<KnobEvent> {
		return this._onKnobReleased;
	}

	get onKnobRotated(): EventEmitter<StaticKnobMoveEvent> {
		return this._onKnobRotated;
	}
}

export class StaticKnobMoveEvent extends KnobEvent {
	constructor(knobId: number, protected _value: number) {
		super(knobId);
	}
	get value(): number {
		return this._value;
	}
}