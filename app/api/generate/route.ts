import { NextRequest, NextResponse } from "next/server";

function isNonEmptyString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidTheme(value: unknown) {
  return value === "audio" || value === "residential" || value === "lighting";
}

function isValidLanguage(value: unknown) {
  return value === "en" || value === "es" || value === "de";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const errors: Record<string, string> = {};

    if (!isNonEmptyString(body.companyName)) {
      errors.companyName = "Company name is required.";
    }

    if (!isNonEmptyString(body.standNumber)) {
      errors.standNumber = "Stand number is required.";
    }

    if (!isNonEmptyString(body.invitationCode)) {
      errors.invitationCode = "Invitation code is required.";
    }

    if (!isNonEmptyString(body.logoUrl)) {
      errors.logoUrl = "Logo source is required.";
    }

    if (!isNonEmptyString(body.registrationUrl)) {
      errors.registrationUrl = "Registration URL is required.";
    }

    if (!isValidTheme(body.theme)) {
      errors.theme = "Theme must be audio, residential, or lighting.";
    }

    if (!isValidLanguage(body.language)) {
      errors.language = "Language must be en, es, or de.";
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Payload received successfully",
      received: body,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid JSON body",
      },
      { status: 400 }
    );
  }
}