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
import {MatDialog, MatDialogModule} from '@angular/material/dialog';

@NgModule({
	imports: [
		MatInputModule,
		MatCardModule,
		MatButtonModule,
		MatSidenavModule,
		MatListModule,
		MatIconModule,
		MatToolbarModule,
		MatProgressSpinnerModule,
		MatDialogModule
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
		MatSpinner,
		MatDialogModule
	],
})
export class MaterialModule {
}
