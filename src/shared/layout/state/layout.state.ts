import {State, Action, Selector, StateContext, StateOperator} from '@ngxs/store';
import {Layout} from '../model/layout';
import {
	SaveLayoutAction,
	SelectLayoutAction,
	SelectLayoutActionDecl,
	SetLayoutLoadingAction,
	SetLayoutLoadingActionDecl, UpdateLayoutAction
} from './layout.actions';
import {saveEntity, updateEntity} from '../../ngxs/entity/state-operators';
import {defaultEntityState, EntityStateModel} from '../../ngxs/entity/state-model';
import {SaveEntityActionDecl, UpdateEntityActionDecl} from '../../ngxs/entity/actions';

export interface LayoutStateModel extends EntityStateModel<Layout> {
	active?: string;
	loading: boolean;
}

@State<LayoutStateModel>({
	name: 'layout',
	defaults: Object.assign(
		defaultEntityState<Layout>(), {
			active: null,
			loading: false
		}
	)
})
export class LayoutState {

	@Selector()
	public static isLayoutSelected(state: LayoutStateModel): boolean {
		return state.active !== null;
	}

	@Selector()
	public static isLayoutNotSelected(state: LayoutStateModel): boolean {
		return state.active === null;
	}

	@Selector()
	public static isLayoutLoading(state: LayoutStateModel): boolean {
		return state.active !== null && state.loading === true;
	}

	@Selector()
	public static isLayoutLoaded(state: LayoutStateModel): boolean {
		return state.loading === false && state.active !== null;
	}

	@Selector()
	public static getActiveLayout(state: LayoutStateModel): Layout|null {
		return state.active === null ? null : state.entities[state.active];
	}

	@Selector()
	public static getActiveLayoutId(state: LayoutStateModel): string|null {
		return state.active;
	}

	@Selector()
	public static getById(state: LayoutStateModel) {
		return (id: string) => {
			return id in state.entities ? state.entities[id] : null;
		};
	}

	@Selector()
	public static getAll(state: LayoutStateModel) {
		return state.ids.map(id => state.entities[id]).sort((a, b) => {
			return (b.lastOpened || 0) - (a.lastOpened || 0);
		});
	}

	@Selector()
	public static getState(state: LayoutStateModel) {
		return state;
	}

	@Action({type: SaveLayoutAction.type})
	public save(ctx: StateContext<LayoutStateModel>, action: SaveEntityActionDecl<Layout>) {
		ctx.setState(
			<StateOperator<LayoutStateModel>>saveEntity(
				action.entity
			)
		);
	}

	@Action({type: UpdateLayoutAction.type})
	public update(ctx: StateContext<LayoutStateModel>, action: UpdateEntityActionDecl<Layout>) {
		ctx.setState(
			<StateOperator<LayoutStateModel>>updateEntity(
				action.entity
			)
		);
	}

	@Action({type: SetLayoutLoadingAction.type})
	public setLoading(ctx: StateContext<LayoutStateModel>, action: SetLayoutLoadingActionDecl) {
		ctx.patchState({
			loading: action.loading
		});
	}

}