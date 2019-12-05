import {BiduleSettingsLoader} from '../bidule/settings/BiduleSettingsLoader';
import {OscMessage} from './osc.message';
import {EventEmitter, Injectable} from '@angular/core';
import {OscSubscription} from './osc.subscription';
import {merge, Observable, of} from 'rxjs';
import {filter, map} from 'rxjs/operators';

let OSC;

@Injectable({
	providedIn: 'root'
})
export class OscService {

	protected osc;

	// last value for each osc parameter
	protected valuesMap = { };

	protected valuesEmitter = new EventEmitter<OscMessage>();

	constructor(protected biduleSettingsLoader: BiduleSettingsLoader) {
		OSC = require('osc-js');
		this.initOsc();
		this.observeIncoming('*').subscribe((message) => {
			this.valuesEmitter.emit(message);
		});
		this.valuesEmitter.subscribe((message) => {
			this.valuesMap[message.path] = message.args;
		});
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
		this.valuesEmitter.emit(message);
		this.osc.send(new OSC.Message(message.path, ...message.args));
	}

	/**
	 * Observe only incoming values
	 * @param pathPattern
	 */
	public observeIncoming(pathPattern: string): Observable<OscMessage> {
		console.log("[OSC] OBSERVING INCOMING " + pathPattern);
		return new Observable((subscriber) => {
			const subscription = this.on(pathPattern, (oscMessage) => {
				subscriber.next(oscMessage);
			});
			return () => {
				console.log("[OSC] NOT OBSERVING INCOMING " + subscription.path);
				this.off(subscription);
			};
		});
	}

	/**
	 * Observes both incoming and outcoming messages
	 * @param pathPattern
	 */
	public observeAny(pathPattern: string): Observable<OscMessage> {
		console.log("[OSC] OBSERVING ANY " + pathPattern);
		return this.valuesEmitter.pipe(filter(message => message.path.match(pathPattern.replace('*', '*.')) !== null));
	}

	/**
	 * Returns observable for given path, last message is replayed if available
	 * @param path
	 */
	public observeEndpointValue(path: string): Observable<OscMessage> {
		const messageObservable = this.valuesEmitter.pipe(filter(message => message.path === path));
		return merge(
			((path in this.valuesMap) ? of(this.valuesMap[path]) : of()).pipe(map((values => { return new OscMessage(path, values); }))),
			messageObservable
		);
	}

	public on(pathPattern: string, callback): OscSubscription {
		return new OscSubscription(
			pathPattern,
			this.osc.on(pathPattern, (oscEvent) => {
				callback(new OscMessage(oscEvent.address, oscEvent.args));
			})
		);
	}

	public off(subscription: OscSubscription) {
		this.osc.off(subscription.path, subscription.listenerId);
	}
}