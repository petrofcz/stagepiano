import {Injectable} from '@angular/core';
import {KeyboardWatchdogService} from './keyboard-watchdog.service';
import {Store} from '@ngxs/store';
import {SetKnobValueAction} from '../keyboard/actions/set-knob-value.actions';

@Injectable({
	providedIn: 'root'
})
export class KotatkoService {

	constructor(protected kws: KeyboardWatchdogService, protected store: Store) {
		kws.run();
	}

	run() {
		const _this = this;
		setInterval(function () {
			_this.store.dispatch(<SetKnobValueAction>{
				knobId: _this.getRandomArbitrary(0, 8),
				value: _this.getRandomArbitrary(0, 128),
			});
		}, 1000);
	}

	public getRandomArbitrary(min, max) {
		return Math.round(Math.random() * (max - min) + min);
	}
}
