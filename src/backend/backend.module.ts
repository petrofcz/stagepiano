import {APP_INITIALIZER, NgModule} from '@angular/core';
import {ServerModule} from '@angular/platform-server';
import {KotatkoService} from './kotatko.service';
import {NGXS_PLUGINS, NgxsModule} from '@ngxs/store';
import {KeyboardState} from '../shared/keyboard/states/keyboard.state';
import {IpcActionTransmitterPlugin} from './ngxs/ipc-action-transmitter-plugin.service';
import {IpcActionReceiver} from './ngxs/ipc-action-receiver.service';
import {DummyComponent} from './component/dummy.component';
import {StateLoaderPlugin} from '../shared/ngxs/state-loader-plugin.plugin';
import {StatePersisterPlugin} from './ngxs/state-persister.plugin';
import {AutosaveService} from './ngxs/autosave.service';
import {StateLoaderHandler} from './ngxs/state-loader-handler.service';
import {LayoutState} from '../shared/layout/state/layout.state';
import {BiduleSettingsLoader} from './bidule/settings/BiduleSettingsLoader';
import {OscService} from './osc/osc.service';
import {BiduleLayoutOpener} from './bidule/layout/layout-opener.service';
import {VSTState} from '../shared/vst/state/vst.state';
import {BiduleLayoutReader} from './bidule/layout/layout-reader';

export function IpcActionReceiverFactory(ipcActionReceiver: IpcActionReceiver) {
	return () => ipcActionReceiver.init();
}
export function AutosaveFactory(autosaveService: AutosaveService) {
	return () => autosaveService.start();
}
export function NoopAppInitializer() {
	return function() {};
}

@NgModule({
	declarations: [
		DummyComponent
	],
	imports: [
		ServerModule,
		NgxsModule.forRoot([LayoutState, KeyboardState, VSTState])
	],
	providers: [
		{
			provide: NGXS_PLUGINS,
			useClass: IpcActionTransmitterPlugin,
			multi: true
		},
		{
			provide: APP_INITIALIZER,
			useFactory: IpcActionReceiverFactory,
			deps: [IpcActionReceiver],
			multi: true
		},
		{
			provide: NGXS_PLUGINS,
			useClass: StateLoaderPlugin,
			multi: true
		},
		{
			provide: NGXS_PLUGINS,
			useClass: StatePersisterPlugin,
			multi: true
		},
		{ provide: APP_INITIALIZER, useFactory: AutosaveFactory, multi: true, deps: [AutosaveService] },
		{ provide: APP_INITIALIZER, useFactory: NoopAppInitializer, multi: true, deps: [
			StateLoaderHandler,
		]},
		BiduleSettingsLoader,
		OscService
	],
	bootstrap: [DummyComponent]
})
export class BackendModule {
	constructor(ks: KotatkoService, blw: BiduleLayoutOpener, blr: BiduleLayoutReader) {
		ks.run();
	}
}