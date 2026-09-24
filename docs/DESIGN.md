# Design Explanation — Flight Tracking & Operations Dashboard

## 1. Architecture

The app follows a **core / features** split typical of mid-size Angular apps:

- **`core/`** holds cross-cutting concerns that don't belong to any one screen: the `Flight` domain model and the `FlightService`. There is exactly one service and one source of truth for flight data — every component reads from it and never talks to the mock JSON file directly.
- **`features/`** holds one folder per screen region (dashboard shell, KPI cards, sidebar, map, details panel). Each is a self-contained Angular component with its own template and SCSS, communicating only through the shared `FlightService`, never through `@Input`/`@Output` chains between siblings. This keeps the map, sidebar and details panel decoupled — any one of them could be reused or dropped without touching the others.

**State management** is intentionally simple and RxJS-native rather than pulling in NgRx, which would be over-engineering for a dataset this size: `FlightService` exposes a `BehaviorSubject` for the raw flight list, one for the active filters, and one for the selected flight ID. `filteredFlights$`, `selectedFlight$` and `kpis$` are derived observables built with `combineLatest`/`map`/`shareReplay`, so the sidebar list, the map markers, the KPI cards and the details panel all reactively re-render off the same three pieces of state without manual change-detection wiring.

**Routing** is used for one meaningful reason beyond ticking the "routing" box: selecting a flight updates the URL to `/flight/:id` (via `replaceUrl`, so it doesn't spam browser history), so a specific flight view is bookmarkable/shareable, and loading `/flight/:id` directly pre-selects that flight on load.

## 2. UI/UX decisions

**The map is the primary focus**, as required. It occupies the largest, center column of the grid; the sidebar (list/search/filters) and details panel are narrower flanking columns so operators' eyes land on the map first, consistent with how real ops-center displays (ATC, ground control) are laid out.

**Dark theme by default.** Aviation ops centers are typically dimly lit rooms with large displays; a dark, low-glare palette with a single blue accent and semantic status colors (green/amber/blue/purple for Active/Delayed/Arrived/Scheduled) reduces eye strain and lets the status colors — the thing operators actually need to scan for — pop instead of competing with a busy light UI. The same four status colors are used consistently across the KPI cards, status pills, map markers, map legend and route lines, so an operator only has to learn the color code once.

**Status affordance repetition.** Rather than relying on color alone (an accessibility concern), each status also has a text label everywhere it appears (KPI card label, list item pill, popup, details panel), and the plane marker's color is paired with its rotation (heading), so even a colorblind operator can distinguish flights by reading the pill text or hovering the marker.

**Progressive disclosure for flight detail.** The map and list show only what's needed to scan quickly (callsign, route, status); clicking a flight — from either the map marker or the sidebar list — reveals the full detail panel with departure/arrival times, aircraft type, altitude and speed, and simultaneously draws the route and flies the map to it. This keeps the default view uncluttered while making deep information one click away, and keeps map and list in sync (selecting from either updates both).

**Search + filters use Reactive Forms with a debounced `valueChanges` stream** (150ms) rather than an explicit "Apply" button, since aviation ops filtering is typically exploratory ("show me delayed flights out of ORD") and instant feedback is more useful than an extra click. Filters and search are combined via `combineLatest`, so any combination (e.g., "search + status + origin") narrows results predictably.

**Responsiveness.** Desktop keeps the three-pane layout. Tablet width collapses the details panel to a strip beneath the sidebar+map row (still visible, since ops staff on a tablet in the field still need flight detail without losing the map). Below ~820px the layout stacks vertically as list → map → detail, prioritizing the flight list first since a narrow/mobile view is more likely used for lookup than live monitoring.

## 3. Data model

Mock flights (`assets/data/mock-flights.json`) are generated with real airport coordinates (JFK, LAX, LHR, DXB, HND, SIN, SYD, etc.) rather than random lat/lngs, so routes and the map look plausible rather than obviously synthetic. Each flight's `currentPosition` is interpolated along its origin→destination line at a fraction appropriate to its status (0% for Scheduled, 100% for Arrived, a random point along the route for Active/Delayed), and a `heading` is computed via bearing so the plane icon on the map points the correct direction — this was worth doing because a static, un-rotated icon set would look obviously fake to anyone evaluating UI polish.

## 4. What I'd add with more time

- Live position animation (bonus feature): interpolate `currentPosition` on a timer to visibly "fly" active flights between updates.
- Marker clustering for denser flight sets.
- Persisted filter state (e.g., in the URL as query params) so a filtered view is also shareable, not just a selected flight.
- Unit tests for `FlightService`'s filter/KPI derivations, which are the highest-value logic to cover since every other component depends on them.
