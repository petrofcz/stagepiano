import BrowserWindow = Electron.BrowserWindow;
import {Injectable} from '@angular/core';

const globalAny: any = global;

@Injectable({
	providedIn: 'root'
})
export class BrowserWindowProvider {
	protected electronWindow: BrowserWindow;

	constructor() {
		this.electronWindow = globalAny.electronWindow;
	}
	
	public get(): BrowserWindow {
		return this.electronWindow;
	}
}