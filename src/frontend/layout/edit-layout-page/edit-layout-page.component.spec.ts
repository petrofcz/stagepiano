import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {EditLayoutPageComponent} from './edit-layout-page.component';

describe('EditLayoutPageComponent', () => {
	let component: EditLayoutPageComponent;
	let fixture: ComponentFixture<EditLayoutPageComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [EditLayoutPageComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(EditLayoutPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
