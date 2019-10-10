import {Injectable} from '@angular/core';
import {actionMatcher, getActionTypeFromInstance, NgxsNextPluginFn, NgxsPlugin, InitState, UpdateState, Store} from '@ngxs/store';
import {FileStateStorage} from '../electron/file-state-storage';
import {LoadStateAction} from '../../shared/ngxs/load-state.action';
import {PersistStateAction} from './persist-state.action';

@Injectable({
	providedIn: 'root'
})
export class StatePersisterPlugin implements NgxsPlugin {

	constructor(protected stateStorage: FileStateStorage) { }

	handle(state: any, event: any, next: NgxsNextPluginFn): any {
		const matches = actionMatcher(event);

		console.log(state);

		// persist state
		if (matches(PersistStateAction)) {
			const globalKeys = ['layout', 'settings'];
			const ignoreKeys = ['keyboard'];

			const layoutSnapshot = Object.assign({}, state);
			const globalSnapshot = {};

			for (const globalKey of globalKeys) {
				globalSnapshot[globalKey] = layoutSnapshot[globalKey];
				delete layoutSnapshot[globalKey];
			}

			for (const ignoreKey of ignoreKeys) {
				delete layoutSnapshot[ignoreKey];
			}

			this.stateStorage.saveGlobal(globalSnapshot);

			// persist layout data - the rest of state
			const activeLayoutId = globalSnapshot['layout']['active'];
			if (activeLayoutId) {
				this.stateStorage.saveLayout(layoutSnapshot, activeLayoutId);
			}
		}

		return next(state, event);
	}
}