import {USBDriver} from '../../automap/usb-driver';
import {Display} from '../hw/display/display';
import {Injectable} from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class InitialScreenTransmitterService {
	constructor(protected usbDriver: USBDriver, protected display: Display) {
		usbDriver.onConnect.subscribe(() => {
			display.flushContent();
		});
	}
}