"use client";

import { Checkbox, ChoiceCard, Field, Switch } from "@nelio/ui";
import { useState } from "react";

/** The interactive parts of the Foundations board (forms, choice cards), so each control can be tried. */
export function FormsDemo() {
  const [auto, setAuto] = useState(false);
  const [email, setEmail] = useState(true);
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div className="flex flex-col gap-3">
        <Field label="Workspace name" name="ws" id="f-ws" defaultValue="Ada Studio" />
        <Field label="Email" name="email" id="f-email" type="email" defaultValue="ada@" error="Enter a full email address" />
      </div>
      <div className="flex flex-col gap-3">
        <Checkbox name="c1" id="f-c1" label="Client approval required" defaultChecked />
        <Checkbox name="c2" id="f-c2" label="Approve each platform separately" defaultChecked />
        <Switch id="f-auto" label="Autonomous publishing" sub="Needs your authorization" checked={auto} onChange={setAuto} />
        <Switch id="f-renders" label="Email when renders finish" checked={email} onChange={setEmail} />
      </div>
    </div>
  );
}

export function ChoiceDemo() {
  return (
    <fieldset className="m-0 grid grid-cols-1 gap-3 border-0 p-0 md:grid-cols-2">
      <legend className="sr-only">Automation mode</legend>
      <ChoiceCard name="demo-mode" value="assisted" defaultChecked title="Assisted" sub="Agents prepare, you approve." icon="check" tone="blue" badge="Recommended" />
      <ChoiceCard name="demo-mode" value="autonomous" title="Autonomous" sub="Agents publish within your limits." icon="zap" tone="ai" badge="Paid plans" locked />
    </fieldset>
  );
}
