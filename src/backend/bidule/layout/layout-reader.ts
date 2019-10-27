import {Injectable} from '@angular/core';
import {Select, Store} from '@ngxs/store';
import {LayoutState} from '../../../shared/layout/state/layout.state';
import {Observable} from 'rxjs';
import {Layout} from '../../../shared/layout/model/layout';
import {BiduleLayout, BiduleLayoutParser, EffectDefinition, InstrumentDefinition} from './layout-parser';
import {AddVSTAction} from '../../../shared/vst/state/vst.actions';
import {Instrument} from '../../../shared/vst/model/instrument';
import {Effect} from '../../../shared/vst/model/effect';
import {VST} from '../../../shared/vst/model/vst';
import {AddLayerAction, AddManualAction} from '../../../shared/manual/state/manual.actions';
import {ResetLayoutAction} from '../../../shared/layout/state/layout.actions';
import {SetAvailableGlobalEffectsAction} from '../../../shared/bidule/bidule.actions';

// This service read bidule layout and imports all information from it to the app
@Injectable({
	providedIn: 'root'
})
export class BiduleLayoutReader {

	@Select(LayoutState.getActiveLayoutId)
	protected activeLayoutId$: Observable<string|null>;

	constructor(protected store: Store) {

		this.activeLayoutId$.subscribe((layoutId) => {
			const layout = this.store.selectSnapshot(LayoutState.getById)(layoutId);

			if (layout !== null) {
				store.dispatch(new ResetLayoutAction());
				BiduleLayoutParser.loadFile(layout.biduleFile).then((biduleLayout: BiduleLayout) => {
					for (const vstDefinition of biduleLayout.vstDefinitions) {
						let vst: VST = null;
						if (vstDefinition instanceof InstrumentDefinition) {
							const instrument: Instrument = {
								type: 'instrument',
								id: vstDefinition.id,
								name: vstDefinition.name,
								defaultParamMappingRecordId: null,
								paramMappingRecords: []
							};
							vst = instrument;
						} else if (vstDefinition instanceof EffectDefinition) {
							const effect: Effect = {
								type: 'effect',
								id: vstDefinition.id,
								name: vstDefinition.name,
								mainParamMappingId: null,
								paramMappings: [],
								placement: vstDefinition.placement
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
						store.dispatch(new AddManualAction(manualId, manualDefinition.name));
						for (const layerDefinition of manualDefinition.layers) {
							const layerId = manualId + '-' + layerDefinition.id.toString();
							store.dispatch(new AddLayerAction(layerId, layerDefinition.name, manualId, layerDefinition.vstIds));
						}
					}
					store.dispatch(new SetAvailableGlobalEffectsAction(biduleLayout.globalEffectIds));
				});
			}
		});
	}
}