import {Injectable} from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class FileStateStorage {

	protected dataDir: string;

	protected fs;

	constructor() {
		const electron = require('electron');
		this.dataDir = electron.app.getPath('userData');
		this.fs = require('fs');
		this.fs.mkdir(this.dataDir, err => {
			if (err && err.code !== 'EEXIST') {
				throw Error('Cannot create user data directory ' + this.dataDir);
			}
		});
		this.fs.mkdir(this.dataDir + '/layouts', err => {
			if (err && err.code !== 'EEXIST') {
				throw Error('Cannot create user data directory ' + this.dataDir);
			}
		});
	}

	public saveGlobal(data: any): any {
		const file = this.getGlobalDataFile();
		const tmpFile = file + '.tmp';
		this.fs.writeFile(tmpFile, JSON.stringify(data), 'utf8', (err) => {
			if (err) {
				console.log(err);
				throw Error('Cannot save data to ' + tmpFile);
			} else {
				this.fs.renameSync(tmpFile, file);
			}
		});
	}

	public saveLayout(data: any, layoutId: string): any {
		const file = this.getLayoutDataFile(layoutId);
		const tmpFile = file + '.tmp';
		this.fs.writeFile(tmpFile, JSON.stringify(data), 'utf8', (err) => {
			if (err) {
				console.log(err);
				throw Error('Cannot save layout data to ' + tmpFile);
			} else {
				this.fs.renameSync(tmpFile, file);
			}
		});
	}

	public loadGlobal(): Promise<any> {
		return new Promise((resolve, reject) => {
			this.fs.readFile(this.getGlobalDataFile(), function (err, data) {
				if (err) {
					if (err.code === 'ENOENT') {
						resolve(null);
					} else {
						reject(err);
					}
				} else {
					resolve(JSON.parse(data));
				}
			});
		});
	}

	public loadLayout(layoutId: string) {
		return new Promise((resolve, reject) => {
			this.fs.readFile(this.getLayoutDataFile(layoutId), function (err, data) {
				if (err) {
					if (err.code === 'ENOENT') {
						resolve(null);
					} else {
						reject(err);
					}
				} else {
					resolve(JSON.parse(data));
				}
			});
		});
	}

	protected getGlobalDataFile() {
		return require('path').join(this.dataDir, '/global.json');
	}

	protected getLayoutDataFile(layoutId: string) {
		return require('path').join(this.dataDir, '/layouts/' + layoutId + '.json');
	}
}