import {Component, OnInit,} from '@angular/core';
import {Observable} from 'rxjs';
import {Select, Store} from '@ngxs/store';
import {MatDialog} from '@angular/material/dialog';
import { v1 as uuid } from 'uuid';
import {PresetCategoryState} from '../../../shared/preset/state/preset-category.state';
import {Preset, PresetCategory} from '../../../shared/preset/model/model';
import {
	AddPresetCategoryAction, AddPresetToCategoryAction, MovePresetAction,
	MovePresetCategoryAction,
	UpdatePresetCategoryAction
} from '../../../shared/preset/state/preset-category.actions';
import {NamedEntityDialogComponent, NamedEntityDialogData} from '../../shared/dialogs/named/named-entity-dialog.component';
import {SelectPresetCategoryAction} from '../../../shared/session/state/session.actions';
import {CdkDragDrop} from '@angular/cdk/drag-drop';
import {PresetState} from '../../../shared/preset/state/preset.state';
import {AddPresetAction} from '../../../shared/preset/state/preset.actions';
import {filter, map, switchMap} from 'rxjs/operators';
import {ManualState} from '../../../shared/manual/state/manual.state';
import {Router} from '@angular/router';
import {PresetSessionState} from '../../../shared/preset/state/presetSession.state';
import {SelectPresetAction} from '../../../shared/preset/state/presetSession.actions';

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

	presets$: Observable<Preset[]>;

	availableVsts$: Observable<string[]>;

	currentPresetId$: Observable<string>;

	constructor(protected store: Store, public dialog: MatDialog, protected router: Router) {
		this.presets$ = this.currentCategory$.pipe(
			switchMap(currentCategory => this.store.select(PresetState.getEntities).pipe(map(entities => {
				console.log(' --- ', currentCategory.presetIds);
				return currentCategory.presetIds.map(presetId => entities[presetId]);
			})))
		);
		this.availableVsts$ = this.store.select(ManualState.getCurrentLayer).pipe(
			map(layer => layer.availableVstIds)
		);
		this.currentPresetId$ = this.store.select(PresetSessionState.getCurrentPreset).pipe(map(p => p ? p.id : null));

		// todo remove
		this.currentCategory$.subscribe(() => { console.log('--- !!!! CURRENT CATEGORY CHANGED !!!'); })
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
			if (!result) {
				return;
			}
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


	openAddPresetDialog(categoryId: string | null) {
		const dialogRef = this.dialog.open(NamedEntityDialogComponent, {
			width: '260px',
			data: <NamedEntityDialogData>{
				id: null,
				name: null,
				phrase: 'Select preset name:'
			}
		});

		dialogRef.afterClosed().subscribe((result: NamedEntityDialogData) => {
			if (!result) {
				return;
			}
			const id = uuid();
			this.store.dispatch(new AddPresetAction(<Preset>{
				id: id,
				name: result.name,
				vstId: null,
				initStrategy: null,
				parameterMappingGroupId: null,
				paramValues: { },
				effectParamValues: { }
			}));
			this.store.dispatch(new AddPresetToCategoryAction(id, this.store.selectSnapshot(PresetCategoryState.getCurrent).id));
		});
	}

	handleCategorySorting($event: CdkDragDrop<string[]>) {
		this.store.dispatch(new MovePresetCategoryAction($event.previousIndex, $event.currentIndex));
	}

	handlePresetSorting($event: CdkDragDrop<string[]>) {
		this.store.dispatch(
			new MovePresetAction($event.previousIndex, $event.currentIndex, this.store.selectSnapshot(PresetCategoryState.getCurrent).id)
		);
	}

	openPresetDetail() {
		this.router.navigate(['/presets/detail']);
	}

	selectPreset(id: string) {
		this.store.dispatch(new SelectPresetAction(id));
	}
}
