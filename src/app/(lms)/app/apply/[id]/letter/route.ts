import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getApplication } from "@/lib/data/applications";
import { generateIhfLetter } from "@/lib/pdf/ihf-letter";
import { logger } from "@/lib/logging/logger";

/**
 * IHF Letter (PDF) for one application — addressed to the public school and the
 * parent/guardian. Authorisation is by RLS: getApplication only returns a row
 * the caller (owning guardian, or staff) may see. Requires both consents on
 * file. All inserted data is escaped and length-limited in the generator.
 */
export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const app = await getApplication(supabase, id);
  if (!app) return new NextResponse("Not found", { status: 404 });

  const bothConsented =
    app.consents.includes("biological_parent") && app.consents.includes("spiritual_parent");
  if (!bothConsented) {
    return new NextResponse("Both consents are required before the letter can be issued.", {
      status: 403,
    });
  }

  const pdf = await generateIhfLetter({
    applicationRef: `IHF-${id.slice(0, 8).toUpperCase()}`,
    childName: app.childName,
    guardianName: app.guardianName,
    schoolName: app.school ?? "[the public school]",
    programme: app.programme,
  });

  logger.info("ihf_letter_issued", {});

  return new NextResponse(pdf as BodyInit, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="IHF-Letter-${id.slice(0, 8)}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
