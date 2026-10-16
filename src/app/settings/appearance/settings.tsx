"use client";

import { Separator } from "@/components/ui/separator";

import { SettingField, SettingsSection } from "../section";
import { ThemeSwitcher } from "./theme-switcher";
import { VerdictStyleSwitcher } from "./verdict-switcher";

// Both settings are kept in this browser and apply the moment they change.
export function AppearanceSettings() {
  return (
    <SettingsSection
      wide
      title="Appearance"
      description="Choose the color theme and how test results are shown. These are saved in this browser only."
    >
      <SettingField id="theme" label="Theme" group>
        <ThemeSwitcher />
      </SettingField>
      <Separator />
      <SettingField id="verdict-style" label="Verdict style" group>
        <VerdictStyleSwitcher />
      </SettingField>
    </SettingsSection>
  );
}
