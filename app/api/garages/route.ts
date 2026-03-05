import { NextResponse } from "next/server";

const RDW_BASE = process.env.RDW_BASE_URL ?? "https://opendata.rdw.nl/resource";

export const runtime = "nodejs";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city") ?? "";
    const postcode = searchParams.get("postcode") ?? "";
    const type = searchParams.get("type") ?? ""; // e.g. "APK"

    // Build $where — filter by city name or postcode substring, optionally by type
    const conditions: string[] = [];
    if (city) conditions.push(`upper(erkenning_plaatsnaam)='${city.toUpperCase()}'`);
    if (postcode) conditions.push(`starts_with(erkenning_postcode,'${postcode.slice(0, 4)}')`);
    if (type) conditions.push(`upper(soort_erkenning_omschrijving) like '%${type.toUpperCase()}%'`);

    const where = conditions.length ? conditions.join(" AND ") : "erkenning_postcode IS NOT NULL";

    const url = new URL(`${RDW_BASE}/5k74-3jha.json`);
    url.searchParams.set("$where", where);
    url.searchParams.set("$limit", "50");
    url.searchParams.set("$select",
        "erkenning_nummer,erkenninghouder_naam,erkenning_plaatsnaam," +
        "erkenning_straat,erkenning_huisnummer,erkenning_postcode," +
        "soort_erkenning_omschrijving,erkenning_vervaldatum"
    );

    try {
        const res = await fetch(url.toString(), {
            headers: { "Accept": "application/json" },
            next: { revalidate: 3600 }        // cache for 1 hour
        });
        if (!res.ok) return NextResponse.json({ garages: [] }, { status: 200 });
        const data = await res.json();
        return NextResponse.json({ garages: data ?? [] });
    } catch {
        return NextResponse.json({ garages: [] }, { status: 200 });
    }
}
