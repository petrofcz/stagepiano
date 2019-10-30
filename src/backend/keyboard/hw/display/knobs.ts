import {CCMessage, MidiAdapter} from '../../../automap/midi-adapter';
import {EventEmitter} from '@angular/core';
import {RotationDirection} from '../../common';

export class Knobs {

	private _onKnobTouched = new EventEmitter<KnobEvent>();

	private _onKnobReleased = new EventEmitter<KnobEvent>();

	private _onKnobRotated = new EventEmitter<RotationKnobEvent>();

	constructor(protected midiAdapter: MidiAdapter) {
		midiAdapter.onCC.subscribe((message: CCMessage) => {
			const data = message.data;
			if (message.channel !== 16) {
				return;
			}
			if (message.cc >= 0x78 && message.cc <= 0x7f) {
				let amount: number;
				let direction: RotationDirection;
				if (message.value >= 64) {
					amount = message.value - 64;
					direction = RotationDirection.BACKWARD;
				} else {
					amount = message.value;
					direction = RotationDirection.FORWARD;
				}
				this._onKnobRotated.emit(
					new RotationKnobEvent(message.cc - 0x78 + 1, amount, direction)
				);
			}
			if (message.cc === 0x6c) {
				if (message.value >= 64) {
					this._onKnobTouched.emit(new KnobEvent((message.value % 64) + 1));
				} else {
					this._onKnobReleased.emit(new KnobEvent((message.value % 64) + 1));
				}
			}
		});
	}

	public setKnobMode(knobPosition: number, knobMode: KnobMode) {
		this.midiAdapter.sendCC(new CCMessage(16, 0x78 - 1 + knobPosition, knobMode));
	}

	/**
	 * @param knobPosition indexed from 1
	 * @param value Normalized value between 0 and 1
	 * @param keepSingleDot If true, the value will be scaled
	 */
	public setKnobValue(knobPosition: number, value?: number, keepSingleDot: boolean = false) {
		let dotCount;
		if (!keepSingleDot) {
			dotCount = Math.round((value || 0) * 12);
		} else {
			if (value === null) {
				dotCount = 0;
			} else {
				dotCount = Math.round((value || 0) * 11) + 1;
			}
		}
		this.midiAdapter.sendCC(new CCMessage(16, 0x70 - 1 + knobPosition, dotCount));
	}

	get onKnobTouched(): EventEmitter<KnobEvent> {
		return this._onKnobTouched;
	}

	get onKnobReleased(): EventEmitter<KnobEvent> {
		return this._onKnobReleased;
	}

	get onKnobRotated(): EventEmitter<RotationKnobEvent> {
		return this._onKnobRotated;
	}
}

export enum KnobMode {
	MODE_CONTINUOUS = 0,
	MODE_CONTINUOUS_REV = 0x10,
	MODE_CENTERED = 0x20,
	MODE_DOUBLE_CENTERED = 0x30,
	MODE_SINGLE_DOT = 0x40
}

export class KnobEvent {
	constructor(protected readonly _knobId: number) { }
	get knobId(): number {
		return this._knobId;
	}
}

export class RotationKnobEvent extends KnobEvent {
	constructor(knobId: number, protected _amount: number, protected _direction: RotationDirection) {
		super(knobId);
	}
	get amount(): number {
		return this._amount;
	}

	get direction(): RotationDirection {
		return this._direction;
	}
}