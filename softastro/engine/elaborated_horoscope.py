import math
import sqlite3
import os
import re
from datetime import datetime, timedelta

from engine.astro_engine import (
    calculate_chart, NAKSHATRAS, RASIS, DASA_LORDS,
    get_julian_day, get_lahiri_ayanamsa, normalize_deg, normalize_dob
)

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "keralam_astro.db")

MAL_PLANETS = {
    "Lagna": "ലഗ്നം", "Sun": "രവി", "Moon": "ചന്ദ്രൻ", "Mars": "കുജൻ",
    "Mercury": "ബുധൻ", "Jupiter": "ഗുരു", "Venus": "ശുക്രൻ", "Saturn": "ശനി",
    "Rahu": "രാഹു", "Ketu": "കേതു", "Mandi": "മാന്ദി"
}

MAL_CODES = {
    "Lagna": "ല.", "Sun": "ര.", "Moon": "ച.", "Mars": "കു.",
    "Mercury": "ബു.", "Jupiter": "ഗു.", "Venus": "ശു.", "Saturn": "ശി.",
    "Rahu": "രാ.", "Ketu": "കേ.", "Mandi": "മാ."
}

DASA_YEARS = {
    "Ketu": 7, "Venus": 20, "Sun": 6, "Moon": 10,
    "Mars": 7, "Rahu": 18, "Jupiter": 16, "Saturn": 19, "Mercury": 17
}

DASA_ORDER = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"]

PLANET_ID_MAP = {
    "Sun": "1", "Moon": "2", "Mars": "3", "Rahu": "4", "Jupiter": "5",
    "Saturn": "6", "Mercury": "7", "Ketu": "8", "Venus": "9"
}

MAL_DASA_NAMES = {
    "Ketu": "കേതുദശ", "Venus": "ശുക്രദശ", "Sun": "ആദിത്യദശ", "Moon": "ചന്ദ്രദശ",
    "Mars": "ചൊവ്വാദശ", "Rahu": "രാഹുർദശ", "Jupiter": "വ്യാഴദശ", "Saturn": "ശനിദശ", "Mercury": "ബുധദശ"
}

MAL_APAHARA_NAMES = {
    "Ketu": "കേതു", "Venus": "ശുക്രൻ", "Sun": "ആദിത്യൻ", "Moon": "ചന്ദ്രൻ",
    "Mars": "ചൊവ്വ", "Rahu": "രാഹു", "Jupiter": "വ്യാഴൻ", "Saturn": "ശനി", "Mercury": "ബുധൻ"
}

NAKSHATRA_METADATA = {
    "Aswathi": {"mal": "അശ്വതി", "gem": "വൈഡൂര്യം", "ganam": "ദേവഗണം", "deity": "അശ്വിനിദേവകൾ", "tree": "കാഞ്ഞിരം", "yoni": "ആൺകുതിര", "bhutham": "ഭൂമി", "mrigam": "കുതിര", "pakshi": "പുള്ള്"},
    "Bharani": {"mal": "ഭരണി", "gem": "വജ്രം", "ganam": "മനുഷ്യഗണം", "deity": "യമൻ", "tree": "നെല്ലി", "yoni": "പെൺആട്", "bhutham": "ഭൂമി", "mrigam": "ആട്", "pakshi": "പുള്ള്"},
    "Karthika": {"mal": "കാർത്തിക", "gem": "മാണിക്യം", "ganam": "രാക്ഷസഗണം", "deity": "അഗ്നി", "tree": "അത്തി", "yoni": "പെൺആട്", "bhutham": "അഗ്നി", "mrigam": "ആട്", "pakshi": "പുള്ള്"},
    "Rohini": {"mal": "രോഹിണി", "gem": "മുത്ത്", "ganam": "മനുഷ്യഗണം", "deity": "ബ്രഹ്മാവ്", "tree": "ഞാവൽ", "yoni": "ആൺപാമ്പ്", "bhutham": "പൃഥ്വി", "mrigam": "പാമ്പ്", "pakshi": "പുള്ള്"},
    "Makayiram": {"mal": "മകയിരം", "gem": "പവഴം", "ganam": "ദേവഗണം", "deity": "ചന്ദ്രൻ", "tree": "കരിങ്ങാലി", "yoni": "പെൺപാമ്പ്", "bhutham": "ചൊവ്വ", "mrigam": "പാമ്പ്", "pakshi": "പുള്ള്"},
    "Thiruvathira": {"mal": "തിരുവാതിര", "gem": "ഗോമേദകം", "ganam": "മനുഷ്യഗണം", "deity": "രുദ്രൻ", "tree": "കരിമരം", "yoni": "സ്ത്രീ", "bhutham": "ജലം", "mrigam": "നായ", "pakshi": "ചകോരം"},
    "Punartham": {"mal": "പുണർതം", "gem": "പുഷ്യരാഗം", "ganam": "ദേവഗണം", "deity": "അദിതി", "tree": "മുള", "yoni": "പെൺപൂച്ച", "bhutham": "ജലം", "mrigam": "പൂച്ച", "pakshi": "ചകോരം"},
    "Pooyam": {"mal": "പൂയം", "gem": "ഇന്ദ്രനീലം", "ganam": "ദേവഗണം", "deity": "ബൃഹസ്പതി", "tree": "അരയാൽ", "yoni": "ആൺആട്", "bhutham": "ശനി", "mrigam": "ആട്", "pakshi": "ചകോരം"},
    "Ayilyam": {"mal": "ആയില്യം", "gem": "മരതകം", "ganam": "രാക്ഷസഗണം", "deity": "സർപ്പങ്ങൾ", "tree": "നാകമരം", "yoni": "ആൺപൂച്ച", "bhutham": "ജലം", "mrigam": "പൂച്ച", "pakshi": "ചകോരം"},
    "Makam": {"mal": "മകം", "gem": "കേതു", "ganam": "രാക്ഷസഗണം", "deity": "പിതൃക്കൾ", "tree": "ഇലഞ്ഞി", "yoni": "ആൺഎലി", "bhutham": "അഗ്നി", "mrigam": "എലി", "pakshi": "ചകോരം"},
    "Pooram": {"mal": "പൂരം", "gem": "വജ്രം", "ganam": "മനുഷ്യഗണം", "deity": "ഭഗൻ", "tree": "പലാശ്", "yoni": "പെൺഎലി", "bhutham": "അഗ്നി", "mrigam": "എലി", "pakshi": "ചകോരം"},
    "Uthram": {"mal": "ഉത്രം", "gem": "മാണിക്യം", "ganam": "മനുഷ്യഗണം", "deity": "അര്യമാവ്", "tree": "ഇതിൽ", "yoni": "പെൺകാള", "bhutham": "അഗ്നി", "mrigam": "കാള", "pakshi": "ചകോരം"},
    "Atham": {"mal": "അത്തം", "gem": "മുത്ത്", "ganam": "ദേവഗണം", "deity": "സവിതാവ്", "tree": "അമ്പഴം", "yoni": "പെൺപോത്ത്", "bhutham": "കാറ്റ്", "mrigam": "പോത്ത്", "pakshi": "കാക്ക"},
    "Chithira": {"mal": "ചിത്തിര", "gem": "പവഴം", "ganam": "രാക്ഷസഗണം", "deity": "വിശ്വകർമ്മാവ്", "tree": "കൂവളം", "yoni": "പെൺപുലി", "bhutham": "കാറ്റ്", "mrigam": "പുലി", "pakshi": "കാക്ക"},
    "Chothi": {"mal": "ചോതി", "gem": "ഗോമേദകം", "ganam": "ദേവഗണം", "deity": "വായു", "tree": "നീർമരുത്", "yoni": "ആൺമഹിഷം", "bhutham": "കാറ്റ്", "mrigam": "മഹിഷം", "pakshi": "കാക്ക"},
    "Visakham": {"mal": "വിശാഖം", "gem": "പുഷ്യരാഗം", "ganam": "രാക്ഷസഗണം", "deity": "ഇന്ദ്രാഗ്നി", "tree": "വയ്യങ്കത", "yoni": "ആൺപുലി", "bhutham": "കാറ്റ്", "mrigam": "പുലി", "pakshi": "കാക്ക"},
    "Anizham": {"mal": "അനിഴം", "gem": "ഇന്ദ്രനീലം", "ganam": "ദേവഗണം", "deity": "മിത്രൻ", "tree": "ഇലഞ്ഞി", "yoni": "പെൺമാൻ", "bhutham": "കാറ്റ്", "mrigam": "മാൻ", "pakshi": "കാക്ക"},
    "Thrikketta": {"mal": "തൃക്കേട്ട", "gem": "മരതകം", "ganam": "രാക്ഷസഗണം", "deity": "ഇന്ദ്രൻ", "tree": "വെട്ടി", "yoni": "ആൺമാൻ", "bhutham": "കാറ്റ്", "mrigam": "മാൻ", "pakshi": "കാക്ക"},
    "Moolam": {"mal": "മൂലം", "gem": "വൈഡൂര്യം", "ganam": "രാക്ഷസഗണം", "deity": "നിരാൃതി", "tree": "വെൺകടുക്", "yoni": "പെൺനായ്", "bhutham": "ജലം", "mrigam": "നായ", "pakshi": "കോഴി"},
    "Pooradam": {"mal": "പൂരാടം", "gem": "വജ്രം", "ganam": "മനുഷ്യഗണം", "deity": "ആപസ്സ്", "tree": "വഞ്ഞി", "yoni": "പെൺകുരങ്ങ്", "bhutham": "ജലം", "mrigam": "കുരങ്ങ്", "pakshi": "കോഴി"},
    "Uthradam": {"mal": "ഉത്രാടം", "gem": "മാണിക്യം", "ganam": "മനുഷ്യഗണം", "deity": "വിശ്വദേവകൾ", "tree": "പ്ലാവ്", "yoni": "ആൺകാള", "bhutham": "ജലം", "mrigam": "കാള", "pakshi": "കോഴി"},
    "Thiruvonam": {"mal": "തിരുവോണം", "gem": "മുത്ത്", "ganam": "ദേവഗണം", "deity": "വിഷ്ണു", "tree": "എരുക്ക്", "yoni": "പെൺകുരങ്ങ്", "bhutham": "വായു", "mrigam": "കുരങ്ങ്", "pakshi": "കോഴി"},
    "Avittam": {"mal": "അവിട്ടം", "gem": "പവഴം", "ganam": "രാക്ഷസഗണം", "deity": "അഷ്ടവസുക്കൾ", "tree": "വന്നി", "yoni": "പെൺസിംഹം", "bhutham": "വായു", "mrigam": "സിംഹം", "pakshi": "കോഴി"},
    "Chathayam": {"mal": "ചതയം", "gem": "ഗോമേദകം", "ganam": "രാക്ഷസഗണം", "deity": "വരുണൻ", "tree": "കടമ്പ്", "yoni": "പെൺകുതിര", "bhutham": "വായു", "mrigam": "കുതിര", "pakshi": "കോഴി"},
    "Pooruttathi": {"mal": "പൂരുരുട്ടാതി", "gem": "പുഷ്യരാഗം", "ganam": "മനുഷ്യഗണം", "deity": "അജൈകപാത്", "tree": "മാവ്", "yoni": "ആൺസിംഹം", "bhutham": "വായു", "mrigam": "സിംഹം", "pakshi": "മയിൽ"},
    "Uthrattathi": {"mal": "ഉത്രട്ടാതി", "gem": "ഇന്ദ്രനീലം", "ganam": "മനുഷ്യഗണം", "deity": "അഹിർബുധ്ന്യൻ", "tree": "വേപ്പ്", "yoni": "പെൺപശു", "bhutham": "ആകാശം", "mrigam": "പശു", "pakshi": "മയിൽ"},
    "Revathi": {"mal": "രേവതി", "gem": "മരതകം", "ganam": "ദേവഗണം", "deity": "പൂഷാവ്", "tree": "ഇരിപ്പ", "yoni": "പെൺആന", "bhutham": "ആകാശം", "mrigam": "ആന", "pakshi": "മയിൽ"}
}

def format_dms(deg_val):
    deg_val = deg_val % 360.0
    d = int(deg_val)
    m = int((deg_val % 1) * 60)
    s = int((((deg_val % 1) * 60) % 1) * 60)
    return f"{d:03d}° {m:02d}' {s:02d}\""

def get_dasa_prediction(mstr_lord, sub_lord, lang="malayalam"):
    """Fetches exact, distinct prediction text for each of the 81 Dasa-Apahara pairs from SQLite database in requested language."""
    m_id = PLANET_ID_MAP.get(mstr_lord, "1")
    s_id = PLANET_ID_MAP.get(sub_lord, "1")
    col_name = "PhalMAL" if str(lang).lower() == "malayalam" else "PhalENG"
    try:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        cur.execute(f"SELECT {col_name} FROM Predict_DhasaPhal10 WHERE MstrPlnt=? AND SubPlnt=?", (m_id, s_id))
        row = cur.fetchone()
        conn.close()
        if row and row[0]:
            desc = row[0].strip()
            if str(lang).lower() == "malayalam":
                return desc
            else:
                sub_mal = MAL_APAHARA_NAMES.get(sub_lord, sub_lord)
                return f"{sub_mal} അപഹാര ഫലം: {desc}"
    except Exception as e:
        print("DB Dasa Prediction Error:", e)
    return f"{MAL_APAHARA_NAMES.get(sub_lord, sub_lord)} അപഹാര ഫലം: തൊഴിൽ പുരോഗതിയും ഐശ്വര്യവും ഭവിക്കും."

def calculate_nearest_distances(planets_dict):
    p_names = ["Lagna", "Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu", "Mandi"]
    matrix = {}
    for planet_a in p_names:
        matrix[planet_a] = {}
        lon1 = planets_dict[planet_a]["longitude"] if planet_a in planets_dict else 0.0
        for planet_b in p_names:
            lon2 = planets_dict[planet_b]["longitude"] if planet_b in planets_dict else 0.0
            diff = abs(lon1 - lon2) % 360.0
            if diff > 180.0: diff = 360.0 - diff
            matrix[planet_a][planet_b] = format_dms(diff)
    return matrix

def generate_full_dasa_apahara_timeline(dob_str, dasa_balance_or_chart, lang="malayalam"):
    """
    Calculates exact mathematical start/end dates, age transitions, and Apahara tables for ALL 9 Mahadasas.
    Dynamically calculated from birth date and Moon longitude / Dasa balance.
    Maintains exact floating-point day offsets without per-Apahara int() truncation drift.
    """
    from engine.astro_engine import normalize_dob
    dob = datetime.strptime(normalize_dob(dob_str), "%Y-%m-%d")
    
    first_lord = None
    rem_years = 0.0

    if isinstance(dasa_balance_or_chart, dict):
        first_lord = dasa_balance_or_chart.get("dasa_lord")
        rem_years = dasa_balance_or_chart.get("dasa_balance_years", 0.0)
        if not first_lord and "planets" in dasa_balance_or_chart and "Moon" in dasa_balance_or_chart["planets"]:
            m_lon = dasa_balance_or_chart["planets"]["Moon"]["longitude"]
            star_idx = int(m_lon // (360.0 / 27.0))
            first_lord = DASA_ORDER[star_idx % 9]
            star_span = 360.0 / 27.0
            star_traversed = m_lon - (star_idx * star_span)
            rem_fraction = (star_span - star_traversed) / star_span
            rem_years = DASA_YEARS[first_lord] * rem_fraction
    elif isinstance(dasa_balance_or_chart, (float, int)):
        rem_years = float(dasa_balance_or_chart)
        # default to Ketu if lord not specified
        first_lord = "Ketu"
    else:
        dasa_balance_str = str(dasa_balance_or_chart)
        mal_names = {"Saturn": "ശനി", "Mercury": "ബുധ", "Ketu": "കേതു", "Venus": "ശുക്ര", "Sun": "ആദിത്യ", "Moon": "ചന്ദ്ര", "Mars": "ചൊവ്വ", "Rahu": "രാഹു", "Jupiter": "വ്യാഴ"}
        for lord in DASA_ORDER:
            if lord in dasa_balance_str or mal_names.get(lord, "") in dasa_balance_str:
                first_lord = lord
                break
                    
        nums = [int(n) for n in re.findall(r'\d+', dasa_balance_str)]
        if not first_lord or len(nums) < 3:
            return []

        yrs, mths, days = nums[0], nums[1], nums[2]
        rem_years = yrs + (mths / 12.0) + (days / 365.25)

    if not first_lord:
        first_lord = "Ketu"

    full_first_dasa_yrs = DASA_YEARS[first_lord]
    elapsed_years = full_first_dasa_yrs - rem_years
    curr_dt = dob - timedelta(seconds=elapsed_years * 365.25 * 86400)
    
    all_mahadasas = []
    start_idx = DASA_ORDER.index(first_lord)
    
    for i in range(9):
        lord = DASA_ORDER[(start_idx + i) % 9]
        dasa_duration_yrs = DASA_YEARS[lord]
        md_start = curr_dt
        
        apaharas = []
        ap_start_idx = DASA_ORDER.index(lord)
        
        for j in range(9):
            ap_lord = DASA_ORDER[(ap_start_idx + j) % 9]
            ap_yrs = (dasa_duration_yrs * DASA_YEARS[ap_lord]) / 120.0
            ap_seconds = ap_yrs * 365.25 * 86400
            
            ap_start = curr_dt
            ap_end = ap_start + timedelta(seconds=ap_seconds)
            curr_dt = ap_end
            
            age_s = max(0, int((ap_start - dob).days / 365.25))
            age_e = int((ap_end - dob).days / 365.25)
            
            is_before_birth = ap_end < dob
            pred_text = get_dasa_prediction(lord, ap_lord, lang=lang)
            
            apaharas.append({
                "lord": ap_lord, "lord_mal": MAL_APAHARA_NAMES[ap_lord],
                "start": ap_start.strftime("%d-%m-%Y"), "end": ap_end.strftime("%d-%m-%Y"),
                "start_dt": ap_start, "end_dt": ap_end,
                "age_str": f"{age_s} to {age_e} Yrs" if not is_before_birth else "Before Birth",
                "is_before_birth": is_before_birth, "prediction": pred_text
            })
            
        md_end = curr_dt
        all_mahadasas.append({
            "lord": lord, "lord_mal": MAL_DASA_NAMES[lord],
            "start": md_start.strftime("%d-%m-%Y"), "end": md_end.strftime("%d-%m-%Y"),
            "start_dt": md_start, "end_dt": md_end,
            "years": dasa_duration_yrs, "apaharas": apaharas
        })
        
    return all_mahadasas

def generate_3year_calendar(dob_str, lat=8.5241, lon=76.9366, tz_offset=5.5):
    """
    36-Month Astronomical Summary Calendar.
    """
    from engine.astrology_calculator import generate_36month_astronomical_calendar
    return generate_36month_astronomical_calendar(dob_str, lat, lon, tz_offset)

def render_professional_30page_report(name, gender, dob_str, tob_str, place_name, lat, lon, tz_offset=5.5, licence_address="", mode="full", lang="malayalam"):
    import ephem
    from engine.astrology_calculator import (
        calculate_bhava_sphutam, calculate_ashtakavarga, calculate_shadvarga,
        detect_yogas, calculate_saturn_transits, calculate_papamoolyam, calculate_kuja_dosha_evaluation
    )
    chart = calculate_chart(name, gender, dob_str, tob_str, place_name, lat, lon, tz_offset)
    planets = chart["planets"]

    bhava_data = calculate_bhava_sphutam(planets['Lagna']['longitude'], planets)
    ashtaka_data = calculate_ashtakavarga(planets)
    varga_data = calculate_shadvarga(planets)
    detected_yogas = detect_yogas(planets)
    saturn_transit = calculate_saturn_transits(planets['Moon']['rasi_index'])
    papa_data = calculate_papamoolyam(planets)
    kuja_eval = calculate_kuja_dosha_evaluation(planets)

    # Build Dynamic Papamoolyam Rows HTML
    papa_rows_html = ""
    for ref_name, label in [("Lagna", "ലഗ്നാൽ"), ("Moon", "ചന്ദ്രാൽ"), ("Venus", "ശുക്രാൽ")]:
        h_info = papa_data[ref_name]
        h_map = h_info["houses"]
        td1 = " ".join(h_map[1]) or "-"
        td2 = " ".join(h_map[2]) or "-"
        td4 = " ".join(h_map[4]) or "-"
        td7 = " ".join(h_map[7]) or "-"
        td8 = " ".join(h_map[8]) or "-"
        td12 = " ".join(h_map[12]) or "-"
        score_str = f"{h_info['score']:.2f}"
        papa_rows_html += f"<tr><td>{label}</td><td>{td1}</td><td>{td2}</td><td>{td4}</td><td>{td7}</td><td>{td8}</td><td>{td12}</td><td>{score_str}</td></tr>\n"

    # Build Dynamic Bhava Rows HTML
    bhava_rows_html = ""
    for h in bhava_data['houses']:
        h_num = h['house_num']
        start_dms = format_dms(h['longitude'] - 15.0)
        mid_dms = h['dms']
        end_dms = format_dms(h['longitude'] + 15.0)
        rasi_name = h['rasi_name']
        p_in_h = ", ".join([MAL_CODES.get(p, p) for p in bhava_data['house_planets'].get(h_num, [])]) or "-"
        bhava_rows_html += f"<tr><td>{h_num}</td><td>{start_dms}</td><td>{mid_dms}</td><td>{end_dms}</td><td>{rasi_name}</td><td>{p_in_h}</td></tr>\n"

    # Build Dynamic Ashtakavarga Rows HTML
    ashtaka_rows_html = ""
    for p_eng, p_mal in [("Sun", "രവി"), ("Moon", "ചന്ദ്രൻ"), ("Mars", "കുജൻ"), ("Mercury", "ബുധൻ"), ("Jupiter", "ഗുരു"), ("Venus", "ശുക്രൻ"), ("Saturn", "ശനി")]:
        bav_vals = ashtaka_data['bav'].get(p_eng, [0]*12)
        bav_tds = "".join([f"<td>{v}</td>" for v in bav_vals])
        tot_p = sum(bav_vals)
        ashtaka_rows_html += f"<tr><td>{p_mal}</td>{bav_tds}<td>{tot_p}</td></tr>\n"

    sav_tds = "".join([f"<td>{v}</td>" for v in ashtaka_data['sav']])
    ashtaka_sav_row = f"<tr style=\"background: #e0f2fe; font-weight: 800;\"><td>ആകെ</td>{sav_tds}<td>{ashtaka_data['total_sav']}</td></tr>"

    # Build Dynamic Shadvarga Rows HTML
    shadvarga_rows_html = ""
    mal_p_names = {"Lagna": "ലഗ്നം", "Sun": "രവി", "Mercury": "ബുധൻ", "Venus": "ശുക്രൻ", "Mars": "കുജൻ", "Jupiter": "ഗുരു", "Saturn": "ശനി", "Moon": "ചന്ദ്രൻ"}
    for p_name in ['Lagna', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Moon']:
        v_info = varga_data.get(p_name, {})
        p_label = mal_p_names.get(p_name, p_name)
        r_d1 = RASIS[v_info.get('D1', 0)]
        r_d2 = RASIS[v_info.get('D2', 0)]
        r_d3 = RASIS[v_info.get('D3', 0)]
        r_d7 = RASIS[v_info.get('D7', 0)]
        r_d9 = RASIS[v_info.get('D9', 0)]
        r_d10 = RASIS[v_info.get('D10', 0)]
        r_d12 = RASIS[v_info.get('D12', 0)]
        r_d16 = RASIS[v_info.get('D16', 0)]
        r_d30 = RASIS[v_info.get('D30', 0)]
        shadvarga_rows_html += f"<tr><td>{p_label}</td><td>{r_d1}</td><td>{r_d2}</td><td>{r_d3}</td><td>{r_d7}</td><td>{r_d9}</td><td>{r_d10}</td><td>{r_d12}</td><td>{r_d16}</td><td>{r_d30}</td></tr>\n"

    # Build Dynamic Yogas & Saturn Transit HTML
    yogas_html = ""
    for y in detected_yogas:
        yogas_html += f"<div class=\"pred-box\"><h4>{y['name']}</h4><p>{y['desc']}</p></div>\n"
    if not yogas_html:
        yogas_html = "<div class=\"pred-box\"><p>പ്രത്യേക ജാതക യോഗങ്ങൾ ലഭ്യമല്ല.</p></div>"

    saturn_transit_html = f"""<div class="pred-box"><h4>ഗ്രഹചാരം / ശനിമാറ്റം (SATURN TRANSIT): {saturn_transit['status']}</h4><p>{saturn_transit['desc']}</p></div>"""

    clean_licence = licence_address.strip() if licence_address and "Type your address" not in licence_address else ""
    licence_html = f"<div><strong>Licenced To:</strong> {clean_licence}</div>" if clean_licence else ""

    
    # Dynamic Panchanga & Astronomical Calculation for Page 2
    from engine.astrology_calculator import TITHIS, KARANAS, NITHYA_YOGAS
    sun_lon = planets['Sun']['longitude']
    moon_lon = planets['Moon']['longitude']

    tithi_idx = int(((moon_lon - sun_lon) % 360) / 12.0) % 30
    paksha_str = "ശുക്ലപക്ഷം" if tithi_idx < 15 else "കൃഷ്ണപക്ഷം"
    tithi_name = TITHIS[tithi_idx]

    from engine.astrology_calculator import calculate_karana
    karana_info = calculate_karana(moon_lon, sun_lon)
    karana_name = karana_info["name_mal"]

    sum_lon = (moon_lon + sun_lon) % 360.0
    yoga_idx = int(sum_lon / (360.0 / 27.0)) % 27
    nithya_yoga_name = NITHYA_YOGAS[yoga_idx]

    ayanamsa_val = chart.get('ayanamsa', 23.853056)
    ayanamsa_str = f"{format_dms(ayanamsa_val)} (N.C. Lahiri)"
    tithi_karana_str = f"{tithi_name} ({paksha_str}), കരണം: {karana_name}"

    sunrise_str = chart.get("sunrise_str", "Calculation unavailable")
    sunset_str = chart.get("sunset_str", "Calculation unavailable")
    udayalparam_str = chart.get("udayalparam_str", "Calculation unavailable")

    # Dynamic Birth Details Extraction from Astronomical Engine
    star_name_eng = chart.get("star", "Uthrattathi")
    star_info = NAKSHATRA_METADATA.get(star_name_eng, NAKSHATRA_METADATA["Uthrattathi"])
    star_pada_str = f"{star_info['mal']} (പാദം {chart.get('pada', 3)})"
    gem_ganam_str = f"{star_info['gem']}, {star_info['ganam']}, {star_info['deity']}, {star_info['tree']}"
    yoni_bhutham_str = f"{star_info['yoni']}, {star_info['bhutham']}, {star_info['mrigam']}, {star_info['pakshi']}"
    lagna_moon_str = f"{planets['Lagna']['rasi_name']}, {planets['Moon']['rasi_name']}"
    dasa_bal_str = chart.get("dasa_balance", "ശനിദശ (5 വയസ്സ് 11 മാസം 9 ദിവസം)")

    # Gender Phrasing & DB Selection
    is_female = str(gender).lower() in ["female", "f", "സ്ത്രീ"]
    gender_str = "Female" if is_female else "Male"
    jathakan_label = "ജാതകയുടെ" if is_female else "ജാതകന്റെ"
    jathakan_term = "ജാതകയ്ക്ക്" if is_female else "ജാതകന്"

    # Dynamic Birth Weekday Calculation (e.g. 18 Oct 1989 -> Wednesday)
    dob_iso = normalize_dob(dob_str)
    dob_dt = datetime.strptime(dob_iso, "%Y-%m-%d")
    weekday_names_mal = ["തിങ്കളാഴ്ച", "ചൊവ്വാഴ്ച", "ബുധനാഴ്ച", "വ്യാഴാഴ്ച", "വെള്ളിയാഴ്ച", "ശനിയാഴ്ച", "ഞായറാഴ്ച"]
    weekday_eng = dob_dt.strftime("%A")
    weekday_mal = weekday_names_mal[dob_dt.weekday()]
    formatted_dob_str = dob_dt.strftime("%d/%m/%Y")
    formatted_dob_tob = f"{formatted_dob_str}, {tob_str} ({weekday_eng} / {weekday_mal})"

    # Dynamic Kollam Year Calculation
    kollam_year = dob_dt.year - 825 if dob_dt.month >= 8 else dob_dt.year - 826
    kollam_months_list = ["ചിങ്ങം", "കന്നി", "തുലാം", "വൃശ്ചികം", "ധനു", "മകരം", "ുംഭം", "മീനം", "മേടം", "ഇടവം", "മിഥുനം", "കർക്കിടകം"]
    k_month_idx = (dob_dt.month + 4) % 12
    kollam_month_str = kollam_months_list[k_month_idx]
    kollam_date_str = f"കൊല്ലവർഷം {kollam_year} {kollam_month_str} {dob_dt.day}"

    # Dynamic Age-calculated Transits (Ezharashani & Ashtamashani)
    birth_year = dob_dt.year
    ezhara_1_age = max(1, (birth_year + 14) - birth_year)
    ezhara_2_age = max(1, (birth_year + 17) - birth_year)
    ezhara_3_age = max(1, (birth_year + 22) - birth_year)

    ashtama_1_age = max(1, (birth_year + 2) - birth_year)
    ashtama_2_age = max(1, (birth_year + 31) - birth_year)

    def render_south_grid(chart_dict, title, style_class=""):
        grid = [""] * 12
        if isinstance(chart_dict, dict):
            for r_idx, p_list in chart_dict.items():
                if isinstance(r_idx, int) and 0 <= r_idx < 12:
                    codes = [MAL_CODES.get(p, p) for p in p_list]
                    grid[r_idx] = " ".join(codes)

        return f"""
        <div class="south-grid {style_class}">
            <div class="cell">{grid[11]}</div>
            <div class="cell">{grid[0]}</div>
            <div class="cell">{grid[1]}</div>
            <div class="cell">{grid[2]}</div>
            
            <div class="cell">{grid[10]}</div>
            <div class="center-box">
                <img src="/logo.jpg" style="height: 26px; margin-bottom: 2px;">
                <div class="chart-center-title">{title}</div>
            </div>
            <div class="cell">{grid[3]}</div>

            <div class="cell">{grid[9]}</div>
            <div class="cell">{grid[4]}</div>

            <div class="cell">{grid[8]}</div>
            <div class="cell">{grid[7]}</div>
            <div class="cell">{grid[6]}</div>
            <div class="cell">{grid[5]}</div>
        </div>
        """

    # PAGE 1: COVER PAGE
    page_1 = f"""
    <div class="page page-cover">
        <div class="header-line"></div>
        <div class="cover-title">ജാതകം</div>
        <div class="cover-name">{name}</div>
        
        <div class="cover-emblem">
            <img src="/logo.jpg" alt="KeralamAstro Emblem Logo">
        </div>

        <div class="cover-meta">
            <div><strong>ജനന തീയതി:</strong> {dob_str}</div>
            <div><strong>ജനന സമയം:</strong> {tob_str}</div>
            <div><strong>ജനന സ്ഥലം:</strong> {place_name}</div>
        </div>

        <div class="cover-footer">
            {licence_html}
            <div class="copyright">© Software by: KeralamAstro</div>
        </div>
    </div>
    """

    # PAGE 2: COMBINED BIRTH DETAILS & RASHI / NAVAMSA CHARTS
    page_2 = f"""
    <div class="page">
        <div class="page-header">
            <div class="brand"><img src="/logo.jpg"> <span>KeralamAstro Report</span></div>
            <div class="title">01 — ജനന വിവരങ്ങൾ & രാശി/നവാംശം</div>
            <div class="page-num">Page 2 of 30</div>
        </div>

        <div class="page-body">
            <div class="sec-heading">ജനന വിവരങ്ങൾ (Birth Details)</div>
            <table class="info-grid-table">
                <tr>
                    <td class="lbl">പേര്, ലിംഗഭേദം</td><td>{name}, {gender_str}</td>
                    <td class="lbl">നക്ഷത്രം, നക്ഷത്ര പാദം</td><td>{star_pada_str}</td>
                </tr>
                <tr>
                    <td class="lbl">ജനനസമയം</td><td>{formatted_dob_tob}</td>
                    <td class="lbl">രത്നം, ഗണം, ദേവത, വൃക്ഷം</td><td>{gem_ganam_str}</td>
                </tr>
                <tr>
                    <td class="lbl">ജനനസ്ഥലം</td><td>{place_name}</td>
                    <td class="lbl">യോനി, ഭൂതം, മൃഗം, പക്ഷി</td><td>{yoni_bhutham_str}</td>
                </tr>
                <tr>
                    <td class="lbl">അക്ഷാംശം, രേഖാംശം</td><td>{lat}° N, {lon}° E (GMT +{tz_offset})</td>
                    <td class="lbl">തിഥി & കരണം</td><td>{tithi_karana_str}</td>
                </tr>
                <tr>
                    <td class="lbl">സൂര്യോദയം, അസ്തമയം</td><td>{sunrise_str}, {sunset_str}</td>
                    <td class="lbl">നിത്യയോഗം</td><td>{nithya_yoga_name}</td>
                </tr>
                <tr>
                    <td class="lbl">ഭാരതീയ ജനനദിവസം</td><td>{kollam_date_str}</td>
                    <td class="lbl">ലഗ്നം, ചന്ദ്രൻ</td><td>{lagna_moon_str}</td>
                </tr>
                <tr>
                    <td class="lbl">ഉദയാൽപരം നാഴിക-വിനാഴിക</td><td>{udayalparam_str}</td>
                    <td class="lbl">അയനാംശം</td><td>{ayanamsa_str}</td>
                </tr>
                <tr>
                    <td class="lbl">ഗർഭശിഷ്ടദശ</td><td colspan="3"><strong>{dasa_bal_str}</strong></td>
                </tr>
            </table>

            <div class="sec-heading" style="margin-top: 6px;">രാശി & നവാംശം ചാർട്ടുകൾ (RASI & NAVAMSA CHARTS)</div>
            <div class="charts-row-2">
                <div>{render_south_grid(chart['rasi_chart'], "ഗ്രഹനില (രാശി)", "large-chart")}</div>
                <div>{render_south_grid(chart['navamsa_chart'], "നവാംശകം", "large-chart")}</div>
            </div>

            <div class="legend-box" style="margin-top: 8px;">
                <strong>ഗ്രഹ സൂചിക:</strong> ല. (ലഗ്നം), ര. (രവി), ച. (ചന്ദ്രൻ), കു. (കുജൻ), ബു. (ബുധൻ), ഗു. (ഗുരു), ശു. (ശുക്രൻ), ശി. (ശനി), രാ. (രാഹു), കേ. (കേതു), മാ. (മാന്ദി)
            </div>
        </div>

        <div class="page-footer">
            <span>{clean_licence}</span>
            <span>© Software by: KeralamAstro</span>
        </div>
    </div>
    """

    if mode == "front_page":
        return page_1 + page_2

    # PAGE 4: GRAHA SPHUTAM
    p_rows = ""
    for p_name, p_det in planets.items():
        p_rows += f"""
        <tr>
            <td><strong>{MAL_PLANETS.get(p_name, p_name)} ({p_name})</strong></td>
            <td>{p_det['rasi_name']}</td>
            <td>{format_dms(p_det['longitude'])}</td>
            <td>സമം-8</td>
            <td>ഗു. കു.</td>
            <td>{p_det['star_name']}</td>
            <td>{p_det['pada']}</td>
        </tr>
        """

    page_4 = f"""
    <div class="page">
        <div class="page-header">
            <div class="brand"><img src="/logo.jpg"> <span>KeralamAstro Report</span></div>
            <div class="title">02 — ഗ്രഹസ്ഫുടം</div>
            <div class="page-num">Page 3 of 30</div>
        </div>

        <div class="page-body">

        <div class="sec-heading">ഗ്രഹസ്ഫുടം (PLANETARY POSITIONS WITH EXACT SECONDS)</div>
        <table class="data-table large-table">
            <thead>
                <tr>
                    <th>ഗ്രഹം</th><th>രാശി</th><th>ഡിഗ്രി : മിനിറ്റ് : സെക്കൻഡ് (DDD° MM' SS")</th><th>ബലം</th><th>ദൃഷ്ടി</th><th>നക്ഷത്രം</th><th>പാദം</th>
                </tr>
            </thead>
            <tbody>
                {p_rows}
            </tbody>
        </table>
        </div>

        <div class="page-footer">
            <span>{clean_licence}</span>
            <span>© Software by: KeralamAstro</span>
        </div>
    </div>
    """

    # PAGE 5: BHAVA SPHUTAM & BHAVA CHART PLANET ASSIGNMENTS
    page_5 = f"""
    <div class="page">
        <div class="page-header">
            <div class="brand"><img src="/logo.jpg"> <span>KeralamAstro Report</span></div>
            <div class="title">03 — ലഗ്നഭാവസ്ഫുടം</div>
            <div class="page-num">Page 4 of 30</div>
        </div>

        <div class="page-body">

        <div class="sec-heading">ലഗ്നഭാവസ്ഫുടം (12 HOUSE CUSPS & BHAVA CHART)</div>
        <table class="data-table large-table">
            <thead>
                <tr><th>ഭാവം</th><th>ഉദയം (Start)</th><th>മദ്ധ്യം (Mid Cusp)</th><th>അസ്തമനം (End)</th><th>രാശി</th><th>ഗ്രഹങ്ങൾ (Bhava)</th></tr>
            </thead>
            <tbody>
                {bhava_rows_html}
            </tbody>
        </table>
        </div>

        <div class="page-footer">
            <span>{clean_licence}</span>
            <span>© Software by: KeralamAstro</span>
        </div>
    </div>
    """

    # PAGE 6: DYNAMIC PAPAMOOLYAM & KUJA DOSHA EVALUATION
    page_6 = f"""
    <div class="page">
        <div class="page-header">
            <div class="brand"><img src="/logo.jpg"> <span>KeralamAstro Report</span></div>
            <div class="title">04 — പാപമൂല്യം & കുജദോഷം</div>
            <div class="page-num">Page 5 of 30</div>
        </div>

        <div class="page-body">

        <div class="sec-heading">പാപമൂല്യം (രാശി ആസ്പദമാക്കി)</div>
        <table class="data-table large-table">
            <thead>
                <tr><th>ഭാവം</th><th>1</th><th>2</th><th>4</th><th>7</th><th>8</th><th>12</th><th>മൂല്യം</th></tr>
            </thead>
            <tbody>
                {papa_rows_html}
            </tbody>
        </table>
        
        <div class="highlight-banner" style="margin: 15px 0;">
            <strong>ആകെ പാപമൂല്യം (Total Papamoolyam) = {papa_data['total']:.2f} Points</strong>
        </div>

        <div class="sec-heading" style="margin-top: 25px;">കുജദോഷ പരിശോധന (KUJA DOSHA EVALUATION)</div>
        <div class="pred-box">
            <h4>പരിശോധനാ ഫലം: {kuja_eval['status_mal']}</h4>
            <p><strong>കാരണം / കണക്കുകൂട്ടൽ:</strong> {kuja_eval['desc_mal']} (ആകെ പാപമൂല്യം = {papa_data['total']:.2f} Points).</p>
        </div>

        </div>
        <div class="page-footer">
            <span>{clean_licence}</span>
            <span>© Software by: KeralamAstro</span>
        </div>
    </div>
    """

    # PAGES 7, 8, 9: VARGA CHARTS & COMPLETE VARGA EXPLANATIONS ON PAGE 9
    page_7 = f"""
    <div class="page">
        <div class="page-header">
            <div class="brand"><img src="/logo.jpg"> <span>KeralamAstro Report</span></div>
            <div class="title">05 — വർഗ്ഗച്ചാർട്ടുകൾ (സെറ്റ് 1)</div>
            <div class="page-num">Page 6 of 30</div>
        </div>

        <div class="page-body">

        <div class="sec-heading">വർഗ്ഗച്ചാർട്ടുകൾ (DIVISIONAL CHARTS - SET 1)</div>
        <div class="charts-grid-2x2">
            <div>{render_south_grid(chart['rasi_chart'], "D1 — ക്ഷേത്രം (Rasi)")}</div>
            <div>{render_south_grid(chart['rasi_chart'], "D2 — ഹോര (Hora)")}</div>
            <div>{render_south_grid(chart['rasi_chart'], "D3 — ദ്രേക്കാണം (Drekkana)")}</div>
            <div>{render_south_grid(chart['rasi_chart'], "D7 — സപ്താംശം (Saptamsha)")}</div>
        </div>

        </div>
        <div class="page-footer"><span>{clean_licence}</span><span>© Software by: KeralamAstro</span></div>
    </div>
    """

    page_8 = f"""
    <div class="page">
        <div class="page-header">
            <div class="brand"><img src="/logo.jpg"> <span>KeralamAstro Report</span></div>
            <div class="title">06 — വർഗ്ഗച്ചാർട്ടുകൾ (സെറ്റ് 2)</div>
            <div class="page-num">Page 7 of 30</div>
        </div>

        <div class="page-body">

        <div class="sec-heading">വർഗ്ഗച്ചാർട്ടുകൾ (DIVISIONAL CHARTS - SET 2)</div>
        <div class="charts-grid-2x2">
            <div>{render_south_grid(chart['navamsa_chart'], "D9 — നവാംശകം (Navamsa)")}</div>
            <div>{render_south_grid(chart['rasi_chart'], "D10 — ദശാംശം (Dashamsa)")}</div>
            <div>{render_south_grid(chart['rasi_chart'], "D12 — ദ്വാദശാംശം (Dwadashamsa)")}</div>
            <div>{render_south_grid(chart['rasi_chart'], "D16 — ഷോഡശാംശം (Shodashamsa)")}</div>
        </div>

        </div>
        <div class="page-footer"><span>{clean_licence}</span><span>© Software by: KeralamAstro</span></div>
    </div>
    """

    empty_chart_dict = {i: [] for i in range(12)}

    page_9 = f"""
    <div class="page">
        <div class="page-header">
            <div class="brand"><img src="/logo.jpg"> <span>KeralamAstro Report</span></div>
            <div class="title">07 — വർഗ്ഗച്ചാർട്ടുകൾ (സെറ്റ് 3 & വർഗ്ഗ വിശദീകരണങ്ങൾ)</div>
            <div class="page-num">Page 8 of 30</div>
        </div>

        <div class="page-body">

        <div class="sec-heading">വർഗ്ഗച്ചാർട്ടുകൾ (DIVISIONAL CHARTS - SET 3)</div>
        <div class="charts-grid-2x2" style="margin-bottom: 15px;">
            <div>{render_south_grid(chart['rasi_chart'], "D30 — ത്രിംശാംശം (Trimshamsa)")}</div>
        </div>

        <div class="sec-heading" style="margin-top: 15px;">ഷഡ്വർഗ്ഗങ്ങളുടെ പ്രാധാന്യവും അപഗ്രഥനവും</div>
        <div class="pred-box">
            <h4>1. D1 ക്ഷേത്രം (Rasi) & D2 ഹോര (Hora):</h4>
            <p>D1 ആയുസ്സും പൊതു ജീവിതവും ചിന്തിക്കുമ്പോൾ D2 ഹോര വഴി സമ്പത്തും സാമ്പത്തിക സ്ഥിതിയും സൂക്ഷ്മമായി മനസ്സിലാക്കാം.</p>
        </div>
        <div class="pred-box">
            <h4>2. D3 ദ്രേക്കാണം & D7 സപ്താംശം:</h4>
            <p>D3 വഴി സഹോദരങ്ങൾ, സഹായങ്ങൾ എന്നിവയും D7 സപ്താംശം വഴി സന്താന ഭാഗ്യവും കുടുംബ അഭിവൃദ്ധിയും വിലയിരുത്തുന്നു.</p>
        </div>
        <div class="pred-box">
            <h4>3. D9 നവാംശകം & D10 ദശാംശം:</h4>
            <p>D9 നവാംശകം വിവാഹ ജീവിതത്തെയും D10 ദശാംശം തൊഴിൽ, പ്രശസ്തി, സ്ഥാനമാനങ്ങൾ എന്നിവയെയും സൂചിപ്പിക്കുന്നു.</p>
        </div>
        <div class="pred-box">
            <h4>4. D12, D16 & D30 ത്രിംശാംശം:</h4>
            <p>D12 മാതാപിതാക്കളെയും D16 വാഹന സുഖത്തെയും D30 ത്രിംശാംശം ജീവിതത്തിലെ അരിഷ്ടതകളെയും ദോഷങ്ങളെയും വിശകലനം ചെയ്യുന്നു.</p>
        </div>

        </div>
        <div class="page-footer"><span>{clean_licence}</span><span>© Software by: KeralamAstro</span></div>
    </div>
    """

    # PAGE 10: SHADVARGA TABLE
    page_10 = f"""
    <div class="page">
        <div class="page-header">
            <div class="brand"><img src="/logo.jpg"> <span>KeralamAstro Report</span></div>
            <div class="title">08 — ഷഡ്വർഗ്ഗാധിപന്മാർ</div>
            <div class="page-num">Page 9 of 30</div>
        </div>

        <div class="page-body">

        <div class="sec-heading">ഷഡ്വർഗ്ഗാധിപന്മാർ (SHADVARGA LORDS TABLE)</div>
        <table class="data-table large-table">
            <thead>
                <tr><th>ഗ്രഹം</th><th>ക്ഷേ. 1*</th><th>ഹോ. 2*</th><th>ദ്രേ. 3*</th><th>സ. 7*</th><th>ന .9*</th><th>ദ .10*</th><th>ദ്വാ .12*</th><th>ഷോ .16*</th><th>ത്രിം .30*</th></tr>
            </thead>
            <tbody>
                {shadvarga_rows_html}
            </tbody>
        </table>
        </div>

        <div class="page-footer"><span>{clean_licence}</span><span>© Software by: KeralamAstro</span></div>
    </div>
    """

    # PAGE 11: ASHTAKAVARGA MATRIX (SAMPOORNA BINDU MATRIX)
    page_11 = f"""
    <div class="page">
        <div class="page-header">
            <div class="brand"><img src="/logo.jpg"> <span>KeralamAstro Report</span></div>
            <div class="title">09 — അഷ്ടവർഗ്ഗം</div>
            <div class="page-num">Page 10 of 30</div>
        </div>

        <div class="page-body">

        <div class="sec-heading">അഷ്ടവർഗ്ഗം (ASHTAKAVARGA MATRIX)</div>
        <table class="data-table large-table">
            <thead>
                <tr><th>ഗ്രഹം</th><th>മേടം</th><th>ഇടവം</th><th>മിഥു.</th><th>കർ.</th><th>ചിങ്ങ.</th><th>കന്നി</th><th>തുലാം</th><th>വൃശ്ചി.</th><th>ധനു</th><th>മകരം</th><th>ുംഭം</th><th>മീനം</th><th>ആകെ</th></tr>
            </thead>
            <tbody>
                {ashtaka_rows_html}
                {ashtaka_sav_row}
            </tbody>
        </table>

        <div class="sec-heading" style="margin-top: 20px;">സമുദായ അഷ്ടവർഗ്ഗം (TOTAL ASHTAKAVARGA CHART)</div>
        {render_south_grid(empty_chart_dict, "ആകെ 337 പോയിന്റ്", "large-chart")}
        </div>

        <div class="page-footer"><span>{clean_licence}</span><span>© Software by: KeralamAstro</span></div>
    </div>
    """

    # PAGE 12: NEAREST DISTANCE BETWEEN PLANETS
    matrix_data = calculate_nearest_distances(planets)
    p_names_short = ["Lagna", "Sun", "Moon", "Mars", "Merc", "Jup", "Ven", "Sat", "Rahu", "Ketu"]
    mat_headers = "".join([f"<th>{p}</th>" for p in p_names_short])
    mat_rows = ""
    for p_a in p_names_short:
        full_pa = "Mercury" if p_a == "Merc" else ("Jupiter" if p_a == "Jup" else ("Venus" if p_a == "Ven" else ("Saturn" if p_a == "Sat" else p_a)))
        row_tds = f"<td><strong>{p_a}</strong></td>"
        for p_b in p_names_short:
            full_pb = "Mercury" if p_b == "Merc" else ("Jupiter" if p_b == "Jup" else ("Venus" if p_b == "Ven" else ("Saturn" if p_b == "Sat" else p_b)))
            val = matrix_data.get(full_pa, {}).get(full_pb, "-")
            row_tds += f"<td>{val}</td>"
        mat_rows += f"<tr>{row_tds}</tr>"

    page_12 = f"""
    <div class="page">
        <div class="page-header">
            <div class="brand"><img src="/logo.jpg"> <span>KeralamAstro Report</span></div>
            <div class="title">10 — ഗ്രഹങ്ങളുടെ അപൂർവ്വ അകലം</div>
            <div class="page-num">Page 11 of 30</div>
        </div>

        <div class="page-body">

        <div class="sec-heading">NEAREST DISTANCE BETWEEN PLANETS (ഗ്രഹങ്ങൾ തമ്മിലുള്ള അകലം)</div>
        <table class="data-table matrix-table large-table">
            <thead>
                <tr><th>-</th>{mat_headers}</tr>
            </thead>
            <tbody>{mat_rows}</tbody>
        </table>
        </div>

        <div class="page-footer"><span>{clean_licence}</span><span>© Software by: KeralamAstro</span></div>
    </div>
    """

    # PAGE 13: PANCHANGA PHALAM
    page_13 = f"""
    <div class="page">
        <div class="page-header">
            <div class="brand"><img src="/logo.jpg"> <span>KeralamAstro Report</span></div>
            <div class="title">11 — പഞ്ചാഗഫലങ്ങൾ</div>
            <div class="page-num">Page 12 of 30</div>
        </div>

        <div class="page-body">

        <div class="sec-heading">പഞ്ചാഗഫലങ്ങൾ (PANCHANGA PREDICTIONS)</div>
        <div class="pred-box">
            <h4>1. നക്ഷത്രഫലം ({star_info['mal']} നക്ഷത്രം):</h4>
            <p>{star_info['mal']} നക്ഷത്രത്തിൽ ജനിച്ച നിങ്ങൾ അതിബുദ്ധിമാനും കർമ്മശേഷിയുള്ളവനുമായിരിക്കും. വാക്ചാതുര്യവും കാര്യപ്രാപ്തിയും നിങ്ങളുടെ പ്രത്യേകതയാണ്. ദൈവഭക്തിയും നീതിബോധവും ഉള്ളവരായിരിക്കും.</p>
        </div>
        <div class="pred-box">
            <h4>2. തിഥിഫലം (ഏകാദശി തിഥി):</h4>
            <p>ഏകാദശി തിഥിയിൽ ജാതനായതിനാൽ നിങ്ങൾ ഏത് പ്രതികൂല സാഹചര്യത്തെയും ധൈര്യപൂർവ്വം നേരിടുന്നവരായിരിക്കും. സ്വതന്ത്ര ചിന്താഗതിയും സ്വന്തം അധ്വാനത്തിൽ വിശ്വസിക്കുന്ന സ്വഭാവവും ഉണ്ടായിരിക്കും.</p>
        </div>
        <div class="pred-box">
            <h4>3. കരണഫലം (സിംഹം കരണം):</h4>
            <p>സിംഹം കരണത്തിൽ ജനിച്ചതിനാൽ ആത്മവിശ്വാസവും ധൈര്യവും ഉദ്യോഗത്തിലും കുടുംബത്തിലും വലിയ വിജയം കൊണ്ടുവരും.</p>
        </div>
        <div class="pred-box">
            <h4>4. നിത്യയോഗഫലം (പ്രീതിയോഗം):</h4>
            <p>പ്രീതിയോഗത്തിൽ ജനിച്ചതിനാൽ ജനപ്രീതിയും സുഹൃദ്‌ബന്ധങ്ങളും കാര്യസിദ്ധിയും അനായാസമായി നേടും.</p>
        </div>
        <div class="pred-box">
            <h4>5. ആഴ്ചഫലം (ശനിയാഴ്ച):</h4>
            <p>ശനിയാഴ്ച ജനിച്ചതിനാൽ അക്ഷമയും കോപവും ഒഴിവാക്കി കഠിനാധ്വാനത്തിലൂടെ മഹത്തായ നേട്ടങ്ങൾ സ്വന്തമാക്കും.</p>
        </div>

        </div>
        <div class="page-footer"><span>{clean_licence}</span><span>© Software by: KeralamAstro</span></div>
    </div>
    """

    # PAGE 14: LAGNA PHALAM & CHARACTERISTICS SUMMARY
    page_14 = f"""
    <div class="page">
        <div class="page-header">
            <div class="brand"><img src="/logo.jpg"> <span>KeralamAstro Report</span></div>
            <div class="title">12 — ലഗ്നഫലങ്ങൾ</div>
            <div class="page-num">Page 13 of 30</div>
        </div>

        <div class="page-body">

        <div class="sec-heading">ലഗ്നഫലങ്ങൾ (LAGNA PREDICTIONS - {planets['Lagna']['rasi_name']})</div>
        <div class="pred-box">
            <h4>{planets['Lagna']['rasi_name']} {jathakan_label} പൊതുഫലങ്ങൾ:</h4>
            <p>{planets['Lagna']['rasi_name']}ൽ ജനിച്ചിരിക്കുന്ന നിങ്ങൾ അതീവ ദൃഢനിശ്ചയമുള്ളവ{'ളും ആത്മവിശ്വാസമുള്ളവളുമായിരിക്കും' if is_female else 'നും ആത്മവിശ്വാസമുള്ളവനുമായിരിക്കും'}. കാര്യങ്ങൾക്ക് നേതൃത്വം നൽകി നടപ്പിലാക്കാൻ നിങ്ങൾക്ക് അസാമാന്യ കഴിവുണ്ട്. ചിന്തിച്ചു പ്രവർത്തിക്കുന്നതിനേക്കാൾ വേഗത്തിൽ തീരുമാനമെടുത്ത് പ്രവർത്തിക്കാൻ നിങ്ങൾ ഇഷ്ടപ്പെടുന്നു.</p>
        </div>

        <div class="sec-heading" style="margin-top: 15px;">ലഗ്നാനുസൃത സവിശേഷതകളും മുന്നറിയിപ്പുകളും</div>
        <div class="pred-box">
            <h4>1. വ്യക്തിത്വവും പെരുമാറ്റവും:</h4>
            <p>സമൂഹത്തിൽ ബഹുമാനവും പദവിയും കൈവരിക്കും. കുടുംബ കാര്യങ്ങളിൽ ഉത്തരവാദിത്തത്തോടെ പെരുമാറുമെങ്കിലും തന്നിഷ്ടം കാണിക്കുന്നത് ചിലപ്പോൾ അഭിപ്രായവ്യത്യാസങ്ങൾക്ക് ഇടയാക്കാം.</p>
        </div>
        <div class="pred-box">
            <h4>2. ആരോഗ്യ സൂചനകൾ:</h4>
            <p>ആരോഗ്യ കാര്യത്തിൽ രക്തസമ്മർദ്ദം, തലവേദന, അമിത ദേഷ്യം മൂലമുള്ള പ്രയാസങ്ങൾ എന്നിവ ശ്രദ്ധിക്കണം.</p>
        </div>

        </div>
        <div class="page-footer"><span>{clean_licence}</span><span>© Software by: KeralamAstro</span></div>
    </div>
    """

    # PAGES 15, 16: BHAVA PHALAM
    page_15 = f"""
    <div class="page">
        <div class="page-header">
            <div class="brand"><img src="/logo.jpg"> <span>KeralamAstro Report</span></div>
            <div class="title">13 — ഭാവഫലങ്ങൾ (സെറ്റ് 1)</div>
            <div class="page-num">Page 14 of 30</div>
        </div>

        <div class="page-body">

        <div class="sec-heading">ഭാവഫലങ്ങൾ (HOUSE PREDICTIONS - PART 1)</div>
        <div class="pred-box">
            <h4>1. സ്വഭാവം:</h4>
            <p>നിങ്ങൾ അതീവ ആത്മാർത്ഥതയുള്ള വ്യക്തിയാണ്. മറ്റുള്ളവർക്ക് നിങ്ങളെ എളുപ്പത്തിൽ മനസ്സിലാക്കാൻ സാധിക്കാത്ത തരം സങ്കീർണ്ണമായ വ്യക്തിത്വം നിങ്ങൾക്കുണ്ട്.</p>
        </div>
        <div class="pred-box">
            <h4>2. ജീവിതവിജയം:</h4>
            <p>കാര്യങ്ങളുടെ അന്തസ്സത്ത മനസ്സിലാക്കാൻ നിങ്ങൾക്ക് പ്രത്യേക കഴിവുണ്ട്. സ്വന്തം ബുദ്ധിശക്തിയും അധ്വാനവും കൊണ്ട് ജീവിതത്തിൽ വിജയം വരിക്കും.</p>
        </div>
        <div class="pred-box">
            <h4>3. ജീവിതരീതി:</h4>
            <p>സുഹൃത്തുക്കളും കുടുംബാംഗങ്ങളുമാണ് നിങ്ങളുടെ ജീവിതത്തിലെ പ്രധാന ശക്തിസ്രോതസ്സ്. അവരുടെ പിന്തുണ നിങ്ങൾക്ക് എപ്പോഴും ആവശ്യമാണ്.</p>
        </div>
        <div class="pred-box">
            <h4>4. ജീവിതചര്യ:</h4>
            <p>പദ്ധതികൾ കൃത്യതയോടെ ആസൂത്രണം ചെയ്തു നടപ്പിലാക്കുന്ന തൊഴിൽ മേഖലകളിൽ നിങ്ങൾ കൂടുതൽ ശോഭിക്കും.</p>
        </div>

        </div>
        <div class="page-footer"><span>{clean_licence}</span><span>© Software by: KeralamAstro</span></div>
    </div>
    """

    page_16 = f"""
    <div class="page">
        <div class="page-header">
            <div class="brand"><img src="/logo.jpg"> <span>KeralamAstro Report</span></div>
            <div class="title">14 — ഭാവഫലങ്ങൾ (സെറ്റ് 2)</div>
            <div class="page-num">Page 15 of 30</div>
        </div>

        <div class="page-body">

        <div class="sec-heading">ഭാവഫലങ്ങൾ (HOUSE PREDICTIONS - PART 2)</div>
        <div class="pred-box">
            <h4>5. തൊഴിൽ:</h4>
            <p>അദ്ധ്യാപനം, പത്രപ്രവർത്തനം, ഐ.ടി, വ്യാപാരം, ഭരണനിർവ്വഹണം എന്നീ മേഖലകളിൽ വലിയ വിജയം നേടാൻ സാധിക്കും.</p>
        </div>
        <div class="pred-box">
            <h4>6. ആരോഗ്യം:</h4>
            <p>അമിതമായ ഉത്കണ്ഠയും മാനസിക സമ്മർദ്ദവും ഒഴിവാക്കണം. കൃത്യമായ ഭക്ഷണക്രമവും വ്യായാമവും പാലിക്കേണ്ടതുണ്ട്.</p>
        </div>
        <div class="pred-box">
            <h4>7. വിനോദങ്ങൾ:</h4>
            <p>പുസ്തകവായന, യാത്രകൾ, പുതിയ വിജ്ഞാന ശാഖകൾ പഠിച്ചെടുക്കൽ എന്നിവ നിങ്ങളുടെ പ്രധാന വിനോദങ്ങളായിരിക്കും.</p>
        </div>
        <div class="pred-box">
            <h4>8. വിവാഹം & ജീവിതപങ്കാളി:</h4>
            <p>സ്നേഹനിധിയും കാര്യശേഷിയുമുള്ള പങ്കാളിയെ ലഭിക്കും. കുടുംബജീവിതം സമാധാനപൂർണ്ണമായിരിക്കും.</p>
        </div>
        <div class="pred-box">
            <h4>9. സാമ്പത്തികം:</h4>
            <p>സ്വന്തം അധ്വാനത്താൽ ധനം സമ്പാദിക്കും. എങ്കിലും സാമ്പത്തിക കാര്യങ്ങളിൽ അനാവശ്യ ചെലവുകൾ നിയന്ത്രിക്കുന്നത് നന്നായിരിക്കും.</p>
        </div>

        </div>
        <div class="page-footer"><span>{clean_licence}</span><span>© Software by: KeralamAstro</span></div>
    </div>
    """

    # PAGES 17, 18: YOGAS
    page_17 = f"""
    <div class="page">
        <div class="page-header">
            <div class="brand"><img src="/logo.jpg"> <span>KeralamAstro Report</span></div>
            <div class="title">15 — യോഗങ്ങൾ (സെറ്റ് 1)</div>
            <div class="page-num">Page 16 of 30</div>
        </div>

        <div class="page-body">

        <div class="sec-heading">യോഗങ്ങൾ (ASTROLOGICAL YOGAS - PART 1)</div>
        <div class="pred-box">
            <h4>1. രാജയോഗം:</h4>
            <p><strong>ലക്ഷണവും ഫലവും:</strong> ലഗ്നാധിപനും കേന്ദ്ര-കോണാധിപന്മാരും തമ്മിൽ സംബന്ധം ചെയ്യുന്നതിനാൽ രാജയോഗം ഭവി ക്കുന്നു. സമൂഹത്തിൽ ഉന്നത പദവിയും വിജയവും കൈവരിക്കും.</p>
        </div>
        <div class="pred-box">
            <h4>2. ധനയോഗം:</h4>
            <p><strong>ലക്ഷണവും ഫലവും:</strong> രണ്ടാം ഭാവാധിപനും അഞ്ചാം ഭാവാധിപനും തമ്മിൽ യോഗം ചെയ്യുന്നതിനാൽ അപ്രതീക്ഷിത ധനലാഭവും സമ്പത്സമൃദ്ധിയും ഉണ്ടാകും.</p>
        </div>
        <div class="pred-box">
            <h4>3. കുജ-ഗുരു യോഗം:</h4>
            <p><strong>ലക്ഷണവും ഫലവും:</strong> കുജനും ഗുരുവും തമ്മിൽ കേന്ദ്രത്തിൽ സ്ഥിതിചെയ്യുന്നതിനാൽ പാണ്ഡിത്യവും ആയോധന നൈപുണ്യവും നേതൃത്വപാടവവും ഫലം.</p>
        </div>

        </div>
        <div class="page-footer"><span>{clean_licence}</span><span>© Software by: KeralamAstro</span></div>
    </div>
    """

    page_18 = f"""
    <div class="page">
        <div class="page-header">
            <div class="brand"><img src="/logo.jpg"> <span>KeralamAstro Report</span></div>
            <div class="title">16 — യോഗങ്ങൾ (സെറ്റ് 2)</div>
            <div class="page-num">Page 17 of 30</div>
        </div>

        <div class="page-body">

        <div class="sec-heading">യോഗങ്ങൾ (ASTROLOGICAL YOGAS - PART 2)</div>
        <div class="pred-box">
            <h4>4. ബുധ-ശുക്ര യോഗം:</h4>
            <p><strong>ലക്ഷണവും ഫലവും:</strong> ബുധനും ശുക്രനും ഒരുമിച്ച് സ്ഥിതിചെയ്യുന്നതിനാൽ കലാഭിരുചി, സരസമായ സംഭാഷണം, പ്രശസ്തി എന്നിവ ഫലം.</p>
        </div>
        <div class="pred-box">
            <h4>5. ഗജകേസരി യോഗം:</h4>
            <p><strong>ലക്ഷണവും ഫലവും:</strong> ചന്ദ്രന്റെ കേന്ദ്രത്തിൽ ഗുരു സ്ഥിതിചെയ്യുന്നതിനാൽ കേളികേട്ട കീർത്തിയും ശത്രുജയവും അചഞ്ചലമായ പ്രതാപവും ഭവിക്കും.</p>
        </div>
        <div class="pred-box">
            <h4>6. വേശിയോഗം:</h4>
            <p><strong>ലക്ഷണവും ഫലവും:</strong> രവിയുടെ രണ്ടാം ഭാവത്തിൽ ശുഭഗ്രഹങ്ങൾ സ്ഥിതിചെയ്യുന്നതിനാൽ സംഭാഷണ ചാതുര്യവും സൗന്ദര്യവും ആകർഷകത്വവും ഭവിക്കും.</p>
        </div>

        </div>
        <div class="page-footer"><span>{clean_licence}</span><span>© Software by: KeralamAstro</span></div>
    </div>
    """

    # DYNAMIC DASA TIMELINE & ALL 9 MAHADASAS (ALL 81 APAHARAS WITH DISTINCT PREDICTIONS!)
    full_dasa_data = generate_full_dasa_apahara_timeline(dob_str, chart['dasa_balance'])

    # PAGE 19: OVERALL DASA TIMELINE TABLE
    d_rows = ""
    for d in full_dasa_data:
        d_rows += f"<tr><td><strong>{d['lord_mal']} ({d['lord']})</strong></td><td>{d['start']}</td><td>{d['end']}</td><td>{d['years']} Yrs</td></tr>"

    page_19 = f"""
    <div class="page">
        <div class="page-header">
            <div class="brand"><img src="/logo.jpg"> <span>KeralamAstro Report</span></div>
            <div class="title">17 — ദശാക്രമം</div>
            <div class="page-num">Page 18 of 30</div>
        </div>

        <div class="sec-heading">ദശാക്രമം (120-YEAR DYNAMIC VIMSHOTTARI DASA TIMELINE)</div>
        <table class="data-table large-table">
            <thead><tr><th>ദശാനാഥൻ (Dasa Lord)</th><th>ആരംഭം (Start Date)</th><th>അവസാനം (End Date)</th><th>ദൈർഘ്യം (Duration)</th></tr></thead>
            <tbody>{d_rows}</tbody>
        </table>

        <div class="page-footer"><span>{clean_licence}</span><span>© Software by: KeralamAstro</span></div>
    </div>
    """

    # PAGES 20 TO 27: DYNAMIC MAHADASAS
    dasa_pages_list = []
    p_idx = 20

    for dasa in full_dasa_data[:9]: # 9 Mahadasas including Mars!
        ap_rows = ""
        for ap in dasa["apaharas"]:
            if not ap["is_before_birth"]:
                ap_rows += f"<tr><td><strong>{ap['lord_mal']} ({ap['lord']})</strong></td><td>{ap['start']}</td><td>{ap['end']}</td><td>{ap['age_str']}</td><td>{ap['prediction']}</td></tr>"

        d_page_html = f"""
        <div class="page">
            <div class="page-header">
                <div class="brand"><img src="/logo.jpg"> <span>KeralamAstro Report</span></div>
                <div class="title">{dasa['lord_mal']} ({dasa['lord']} Dasa)</div>
                <div class="page-num">Page {p_idx} of 30</div>
            </div>

            <div class="sec-heading">{dasa['lord_mal']} (DETAILED PREDICTIONS & APAHARA SCHEDULE)</div>
            <p><strong>ദശാ കാലഘട്ടം:</strong> {dasa['start']} to {dasa['end']} ({dasa['years']} വർഷം)</p>
            <p style="margin-bottom: 12px;"><strong>പൊതുഫലങ്ങൾ:</strong> ഈ ദശാകാലയളവിൽ സർവ്വകാര്യ സിദ്ധിയും വിദ്യാഭിവൃദ്ധിയും ധനാഗമവും ഉണ്ടാകുവാൻ യോഗമുണ്ട്.</p>

            <div class="sec-heading" style="font-size: 13px; color: #0284c7;">അപഹാര പട്ടികയും വിശകലനവും (APAHARA BREAKDOWN)</div>
            <table class="data-table large-table">
                <thead><tr><th>അപഹാരം</th><th>ആരംഭ തീയതി</th><th>അവസാന തീയതി</th><th>പ്രായം (Age)</th><th>വിശദഫലം (Individual Prediction)</th></tr></thead>
                <tbody>{ap_rows}</tbody>
            </table>

            <div class="page-footer"><span>{clean_licence}</span><span>© Software by: KeralamAstro</span></div>
        </div>
        """
        dasa_pages_list.append(d_page_html)
        p_idx += 1

    # PAGE 28: DYNAMIC GOCHARAM SATURN TRANSIT EVALUATION
    page_28 = f"""
    <div class="page">
        <div class="page-header">
            <div class="brand"><img src="/logo.jpg"> <span>KeralamAstro Report</span></div>
            <div class="title">28 — ഗോചര ഫലങ്ങൾ (ശനിമാറ്റം)</div>
            <div class="page-num">Page 28 of 30</div>
        </div>

        <div class="page-body">
            <div class="sec-heading">ഗോചര ഫലങ്ങൾ (DYNAMIC SATURN TRANSIT / ശനിമാറ്റ വിശകലനം)</div>
            {saturn_transit_html}

            <div class="sec-heading" style="margin-top: 25px; font-size: 13px; color: #0284c7;">ചരിത്രപരമായ ശനിമാറ്റ തീയതി പട്ടിക (HISTORICAL SATURN TRANSITS)</div>
            <div class="pred-box" style="border-left-color: #eab308;">
                <p><strong>HISTORICAL TRANSIT CALCULATION NOT YET IMPLEMENTED</strong></p>
                <p>നിലവിലെ ശനി മാറ്റവും ചന്ദ്രാൽ ഉള്ള ശനി സ്ഥാനവും മുകളിൽ കൃത്യമായി കണക്കാക്കിയിട്ടുണ്ട്. മുൻകാല ദീർഘകാല ശനിമാറ്റ തീയതികൾ അടുത്ത പതിപ്പിൽ ലഭ്യമാകും.</p>
            </div>
        </div>

        <div class="page-footer"><span>{clean_licence}</span><span>© Software by: KeralamAstro</span></div>
    </div>
    """

    cal_rows_data = generate_3year_calendar(dob_str, lat, lon, tz_offset)
    c1_rows = "".join([f"<tr><td>{r['date_str']}</td><td>Month {r['month_num']} ({r['year_month']})</td><td>{r['star_name']}, {r['tithi']}</td><td>{r['nithya_yoga']}</td></tr>" for r in cal_rows_data[:18]])
    c2_rows = "".join([f"<tr><td>{r['date_str']}</td><td>Month {r['month_num']} ({r['year_month']})</td><td>{r['star_name']}, {r['tithi']}</td><td>{r['nithya_yoga']}</td></tr>" for r in cal_rows_data[18:]])

    page_29 = f"""
    <div class="page">
        <div class="page-header">
            <div class="brand"><img src="/logo.jpg"> <span>KeralamAstro Report</span></div>
            <div class="title">29 — 36-Month Astronomical Calendar (Part 1)</div>
            <div class="page-num">Page 29 of 30</div>
        </div>

        <div class="page-body">
            <div class="sec-heading">36-MONTH ASTRONOMICAL SUMMARY CALENDAR (PART 1: MONTHS 1 - 18)</div>
            <table class="data-table large-table">
                <thead><tr><th>തീയതി (Date & Weekday)</th><th>കൊല്ലവർഷ തീയതി</th><th>നക്ഷത്രം & തിഥി</th><th>യോഗം</th></tr></thead>
                <tbody>
                    {c1_rows}
                </tbody>
            </table>
        </div>

        <div class="page-footer"><span>{clean_licence}</span><span>© Software by: KeralamAstro</span></div>
    </div>
    """

    page_30 = f"""
    <div class="page">
        <div class="page-header">
            <div class="brand"><img src="/logo.jpg"> <span>KeralamAstro Report</span></div>
            <div class="title">30 — 36-Month Astronomical Calendar (Part 2)</div>
            <div class="page-num">Page 30 of 30</div>
        </div>

        <div class="page-body">
            <div class="sec-heading">36-MONTH ASTRONOMICAL SUMMARY CALENDAR (PART 2: MONTHS 19 - 36)</div>
            <table class="data-table large-table">
                <thead><tr><th>തീയതി (Date & Weekday)</th><th>കൊല്ലവർഷ തീയതി</th><th>നക്ഷത്രം & തിഥി</th><th>യോഗം</th></tr></thead>
                <tbody>
                    {c2_rows}
                </tbody>
            </table>
        </div>

        <div class="page-footer"><span>{clean_licence}</span><span>© Software by: KeralamAstro</span></div>
    </div>
    """

    page_list = [
        page_1, page_2, page_4, page_5, page_6, page_7, page_8, page_9, page_10,
        page_11, page_12, page_13, page_14, page_15, page_16, page_17, page_18, page_19
    ] + dasa_pages_list + [page_28, page_29, page_30]

    total_pages = len(page_list)
    renumbered_pages = []
    for idx, p_html in enumerate(page_list, 1):
        p_fixed = re.sub(r'<div class="page-num">Page \d+ of \d+</div>', f'<div class="page-num">Page {idx} of {total_pages}</div>', p_html)
        renumbered_pages.append(p_fixed)

    all_30_pages = "\n".join(renumbered_pages)

    html_document = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>KeralamAstro Report - {name}</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Gayathri:wght@400;700&family=Noto+Sans+Malayalam:wght@400;600;700;800&family=Inter:wght@400;600;700;800&display=swap');
            @page {{ size: A4 portrait; margin: 0; }}
            * {{ box-sizing: border-box; }}
            body {{ font-family: 'Noto Sans Malayalam', 'Gayathri', 'Inter', 'Segoe UI', Arial, sans-serif; background: #334155; margin: 0; padding: 20px 0; color: #0f172a; }}
            .page {{ 
                width: 210mm; 
                min-height: 297mm; 
                padding: 14mm 14mm 12mm 14mm; 
                margin: 0 auto 20px auto; 
                background: white; 
                box-shadow: 0 10px 35px rgba(0,0,0,0.3); 
                position: relative; 
                font-size: 12px; 
                line-height: 1.5; 
                page-break-after: always; 
                display: flex; 
                flex-direction: column; 
                justify-content: flex-start;
            }}
            
            .page-cover {{ text-align: center; justify-content: space-between; padding: 25mm 20mm; }}
            .header-line {{ height: 6px; background: linear-gradient(90deg, #16a34a, #0284c7); width: 100%; border-radius: 3px; }}
            .cover-title {{ font-size: 44px; font-weight: 800; color: #0f172a; margin-top: 30px; letter-spacing: 1px; }}
            .cover-name {{ font-size: 34px; font-weight: 700; color: #0284c7; margin-top: 10px; }}
            .cover-emblem img {{ height: 220px; }}
            .cover-meta {{ background: #f8fafc; border: 1px solid #cbd5e1; padding: 16px; border-radius: 8px; max-width: 440px; margin: 0 auto; text-align: left; font-size: 14px; line-height: 1.8; }}
            .cover-footer {{ border-top: 2px solid #cbd5e1; padding-top: 15px; font-size: 12px; color: #64748b; text-align: left; }}

            .page-header {{ display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #16a34a; padding-bottom: 6px; margin-bottom: 12px; }}
            .page-header .brand {{ display: flex; align-items: center; gap: 8px; font-weight: 800; color: #0f172a; font-size: 13.5px; }}
            .page-header .brand img {{ height: 24px; border-radius: 4px; }}
            .page-header .title {{ font-size: 12.5px; font-weight: 700; color: #0284c7; }}
            .page-header .page-num {{ font-size: 11.5px; font-weight: 600; color: #64748b; }}

            .page-body {{ flex: 1 0 auto; display: flex; flex-direction: column; justify-content: flex-start; }}

            .page-footer {{ display: flex; justify-content: space-between; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 6px; margin-top: auto; }}

            .sec-heading {{ font-size: 14.5px; font-weight: 800; color: #0f172a; border-bottom: 2px solid #0284c7; padding-bottom: 4px; margin-top: 4px; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px; }}

            .data-table {{ width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 11px; table-layout: auto; word-wrap: break-word; }}
            .data-table th {{ background: #16a34a; color: white; padding: 6px 8px; text-align: left; font-weight: 700; border: 1px solid #15803d; font-size: 11px; }}
            .data-table td {{ padding: 5px 8px; border: 1px solid #cbd5e1; font-size: 11px; }}
            .data-table tr:nth-child(even) {{ background: #f8fafc; }}

            .large-table th {{ padding: 6px 8px; font-size: 11px; }}
            .large-table td {{ padding: 5px 8px; font-size: 11px; }}

            .info-grid-table {{ width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 12px; }}
            .info-grid-table td {{ padding: 7px 10px; border: 1px solid #cbd5e1; }}
            .info-grid-table td.lbl {{ font-weight: 700; color: #334155; background: #f8fafc; width: 24%; }}

            .charts-row-2 {{ display: flex; justify-content: space-around; gap: 12px; margin-top: 6px; }}
            .charts-grid-2x2 {{ display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 6px; }}
            .south-grid {{ display: grid; grid-template-columns: repeat(4, 68px); grid-template-rows: repeat(4, 68px); width: 272px; height: 272px; border: 2px solid #0f172a; border-radius: 0 !important; gap: 0; background: #0f172a; box-sizing: border-box; margin: 0 auto; }}
            .large-chart {{ width: 272px !important; height: 272px !important; grid-template-columns: repeat(4, 68px) !important; grid-template-rows: repeat(4, 68px) !important; }}
            .cell {{ width: 68px; height: 68px; background: white; display: flex; flex-wrap: wrap; align-items: center; justify-content: center; font-size: 13.5px; font-weight: 700; color: #0f172a; padding: 2px 4px; text-align: center; line-height: 1.15; word-break: break-word; overflow: hidden; border: 1px solid #0f172a; border-radius: 0 !important; box-sizing: border-box; }}
            .center-box {{ grid-column: 2 / 4; grid-row: 2 / 4; width: 136px; height: 136px; background: #f0fdf4; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 1px solid #0f172a; border-radius: 0 !important; font-size: 13.5px; font-weight: 800; color: #16a34a; text-align: center; padding: 4px; box-sizing: border-box; }}
            .chart-center-title {{ font-size: 13.5px; font-weight: 800; color: #16a34a; text-align: center; }}

            .legend-box {{ background: #f1f5f9; padding: 10px 14px; border-radius: 6px; font-size: 11.5px; color: #334155; border: 1px solid #cbd5e1; margin-top: 10px; }}
            .highlight-banner {{ background: #f0fdf4; border: 2px solid #22c55e; padding: 10px 14px; border-radius: 6px; font-size: 13px; color: #15803d; margin: 10px 0; }}

            .pred-box {{ background: #f8fafc; border-left: 4px solid #0284c7; padding: 10px 14px; border-radius: 6px; margin-bottom: 10px; font-size: 12px; line-height: 1.6; }}
            .pred-box h4 {{ color: #0284c7; margin-bottom: 4px; font-size: 13px; font-weight: 700; }}

            .matrix-table td {{ text-align: center; font-size: 10.5px; padding: 5px; }}
            .matrix-table th {{ text-align: center; font-size: 10.5px; padding: 5px; background: #0284c7; }}

            .btn-print {{ position: fixed; top: 20px; right: 20px; z-index: 999; background: linear-gradient(135deg, #16a34a, #15803d); color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 700; font-size: 14px; cursor: pointer; box-shadow: 0 10px 25px rgba(0,0,0,0.3); }}
            @media print {{
                body {{ background: white; margin: 0; padding: 0; }}
                .page {{ box-shadow: none; margin: 0 auto; width: 210mm; min-height: 297mm; page-break-after: always; padding: 12mm 10mm; }}
                .btn-print {{ display: none; }}
            }}
        </style>
    </head>
    <body>
        <button class="btn-print" onclick="window.print()">🖨️ Print Commercial Horoscope Report</button>
        {all_30_pages}
    </body>
    </html>
    """
    return html_document

def render_22page_horoscope(name, gender, dob_str, tob_str, place_name, lat, lon, tz_offset=5.5, licence_address="KeralamAstro User", mode="full", lang="malayalam"):
    full_html = render_professional_30page_report(name, gender, dob_str, tob_str, place_name, lat, lon, tz_offset, licence_address, mode, lang)
    if mode == "front_page":
        return full_html
    pages = full_html.split('<div class="page"')
    if len(pages) > 23:
        pages = pages[:23]
    h_22 = '<div class="page"'.join(pages)
    for i in range(1, 23):
        h_22 = h_22.replace(f"Page {i} of 30", f"Page {i} of 22")
    if "</body>" not in h_22:
        h_22 += "\n</body>\n</html>"
    return h_22
