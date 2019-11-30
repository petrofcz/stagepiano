import {getActionTypeFromInstance, NgxsNextPluginFn, NgxsPlugin} from '@ngxs/store';
import {Injectable} from '@angular/core';
import {BrowserWindowProvider} from '../electron/BrowserWindowProvider';

@Injectable({
	providedIn: 'root'
})
export class IpcActionTransmitterPlugin implements NgxsPlugin {

	constructor(protected browserWindowProvider: BrowserWindowProvider) { }

	handle(state: any, event: any, next: NgxsNextPluginFn): any {
		this.sendAction(event);
		return next(state, event);
	}

	sendAction(action: any) {
		if (!action.hasOwnProperty('__nf') || action.__nf === false) {     // check for not-forward flag
			const actionType = getActionTypeFromInstance(action);
			if (actionType.substr(0, 2) !== '@@') {     // skip ngxs internal actions
				// console.log("SND");
				// console.log(event);
				const obj =  Object.assign({}, action);
				obj['type'] = actionType;
				// console.log(obj);
				this.browserWindowProvider.get().webContents.send('ngxs', JSON.stringify(obj));
			}
		}
	}
}
