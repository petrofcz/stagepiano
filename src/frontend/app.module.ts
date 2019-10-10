import 'reflect-metadata';
import '../polyfills';

import {BrowserModule} from '@angular/platform-browser';
import {APP_INITIALIZER, NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpClientModule, HttpClient} from '@angular/common/http';
import {CoreModule} from './core/core.module';
import {SharedModule} from './shared/shared.module';

import {AppRoutingModule} from './app-routing.module';

import {NGXS_PLUGINS, NgxsModule, Store} from '@ngxs/store';
import {NgxsReduxDevtoolsPluginModule} from '@ngxs/devtools-plugin';

// NG Translate
import {TranslateModule, TranslateLoader} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';

import {HomeModule} from './home/home.module';

import {AppComponent} from './app.component';
import {NgxsStoragePluginModule, STORAGE_ENGINE} from '@ngxs/storage-plugin';
import {IpcActionTransmitterPlugin} from './model/ngxs/ipc-action-transmitter-plugin.service';
import {ElectronService} from './core/services';
import {IpcActionReceiver} from './model/ngxs/ipc-action-receiver.service';
import {KeyboardState} from '../shared/keyboard/states/keyboard.state';
import {NgxsLoggerPluginModule} from '@ngxs/logger-plugin';
import {MatSidenavModule} from '@angular/material/sidenav';
import {HomeRoutingModule} from './home/home-routing.module';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatListModule} from '@angular/material/list';
import {MatIconModule} from '@angular/material/icon';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatButtonModule} from '@angular/material/button';
import {StateLoaderPlugin} from '../shared/ngxs/state-loader-plugin.plugin';
import {LayoutGuard} from './layout/guards/layout.guard';
import {NoLayoutGuard} from './layout/guards/no-layout.guard';
import {NgxsRouterPluginModule} from '@ngxs/router-plugin';
import {RouterModule} from '@angular/router';
import {MaterialModule} from './material';
import {LayoutState} from '../shared/layout/state/layout.state';
import {FrontendState} from '../shared/frontend/state/frontend.state';
import {VSTState} from '../shared/vst/state/vst.state';
// import {IpcStorageEngine} from './core/services/storage/ipcStorageEngine.service';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
	return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export function IpcActionReceiverFactory(ipcActionReceiver: IpcActionReceiver) {
	return () => ipcActionReceiver.init();
}

@NgModule({
	declarations: [AppComponent],
	imports: [
		BrowserModule,
		FormsModule,
		HttpClientModule,
		CoreModule,
		SharedModule,
		HomeModule,
		AppRoutingModule,
		TranslateModule.forRoot({
			loader: {
				provide: TranslateLoader,
				useFactory: HttpLoaderFactory,
				deps: [HttpClient]
			}
		}),
		NgxsModule.forRoot([LayoutState, FrontendState, VSTState]),
		NgxsReduxDevtoolsPluginModule.forRoot(),
		NgxsRouterPluginModule.forRoot(),
		RouterModule.forRoot([]),
		// NgxsLoggerPluginModule.forRoot(),   // todo-remove
		HomeRoutingModule,
		MaterialModule,
		BrowserAnimationsModule
	],
	providers: [
		{
			provide: NGXS_PLUGINS,
			useClass: IpcActionTransmitterPlugin,
			deps: [ElectronService],
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
		LayoutGuard, NoLayoutGuard
	],
	bootstrap: [AppComponent]
})
export class AppModule {
}
