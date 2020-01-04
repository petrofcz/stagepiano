import {OscService} from '../../osc/osc.service';
import {SnapshotPresetInitStrategy} from '../../../shared/preset/model/model';
import {Layer} from '../../../shared/manual/model/layer';
import {OscMessage} from '../../osc/osc.message';
import {BiduleOscHelper} from '../../../shared/bidule/osc/bidule-osc-helper';
import {Injectable} from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class SnapshotInitStrategyHandlerService {
	constructor(protected osc: OscService) { }

	public handle(strategy: SnapshotPresetInitStrategy, layer: Layer, instrumentId: string) {
		if (strategy.paramValues) {
			for (const key in strategy.paramValues) {
				this.osc.send(new OscMessage(
					BiduleOscHelper.getLocalVstPrefix(layer) + instrumentId + '/' + key, strategy.paramValues[key]
				));
			}
		}
	}
}