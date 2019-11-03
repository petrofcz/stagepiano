import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

export interface NamedEntityDialogData {
	id: string|null;
	name: string|null;
	phrase: string|null;
}

@Component({
	selector: 'app-preset-category-editor',
	templateUrl: './named-entity-dialog.component.html',
	// styleUrls: ['./category-editor.component.scss']
})
export class NamedEntityDialogComponent {

	constructor(
		public dialogRef: MatDialogRef<NamedEntityDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: NamedEntityDialogData
	) {}

	onCancelClick(): void {
		this.dialogRef.close();
	}

}