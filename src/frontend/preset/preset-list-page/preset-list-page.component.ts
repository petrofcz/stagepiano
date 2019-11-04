import {Component, OnInit,} from '@angular/core';
import {Observable} from 'rxjs';
import {Select, Store} from '@ngxs/store';
import {MatDialog} from '@angular/material/dialog';
import { v1 as uuid } from 'uuid';
import {PresetCategoryState} from '../../../shared/preset/state/preset-category.state';
import {PresetCategory} from '../../../shared/preset/model/model';
import {
	AddPresetCategoryAction,
	MovePresetCategoryAction,
	UpdatePresetCategoryAction
} from '../../../shared/preset/state/preset-category.actions';
import {NamedEntityDialogComponent, NamedEntityDialogData} from '../../shared/dialogs/named/named-entity-dialog.component';
import {SessionState} from '../../../shared/session/state/session.state';
import {SelectPresetCategoryAction} from '../../../shared/session/state/session.actions';
import {CdkDragDrop} from '@angular/cdk/drag-drop';

@Component({
	selector: 'app-preset-list',
	templateUrl: './preset-list-page.component.html',
	styleUrls: ['./preset-list-page.component.scss'],
})
export class PresetListPageComponent implements OnInit {

	@Select(PresetCategoryState.getAll)
	categories$: Observable<PresetCategory[]>;

	@Select(PresetCategoryState.getCurrent)
	currentCategory$: Observable<PresetCategory>;

	constructor(protected store: Store, public dialog: MatDialog) {
	}

	ngOnInit() {
	}

	selectCategory(id?: string) {
		this.store.dispatch(new SelectPresetCategoryAction(id));
	}

	openCategoryDialog(categoryId: string | null) {
		const category = categoryId ? this.store.selectSnapshot(PresetCategoryState.getById)(categoryId) : null;

		const dialogRef = this.dialog.open(NamedEntityDialogComponent, {
			width: '260px',
			data: <NamedEntityDialogData>{
				id: category ? category.id : null,
				name: category ? category.name : null,
				phrase: 'Select category name:'
			}
		});

		dialogRef.afterClosed().subscribe((result: NamedEntityDialogData) => {
			if (result.id) {
				this.store.dispatch(new UpdatePresetCategoryAction(<Partial<PresetCategory>>{
					id: result.id,
					name: result.name
				}));
			} else {
				this.store.dispatch(new AddPresetCategoryAction(<PresetCategory>{
					id: uuid(),
					name: result.name,
					presetIds: []
				}));
			}
		});
	}

	handleCategorySorting($event: CdkDragDrop<string[]>) {
		this.store.dispatch(new MovePresetCategoryAction($event.previousIndex, $event.currentIndex));
	}
}
