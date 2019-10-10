import {NgModule} from '@angular/core';

import {
	MatInputModule,
	MatCardModule,
	MatButtonModule,
	MatSidenavModule,
	MatListModule,
	MatIconModule,
	MatToolbarModule,
	MatProgressSpinnerModule,
	MatSpinner
} from '@angular/material';

@NgModule({
	imports: [
		MatInputModule,
		MatCardModule,
		MatButtonModule,
		MatSidenavModule,
		MatListModule,
		MatIconModule,
		MatToolbarModule,
		MatProgressSpinnerModule
	],
	exports: [
		MatInputModule,
		MatCardModule,
		MatButtonModule,
		MatSidenavModule,
		MatListModule,
		MatIconModule,
		MatToolbarModule,
		MatProgressSpinnerModule,
		MatSpinner
	],
})
export class MaterialModule {
}
