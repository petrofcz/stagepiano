import {defaultEntityState, EntityStateModel} from '../../ngxs/entity/state-model';
import {Action, Selector, State, StateContext, StateOperator} from '@ngxs/store';
import {PresetCategory} from '../model/model';
import {LayoutStateModel} from '../../layout/state/layout.state';
import {SaveLayoutAction} from '../../layout/state/layout.actions';
import {MoveEntityActionDecl, SaveEntityActionDecl} from '../../ngxs/entity/actions';
import {Layout} from '../../layout/model/layout';
import {moveEntity, saveEntity} from '../../ngxs/entity/state-operators';
import {MovePresetCategoryAction, SavePresetCategoryAction} from './preset-category.actions';
import {SessionState, SessionStateModel} from '../../session/state/session.state';

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

	@Action({type: SavePresetCategoryAction.type})
	public save(ctx: StateContext<PresetCategoryStateModel>, action: SaveEntityActionDecl<PresetCategory>) {
		ctx.setState(
			<StateOperator<PresetCategoryStateModel>>saveEntity(
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

}