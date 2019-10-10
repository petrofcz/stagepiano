import {State, Action, Selector, StateContext, StateOperator} from '@ngxs/store';
import {Layout} from '../model/layout';
import {
	SaveLayoutAction,
	SelectLayoutAction,
	SelectLayoutActionDecl,
	SetLayoutLoadingAction,
	SetLayoutLoadingActionDecl
} from './layout.actions';
import {saveEntity} from '../../ngxs/entity/state-operators';
import {defaultEntityState, EntityStateModel} from '../../ngxs/entity/state-model';
import {SaveEntityActionDecl} from '../../ngxs/entity/actions';

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
	public static getById(state: LayoutStateModel) {
		return (id: string) => {
			return id in state.entities ? state.entities[id] : null;
		};
	}

	@Selector()
	public static getAll(state: LayoutStateModel) {
		return state.ids.map(id => state.entities[id]);
	}

	@Selector()
	public static getState(state: LayoutStateModel) {
		return state;
	}

	@Action({type: SaveLayoutAction.type})
	public update(ctx: StateContext<LayoutStateModel>, action: SaveEntityActionDecl<Layout>) {
		ctx.setState(
			<StateOperator<LayoutStateModel>>saveEntity(
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