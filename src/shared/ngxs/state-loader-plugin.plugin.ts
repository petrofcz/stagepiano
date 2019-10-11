import {Injectable} from '@angular/core';
import {actionMatcher, NgxsNextPluginFn, NgxsPlugin, setValue} from '@ngxs/store';
import {LoadStateAction, LoadStateActionDecl} from './load-state.action';

@Injectable({
	providedIn: 'root'
})
export class StateLoaderPlugin implements NgxsPlugin {

	constructor() { }

	handle(state: any, event: any, next: NgxsNextPluginFn): any {
		const matches = actionMatcher(event);
		if (matches(LoadStateAction) || event.type === LoadStateAction.type) {
			const setStateEvent: LoadStateActionDecl = event;
			for (const key of Object.keys(setStateEvent.items)) {
				console.log('Setting', key, setStateEvent.items[key]);
				state = setValue(state, key, setStateEvent.items[key]);
			}
		}
		return next(state, event);
	}
}
