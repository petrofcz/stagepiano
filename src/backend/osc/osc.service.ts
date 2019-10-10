import {BiduleSettingsLoader} from '../bidule/settings/BiduleSettingsLoader';
import {OscMessage} from './osc.message';
import {Injectable} from '@angular/core';
import {OscSubscription} from './osc.subscription';

let OSC;

@Injectable({
	providedIn: 'root'
})
export class OscService {
	protected osc;

	constructor(protected biduleSettingsLoader: BiduleSettingsLoader) {
		OSC = require('osc-js');
		this.initOsc();
	}

	protected initOsc() {
		const biduleSettings = this.biduleSettingsLoader.get();

		this.osc = new OSC({plugin: new OSC.DatagramPlugin({
			type: 'udp4',         // @param {string} 'udp4' or 'udp6'
			open: {
				host: 'localhost',    // @param {string} Hostname of udp server to bind to
				port: biduleSettings.oscLocalPort,          // @param {number} Port of udp server to bind to
				exclusive: false      // @param {boolean} Exclusive flag
			},
			send: {
				host: 'localhost',    // @param {string} Hostname of udp client for messaging
				port: biduleSettings.oscRemotePort           // @param {number} Port of udp client for messaging
			}
		})});

		this.osc.open();
	}

	public send(message: OscMessage) {
		console.log('OSC out', message);
		this.osc.send(new OSC.Message(message.path, ...message.args));
	}

	public on(pathPattern: string, callback): OscSubscription {
		return new OscSubscription(
			pathPattern,
			this.osc.on(pathPattern, callback)
		);
	}

	public off(subscription: OscSubscription) {
		this.osc.off(subscription.path, subscription.listenerId);
	}
}