This is the web interface for the [DAESIMWeb](https://github.com/NortonAlex/DAESIM) python package.



## Deployment

Prior to running this, start the the caddy container in [borevitz_projects_caddy](https://github.com/thestochasticman/borevitz_projects_caddy)

make sure the the network 'edge' has been created. 

```
sudo docker network ls --filter name=^edge$ --format '{{.Name}}'
[sudo] password for yasar: 
edge
```
If not created(You dont get 'edge' as an output)
```
sudo docker network create edge
```
Then build the containers

```
sudo docker compose build frontend
sudo docker compose build frontend
```

Start the containers
```
sudo docker compose up backend

sudo docker compose up frontend
```

View the website on http://130.56.246.157/DAESIM


## Frontend

## App Router Pages

### `app/layout.tsx`
**Role**: Global HTML shell shared by all pages.  

---

### `app/page.tsx` — Home
**Role**: Landing page and entry point to results browsing.  
**Renders**: project summary, shortcuts to **Results**, optionally a “recent items” widget.  
**Navigation**: links/CTAs route to `/results`.  
**Empty/Loading/Error**: typically static; if a “recent” widget exists, it must handle all three states.  
**Test**: responsive layout, accessible headings, links work with keyboard/reader.

---

### `app/results/page.tsx` — Results List
**Role**: Browse and find completed runs to view.  
**Renders**: a searchable/filterable list (table or cards) of runs with:  
- Identifier/Code  
- Status (Queued, Running, Done, Failed)  
- Start/Finish timestamps  
- Key metrics that the API exposes for quick scanning (e.g., error, yield)  

**Controls**: text search, date range, status filter, pagination or infinite scroll.  
**Data**: `GET /api/runs` with query params.  
**States**: loading skeleton, empty state with guidance, inline error with retry.  
**Interaction**: clicking a row/card routes to `/results/[runId]`.  
**Accessibility**: table roles/headers, focus rings, “enter to open” support.  
**Performance**: row virtualization for large datasets; memoized rows.

---

### `app/results/[runId]/page.tsx` — Run Detail
**Role**: Inspect a single run’s data.  
**Renders**:  
- **Summary cards**: core metrics (e.g., error, yield if provided), timestamps, status.  
- **Charts**: one or more time‑series visualizations (observed vs modelled series when supplied by the API); optional residuals chart; optional uncertainty bands.  
- **Details**: plain data panels (key‑value), log snippets if available.  
- **Export**: link/button to download a CSV/JSON bundle when the API exposes it.  

**Data**: `GET /api/runs/:id` (primary), optional `GET /api/runs/:id/export`.  
**States**: loading placeholders, empty sections if a series is missing, error blocks with recovery text.  
**Interaction**: legend toggles, drag‑to‑zoom, double‑click reset, tabs (Summary / Charts / Details).  
**Accessibility**: labelled charts/controls; units always shown next to numbers.  
**Performance**: avoid re‑render on hover; debounce window resize; detach heavy listeners on unmount.

---

## Components — Charts (`components/charts/*`)

### `components/charts/TimeSeriesChart.tsx`
**Role**: Generic line chart wrapper.  
**Props (typical)**:  
```ts
series: Array<{ key: string; label: string; values: { t: string|number; y: number }[] }>;
bands?: Array<{ key: string; lower: number[]; upper: number[] }>;
yLabel?: string;
unit?: string;
height?: number;
Behavior: responsive SVG/canvas, zoom/pan, legend toggles

## Shutting Down

```
sudo docker compose down backend

sudo docker compose down frontend 
```