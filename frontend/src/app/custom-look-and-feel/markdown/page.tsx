import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

const CUSTOM_TAG_TSC = `$ npx tsc --noEmit      # custom-tag-probe.tsx, suppression removed
custom-tag-probe.tsx(34,15): error TS2353: Object literal may only specify
  known properties, and '"reference-chip"' does not exist in type 'Components'.

the page publishes:
  error TS2353: Object literal may only specify known properties,
  and '"reference-chip"' does not exist in type 'Components'.

installed @copilotkit/react-core 1.72.0 (declared ^1.72.0), streamdown 1.6.11`;

const SLOT_TYPING = `markdownRenderer: SlotValue<typeof CopilotChatAssistantMessage.MarkdownRenderer>

CopilotChatAssistantMessage.MarkdownRenderer:
  React.FC<Omit<React.ComponentProps<typeof Streamdown>, "children">
           & { content: string }>

SlotValue<C> = C | string | Partial<React.ComponentProps<C>>

const PlainText = ({ content }: { content: string }) => ...   ✓ assignable`;

const LINK_HARDENING = `streamdown 1.6.11 — dist/chunk-JAPRZBRM.js, default rehype plugins:

  harden: [harden, { allowedImagePrefixes: ["*"], allowedLinkPrefixes: ["*"],
                     allowedProtocols: ["*"], defaultOrigin: undefined,
                     allowDataImages: true }]

rehype-harden sets, on every anchor it lets through:

  node.properties.target = "_blank";
  node.properties.rel    = "noopener noreferrer";

streamdown's own default anchor writes rel="noreferrer" target="_blank" first
and spreads the hardened props over them, so the DOM ends up with
rel="noopener noreferrer" either way — and a components override that spreads
...props inherits the same pair.`;

export default function Page() {
  return (
    <>
      <RouteHeader path="/custom-look-and-feel/markdown" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Assistant replies arrive as markdown, and CopilotKit renders them
          through the <code>markdownRenderer</code> slot on{" "}
          <code>CopilotChatAssistantMessage</code>, whose default wraps
          Streamdown. The demo tabs the page&apos;s three techniques against one
          chat: a Streamdown <code>components</code> map, a class string, and a
          component that replaces the renderer and receives one{" "}
          <code>content</code> prop. All three snippets are verbatim.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The demo adds one thing the page does not: a probe under the chat that
          prints every attribute on the last rendered <code>a</code>,{" "}
          <code>h2</code> and <code>pre</code>. The page&apos;s three claims
          about the props an override receives are all attribute-level, so they
          are invisible in the chat and legible in that row.
        </p>

        <div className="mt-4">
          <TryIt
            prompts={[
              "Reply in markdown with an '## Overview' heading and a link to https://docs.copilotkit.ai.",
            ]}
            expect="Level 1: the a and h2 rows carry class=&quot;my-link&quot; / class=&quot;my-heading&quot;, plus href, target=&quot;_blank&quot; and rel=&quot;noopener noreferrer&quot; — and no node attribute, because the snippet destructures it out. Level 2 restyles the whole block and the default data-streamdown attributes are back. Level 3 shows a pre holding the raw markdown, with no a or h2 at all."
            fail="A node=&quot;[object Object]&quot; attribute anywhere, or level 1 losing target/rel, or all three tabs rendering identically."
          />
        </div>
      </Panel>

      <Callout tone="success" title="Verified: a bare component IS assignable to this slot">
        This repo&apos;s §9 #3 records that a plain function component is not
        assignable to most slots, because{" "}
        <code>SlotValue&lt;C&gt; = C | string | Partial&lt;ComponentProps&lt;C&gt;&gt;</code>{" "}
        forces a replacement to match the default component&apos;s type,
        attached statics included. &ldquo;Replace the renderer&rdquo; passes a
        bare <code>PlainText</code>, and it typechecks here:{" "}
        <code>MarkdownRenderer</code> is a plain <code>React.FC</code> in the{" "}
        <code>CopilotChatAssistantMessage</code> namespace with no statics of its
        own, and its props are a supertype of <code>{"{ content: string }"}</code>,
        so the assignment is ordinary contravariance. Checked with{" "}
        <code>npx tsc --noEmit</code> on the installed{" "}
        <strong>@copilotkit/react-core 1.72.0</strong> (declared{" "}
        <code>^1.72.0</code>). So #3 is about which slots, not about slots in
        general, and this page happens to land on the safe side.
        <pre className="mt-3 overflow-x-auto rounded bg-slate-900 p-3 text-xs text-slate-100">
          {SLOT_TYPING}
        </pre>
      </Callout>

      <Callout tone="success" title="Verified: the custom-tag compile error is exactly what the page prints">
        The page says a custom key is a compile error and quotes the message.
        The smallest reproduction of it lives in{" "}
        <code>custom-tag-probe.tsx</code>, imported by nothing, and the message
        matched the published text character for character. It is kept as a{" "}
        <code>@ts-expect-error</code> so the claim stays under the typecheck: if
        a release ever starts accepting custom keys, the suppression goes unused
        and this repo&apos;s <code>npx tsc --noEmit</code> fails.
        <pre className="mt-3 overflow-x-auto rounded bg-slate-900 p-3 text-xs text-slate-100">
          {CUSTOM_TAG_TSC}
        </pre>
      </Callout>

      <Callout tone="info" title="The link-hardening claim holds, but it comes from the pipeline, not from the default component">
        &ldquo;An <code>a</code> is handed <code>href</code>,{" "}
        <code>target</code> and <code>rel</code>, with{" "}
        <code>target=&quot;_blank&quot; rel=&quot;noopener noreferrer&quot;</code>{" "}
        already applied by the renderer&apos;s link hardening.&rdquo; Read off
        the installed <strong>streamdown 1.6.11</strong> and{" "}
        <strong>rehype-harden</strong>, that is true — and the reason it is true
        is worth knowing, because the sentence next to it (&ldquo;you are
        replacing, not extending&rdquo;) could be read as meaning you lose the
        hardening too. You do not: the hardening is a rehype plugin that writes
        the attributes onto the parsed node before any component mapping, so
        your override receives them and spreading keeps them. What you lose by
        replacing is only what the default <em>component</em> adds — the
        Streamdown classes and <code>data-streamdown</code>. Streamdown&apos;s
        own default anchor sets the weaker <code>rel=&quot;noreferrer&quot;</code>{" "}
        and is then overwritten by the hardened pair.{" "}
        <strong>Static read only</strong>: no server was started in this pass, so
        the attributes have not been observed in a running page. The demo&apos;s
        probe row is where that gets checked.
        <pre className="mt-3 overflow-x-auto rounded bg-slate-900 p-3 text-xs text-slate-100">
          {LINK_HARDENING}
        </pre>
      </Callout>

      <Callout tone="warn" title="One unstated prerequisite: the components map is Streamdown's, and Streamdown is not a declared dependency">
        The <code>components</code> override is Streamdown&apos;s prop, and the
        page links to streamdown.ai for it, but it never says which Streamdown
        the slot forwards to or that the map&apos;s keys and prop shapes are that
        package&apos;s API rather than CopilotKit&apos;s. Here{" "}
        <strong>streamdown 1.6.11</strong> arrives only as a transitive
        dependency of <code>@copilotkit/react-core</code> (which declares{" "}
        <code>^1.3.0</code>), so the type a reader is writing against can move
        under a caret range they never wrote down. Nothing needed installing for
        this page, which is the upside; nothing pins it either.
      </Callout>

      <Callout tone="warn" title="“Everything on this page works the same way on CopilotSidebar and CopilotPopup” is not exercised here">
        The demo drives <code>CopilotChat</code> only. The sentence about{" "}
        <code>CopilotChatMessageView</code>, where &ldquo;the path starts one
        level in, at <code>assistantMessage</code>&rdquo;, is also unexercised.
        Both are plausible from the types, and neither has been run.
      </Callout>

      <Panel title="Source">
        <SourceCode file="frontend/src/app/custom-look-and-feel/markdown/demo-chat/page.tsx" />
        <div className="mt-4">
          <SourceCode file="frontend/src/app/custom-look-and-feel/markdown/custom-tag-probe.tsx" />
        </div>
      </Panel>
    </>
  );
}
