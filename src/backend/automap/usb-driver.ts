import {EventEmitter, Injectable} from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class USBDriver {

	usb;

	interface;

	interval;

	inEndpoint;

	outEndpoint;

	private _onMessage = new EventEmitter<Buffer>();

	private _onConnect = new EventEmitter<any>();

	private _onDisconnect = new EventEmitter<any>();

	constructor() {
		this.interval = setInterval(() => {
			this.init();
		}, 3000);
	}

	public init() {
		if (!this.usb) {
			this.usb = require('usb');
		}
		if (!this.interface) {
			const device = this.usb.findByIds(4661, 11);
			if (device) {
				device.open();
				for (const iface of device.interfaces) {
					if (iface.descriptor.bInterfaceClass === 255) {
						iface.claim();
						this.interface = iface;

						const inEndpoint = iface.endpoints[0];

						this.inEndpoint = inEndpoint;
						this.outEndpoint = iface.endpoints[1];

						inEndpoint.on('data', (data) => {
							console.log('AUTOMAP IN');
							console.log(data);
							this._onMessage.emit(data);
						});

						inEndpoint.on('end', () => {
							this.interface.release();
							device.close();
							this._onDisconnect.emit();
							this.interface = null;
							this.outEndpoint = null;
						});

						inEndpoint.startPoll(8, 4);

						setTimeout(() => {
							this._onConnect.emit();
						}, 300);
					}
				}
				if (!this.interface) {
					device.close();
				}
			}
		}
	}

	public send(data: number[]) {
		if (this.outEndpoint) {
			const array = new Uint8Array(data.length);
			for (let i = 0; i < data.length; i++) {
				array[i] = data[i];
			}
			console.log('AUTOMAP OUT');
			console.log(array.buffer);
			this.outEndpoint.transfer(Buffer.from(array));
		}
	}

	get onMessage(): EventEmitter<Buffer> {
		return this._onMessage;
	}

	get onConnect(): EventEmitter<any> {
		return this._onConnect;
	}

	get onDisconnect(): EventEmitter<any> {
		return this._onDisconnect;
	}
}