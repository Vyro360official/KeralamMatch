#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
KeralamMatch — Dedicated SoftAstro Bridge Runner
Executes authentic Kerala astrology calculations via C:\\Users\\DELL\\Downloads\\SOFTASTRO\\keralam_astro
or the path defined by the SOFTASTRO_PATH environment variable.

Input: JSON via STDIN
Output: JSON via STDOUT
Diagnostics: STDERR only
"""

import sys
import os
import json

# Ensure STDOUT is strictly UTF-8 and does not mangle Malayalam characters
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

def fail_with_error(message, code=1, details=None):
    sys.stderr.write(f"[softastro_runner] ERROR: {message}\n")
    if details:
        sys.stderr.write(f"[softastro_runner] DETAILS: {details}\n")
    output = {
        "success": False,
        "error": message
    }
    sys.stdout.write(json.dumps(output, ensure_ascii=False))
    sys.stdout.flush()
    sys.exit(code)

def main():
    repo_softastro = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "softastro"))
    softastro_path = os.environ.get(
        "SOFTASTRO_PATH",
        repo_softastro if os.path.exists(repo_softastro) else r"C:\Users\DELL\Downloads\SOFTASTRO\keralam_astro"
    )
    
    if not os.path.exists(softastro_path):
        fail_with_error(f"SoftAstro directory not found at: {softastro_path}", code=2)

    # Insert SoftAstro root into sys.path
    if softastro_path not in sys.path:
        sys.path.insert(0, softastro_path)

    try:
        raw_input = sys.stdin.read()
        if not raw_input.strip():
            fail_with_error("Empty input received on STDIN", code=3)
        payload = json.loads(raw_input)
    except Exception as e:
        fail_with_error(f"Invalid JSON input: {str(e)}", code=4)

    mode = payload.get("mode", "marriage_match")

    if mode == "single_horoscope":
        profile_input = payload.get("profile")
        if not profile_input:
            fail_with_error("Missing profile payload for single horoscope", code=5)

        try:
            import engine.astro_engine as ae
            import engine.elaborated_horoscope as eh
        except Exception as e:
            fail_with_error(f"Failed to import SoftAstro elaborated_horoscope: {str(e)}", code=6)

        try:
            p_name = str(profile_input.get("name", "Candidate"))
            p_gender = str(profile_input.get("gender", "male")).lower()
            p_dob = str(profile_input.get("dob", "1995-01-01"))
            p_tob = str(profile_input.get("tob", "12:00"))
            p_place = str(profile_input.get("place", "Kerala"))
            p_lat = float(profile_input.get("lat", 8.5241))
            p_lon = float(profile_input.get("lon", 76.9366))
            p_tz = float(profile_input.get("tz", 5.5))

            # Render 30 page report from SoftAstro engine
            full_html = eh.render_professional_30page_report(
                p_name, p_gender, p_dob, p_tob, p_place, p_lat, p_lon, p_tz, licence_address="KeralamMatch Verified"
            )

            # Sliced to EXACT FIRST TWO PAGES ONLY as requested by user
            import re
            pattern = r'(<div class="page(?: page-cover)?">[\s\S]*?)(?=<div class="page(?: page-cover)?"|\Z)'
            pages = re.findall(pattern, full_html)
            doc_start = full_html.split('<div class="page')[0]
            
            if len(pages) >= 2:
                report_2page = doc_start + "\n".join(pages[:2]) + "\n</body>\n</html>"
            else:
                report_2page = full_html

            # Renumber page indicator to "Page 2 of 2"
            report_2page = re.sub(r'<div class="page-num">Page \d+ of \d+</div>', '<div class="page-num">Page 2 of 2</div>', report_2page)


            # Base64 embed logo so it displays offline and in iframes with 100% fidelity
            logo_path = os.path.join(softastro_path, "logo.jpg")
            if os.path.exists(logo_path):
                import base64
                with open(logo_path, "rb") as lf:
                    b64_logo = base64.b64encode(lf.read()).decode("ascii")
                    report_2page = report_2page.replace('src="/logo.jpg"', f'src="data:image/jpeg;base64,{b64_logo}"')

            # Calculate chart for metadata
            chart = ae.calculate_chart(p_name, p_gender, p_dob, p_tob, p_place, p_lat, p_lon, p_tz)

            result = {
                "success": True,
                "engine": "SoftAstro Elaborated Horoscope v1.0",
                "profile": {
                    "name": p_name,
                    "gender": p_gender,
                    "dob": p_dob,
                    "tob": p_tob,
                    "place": p_place,
                    "star": chart.get("star"),
                    "pada": chart.get("pada"),
                    "rasi": chart.get("planets", {}).get("Moon", {}).get("rasi_name"),
                    "lagna": chart.get("planets", {}).get("Lagna", {}).get("rasi_name"),
                    "dasa_balance": chart.get("dasa_balance"),
                },
                "report_html": report_2page
            }
            sys.stdout.write(json.dumps(result, default=str, ensure_ascii=False))
            sys.stdout.flush()
            sys.exit(0)
        except Exception as e:
            fail_with_error(f"Single horoscope calculation failed: {str(e)}", code=7)

    bride_input = payload.get("bride")
    groom_input = payload.get("groom")
    include_html = payload.get("includeReportHtml", True)

    if not bride_input or not groom_input:
        fail_with_error("Missing bride or groom profile payload", code=5)

    # Import SoftAstro engines
    try:
        import engine.astro_engine as ae
        import engine.marriage_engine as me
        import report_generator as rg
    except Exception as e:
        fail_with_error(f"Failed to import SoftAstro calculation modules: {str(e)}", code=6)

    try:
        # Calculate Bride Chart
        b_name = str(bride_input.get("name", "Bride"))
        b_gender = str(bride_input.get("gender", "female")).lower()
        b_dob = str(bride_input.get("dob"))
        b_tob = str(bride_input.get("tob", "12:00"))
        b_place = str(bride_input.get("place", "Kerala"))
        b_lat = float(bride_input.get("lat", 8.5241))
        b_lon = float(bride_input.get("lon", 76.9366))
        b_tz = float(bride_input.get("tz", 5.5))

        girl_chart = ae.calculate_chart(
            name=b_name,
            gender=b_gender,
            dob_str=b_dob,
            tob_str=b_tob,
            place_name=b_place,
            lat=b_lat,
            lon=b_lon,
            tz_offset=b_tz
        )

        # Calculate Groom Chart
        g_name = str(groom_input.get("name", "Groom"))
        g_gender = str(groom_input.get("gender", "male")).lower()
        g_dob = str(groom_input.get("dob"))
        g_tob = str(groom_input.get("tob", "12:00"))
        g_place = str(groom_input.get("place", "Kerala"))
        g_lat = float(groom_input.get("lat", 8.5241))
        g_lon = float(groom_input.get("lon", 76.9366))
        g_tz = float(groom_input.get("tz", 5.5))

        boy_chart = ae.calculate_chart(
            name=g_name,
            gender=g_gender,
            dob_str=g_dob,
            tob_str=g_tob,
            place_name=g_place,
            lat=g_lat,
            lon=g_lon,
            tz_offset=g_tz
        )

        # Calculate Compatibility
        compat = me.calculate_marriage_compatibility(girl_chart, boy_chart)

        # Generate HTML report if requested
        report_html = None
        if include_html:
            try:
                report_html = rg.render_marriage_report(girl_chart, boy_chart, licence_address="KeralamMatch Verified")
            except Exception as report_err:
                sys.stderr.write(f"[softastro_runner] Notice: Report HTML render non-fatal exception: {report_err}\n")
                report_html = None

        # Build clean JSON response
        result = {
            "success": True,
            "engine": "SoftAstro Native Ephemeris v1.0",
            "bride": {
                "name": b_name,
                "star": girl_chart.get("star"),
                "pada": girl_chart.get("pada"),
                "rasi": girl_chart.get("planets", {}).get("Moon", {}).get("rasi_name"),
                "rasi_index": girl_chart.get("planets", {}).get("Moon", {}).get("rasi_index"),
                "dob": b_dob,
                "tob": b_tob,
                "place": b_place,
                "dasa_balance": girl_chart.get("dasa_balance"),
            },
            "groom": {
                "name": g_name,
                "star": boy_chart.get("star"),
                "pada": boy_chart.get("pada"),
                "rasi": boy_chart.get("planets", {}).get("Moon", {}).get("rasi_name"),
                "rasi_index": boy_chart.get("planets", {}).get("Moon", {}).get("rasi_index"),
                "dob": g_dob,
                "tob": g_tob,
                "place": g_place,
                "dasa_balance": boy_chart.get("dasa_balance"),
            },
            "porutham": compat.get("porutham"),
            "papasamya": compat.get("papasamya"),
            "kuja_dosha": compat.get("kuja_dosha"),
            "dasa_timeline": compat.get("dasa_timeline"),
            "report_html": report_html
        }

        sys.stdout.write(json.dumps(result, default=str, ensure_ascii=False))
        sys.stdout.flush()
        sys.exit(0)

    except Exception as calc_err:
        fail_with_error(f"Calculation exception: {str(calc_err)}", code=7)

if __name__ == "__main__":
    main()
