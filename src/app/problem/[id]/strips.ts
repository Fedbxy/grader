// The strip at the top of each workspace pane. Every pane uses the same
// height, so the strips line up across the divider, and the same 12px inset
// as the rest of the code pane.
export const TOOLBAR = "flex h-11 shrink-0 items-center gap-2 border-b px-3";

// The statement side's strip: md:px-4.5 plus a tab's own padding puts the
// first tab on the page header's 24px edge.
export const TAB_TOOLBAR = `${TOOLBAR} md:px-4.5`;
