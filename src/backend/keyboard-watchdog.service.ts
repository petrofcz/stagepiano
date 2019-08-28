import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Select, Store} from '@ngxs/store';
import {KeyboardState, KeyboardStateModel} from '../keyboard/states/keyboard.state';

@Injectable({
	providedIn: 'root'
})
export class KeyboardWatchdogService {

	knobValues$: Observable<string[]>;

	@Select(KeyboardState.knobValues) knobValuesMemoized$: Observable<string[]>;

	constructor(private store: Store) {
		this.knobValues$ = this.store.select(state => state.keyboard.knobValues);
	}

	run() {
		const _this = this;
		this.knobValues$.subscribe(
			function (x) {
				console.log('Knobs are now ', x);
				console.log(
					_this.store.selectSnapshot(KeyboardState.knobValues)
				);
			}
		);
		this.knobValuesMemoized$.subscribe(
			function (x) {
				console.log('(memoized) Knobs are now ', x);
				console.log(
					_this.store.selectSnapshot(KeyboardState.knobValues)
				);
			}
		);
	}
}
