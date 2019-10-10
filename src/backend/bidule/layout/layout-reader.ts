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

@Injectable({
	providedIn: 'root'
})
export class BiduleLayoutReader {

	@Select(LayoutState.getActiveLayout)
	protected activeLayout$: Observable<Layout>;

	constructor(protected store: Store) {

		this.activeLayout$.subscribe((layout) => {
			if (layout !== null) {
				BiduleLayoutParser.loadFile(layout.biduleFile).then((biduleLayout: BiduleLayout) => {
console.log(biduleLayout);
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
				});
			}
		});
	}
}