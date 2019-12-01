import {defaultEntityState, EntityStateModel} from '../../ngxs/entity/state-model';
import {Action, Selector, State, StateContext, StateOperator} from '@ngxs/store';
import {Preset, PresetCategory} from '../model/model';
import {AddEntityActionDecl, MoveEntityActionDecl, SaveEntityActionDecl, UpdateEntityActionDecl} from '../../ngxs/entity/actions';
import {addEntity, moveEntity, saveEntity, updateEntity} from '../../ngxs/entity/state-operators';
import {
	AddPresetCategoryAction, AddPresetToCategoryAction, AddPresetToCategoryActionDecl, MovePresetAction, MovePresetActionDecl,
	MovePresetCategoryAction,
	UpdatePresetCategoryAction
} from './preset-category.actions';
import {SessionState} from '../../session/state/session.state';
import {moveItemInArray} from '@angular/cdk/drag-drop';
import {AddPresetAction} from './preset.actions';

export interface PresetCategoryStateModel extends EntityStateModel<PresetCategory> {
}

@State<PresetCategoryStateModel>({
	name: 'presetCategory',
	defaults: defaultEntityState<PresetCategory>()
})
export class PresetCategoryState {

	@Selector()
	public static getById(state: PresetCategoryStateModel): (id: string) => PresetCategory|null {
		return (id: string) => {
			return id in state.entities ? state.entities[id] : null;
		};
	}

	@Selector()
	public static getAll(state: PresetCategoryStateModel) {
		return state.ids.map(id => state.entities[id]);
	}

	@Selector()
	public static getIds(state: PresetCategoryStateModel) {
		return state.ids;
	}

	@Selector()
	public static getState(state: PresetCategoryStateModel) {
		return state;
	}

	@Selector([SessionState.getCurrentPresetCategoryId])
	public static getCurrent(state: PresetCategoryStateModel, id: string): PresetCategory|null {
		if (!id) {
			return null;
		}
		return this.getById(state)(id);
	}

	@Action({type: UpdatePresetCategoryAction.type})
	public update(ctx: StateContext<PresetCategoryStateModel>, action: UpdateEntityActionDecl<PresetCategory>) {
		ctx.setState(
			<StateOperator<PresetCategoryStateModel>>updateEntity(
				action.entity
			)
		);
	}

	@Action({type: AddPresetCategoryAction.type})
	public add(ctx: StateContext<PresetCategoryStateModel>, action: AddEntityActionDecl<PresetCategory>) {
		ctx.setState(
			<StateOperator<PresetCategoryStateModel>>addEntity(
				action.entity
			)
		);
	}

	@Action({type: MovePresetCategoryAction.type})
	public move(ctx: StateContext<PresetCategoryStateModel>, action: MoveEntityActionDecl<PresetCategory>) {
		ctx.setState(
			<StateOperator<PresetCategoryStateModel>>moveEntity(
				action.oldIndex, action.newIndex
			)
		);
	}

	@Action({type: MovePresetAction.type})
	public movePreset(ctx: StateContext<PresetCategoryStateModel>, action: MovePresetActionDecl) {
		const state = ctx.getState();
		if (state.ids.indexOf(action.categoryId) === -1) {
			return;
		}
		const entities = state.entities;
		const presetIds = entities[action.categoryId].presetIds;
		moveItemInArray(presetIds, action.oldIndex, action.newIndex);
		entities[action.categoryId] = {
			... entities[action.categoryId],
			presetIds: presetIds
		};
		ctx.patchState({
			entities: entities
		});
	}

	@Action({type: AddPresetToCategoryAction.type})
	public addPreset(ctx: StateContext<PresetCategoryStateModel>, action: AddPresetToCategoryActionDecl) {
		const state = ctx.getState();
		if (state.ids.indexOf(action.categoryId) === -1) {
			return;
		}
		const entities = state.entities;
		const presetIds = entities[action.categoryId].presetIds;
		presetIds.push(action.presetId);
		entities[action.categoryId] = {
			... entities[action.categoryId],
			presetIds: presetIds
		};
		ctx.patchState({
			entities: entities
		});
	}

}