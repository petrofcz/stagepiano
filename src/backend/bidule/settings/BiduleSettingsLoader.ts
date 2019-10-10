import {BiduleSettings} from './BiduleSettings';
import {Injectable} from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class BiduleSettingsLoader {
	public get(): BiduleSettings {
		return {
			oscRemotePort: 10000,
			oscLocalPort: 9999
		};
		// todo-dynamic (registry or app settings)
	}
}