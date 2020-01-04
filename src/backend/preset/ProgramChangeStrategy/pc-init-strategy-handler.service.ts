import {PCPresetInitStrategy} from '../../../shared/preset/model/model';
import {Layer} from '../../../shared/manual/model/layer';
import {OscService} from '../../osc/osc.service';
import {BiduleOscHelper} from '../../../shared/bidule/osc/bidule-osc-helper';
import {Store} from '@ngxs/store';
import {ManualState} from '../../../shared/manual/state/manual.state';
import {Injectable} from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class PcInitStrategyHandlerService {

	constructor(protected osc: OscService, protected store: Store) { }

	public handle(strategy: PCPresetInitStrategy, layer: Layer) {
		const manual = this.store.selectSnapshot(ManualState.getManualById)(layer.manualId);

		if (strategy.program !== null) {
			BiduleOscHelper.sendMidiMessage(
				192 + ((manual.position - 1) * 4) + (layer.position - 1), strategy.program, 0, this.osc
			);
		}
	}
}