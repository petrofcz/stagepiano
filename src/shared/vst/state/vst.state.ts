import {State, Action, Selector, StateContext, StateOperator, Store} from '@ngxs/store';
import {VST} from '../model/VST';
import {addEntity, updateEntity} from '../../ngxs/entity/state-operators';
import {defaultEntityState, EntityStateModel} from '../../ngxs/entity/state-model';
import {AddEntityActionDecl, RemoveEntityActionDecl, UpdateEntityActionDecl} from '../../ngxs/entity/actions';
import {
	AddVSTAction, PatchMappingGroupAction, PatchMappingGroupActionDecl,
	PatchVstAction,
	RemoveMappingGroupAction, RemoveMappingGroupActionDecl,
	SaveEffectParamMappingPageAction,
	SaveEffectParamMappingPageActionDecl
} from './vst.actions';
import {Effect} from '../model/effect';
import {Navigate} from '@ngxs/router-plugin';
import {RemoveParamMappingAction} from '../../paramMapping/state/paramMappingPage.actions';
import {Instrument} from '../model/instrument';
import {ParamMappingGroup, ParamMappingPage} from '../../paramMapping/model/model';

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
	static getVsts(state: VSTStateModel): VST[] {
		return state.ids.map(id => state.entities[id]);
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

	@Action({type: RemoveMappingGroupAction.type})
	public removeParamMappingGroup(ctx: StateContext<VSTStateModel>, action: RemoveMappingGroupActionDecl) {
		const state = ctx.getState();
		if (action.instrumentId in state.entities && state.entities[action.instrumentId].type === 'instrument') {
			ctx.patchState({
				entities: {
					...state.entities,
					[action.instrumentId]: <Instrument>{
						...state.entities[action.instrumentId],
						paramMappingGroupIds: (<Instrument>state.entities[action.instrumentId]).paramMappingGroupIds.filter(id => id !== action.groupId),
						defaultParamMappingGroupId: (<Instrument>state.entities[action.instrumentId]).defaultParamMappingGroupId !== action.groupId ? (<Instrument>state.entities[action.instrumentId]).defaultParamMappingGroupId :
							((<Instrument>state.entities[action.instrumentId]).paramMappingGroupIds.filter(id => id !== action.groupId).pop() || null)
					}
				}
			});
		}
	}

	@Action({type: PatchMappingGroupAction.type})
	public patchParamMappingGroup(ctx: StateContext<VSTStateModel>, action: PatchMappingGroupActionDecl) {
		const state = ctx.getState();
		if (!action.paramMappingGroup.id || !action.instrumentId) {
			return;
		}
		const instrument: Instrument = <Instrument>state.entities[action.instrumentId];
		let entity = action.paramMappingGroup.id in instrument.paramMappingGroups ? instrument.paramMappingGroups[action.paramMappingGroup.id] : <ParamMappingGroup>{
			name: '',
			paramMappingPage: <ParamMappingPage> {
				mappings: {},
				ids: []
			}
		};
		entity = {
			... entity,
			... action.paramMappingGroup
		};
		ctx.patchState({
			entities: {
				... state.entities,
				[action.instrumentId]: <Instrument>{
					... instrument,
					paramMappingGroups: {
						... instrument.paramMappingGroups,
						[entity.id]: entity
					},
					paramMappingGroupIds: instrument.paramMappingGroupIds.indexOf(entity.id) > -1 ? instrument.paramMappingGroupIds : instrument.paramMappingGroupIds.concat([entity.id])
				}
			}
		});
	}

}