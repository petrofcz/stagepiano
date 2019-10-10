// start backend service
import {renderModuleFactory} from '@angular/platform-server';
import {BackendModuleNgFactory} from './dist/backend/main';
import 'zone.js/dist/zone-node';

renderModuleFactory(BackendModuleNgFactory, {
	url: '/',
	document: ''
});
