"use client";

import { useState } from "react";
import InvitePreview from "@/components/InvitePreview";
import { mockExhibitor } from "@/lib/mockExhibitor";
import type { LanguageKey, ThemeKey } from "@/lib/types";

export default function GeneratorPage() {
  const [companyName, setCompanyName] = useState(mockExhibitor.companyName);
  const [standNumber, setStandNumber] = useState(mockExhibitor.standNumber);
  const [invitationCode, setInvitationCode] = useState(
    mockExhibitor.invitationCode
  );
  const [logoUrl, setLogoUrl] = useState(mockExhibitor.logoUrl);
  const [registrationUrl, setRegistrationUrl] = useState(
    mockExhibitor.registrationUrl
  );
  const [theme, setTheme] = useState<ThemeKey>("audio");
  const [language, setLanguage] = useState<LanguageKey>("en");

  function handleGenerate() {
    const payload = {
      companyName,
      standNumber,
      invitationCode,
      logoUrl,
      registrationUrl,
      theme,
      language,
    };

    console.log("Generate payload:", payload);
    alert(JSON.stringify(payload, null, 2));
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-6 text-3xl font-bold">Invitation Generator</h1>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">Exhibitor Details</h2>

            <label className="mb-2 block text-sm font-medium">Company Name</label>
            <input
              className="mb-4 w-full rounded border px-3 py-2"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />

            <label className="mb-2 block text-sm font-medium">Stand Number</label>
            <input
              className="mb-4 w-full rounded border px-3 py-2"
              value={standNumber}
              onChange={(e) => setStandNumber(e.target.value)}
            />

            <label className="mb-2 block text-sm font-medium">
              Invitation Code
            </label>
            <input
              className="mb-4 w-full rounded border px-3 py-2"
              value={invitationCode}
              onChange={(e) => setInvitationCode(e.target.value)}
            />

            <label className="mb-2 block text-sm font-medium">Logo URL</label>
            <input
              className="mb-4 w-full rounded border px-3 py-2"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
            />

            <label className="mb-2 block text-sm font-medium">
              Registration URL
            </label>
            <input
              className="mb-4 w-full rounded border px-3 py-2"
              value={registrationUrl}
              onChange={(e) => setRegistrationUrl(e.target.value)}
            />

            <label className="mb-2 block text-sm font-medium">Theme</label>
            <select
              className="mb-4 w-full rounded border px-3 py-2"
              value={theme}
              onChange={(e) => setTheme(e.target.value as ThemeKey)}
            >
              <option value="audio">Audio</option>
              <option value="residential">Residential</option>
              <option value="lighting">Lighting</option>
            </select>

            <label className="mb-2 block text-sm font-medium">Language</label>
            <select
              className="mb-4 w-full rounded border px-3 py-2"
              value={language}
              onChange={(e) => setLanguage(e.target.value as LanguageKey)}
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="de">German</option>
            </select>

            <button
              onClick={handleGenerate}
              className="mt-2 w-full rounded-lg bg-black px-4 py-3 text-white"
            >
              Generate Assets
            </button>
          </div>

          <InvitePreview
            companyName={companyName}
            standNumber={standNumber}
            invitationCode={invitationCode}
            logoUrl={logoUrl}
            registrationUrl={registrationUrl}
            theme={theme}
            language={language}
          />
        </div>
      </div>
    </main>
  );
}