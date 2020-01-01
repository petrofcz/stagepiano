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
import {ManualState} from '../shared/manual/state/manual.state';
import {BiduleState} from '../shared/bidule/state/bidule.state';
import {USBDriver} from './automap/usb-driver';
import {MidiAdapter} from './automap/midi-adapter';
import {KeyboardService} from './keyboard/keyboard.service';
import {KeyboardRouter} from './keyboard/router/keyboardRouter';
import {PresetCategoryState} from '../shared/preset/state/preset-category.state';
import {SessionState} from '../shared/session/state/session.state';
import {NgxsResetPluginModule} from 'ngxs-reset-plugin';
import {ParamMappingPageState} from '../shared/paramMapping/state/paramMappingPage.state';
import {BiduleOscTransmitter} from './bidule/osc/ngxs/bidule-osc-transmitter.service';
import {ParamMappingOscService} from './bidule/osc/paramMapping/param-mapping-osc.service';
import {EffectSnapshotService} from './vst/model/effectSnapshotService';
import {PresetState} from '../shared/preset/state/preset.state';
import {PresetSessionState} from '../shared/preset/state/presetSession.state';
import {VstPresetInitStrategyLearnService} from './preset/VstPresetInitStrategy/vst-preset-init-strategy-learn.service';
import {SnapshotInitStrategyLearnService} from './preset/SnapshotInitStrategy/snapshot-init-strategy-learn.service';
import {PresetCategorySwitcherService} from '../shared/session/model/preset-category-switcher.service';
import {PresetValueListenerService} from './preset/model/preset-value-listener.service';
import {PresetInstrumentLoaderService} from './preset/model/preset-instrument-loader.service';
import {InitialScreenTransmitterService} from './keyboard/model/initial-screen-transmitter.service';

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
		NgxsModule.forRoot([LayoutState, KeyboardState, VSTState, ManualState, BiduleState, SessionState, PresetCategoryState, ParamMappingPageState, PresetState, PresetSessionState]),
		NgxsResetPluginModule.forRoot()
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
			StateLoaderHandler, BiduleOscTransmitter
		]},
		BiduleSettingsLoader,
		OscService
	],
	bootstrap: [DummyComponent]
})
export class BackendModule {
	constructor(ks: KotatkoService, blw: BiduleLayoutOpener, blr: BiduleLayoutReader, kbs: KeyboardService, kbdRouter: KeyboardRouter, pmos: ParamMappingOscService, ess: EffectSnapshotService, vpisls: VstPresetInitStrategyLearnService, sisls: SnapshotInitStrategyLearnService, pcss: PresetCategorySwitcherService, pvls: PresetValueListenerService, pils: PresetInstrumentLoaderService, ists: InitialScreenTransmitterService) {
		ks.run();
	}
}
