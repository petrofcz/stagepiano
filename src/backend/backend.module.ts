import {NgModule} from '@angular/core';
import {ServerModule} from '@angular/platform-server';

import {KotatkoService} from './kotatko.service';
import {NgxsModule} from '@ngxs/store';
import {KeyboardState} from '../keyboard/states/keyboard.state';

@NgModule({
	imports: [
		ServerModule,
		NgxsModule.forRoot([
			KeyboardState
		])
	]
})
export class BackendModule {
	constructor(ks: KotatkoService) {
		ks.run();
	}
}
