import {actionMatcher, getActionTypeFromInstance} from '@ngxs/store';

export class ActionTester {

	protected matcher;

	constructor(protected action) {
		this.matcher = actionMatcher(action);
	}

	public matches(action) {
		return this.action.type === action.type || this.matcher(action);
	}

}