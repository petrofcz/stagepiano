import {app, BrowserWindow, screen} from 'electron';
import * as path from 'path';
import * as url from 'url';
import 'zone.js/dist/zone-node';
// import {enableProdMode} from '@angular/core';
import {renderModuleFactory} from '@angular/platform-server';
import {BackendModuleNgFactory} from './dist/backend/main';
import installExtension, { REDUX_DEVTOOLS } from 'electron-devtools-installer';

module.paths.push(path.resolve('node_modules'));
module.paths.push(path.resolve('../node_modules'));
module.paths.push(path.resolve(__dirname, '..', '..', '..', '..', 'resources', 'app', 'node_modules'));
module.paths.push(path.resolve(__dirname, '..', '..', '..', '..', 'resources', 'app.asar', 'node_modules'));

let win, serve;
const args = process.argv.slice(1);
serve = args.some(val => val === '--serve');

const globalAny: any = global;

function createWindow() {

	const electronScreen = screen;
	const size = electronScreen.getPrimaryDisplay().workAreaSize;

	// Create the browser window.
	win = new BrowserWindow({
		x: 0,
		y: 0,
		width: size.width,
		height: size.height,
		webPreferences: {
			nodeIntegration: true,
			webSecurity: false
		},
		show: false
	});

	if (serve) {
		require('electron-reload')(__dirname, {
			electron: require(`${__dirname}/node_modules/electron`)
		});
		win.loadURL('http://localhost:4200');
	} else {
		win.loadURL(url.format({
			pathname: path.join(__dirname, 'dist/index.html'),
			protocol: 'file:',
			slashes: true
		}));
	}

	// Emitted when the window is closed.
	win.on('closed', () => {
		// Dereference the window object, usually you would store window
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		win = null;
		process.exit(0);
	});
}

try {

	// This method will be called when Electron has finished
	// initialization and is ready to create browser windows.
	// Some APIs can only be used after this event occurs.
	app.on('ready', function () {
		// create window
		createWindow();

		installExtension(REDUX_DEVTOOLS).then((name) => {
			console.log(`Added Extension:  ${name}`);
		}).catch((err) => {
			console.log('An error occurred: ', err);
		});

		globalAny.electronWindow = win;

		win.once('ready-to-show', () => {
			win.show();
			win.openDevTools();
		});

		// start backend service
		renderModuleFactory(BackendModuleNgFactory, {
			url: '/',
			document: ''
		});
	});

	// Quit when all windows are closed.
	app.on('window-all-closed', () => {
		// On OS X it is common for applications and their menu bar
		// to stay active until the user quits explicitly with Cmd + Q
		if (process.platform !== 'darwin') {
			app.quit();
		}
	});

	app.on('activate', () => {
		// On OS X it's common to re-create a window in the app when the
		// dock icon is clicked and there are no other windows open.
		if (win === null) {
			createWindow();
		}
	});

} catch (e) {
	// Catch Error
	// throw e;
}
