import {Injectable} from '@angular/core';
import {KeyboardWatchdogService} from './keyboard-watchdog.service';
import {Store} from '@ngxs/store';
import {keyboard, TestAction} from '../shared/keyboard/actions/set-knob-value.actions';
import SetKnobValueAction = keyboard.SetKnobValueAction;

@Injectable({
	providedIn: 'root'
})
export class KotatkoService {

	constructor(protected kws: KeyboardWatchdogService, protected store: Store) {
		kws.run();
	}

	run() {
		const _this = this;
		return;
		setInterval(function () {
			// _this.store.dispatch(new keyboard.SetKnobValueAction.Impl(
			// 	_this.getRandomArbitrary(0, 8),
			// 	_this.getRandomArbitrary(0, 128)
			// ));
			_this.store.dispatch(new SetKnobValueAction(
				_this.getRandomArbitrary(0, 8),
				_this.getRandomArbitrary(0, 128)
			));
		}, 1000);
		setInterval(function () {
			_this.store.dispatch(new TestAction());
		}, 1200);
	}

	public getRandomArbitrary(min, max) {
		return Math.round(Math.random() * (max - min) + min);
	}
}
