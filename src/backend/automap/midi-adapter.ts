import {USBDriver} from './usb-driver';
import {EventEmitter, Injectable} from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class MidiAdapter {

	public cableId = 2;

	public readonly onCC = new EventEmitter<CCMessage>();

	public readonly onSysex = new EventEmitter<SysexMessage>();

	protected sysexBuffer: number[] = [];

	constructor(protected usbDriver: USBDriver) {
		usbDriver.onMessage.subscribe((buffer: Buffer) => {
			const data = Uint8Array.from(buffer);

			const cableId = Math.floor(data[0] / 16);
			const cin = Math.floor(data[0] % 16);
			switch (cin) {
				case 4:         // SysEx starts or continues
					this.sysexBuffer.push(data[1]);
					this.sysexBuffer.push(data[2]);
					this.sysexBuffer.push(data[3]);
					break;
				case 5:
					this.sysexBuffer.push(data[1]);
					this.onSysex.emit(new SysexMessage(this.sysexBuffer));
					this.sysexBuffer = [];
					break;
				case 6:
					this.sysexBuffer.push(data[1]);
					this.sysexBuffer.push(data[2]);
					this.onSysex.emit(new SysexMessage(this.sysexBuffer));
					this.sysexBuffer = [];
					break;
				case 7:
					this.sysexBuffer.push(data[1]);
					this.sysexBuffer.push(data[2]);
					this.sysexBuffer.push(data[3]);
					this.onSysex.emit(new SysexMessage(this.sysexBuffer));
					this.sysexBuffer = [];
					break;
				case 11:
					this.onCC.emit(new CCMessage((data[1] % 16) + 1, data[2], data[3]));
					break;
			}
		});
	}

	public sendSysex(message: SysexMessage) {
		let payload = message.payload;
		let slice: number[] = null;
		const toSend: number[] = [];
		if (!payload.length) {
			return;
		}
		while (payload.length > 3) {
			slice = payload.slice(0, 3);
			slice.unshift(4 + (16 * this.cableId));
			toSend.push(... slice);
			payload = payload.slice(3);
		}
		payload.unshift((payload.length + 4) + (16 * this.cableId));
		toSend.push(... payload);
		while (toSend.length % 4 !== 0) {   // align
			toSend.push(0);
		}
		this.usbDriver.send(toSend);
	}

	public sendCC(message: CCMessage) {
		this.usbDriver.send(
			[
				11 + (16 * this.cableId)
			].concat(message.data)
		);
	}
}

export class CCMessage {
	/**
	 * @param _channel 1-indexed
	 * @param _cc 0 to 127
	 * @param _value 0 to 127
	 */
	constructor(protected _channel: number, protected _cc: number, protected _value: number) { }

	get data(): number[] {
		return [ (11 * 16) + (this._channel - 1), this._cc, this.value];
	}

	get channel(): number {
		return this._channel;
	}

	get cc(): number {
		return this._cc;
	}

	get value(): number {
		return this._value;
	}
}
export class SysexMessage {
	constructor(protected _payload: number[]) { }

	get payload() {
		return this._payload;
	}
}