import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {LayoutListPageComponent} from './layout-list-page.component';

describe('LayoutListPageComponent', () => {
	let component: LayoutListPageComponent;
	let fixture: ComponentFixture<LayoutListPageComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [LayoutListPageComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(LayoutListPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
