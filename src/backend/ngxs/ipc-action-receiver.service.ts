import {Injectable} from '@angular/core';
import {Store} from '@ngxs/store';

@Injectable({
	providedIn: 'root'
})
export class IpcActionReceiver {

	constructor(protected ngxsStore: Store) { }

	public init() {
		return new Promise((resolve, reject) => {
			const {ipcMain} = require('electron');
			ipcMain.on('ngxs', (event, arg) => {
				let action = JSON.parse(arg);
				action.__nf = true;  //  set no-forward flag
				this.ngxsStore.dispatch(
					action
				);
			});
			resolve();
		});
	}

}