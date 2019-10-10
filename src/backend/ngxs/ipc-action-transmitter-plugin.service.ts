import {getActionTypeFromInstance, NgxsNextPluginFn, NgxsPlugin} from '@ngxs/store';
import {Injectable} from '@angular/core';
import {BrowserWindowProvider} from '../electron/BrowserWindowProvider';

@Injectable({
	providedIn: 'root'
})
export class IpcActionTransmitterPlugin implements NgxsPlugin {

	constructor(protected browserWindowProvider: BrowserWindowProvider) { }

	handle(state: any, event: any, next: NgxsNextPluginFn): any {
		if (!event.hasOwnProperty('__nf')) {     // check for not-forward flag
			const actionType = getActionTypeFromInstance(event);
			if (actionType.substr(0, 2) !== '@@') {     // skip ngxs internal actions
				console.log("SND");
				console.log(event);
				const obj =  Object.assign({}, event);
				obj['type'] = actionType;
				console.log(obj);
				this.browserWindowProvider.get().webContents.send('ngxs', JSON.stringify(obj));
			}
		}
		return next(state, event);
	}
}
