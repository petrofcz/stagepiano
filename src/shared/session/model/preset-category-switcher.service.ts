import {Actions, InitState, Store} from '@ngxs/store';
import {Injectable} from '@angular/core';
import {SelectPresetAction} from '../../preset/state/presetSession.actions';
import {FileStateStorage} from '../../../backend/electron/file-state-storage';
import {ActionTester} from '../../ngxs/helper';
import {combineLatest} from 'rxjs';
import {PresetCategoryState} from '../../preset/state/preset-category.state';
import {PresetSessionState} from '../../preset/state/presetSession.state';
import {debounceTime, distinctUntilChanged, map, withLatestFrom} from 'rxjs/operators';
import {SessionState} from '../state/session.state';
import {PresetCategory} from '../../preset/model/model';
import {SelectPresetCategoryAction} from '../state/session.actions';

@Injectable({
	providedIn: 'root'
})
export class PresetCategorySwitcherService {
	constructor(private store: Store) {
		store.select(PresetSessionState.getCurrentPreset)
			.pipe(
				withLatestFrom(store.select(PresetCategoryState.getCurrent))
			)
			.pipe(debounceTime(20))
			.pipe(map(([currentPreset, currentCategory]) => {
				return currentCategory && currentPreset ? {
					currentPresetId: currentPreset.id,
					categoryPresetIds: currentCategory.presetIds
				} : null;
			}))
			.pipe(distinctUntilChanged())
			.subscribe(data => {
				if (!data) {
					return;
				}
				if (data.categoryPresetIds.indexOf(data.currentPresetId) === -1) {
					let foundCategory: PresetCategory|null = null;
					this.store.selectSnapshot(PresetCategoryState.getAll)
						.forEach(category => {
							foundCategory = category;
						});
					if (foundCategory) {
						this.store.dispatch(
							new SelectPresetCategoryAction(foundCategory.id)
						);
					}
				}
			});
	}
}