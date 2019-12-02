import {Injectable} from '@angular/core';
import {Select, Store} from '@ngxs/store';
import {LayoutState} from '../../../shared/layout/state/layout.state';
import {Observable} from 'rxjs';
import {BiduleLayout, BiduleLayoutParser, EffectDefinition, InstrumentDefinition} from './layout-parser';
import {AddVSTAction} from '../../../shared/vst/state/vst.actions';
import {Instrument} from '../../../shared/vst/model/instrument';
import {Effect} from '../../../shared/vst/model/effect';
import {VST} from '../../../shared/vst/model/vst';
import {AddLayerAction, AddManualAction} from '../../../shared/manual/state/manual.actions';
import {SetAvailableGlobalEffectsAction} from '../../../shared/bidule/state/bidule.actions';
import {SelectLayerAction} from '../../../shared/session/state/session.actions';

// This service read bidule layout and imports all information from it to the app
@Injectable({
	providedIn: 'root'
})
export class BiduleLayoutReader {

	@Select(LayoutState.getActiveLayoutId)
	protected activeLayoutId$: Observable<string|null>;

	constructor(protected store: Store) {

		this.activeLayoutId$.subscribe((layoutId) => {
			console.log('ACTIVE layout id is ' + layoutId);
			const layout = this.store.selectSnapshot(LayoutState.getById)(layoutId);
			if (layout !== null) {
				BiduleLayoutParser.loadFile(layout.biduleFile).then((biduleLayout: BiduleLayout) => {
					for (const vstDefinition of biduleLayout.vstDefinitions) {
						let vst: VST = null;
						if (vstDefinition instanceof InstrumentDefinition) {
							const instrument: Instrument = {
								type: 'instrument',
								id: vstDefinition.id,
								name: vstDefinition.name,
								defaultParamMappingGroupId: null,
								paramMappingGroups: { },
								paramMappingGroupIds: [],
								snapshot: null
							};
							vst = instrument;
						} else if (vstDefinition instanceof EffectDefinition) {
							const effect: Effect = {
								type: 'effect',
								id: vstDefinition.id,
								name: vstDefinition.name,
								mainParamMappingId: null,
								paramMappingPage: {ids: [], mappings: {}},
								placement: vstDefinition.placement,
								snapshot: null
							};
							vst = effect;
						}
						if (vst) {
							console.log('NEW VST');
							console.log(vst);
							store.dispatch(new AddVSTAction(
								vst
							));
						}
					}
					for (const manualDefinition of biduleLayout.manualDefinitions) {
						const manualId = manualDefinition.id.toString();
						console.log('ADD MANUAL ' + manualId);
						store.dispatch(new AddManualAction(manualId, manualDefinition.id + 1, manualDefinition.name));
						for (const layerDefinition of manualDefinition.layers) {
							const layerId = manualId + '-' + layerDefinition.id.toString();
							console.log('ADD LAYER ' + layerId);
							store.dispatch(new AddLayerAction(layerId, layerDefinition.name, manualId, layerDefinition.vstIds, layerDefinition.id + 1));
						}
					}
					store.dispatch(new SetAvailableGlobalEffectsAction(biduleLayout.globalEffectIds));
					this.store.dispatch(new SelectLayerAction('0-0'));  // default layer
				});
			}
		});
	}
}