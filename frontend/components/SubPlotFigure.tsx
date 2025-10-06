"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";

// 👇 TypeScript doesn’t have types for react-plotly.js, so ignore type checking for this import.
 // This keeps Docker/Next.js build happy

const Plot: any = dynamic(() => import("react-plotly.js"), { ssr: false });

export default function SubplotFigure({
  plots,
  title,
}: {
  plots: any;
  title: string;
}) {
  const subplots = plots.subplots ?? [];

  // Dark theme styling
  const BACKGROUND = "#0a0a0a";
  const AXIS_TEXT = "#e5e5e5";
  const AXIS_LINE = "#333333";

  // Default color palette
  const PALETTE = [
    "#4ADE80", // green
    "#60A5FA", // blue
    "#FBBF24", // amber
    "#F87171", // red
    "#A78BFA", // violet
    "#34D399", // teal
    "#F472B6", // pink
  ];

  // Force resize after mount to fill available width
  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full flex flex-col space-y-6">
      <h2 className="text-xl font-semibold text-white">{title}</h2>

      {subplots.map((sub: any) => {
        const traces: any[] = [];

        // Build traces
        (sub.series ?? []).forEach((s: any, idx: number) => {
          let color = PALETTE[idx % PALETTE.length];

          // 🔵 Highlight humidity & transpiration
          if (
            s.label?.toLowerCase().includes("humidity") ||
            s.label?.toLowerCase().includes("transpiration") ||
            s.key?.toLowerCase().includes("humidity") ||
            s.key?.toLowerCase().includes("transpiration") ||
            s.key?.toLowerCase().includes("e_mmd")
          ) {
            color = "#00BFFF"; // bright blue
          }

          // 🔴 Highlight soil variables
          if (
            s.label?.toLowerCase().includes("soil") ||
            s.key_prefix?.includes("soil") ||
            s.key?.toLowerCase().includes("soil")
          ) {
            color = "#FF4D4D"; // red
          }

          if (s.key_prefix && plots[s.key_prefix]) {
            Object.entries(plots[s.key_prefix]).forEach(
              ([z, vals]: [string, number[]]) => {
                traces.push({
                  x: plots.doy ?? plots.t,
                  y: vals,
                  type: s.type || "scatter",
                  mode: "lines",
                  name: `${s.label} ${z}`,
                  line: { color, width: 2, opacity: s.alpha ?? 1.0 },
                });
              }
            );
          } else {
            traces.push({
              x: plots.doy ?? plots.t,
              y: plots[s.key],
              type: s.type || "scatter",
              mode: "lines",
              name: s.label,
              line: { color, width: 2, opacity: s.alpha ?? 1.0 },
            });
          }
        });

        // Secondary y-axis (precipitation, etc.)
        if (sub.secondary_yaxis && plots[sub.secondary_yaxis.key]) {
          const isPrecip =
            sub.secondary_yaxis.label?.toLowerCase().includes("precip") ||
            sub.secondary_yaxis.key?.toLowerCase().includes("precip");
          traces.push({
            x: plots.doy ?? plots.t,
            y: plots[sub.secondary_yaxis.key],
            type: sub.secondary_yaxis.type || "bar",
            name: sub.secondary_yaxis.label,
            yaxis: "y2",
            marker: { color: isPrecip ? "#3AB4FF" : "#999", opacity: 0.5 },
          });
        }

        const annotations = (sub.annotations ?? []).map((a: any) => ({
          text: a.text,
          xref: "paper",
          yref: "paper",
          x: a.x,
          y: a.y,
          showarrow: false,
          font: { size: 12, color: AXIS_TEXT },
          xanchor: a.anchor?.includes("right") ? "right" : "left",
          yanchor: a.anchor?.includes("bottom") ? "bottom" : "top",
        }));

        return (
          <div
            key={sub.id}
            className="w-full"
            style={{ minHeight: 400, overflow: "visible" }}
          >
            <Plot
              data={traces}
              layout={{
                title: {
                  text: sub.title,
                  font: { size: 16, color: AXIS_TEXT },
                },
                autosize: true,
                width: undefined,
                height: 400,
                margin: { l: 60, r: 60, t: 40, b: 40 },
                showlegend: true,
                legend: {
                  font: { color: AXIS_TEXT, size: 10 },
                  bgcolor: "rgba(0,0,0,0)",
                },
                paper_bgcolor: BACKGROUND,
                plot_bgcolor: BACKGROUND,
                xaxis: {
                  title: sub.xlabel ?? "Day of Year",
                  showgrid: false,
                  color: AXIS_TEXT,
                  linecolor: AXIS_LINE,
                  mirror: true,
                },
                yaxis: {
                  title: sub.yaxis_label,
                  range: sub.ylim,
                  showgrid: false,
                  color: AXIS_TEXT,
                  linecolor: AXIS_LINE,
                  mirror: true,
                },
                ...(sub.secondary_yaxis && {
                  yaxis2: {
                    title: sub.secondary_yaxis.label,
                    overlaying: "y",
                    side: "right",
                    showgrid: false,
                    color: "#00BFFF", // blue for precipitation axis
                    linecolor: "#00BFFF",
                  },
                }),
                annotations,
              }}
              config={{
                responsive: true,
                displayModeBar: false,
              }}
              useResizeHandler={true}
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        );
      })}
    </div>
  );
}
