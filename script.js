      const DATA_FILE = "HW_III.csv";
      const ITEMS = ["Binder", "Desk", "Pen", "Pen Set", "Pencil"];
      const COLORS = ["#2563EB", "#059669", "#DC2626", "#D97706", "#7C3AED"];

      const CFG = {
        font: "Arial",
        background: "#FFFFFF",
        padding: { left: 8, right: 8, top: 8, bottom: 8 },
        view: { stroke: null },
        axis: {
          labelFont: "Arial",
          titleFont: "Arial",
          labelFontSize: 10.5,
          titleFontSize: 11,
          gridColor: "#EAECF2",
          domainColor: "#DDE1EC",
          tickColor: "#DDE1EC",
          labelColor: "#5A6070",
          titleColor: "#1A1F2E",
          titleFontWeight: 500,
        },
        legend: {
          labelFont: "Arial",
          titleFont: "Arial",
          labelFontSize: 10.5,
          titleFontSize: 11,
          titleFontWeight: 600,
          labelColor: "#5A6070",
          titleColor: "#1A1F2E",
          symbolSize: 80,
          padding: 6,
        },
        title: {
          font: "Arial",
          fontSize: 12,
          fontWeight: 600,
          subtitleFont: "Arial",
          subtitleFontSize: 10,
          subtitleColor: "#9BA3B8",
          color: "#1A1F2E",
          anchor: "start",
          offset: 8,
        },
      };

      function S(extra = {}) {
        return {
          $schema: "https://vega.github.io/schema/vega-lite/v5.json",
          config: CFG,
          ...extra,
        };
      }
      function colorEnc(legend = true) {
        return {
          field: "Item",
          type: "nominal",
          scale: { domain: ITEMS, range: COLORS },
          legend: legend ? { title: "Item", orient: "right" } : null,
        };
      }

      // Chart 1: Donut
      function mkDonut(data) {
        const total = data.reduce((s, r) => s + r.Total, 0);
        return S({
          data: { values: data },
          width: "container",
          height: 280,
          title: {
            text: "Revenue by Sales Representative",
            subtitle: "Hover slice for amount and share",
          },
          transform: [
            {
              aggregate: [{ op: "sum", field: "Total", as: "Rev" }],
              groupby: ["Rep"],
            },
            { calculate: "datum.Rev / " + total + " * 100", as: "Pct" },
          ],
          mark: {
            type: "arc",
            innerRadius: 68,
            outerRadius: 118,
            padAngle: 0.018,
            cornerRadius: 4,
          },
          encoding: {
            theta: { field: "Rev", type: "quantitative", stack: true },
            color: {
              field: "Rep",
              type: "nominal",
              scale: { scheme: "tableau10" },
              legend: { title: "Rep", orient: "right", labelFontSize: 10 },
            },
            tooltip: [
              { field: "Rep", type: "nominal", title: "Rep" },
              {
                field: "Rev",
                type: "quantitative",
                title: "Revenue ($)",
                format: ",.2f",
              },
              {
                field: "Pct",
                type: "quantitative",
                title: "Share (%)",
                format: ".1f",
              },
            ],
          },
        });
      }

      // Chart 2: Streamgraph
      function mkStream(data) {
        return S({
          data: { values: data },
          width: "container",
          height: 280,
          title: {
            text: "Revenue Streamgraph — Total over Time by Item",
            subtitle:
              "Click an item in the legend to highlight it · click again to reset",
          },
          params: [
            {
              name: "streamSel",
              select: { type: "point", fields: ["Item"], on: "pointerover" },
              bind: "legend",
            },
          ],
          mark: { type: "area", interpolate: "monotone", cursor: "pointer" },
          encoding: {
            x: {
              field: "OrderDate",
              type: "temporal",
              timeUnit: "yearmonth",
              axis: { title: null, format: "%b %Y", labelAngle: -30 },
            },
            y: {
              field: "Total",
              type: "quantitative",
              aggregate: "sum",
              stack: "center",
              axis: { title: "Revenue ($)", format: "$.0f" },
            },
            color: colorEnc(true),
            opacity: {
              condition: { param: "streamSel", value: 0.9 },
              value: 0.15,
            },
            tooltip: [
              { field: "Item", type: "nominal" },
              {
                field: "OrderDate",
                type: "temporal",
                timeUnit: "yearmonth",
                title: "Month",
                format: "%b %Y",
              },
              {
                field: "Total",
                type: "quantitative",
                aggregate: "sum",
                title: "Revenue ($)",
                format: ",.2f",
              },
            ],
          },
        });
      }

      // Chart 3: Trellis Histogram with mean overlay
      function mkTrellis(data) {
        return S({
          data: { values: data },
          title: {
            text: "Trellis Histogram — Units per Order by Item",
            subtitle: "Dashed line marks mean · value shown above line",
          },
          columns: 5,
          facet: {
            field: "Item",
            type: "nominal",
            header: {
              labelFontSize: 11,
              labelFontWeight: 600,
              labelColor: "#1A1F2E",
              title: null,
              labelFont: "Arial",
            },
          },
          spec: {
            width: 148,
            height: 148,
            layer: [
              {
                mark: {
                  type: "bar",
                  opacity: 0.78,
                  cornerRadiusTopLeft: 2,
                  cornerRadiusTopRight: 2,
                },
                encoding: {
                  x: {
                    field: "Units",
                    type: "quantitative",
                    bin: { maxbins: 8 },
                    axis: { title: "Units", labelFontSize: 9 },
                  },
                  y: {
                    aggregate: "count",
                    type: "quantitative",
                    axis: { title: "Count", labelFontSize: 9 },
                  },
                  color: colorEnc(false),
                  tooltip: [
                    {
                      field: "Units",
                      type: "quantitative",
                      bin: true,
                      title: "Units Range",
                    },
                    {
                      aggregate: "count",
                      type: "quantitative",
                      title: "Orders",
                    },
                  ],
                },
              },
              {
                mark: {
                  type: "rule",
                  color: "#DC2626",
                  strokeWidth: 2,
                  strokeDash: [4, 3],
                },
                encoding: {
                  x: {
                    field: "Units",
                    aggregate: "mean",
                    type: "quantitative",
                  },
                },
              },
              {
                mark: {
                  type: "text",
                  dy: -8,
                  fontSize: 9,
                  color: "#DC2626",
                  fontWeight: 700,
                },
                encoding: {
                  x: {
                    field: "Units",
                    aggregate: "mean",
                    type: "quantitative",
                  },
                  y: { value: 0 },
                  text: {
                    field: "Units",
                    aggregate: "mean",
                    type: "quantitative",
                    format: ".0f",
                  },
                },
              },
            ],
          },
        });
      }

      // Chart 4: Order Timeline with brush + regression line + min-value slider
      function mkTimeline(data) {
        return S({
          data: { values: data },
          autosize: { type: "fit-x", contains: "padding" },
          title: {
            text: "Order Timeline — Individual Orders over Time",
            subtitle:
              "Slide to set minimum order value · drag to brush a time window · bar and trend update live",
          },
          params: [
            {
              name: "minTotal",
              value: 0,
              bind: {
                input: "range",
                min: 0,
                max: 1800,
                step: 50,
                name: "Min order ($):  ",
              },
            },
          ],
          vconcat: [
            {
              width: "container",
              height: 220,
              transform: [{ filter: "datum.Total >= minTotal" }],
              layer: [
                {
                  params: [
                    {
                      name: "tBrush",
                      select: { type: "interval", encodings: ["x"] },
                    },
                  ],
                  mark: {
                    type: "point",
                    filled: true,
                    opacity: 0.85,
                  },
                  encoding: {
                    x: {
                      field: "OrderDate",
                      type: "temporal",
                      axis: { title: null, format: "%b %Y", labelAngle: -30 },
                      scale: { padding: 30 },
                    },
                    y: {
                      field: "Total",
                      type: "quantitative",
                      axis: { title: "Order Total ($)", format: "$,.0f" },
                    },
                    size: {
                      field: "Units",
                      type: "quantitative",
                      scale: { range: [30, 400] },
                      legend: { title: "Units", orient: "right" },
                    },
                    color: {
                      condition: {
                        param: "tBrush",
                        field: "Item",
                        type: "nominal",
                        scale: { domain: ITEMS, range: COLORS },
                      },
                      value: "#CBD5E1",
                    },
                    tooltip: [
                      {
                        field: "OrderDate",
                        type: "temporal",
                        title: "Date",
                        format: "%d %b %Y",
                      },
                      { field: "Rep", type: "nominal" },
                      { field: "Item", type: "nominal" },
                      { field: "Units", type: "quantitative" },
                      {
                        field: "Total",
                        type: "quantitative",
                        title: "Revenue ($)",
                        format: ",.2f",
                      },
                    ],
                  },
                },
                {
                  transform: [{ regression: "Total", on: "OrderDate" }],
                  mark: {
                    type: "line",
                    color: "#DC2626",
                    strokeWidth: 2,
                    strokeDash: [6, 4],
                    opacity: 0.8,
                  },
                  encoding: {
                    x: { field: "OrderDate", type: "temporal" },
                    y: { field: "Total", type: "quantitative" },
                  },
                },
              ],
            },
            {
              width: "container",
              height: 140,
              title: {
                text: "Revenue by Item for selected period (all orders shown when no selection)",
                fontSize: 10,
                color: "#9BA3B8",
              },
              transform: [
                { filter: { param: "tBrush" } },
                { filter: "datum.Total >= minTotal" },
              ],
              mark: {
                type: "bar",
                cornerRadiusTopLeft: 3,
                cornerRadiusTopRight: 3,
              },
              encoding: {
                x: {
                  field: "Item",
                  type: "nominal",
                  sort: "-y",
                  axis: { title: null, labelFontSize: 11 },
                },
                y: {
                  field: "Total",
                  type: "quantitative",
                  aggregate: "sum",
                  axis: { title: "Revenue ($)", format: "$,.0f" },
                },
                color: {
                  field: "Item",
                  type: "nominal",
                  scale: { domain: ITEMS, range: COLORS },
                  legend: null,
                },
                tooltip: [
                  { field: "Item", type: "nominal" },
                  {
                    field: "Total",
                    type: "quantitative",
                    aggregate: "sum",
                    title: "Revenue ($)",
                    format: ",.2f",
                  },
                  { aggregate: "count", type: "quantitative", title: "Orders" },
                ],
              },
            },
          ],
          spacing: 10,
        });
      }

      // Chart 5: Region x Item heatmap, click to highlight item trend below
      function mkHeatmap(data) {
        return S({
          data: { values: data },
          autosize: { type: "fit-x", contains: "padding" },
          title: {
            text: "Revenue Heatmap — Region × Item",
            subtitle:
              "Click a cell to select that Item · dblclick to reset · monthly trend updates below",
          },
          vconcat: [
            {
              width: "container",
              height: 140,
              params: [
                {
                  name: "heatSel",
                  select: {
                    type: "point",
                    fields: ["Item"],
                    on: "click",
                    clear: "dblclick",
                  },
                  bind: "legend",
                },
              ],
              transform: [
                {
                  aggregate: [
                    { op: "sum", field: "Total", as: "Rev" },
                    { op: "count", as: "Orders" },
                  ],
                  groupby: ["Region", "Item"],
                },
              ],
              mark: { type: "rect", cursor: "pointer", cornerRadius: 4 },
              encoding: {
                x: {
                  field: "Item",
                  type: "nominal",
                  sort: ITEMS,
                  axis: {
                    title: null,
                    labelFontSize: 12,
                    labelFontWeight: 600,
                  },
                },
                y: {
                  field: "Region",
                  type: "nominal",
                  sort: ["East", "Central", "West"],
                  axis: { title: null, labelFontSize: 12 },
                },
                color: {
                  field: "Rev",
                  type: "quantitative",
                  scale: { scheme: "blues" },
                  legend: {
                    title: "Revenue ($)",
                    format: "$,.0f",
                    gradientLength: 120,
                  },
                },
                opacity: {
                  condition: { param: "heatSel", empty: true, value: 1 },
                  value: 0.25,
                },
                tooltip: [
                  { field: "Region", type: "nominal" },
                  { field: "Item", type: "nominal" },
                  {
                    field: "Rev",
                    type: "quantitative",
                    title: "Revenue ($)",
                    format: ",.2f",
                  },
                  { field: "Orders", type: "quantitative", title: "# Orders" },
                ],
              },
            },
            {
              width: "container",
              height: 185,
              title: {
                text: "Monthly revenue for selected item (all items shown when nothing selected)",
                fontSize: 10,
                color: "#9BA3B8",
              },
              transform: [{ filter: { param: "heatSel" } }],
              mark: {
                type: "line",
                point: { filled: true, size: 50 },
                strokeWidth: 2,
              },
              encoding: {
                x: {
                  field: "OrderDate",
                  type: "temporal",
                  timeUnit: "yearmonth",
                  scale: { padding: 30 },
                  axis: {
                    title: null,
                    format: "%b %Y",
                    labelAngle: -30,
                    labelFontSize: 9,
                  },
                },
                y: {
                  field: "Total",
                  type: "quantitative",
                  aggregate: "sum",
                  axis: {
                    title: "Revenue ($)",
                    format: "$,.0f",
                    labelFontSize: 9,
                  },
                },
                color: {
                  field: "Item",
                  type: "nominal",
                  scale: { domain: ITEMS, range: COLORS },
                  legend: { title: "Item", orient: "right", labelFontSize: 9 },
                },
                tooltip: [
                  { field: "Item", type: "nominal" },
                  {
                    field: "OrderDate",
                    type: "temporal",
                    timeUnit: "yearmonth",
                    title: "Month",
                    format: "%b %Y",
                  },
                  {
                    field: "Total",
                    type: "quantitative",
                    aggregate: "sum",
                    title: "Revenue ($)",
                    format: ",.2f",
                  },
                ],
              },
            },
          ],
          spacing: 10,
        });
      }

      // Chart 6: Cumulative revenue using window transform, year dropdown filter
      function mkCumulative(data) {
        return S({
          data: { values: data },
          width: "container",
          height: 300,
          title: {
            text: "Cumulative Revenue over Time by Item",
            subtitle:
              "Running total per item · use the Year dropdown to zoom into a single year",
          },
          params: [
            {
              name: "cumYear",
              value: "all",
              bind: {
                input: "select",
                options: ["all", "2021", "2022"],
                labels: ["All years", "2021 only", "2022 only"],
                name: "Year:  ",
              },
            },
          ],
          transform: [
            {
              filter:
                "cumYear === 'all' || year(datum.OrderDate) === toNumber(cumYear)",
            },
            {
              sort: [{ field: "OrderDate" }],
              window: [{ op: "sum", field: "Total", as: "CumRev" }],
              groupby: ["Item"],
              frame: [null, 0],
            },
          ],
          mark: {
            type: "line",
            strokeWidth: 2.5,
            point: { filled: true, size: 45 },
          },
          encoding: {
            x: {
              field: "OrderDate",
              type: "temporal",
              axis: { title: null, format: "%b %Y", labelAngle: -30 },
            },
            y: {
              field: "CumRev",
              type: "quantitative",
              axis: { title: "Cumulative Revenue ($)", format: "$,.0f" },
            },
            color: colorEnc(true),
            tooltip: [
              { field: "Item", type: "nominal" },
              {
                field: "OrderDate",
                type: "temporal",
                title: "Date",
                format: "%d %b %Y",
              },
              {
                field: "Total",
                type: "quantitative",
                title: "This order ($)",
                format: ",.2f",
              },
              {
                field: "CumRev",
                type: "quantitative",
                title: "Running total ($)",
                format: ",.2f",
              },
            ],
          },
        });
      }

      // Chart 7: Scatter matrix using repeat, brush highlights across panels
      function mkScatterMatrix(data) {
        return S({
          data: { values: data },
          title: {
            text: "Scatter Matrix — Units · Unit Cost · Revenue",
            subtitle:
              "Drag to brush any panel — matching points highlight across all panels · colored by Item",
          },
          repeat: {
            row: ["Total", "UnitCost", "Units"],
            column: ["Units", "UnitCost", "Total"],
          },
          spec: {
            width: 175,
            height: 175,
            params: [
              {
                name: "matBrush",
                select: { type: "interval", resolve: "union" },
              },
            ],
            mark: { type: "point", filled: true, size: 40, opacity: 0.75 },
            encoding: {
              x: {
                field: { repeat: "column" },
                type: "quantitative",
                scale: { zero: false },
                axis: { labelFontSize: 9, titleFontSize: 10 },
              },
              y: {
                field: { repeat: "row" },
                type: "quantitative",
                scale: { zero: false },
                axis: { labelFontSize: 9, titleFontSize: 10 },
              },
              color: {
                condition: {
                  param: "matBrush",
                  field: "Item",
                  type: "nominal",
                  scale: { domain: ITEMS, range: COLORS },
                },
                value: "#CBD5E1",
              },
              tooltip: [
                { field: "Item", type: "nominal" },
                { field: "Rep", type: "nominal" },
                { field: "Units", type: "quantitative" },
                {
                  field: "UnitCost",
                  type: "quantitative",
                  title: "Unit Cost ($)",
                  format: ".2f",
                },
                {
                  field: "Total",
                  type: "quantitative",
                  title: "Revenue ($)",
                  format: ",.2f",
                },
              ],
            },
          },
        });
      }

      // Chart 8: Boxplot of units per order, region dropdown filter
      function mkBoxplot(data) {
        return S({
          data: { values: data },
          width: "container",
          height: 300,
          title: {
            text: "Units per Order — Distribution by Item",
            subtitle:
              "Median · IQR · whiskers (1.5×IQR) · outlier dots · filter by region",
          },
          params: [
            {
              name: "bpRegion",
              value: "all",
              bind: {
                input: "select",
                options: ["all", "East", "Central", "West"],
                labels: ["All regions", "East", "Central", "West"],
                name: "Region:  ",
              },
            },
          ],
          transform: [
            { filter: "bpRegion === 'all' || datum.Region === bpRegion" },
          ],
          mark: {
            type: "boxplot",
            extent: 1.5,
            median: { color: "white", strokeWidth: 2.5 },
            outliers: { filled: true, size: 30, opacity: 0.7 },
          },
          encoding: {
            x: {
              field: "Item",
              type: "nominal",
              sort: ITEMS,
              axis: { title: null, labelFontSize: 13 },
            },
            y: {
              field: "Units",
              type: "quantitative",
              axis: { title: "Units per Order" },
            },
            color: {
              field: "Item",
              type: "nominal",
              scale: { domain: ITEMS, range: COLORS },
              legend: null,
            },
            tooltip: [
              { field: "Item", type: "nominal" },
              { field: "Units", type: "quantitative" },
            ],
          },
        });
      }

      // Multiview: all 8 charts with shared region cross-filter
      function mkMultiview(data) {
        const dv = { values: data };

        const regionBar = {
          title: {
            text: "(1) Revenue by Region",
            subtitle: "Click bar to filter all charts · dblclick to reset",
            anchor: "start",
          },
          data: dv,
          width: 180,
          height: 220,
          transform: [
            {
              aggregate: [{ op: "sum", field: "Total", as: "Rev" }],
              groupby: ["Region"],
            },
          ],
          params: [
            {
              name: "rgSel",
              select: {
                type: "point",
                fields: ["Region"],
                on: "click",
                clear: "dblclick",
              },
            },
          ],
          mark: {
            type: "bar",
            cursor: "pointer",
            cornerRadiusTopRight: 3,
            cornerRadiusBottomRight: 3,
          },
          encoding: {
            y: {
              field: "Region",
              type: "nominal",
              axis: { title: null, labelFontSize: 12 },
            },
            x: {
              field: "Rev",
              type: "quantitative",
              axis: { title: "Revenue ($)", format: "$.0f" },
            },
            color: {
              field: "Region",
              type: "nominal",
              scale: {
                domain: ["Central", "East", "West"],
                range: ["#2563EB", "#059669", "#D97706"],
              },
              legend: null,
            },
            opacity: {
              condition: { param: "rgSel", empty: true, value: 1 },
              value: 0.3,
            },
            tooltip: [
              { field: "Region", type: "nominal" },
              {
                field: "Rev",
                type: "quantitative",
                title: "Revenue ($)",
                format: ",.2f",
              },
            ],
          },
        };

        // donut must be a direct vconcat child — arc marks don't render inside hconcat in VL5
        const donut = {
          title: {
            text: "(2b) Revenue by Rep — Donut",
            subtitle: "Updates for selected region",
            anchor: "start",
          },
          data: dv,
          width: 320,
          height: 260,
          transform: [{ filter: { param: "rgSel" } }],
          mark: {
            type: "arc",
            innerRadius: 60,
            outerRadius: 115,
            padAngle: 0.012,
            cornerRadius: 3,
          },
          encoding: {
            theta: {
              field: "Total",
              type: "quantitative",
              aggregate: "sum",
              stack: true,
            },
            color: {
              field: "Rep",
              type: "nominal",
              scale: { scheme: "tableau10" },
              legend: { orient: "right", title: "Rep", labelFontSize: 9 },
            },
            tooltip: [
              { field: "Rep", type: "nominal" },
              { field: "Total", type: "quantitative", aggregate: "sum", title: "Revenue ($)", format: ",.2f" },
            ],
          },
        };

        const stream = {
          title: {
            text: "(3) Revenue over Time by Item",
            subtitle: "Shows selected region only",
            anchor: "start",
          },
          data: dv,
          width: 470,
          height: 220,
          transform: [{ filter: { param: "rgSel" } }],
          mark: { type: "area", interpolate: "monotone" },
          encoding: {
            x: {
              field: "OrderDate",
              type: "temporal",
              timeUnit: "yearmonth",
              axis: { title: null, format: "%b %Y", labelAngle: -30 },
            },
            y: {
              field: "Total",
              type: "quantitative",
              aggregate: "sum",
              stack: "center",
              axis: { title: "Revenue ($)", format: "$.0f" },
            },
            color: {
              field: "Item",
              type: "nominal",
              scale: { domain: ITEMS, range: COLORS },
              legend: { orient: "right", title: "Item" },
            },
            tooltip: [
              { field: "Item", type: "nominal" },
              {
                field: "OrderDate",
                type: "temporal",
                timeUnit: "yearmonth",
                title: "Month",
                format: "%b %Y",
              },
              {
                field: "Total",
                type: "quantitative",
                aggregate: "sum",
                title: "Revenue ($)",
                format: ",.2f",
              },
            ],
          },
        };

        const trellis = {
          title: {
            text: "(4) Units Distribution by Item",
            subtitle: "Shows selected region only · dashed = mean",
            anchor: "start",
          },
          data: dv,
          transform: [{ filter: { param: "rgSel" } }],
          columns: 5,
          facet: {
            field: "Item",
            type: "nominal",
            header: {
              labelFontSize: 10,
              labelFontWeight: 600,
              labelColor: "#1A1F2E",
              title: null,
            },
          },
          spec: {
            width: 128,
            height: 110,
            layer: [
              {
                mark: {
                  type: "bar",
                  opacity: 0.78,
                  cornerRadiusTopLeft: 2,
                  cornerRadiusTopRight: 2,
                },
                encoding: {
                  x: {
                    field: "Units",
                    type: "quantitative",
                    bin: { maxbins: 7 },
                    axis: { title: "Units", labelFontSize: 8 },
                  },
                  y: {
                    aggregate: "count",
                    type: "quantitative",
                    axis: { title: "Count", labelFontSize: 8 },
                  },
                  color: {
                    field: "Item",
                    type: "nominal",
                    scale: { domain: ITEMS, range: COLORS },
                    legend: null,
                  },
                  tooltip: [
                    {
                      field: "Units",
                      type: "quantitative",
                      bin: true,
                      title: "Units Range",
                    },
                    {
                      aggregate: "count",
                      type: "quantitative",
                      title: "Orders",
                    },
                  ],
                },
              },
              {
                mark: {
                  type: "rule",
                  color: "#DC2626",
                  strokeWidth: 1.8,
                  strokeDash: [4, 3],
                },
                encoding: {
                  x: {
                    field: "Units",
                    aggregate: "mean",
                    type: "quantitative",
                  },
                },
              },
              {
                mark: {
                  type: "text",
                  dy: -7,
                  fontSize: 8.5,
                  color: "#DC2626",
                  fontWeight: 700,
                },
                encoding: {
                  x: {
                    field: "Units",
                    aggregate: "mean",
                    type: "quantitative",
                  },
                  y: { value: 0 },
                  text: {
                    field: "Units",
                    aggregate: "mean",
                    type: "quantitative",
                    format: ".0f",
                  },
                },
              },
            ],
          },
        };

        const timeline = {
          title: {
            text: "(5) Order Timeline + Trend",
            subtitle:
              "Shows selected region only · red dashed = regression trend",
            anchor: "start",
          },
          data: dv,
          width: 420,
          height: 180,
          transform: [{ filter: { param: "rgSel" } }],
          layer: [
            {
              mark: { type: "point", filled: true, opacity: 0.85 },
              encoding: {
                x: {
                  field: "OrderDate",
                  type: "temporal",
                  axis: {
                    title: null,
                    format: "%b %Y",
                    labelAngle: -30,
                    labelFontSize: 9,
                  },
                },
                y: {
                  field: "Total",
                  type: "quantitative",
                  axis: { title: "Total ($)", format: "$.0f" },
                },
                size: {
                  field: "Units",
                  type: "quantitative",
                  scale: { range: [20, 250] },
                  legend: null,
                },
                color: {
                  field: "Item",
                  type: "nominal",
                  scale: { domain: ITEMS, range: COLORS },
                  legend: null,
                },
                tooltip: [
                  {
                    field: "OrderDate",
                    type: "temporal",
                    title: "Date",
                    format: "%d %b %Y",
                  },
                  { field: "Rep", type: "nominal" },
                  { field: "Item", type: "nominal" },
                  {
                    field: "Total",
                    type: "quantitative",
                    title: "Revenue ($)",
                    format: ",.2f",
                  },
                ],
              },
            },
            {
              transform: [{ regression: "Total", on: "OrderDate" }],
              mark: {
                type: "line",
                color: "#DC2626",
                strokeWidth: 2,
                strokeDash: [5, 4],
                opacity: 0.8,
              },
              encoding: {
                x: { field: "OrderDate", type: "temporal" },
                y: { field: "Total", type: "quantitative" },
              },
            },
          ],
        };

        const heatmapMV = {
          title: {
            text: "(6) Revenue by Region x Item",
            subtitle: "Shows selected region only · hover for details",
            anchor: "start",
          },
          data: dv,
          width: 370,
          height: 180,
          transform: [
            { filter: { param: "rgSel" } },
            {
              aggregate: [
                { op: "sum", field: "Total", as: "Rev" },
                { op: "count", as: "Orders" },
              ],
              groupby: ["Region", "Item"],
            },
          ],
          mark: { type: "rect", cornerRadius: 3 },
          encoding: {
            x: {
              field: "Item",
              type: "nominal",
              sort: ITEMS,
              axis: { title: null, labelFontSize: 10, labelFontWeight: 600 },
            },
            y: {
              field: "Region",
              type: "nominal",
              sort: ["East", "Central", "West"],
              axis: { title: null, labelFontSize: 10 },
            },
            color: {
              field: "Rev",
              type: "quantitative",
              scale: { scheme: "blues" },
              legend: { title: "Rev ($)", format: "$,.0f", gradientLength: 80 },
            },
            tooltip: [
              { field: "Region", type: "nominal" },
              { field: "Item", type: "nominal" },
              {
                field: "Rev",
                type: "quantitative",
                title: "Revenue ($)",
                format: ",.2f",
              },
              { field: "Orders", type: "quantitative", title: "# Orders" },
            ],
          },
        };

        const cumulativeMV = {
          title: {
            text: "(7) Cumulative Revenue by Item",
            subtitle: "Shows selected region only",
            anchor: "start",
          },
          data: dv,
          width: 440,
          height: 170,
          transform: [
            { filter: { param: "rgSel" } },
            {
              sort: [{ field: "OrderDate" }],
              window: [{ op: "sum", field: "Total", as: "CumRev" }],
              groupby: ["Item"],
              frame: [null, 0],
            },
          ],
          mark: {
            type: "line",
            strokeWidth: 2,
            point: { filled: true, size: 28 },
          },
          encoding: {
            x: {
              field: "OrderDate",
              type: "temporal",
              axis: {
                title: null,
                format: "%b %Y",
                labelAngle: -30,
                labelFontSize: 9,
              },
            },
            y: {
              field: "CumRev",
              type: "quantitative",
              axis: {
                title: "Cumul. Rev ($)",
                format: "$.0f",
                labelFontSize: 9,
              },
            },
            color: {
              field: "Item",
              type: "nominal",
              scale: { domain: ITEMS, range: COLORS },
              legend: null,
            },
            tooltip: [
              { field: "Item", type: "nominal" },
              {
                field: "OrderDate",
                type: "temporal",
                title: "Date",
                format: "%d %b %Y",
              },
              {
                field: "CumRev",
                type: "quantitative",
                title: "Running total ($)",
                format: ",.2f",
              },
            ],
          },
        };

        const boxplotMV = {
          title: {
            text: "(9) Units Distribution",
            subtitle: "Shows selected region only",
            anchor: "start",
          },
          data: dv,
          width: 340,
          height: 170,
          transform: [{ filter: { param: "rgSel" } }],
          mark: {
            type: "boxplot",
            extent: 1.5,
            median: { color: "white", strokeWidth: 2 },
          },
          encoding: {
            x: {
              field: "Item",
              type: "nominal",
              sort: ITEMS,
              axis: { title: null, labelFontSize: 10 },
            },
            y: {
              field: "Units",
              type: "quantitative",
              axis: { title: "Units per Order", labelFontSize: 9 },
            },
            color: {
              field: "Item",
              type: "nominal",
              scale: { domain: ITEMS, range: COLORS },
              legend: null,
            },
            tooltip: [
              { field: "Item", type: "nominal" },
              { field: "Units", type: "quantitative" },
            ],
          },
        };

        const scatterMV = {
          title: {
            text: "(8) Unit Cost vs Revenue",
            subtitle: "Shows selected region only · size = units ordered",
            anchor: "start",
          },
          data: dv,
          width: 280,
          height: 170,
          transform: [{ filter: { param: "rgSel" } }],
          mark: { type: "point", filled: true, opacity: 0.8 },
          encoding: {
            x: {
              field: "UnitCost",
              type: "quantitative",
              axis: {
                title: "Unit Cost ($)",
                format: "$.2f",
                labelFontSize: 9,
              },
            },
            y: {
              field: "Total",
              type: "quantitative",
              axis: { title: "Revenue ($)", format: "$,.0f", labelFontSize: 9 },
            },
            color: {
              field: "Item",
              type: "nominal",
              scale: { domain: ITEMS, range: COLORS },
              legend: { title: "Item", orient: "right", labelFontSize: 9 },
            },
            size: {
              field: "Units",
              type: "quantitative",
              scale: { range: [20, 280] },
              legend: null,
            },
            tooltip: [
              { field: "Item", type: "nominal" },
              {
                field: "UnitCost",
                type: "quantitative",
                title: "Unit Cost ($)",
                format: ".2f",
              },
              { field: "Units", type: "quantitative" },
              {
                field: "Total",
                type: "quantitative",
                title: "Revenue ($)",
                format: ",.2f",
              },
            ],
          },
        };

        return {
          $schema: "https://vega.github.io/schema/vega-lite/v5.json",
          config: CFG,
          title: {
            text: "Multiview — All 8 Charts · Region Cross-Filter",
            subtitle:
              "Click any Region bar → all charts update · dblclick to reset",
            fontSize: 13,
            fontWeight: 600,
            color: "#1A1F2E",
            subtitleFontSize: 10,
            subtitleColor: "#9BA3B8",
            anchor: "start",
          },
          spacing: 22,
          vconcat: [
            { hconcat: [regionBar, stream], spacing: 20 },
            donut,
            trellis,
            { hconcat: [timeline, heatmapMV], spacing: 20 },
            { hconcat: [cumulativeMV, scatterMV, boxplotMV], spacing: 20 },
          ],
          resolve: { scale: { color: "independent" } },
        };
      }

      // embed helper
      const OPT = { renderer: "svg", actions: false, theme: "none" };

      async function em(id, ldId, s) {
        document.getElementById(id).innerHTML = "";
        try {
          await vegaEmbed("#" + id, s, OPT);
          const ld = document.getElementById(ldId);
          if (ld) ld.style.display = "none";
        } catch (e) {
          const ld = document.getElementById(ldId);
          if (ld)
            ld.innerHTML = `<span style="color:#DC2626;font-size:0.78rem">⚠ ${e.message}</span>`;
          console.error(id, e);
        }
      }

      // load data and render all charts
      (async () => {
        let rows;
        try {
          const resp = await fetch(DATA_FILE);
          if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
          const text = await resp.text();

          // Normalise line endings — CSV files from Excel/Windows use \r\n.
          // Without this, column names like "Total\r" fail indexOf lookups → NaN.
          const lines = text
            .trim()
            .replace(/\r\n/g, "\n")
            .replace(/\r/g, "\n")
            .split("\n");

          // Proper CSV parser: handles quoted fields with embedded commas (e.g. " 1,619.19 ")
          function parseCSVLine(line) {
            const result = [];
            let cur = "",
              inQ = false;
            for (let i = 0; i < line.length; i++) {
              if (line[i] === '"') {
                inQ = !inQ;
              } else if (line[i] === "," && !inQ) {
                result.push(cur.trim());
                cur = "";
              } else {
                cur += line[i];
              }
            }
            result.push(cur.trim());
            return result;
          }

          const hdr = parseCSVLine(lines[0]);

          rows = lines
            .slice(1)
            .map((line) => {
              const c = parseCSVLine(line);
              // Strip thousands commas from numeric fields before parsing
              const num = (s) => parseFloat((s || "").replace(/,/g, "")) || 0;
              return {
                OrderDate: c[hdr.indexOf("OrderDate")],
                Region: c[hdr.indexOf("Region")],
                Rep: c[hdr.indexOf("Rep")],
                Item: c[hdr.indexOf("Item")],
                Units: num(c[hdr.indexOf("Units")]),
                UnitCost: num(c[hdr.indexOf("Unit Cost")]),
                Total: num(c[hdr.indexOf("Total")]),
              };
            })
            .filter((r) => r.Item && r.Total > 0);
        } catch (err) {
          console.warn("Could not load", DATA_FILE, "—", err.message);
          document.getElementById("fallback").style.display = "block";
          return;
        }

        // Header stats — computed from actual data, not hardcoded
        const rev = rows.reduce((s, r) => s + r.Total, 0);
        document.getElementById("s-rev").textContent =
          "$" + (rev / 1000).toFixed(1) + "k";
        document.getElementById("s-ord").textContent = rows.length;
        document.getElementById("s-rep").textContent = new Set(
          rows.map((r) => r.Rep),
        ).size;
        document.getElementById("s-item").textContent = new Set(
          rows.map((r) => r.Item),
        ).size;
        document.getElementById("s-rgn").textContent = new Set(
          rows.map((r) => r.Region),
        ).size;

        document.getElementById("charts").style.display = "block";

        await Promise.all([
          em("v1", "ld1", mkDonut(rows)),
          em("v2", "ld2", mkStream(rows)),
          em("v3", "ld3", mkTrellis(rows)),
          em("v4", "ld4", mkTimeline(rows)),
          em("v5", "ld5", mkHeatmap(rows)),
          em("vMV", "ldMV", mkMultiview(rows)),
          em("v6", "ld6", mkCumulative(rows)),
          em("v7", "ld7", mkScatterMatrix(rows)),
          em("v8", "ld8", mkBoxplot(rows)),
        ]);
      })();
