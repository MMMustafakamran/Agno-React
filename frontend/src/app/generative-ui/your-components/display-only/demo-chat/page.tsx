"use client";

import { CopilotChat, useComponent } from "@copilotkit/react-core/v2";
import { z } from "zod";

import { DemoFrame } from "@/components/demo-frame";

/**
 * Registering a React component as a tool the agent can render.
 *
 * `useComponent` is a thin wrapper over `useFrontendTool`: it registers a tool
 * with a `render` and deliberately no `handler`, then renders your component
 * with the tool arguments spread in as props. There is nothing to execute — the
 * agent decides when to show it, and CopilotKit draws it.
 *
 * No backend change is needed for this. CopilotKit forwards frontend tools to
 * the agent in the AG-UI run input, so the model can call `showWeather` even
 * though the Agno agent never declares it.
 */

const weatherSchema = z.object({
  city: z.string().describe("City name"),
  temperature: z.number().describe("Temperature in Fahrenheit"),
  condition: z.string().describe("Weather condition"),
});

function WeatherCard({
  city,
  temperature,
  condition,
}: z.infer<typeof weatherSchema>) {
  return (
    <div className="my-2 max-w-xs rounded-xl border border-[var(--accent)] bg-white p-4 dark:bg-slate-900">
      <h3 className="font-semibold text-slate-900 dark:text-slate-50">{city}</h3>
      <p className="mt-1 text-3xl font-light text-slate-900 dark:text-slate-50">
        {temperature}°F
      </p>
      <p className="mt-1 text-sm text-slate-500">{condition}</p>
    </div>
  );
}

const greetingSchema = z.object({
  message: z.string().describe("The greeting to show"),
});

export default function Page() {
  // [19] display-only generative UI: register an agent-rendered component
  // [!code highlight:10]
  useComponent(
    {
      name: "showForecast",
      description: "Display a weather card for a city.",
      parameters: weatherSchema,
      render: WeatherCard,
    },
    [],
  );

  // A second, simpler component — the doc's "without parameters" variant still
  // needs a schema here for the render props to be typed.
  useComponent(
    {
      name: "showGreeting",
      description: "Display a greeting banner.",
      parameters: greetingSchema,
      render: ({ message }) => (
        <div className="my-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
          {message}
        </div>
      ),
    },
    [],
  );

  return (
    <DemoFrame
      parentPath="/generative-ui/your-components/display-only"
      subtitle="useComponent — agent-rendered React components"
    >
      <CopilotChat
        labels={{
          welcomeMessageText:
            'Try "Show the weather card for Tokyo: 77 degrees, clear" or "Show a greeting that says hello".',
        }}
      />
    </DemoFrame>
  );
}
