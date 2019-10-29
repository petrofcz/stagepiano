import {Injectable} from '@angular/core';
import {KeyboardWatchdogService} from './keyboard-watchdog.service';
import {Store} from '@ngxs/store';
import {keyboard} from '../shared/keyboard/actions/set-knob-value.actions';
import {DisplayRegionDriver} from './keyboard/display/display-region-driver';
import {KnobMode, RotationKnobEvent} from './keyboard/display/knobs';
import {RotationDirection} from './keyboard/common';
import SetKnobValueAction = keyboard.SetKnobValueAction;
import UpdateKnobValueAction = keyboard.UpdateKnobValueAction;
import {KeyboardState} from '../shared/keyboard/states/keyboard.state';
import {audit, auditTime, distinctUntilChanged, first, map, throttle, throttleTime} from 'rxjs/operators';
import {interval, timer} from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class KotatkoService {

	constructor(protected kws: KeyboardWatchdogService, protected store: Store, protected drd: DisplayRegionDriver) {
		kws.run();
	}

	run() {
		for (let i = 1; i <= 8; i++) {
			this.drd.knobs.setKnobMode(i, KnobMode.MODE_CONTINUOUS);
			this.store.select(KeyboardState.knobValue).pipe(map(filterFn => filterFn(i - 1))).pipe(distinctUntilChanged()).subscribe((knobValue) => {
				this.drd.knobs.setKnobValue(i, knobValue / 127);
			});
			// tslint:disable-next-line:max-line-length
			this.store.select(KeyboardState.knobValue).pipe(map(filterFn => filterFn(i - 1))).pipe(distinctUntilChanged()).pipe(auditTime(50)).subscribe((knobValue) => {
				this.drd.display.setCellContent(1, i, knobValue.toString());
			});
		}

		this.drd.knobs.onKnobRotated.subscribe((event: RotationKnobEvent) => {
			// tslint:disable-next-line:max-line-length
			this.store.dispatch(new UpdateKnobValueAction(event.knobId - 1, (event.direction === RotationDirection.FORWARD ? 1 : -1) * event.amount));
		});

		// setInterval(() => {
		// 	// _this.store.dispatch(new keyboard.SetKnobValueAction.Impl(
		// 	// 	_this.getRandomArbitrary(0, 8),
		// 	// 	_this.getRandomArbitrary(0, 128)
		// 	// ));
		// 	this.store.dispatch(new SetKnobValueAction(
		// 		this.getRandomArbitrary(0, 8),
		// 		this.getRandomArbitrary(0, 128)
		// 	));
		// }, 1000);
	}

	public getRandomArbitrary(min, max) {
		return Math.round(Math.random() * (max - min) + min);
	}
}
