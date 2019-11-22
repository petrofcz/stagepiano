import {Injectable} from '@angular/core';
import {Actions} from '@ngxs/store';
import {ActionTester} from '../../../../shared/ngxs/helper';
import {SendOscMessageAction, SendOscMessageActionDecl} from '../../../../shared/bidule/state/bidule.actions';
import {OscService} from '../../../osc/osc.service';
import {OscMessage} from '../../../osc/osc.message';

@Injectable({
	providedIn: 'root'
})
export class BiduleOscTransmitter {
	constructor(private osc: OscService, private actions$: Actions) {
		this.actions$.subscribe((val) => {
			if (val.status === 'SUCCESSFUL' && 'action' in val) {
				const actionTester = new ActionTester(val['action']);
				if (actionTester.matches(SendOscMessageAction)) {
					const action: SendOscMessageActionDecl = val.action;
					osc.send(new OscMessage(
						action.address, action.args
					));
				}
			}
		});
	}
}