import {Injectable} from '@angular/core';
import {actionMatcher, getActionTypeFromInstance, NgxsNextPluginFn, NgxsPlugin, InitState, UpdateState, Store} from '@ngxs/store';
import {FileStateStorage} from '../electron/file-state-storage';
import {LoadStateAction} from '../../shared/ngxs/load-state.action';
import {PersistStateAction} from './persist-state.action';
import {ActionTester} from '../../shared/ngxs/helper';
import {RequestGlobalStateAction} from '../../shared/ngxs/request-global-state.action';
import {IpcActionTransmitterPlugin} from './ipc-action-transmitter-plugin.service';

@Injectable({
	providedIn: 'root'
})
export class StatePersisterPlugin implements NgxsPlugin {

	constructor(protected stateStorage: FileStateStorage, protected ipcActionTransmitter: IpcActionTransmitterPlugin) { }

	handle(state: any, event: any, next: NgxsNextPluginFn): any {
		const actionTester = new ActionTester(event);

		console.log(state);

		// persist state
		if (actionTester.matches(PersistStateAction)) {
			const globalKeys = ['layout', 'settings'];
			const ignoreKeys = ['keyboard', 'manual', 'bidule'];

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
		if (actionTester.matches(RequestGlobalStateAction)) {
			const enhanceData = (data) => {
				if (!('frontend' in data)) {
					data['frontend'] = {};
				}
				data['frontend']['initialized'] = true;
				return data;
			};
			const snapshot = Object.assign({}, state);
			// initialize state from store
			this.ipcActionTransmitter.sendAction(
				new LoadStateAction(enhanceData(snapshot))
			);
		}

		return next(state, event);
	}
}