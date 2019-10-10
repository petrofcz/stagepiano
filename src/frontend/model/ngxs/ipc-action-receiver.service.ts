import {Injectable} from '@angular/core';
import {Store} from '@ngxs/store';
import {ElectronService} from '../../core/services';

@Injectable({
	providedIn: 'root'
})
export class IpcActionReceiver {

	constructor(protected electronService: ElectronService, protected ngxsStore: Store) {}

	public init() {
		return new Promise((resolve, reject) => {
			console.log('Action receiver INIT');
			this.electronService.ipcRenderer.on('ngxs', (event, arg) => {
				console.log('Received ACTION');
				console.log(arg);
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