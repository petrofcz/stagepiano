import {Store} from '@ngxs/store';
import {PersistStateAction} from './persist-state.action';
import {Injectable} from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class AutosaveService {

	protected interval = 30000; // [s]

	protected intervalHandle;

	constructor(protected store: Store) {
	}

	public start() {
		if (!this.intervalHandle) {
			this.intervalHandle = setInterval(() => {
				this.store.dispatch(new PersistStateAction());
			}, this.interval);
		}
	}

	public stop() {
		if (this.intervalHandle) {
			clearTimeout(this.intervalHandle);
			this.intervalHandle = null;
		}
	}

}