import {getActionTypeFromInstance, NgxsNextPluginFn, NgxsPlugin} from '@ngxs/store';
import {ElectronService} from '../../core/services';
import {Injectable} from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class IpcActionTransmitterPlugin implements NgxsPlugin {

	constructor(protected electronService: ElectronService) {
		console.log('NGXS ACTION TRANSMITTER PLUGIN CREATED!');
	}

	handle(state: any, event: any, next: NgxsNextPluginFn): any {
		console.log(event);
		if (!event.hasOwnProperty('__nf') || event.__nf === false) {     // check for not-forward flag
			const actionType = getActionTypeFromInstance(event);
			if (actionType.substr(0, 2) !== '@@' && actionType.substr(0, 8) !== '[Router]') {     // skip ngxs internal actions
				const obj =  Object.assign({}, event);
				obj['type'] = actionType;
				this.electronService.ipcRenderer.send(
					'ngxs', JSON.stringify(obj)
				);
			}
		}
		return next(state, event);
	}
}
