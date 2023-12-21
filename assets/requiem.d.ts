type requiem = Folder & {
	occlusion: ScreenGui & {
		grid: Frame & {
			UIGridLayout: UIGridLayout;
		};
	};
	Actor: Actor & {
		Core: LocalScript;
		Event: BindableEvent;
	};
}
