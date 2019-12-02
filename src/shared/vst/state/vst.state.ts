import {State, Action, Selector, StateContext, StateOperator, Store} from '@ngxs/store';
import {VST} from '../model/VST';
import {addEntity, updateEntity} from '../../ngxs/entity/state-operators';
import {defaultEntityState, EntityStateModel} from '../../ngxs/entity/state-model';
import {AddEntityActionDecl, RemoveEntityActionDecl, UpdateEntityActionDecl} from '../../ngxs/entity/actions';
import {AddVSTAction, PatchVstAction, SaveEffectParamMappingPageAction, SaveEffectParamMappingPageActionDecl} from './vst.actions';
import {Effect} from '../model/effect';
import {Navigate} from '@ngxs/router-plugin';
import {RemoveParamMappingAction} from '../../paramMapping/state/paramMappingPage.actions';

export interface VSTStateModel extends EntityStateModel<VST> {
}

@State<VSTStateModel>({
	name: 'VST',
	defaults: Object.assign(
		defaultEntityState<VST>(), {
		}
	)
})
export class VSTState {

	constructor(protected store: Store) { }

	@Selector()
	public static getState(state: VSTStateModel) {
		return state;
	}

	@Selector()
	public static getEntities(state: VSTStateModel) {
		return state.entities;
	}

	@Selector()
	public static getInstruments(state: VSTStateModel) {
		return state.ids.map(id => state.entities[id]).filter((vst) => {
			return vst.type === 'instrument';
		});
	}

	@Selector()
	public static getEffects(state: VSTStateModel): Effect[] {
		return <Effect[]> state.ids.map(id => state.entities[id]).filter((vst) => {
			return vst.type === 'effect';
		});
	}

	@Selector()
	public static getVstById(state: VSTStateModel) {
		return (id: string) => {
			return id in state.entities ? state.entities[id] : null;
		};
	}

	@Action({type: AddVSTAction.type})
	public add(ctx: StateContext<VSTStateModel>, action: AddEntityActionDecl<VST>) {
		ctx.setState(
			<StateOperator<VSTStateModel>>addEntity(
				action.entity
			)
		);
	}

	@Action({type: PatchVstAction.type})
	public update(ctx: StateContext<VSTStateModel>, action: UpdateEntityActionDecl<VST>) {
		ctx.setState(
			<StateOperator<VSTStateModel>>updateEntity(
				action.entity
			)
		);
	}

	@Action({type: SaveEffectParamMappingPageAction.type})
	public saveEffectParamMapping(ctx: StateContext<VSTStateModel>, action: SaveEffectParamMappingPageActionDecl) {
		ctx.setState(
			<StateOperator<VSTStateModel>>updateEntity(
				<Effect>{
					id: action.effectId,
					paramMappingPage: action.paramMappingPage
				}
			)
		);
		this.store.dispatch(new Navigate(['/effects']));
	}

	@Action({type: RemoveParamMappingAction.type})
	public removeParamMapping(ctx: StateContext<VSTStateModel>, action: RemoveEntityActionDecl) {
		const state = ctx.getState();
		let updated: Effect|null = null;

		state.ids.forEach(vstId => {
			if ((<Effect>state.entities[vstId]).mainParamMappingId === action.id) {
				updated = <Effect>state.entities[vstId];
			}
		});

		if (updated) {
			const obj = {};
			obj[updated.id] = {
				...updated,
				mainParamMappingId: updated && updated.paramMappingPage && updated.paramMappingPage.ids.length ? updated.paramMappingPage.ids[0] : null
			};
			ctx.patchState({
				entities: {
					...state.entities,
					...obj
				}
			});
		}
	}
}