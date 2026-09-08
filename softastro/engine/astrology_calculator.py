# Complete Dynamic Astrology Calculator Engine
# 100% Astronomical Calculation for Bhava Sphutam, Ashtakavarga, Shadvarga, Panchanga, Yogas, Saturn Transits & Daily Calendar
import math
import ephem
from datetime import datetime, timedelta

NAKSHATRAS = [
    "Aswathi", "Bharani", "Karthika", "Rohini", "Makayiram", "Thiruvathira",
    "Punartham", "Pooyam", "Ayilyam", "Makam", "Pooram", "Uthram",
    "Atham", "Chithira", "Chothi", "Visakham", "Anizham", "Thrikketta",
    "Moolam", "Pooradam", "Uthradam", "Thiruvonam", "Avittam", "Chathayam",
    "Pooruttathi", "Uthrattathi", "Revathi"
]

TITHIS = [
    "Sukla Paksha Prathama", "Sukla Paksha Dwitiya", "Sukla Paksha Tritiya", "Sukla Paksha Chaturthi", "Sukla Paksha Panchami",
    "Sukla Paksha Shasthi", "Sukla Paksha Saptami", "Sukla Paksha Ashtami", "Sukla Paksha Navami", "Sukla Paksha Dasami",
    "Sukla Paksha Ekadashi", "Sukla Paksha Dwadashi", "Sukla Paksha Trayodashi", "Sukla Paksha Chaturdashi", "Purnima",
    "Krishna Paksha Prathama", "Krishna Paksha Dwitiya", "Krishna Paksha Tritiya", "Krishna Paksha Chaturthi", "Krishna Paksha Panchami",
    "Krishna Paksha Shasthi", "Krishna Paksha Saptami", "Krishna Paksha Ashtami", "Krishna Paksha Navami", "Krishna Paksha Dasami",
    "Krishna Paksha Ekadashi", "Krishna Paksha Dwadashi", "Krishna Paksha Trayodashi", "Krishna Paksha Chaturdashi", "Amavasya"
]

KARANAS = [
    "Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti",
    "Shakuni", "Chatushpada", "Naga", "Kintughna"
]

def calculate_karana(moon_lon, sun_lon):
    """
    Calculates exact classical Karana for any given Moon and Sun longitudes.
    A lunar month contains 60 half-tithis (6.0° arc each):
    - Half-Tithi 1 (k=0): Kintughna (Fixed Karana #1)
    - Half-Tithis 2–57 (k=1..56): Cycles 8 times through 7 Movable Karanas:
      Bava, Balava, Kaulava, Taitila, Gara, Vanija, Vishti
    - Half-Tithi 58 (k=57): Shakuni (Fixed Karana #2)
    - Half-Tithi 59 (k=58): Chatushpada (Fixed Karana #3)
    - Half-Tithi 60 (k=59): Naga (Fixed Karana #4)
    """
    diff_deg = (moon_lon - sun_lon) % 360.0
    k = int(diff_deg / 6.0) % 60

    movable_karanas = ["Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti"]
    movable_karanas_mal = ["ബവ", "ബാലവ", "കൗലവ", "തൈതില", "ഗര", "വണിജ", "വിഷ്ടി (ഭദ്ര)"]

    if k == 0:
        name_eng = "Kintughna"
        name_mal = "കിംസ്തുഘ്നൻ"
    elif 1 <= k <= 56:
        idx = (k - 1) % 7
        name_eng = movable_karanas[idx]
        name_mal = movable_karanas_mal[idx]
    elif k == 57:
        name_eng = "Shakuni"
        name_mal = "ശകുനി"
    elif k == 58:
        name_eng = "Chatushpada"
        name_mal = "ചതുഷ്പാദം"
    elif k == 59:
        name_eng = "Naga"
        name_mal = "നാഗം"
    else:
        name_eng = "Kintughna"
        name_mal = "കിംസ്തുഘ്നൻ"

    return {"k_index": k, "name_eng": name_eng, "name_mal": name_mal}

NITHYA_YOGAS = [
    "Vishkumbha", "Priti", "Ayushman", "Saubhagya", "Sobhana", "Atiganda", "Sukarma", "Dhriti", "Shoola",
    "Ganda", "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyan",
    "Parigha", "Shiva", "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti"
]

RASIS = [
    "Mesha (Aries)", "Vrishabha (Taurus)", "Mithuna (Gemini)", "Karkata (Cancer)",
    "Simha (Leo)", "Kanya (Virgo)", "Tula (Libra)", "Vrischika (Scorpio)",
    "Dhanus (Sagittarius)", "Makara (Capricorn)", "Kumbha (Aquarius)", "Meena (Pisces)"
]

def format_dms(deg_val):
    deg_val = deg_val % 360.0
    d = int(deg_val)
    m = int((deg_val % 1) * 60)
    s = int((((deg_val % 1) * 60) % 1) * 60)
    return f"{d:03d}° {m:02d}' {s:02d}\""

def calculate_bhava_sphutam(lagna_lon, planets_dict):
    houses = []
    house_planets = {i: [] for i in range(1, 13)}
    
    for i in range(12):
        cusp_deg = (lagna_lon + i * 30.0) % 360.0
        rasi_idx = int(cusp_deg // 30)
        deg_in_rasi = cusp_deg % 30
        houses.append({
            "house_num": i + 1,
            "longitude": cusp_deg,
            "rasi_index": rasi_idx,
            "rasi_name": RASIS[rasi_idx],
            "deg_in_rasi": deg_in_rasi,
            "dms": f"{int(cusp_deg):03d}° {int((cusp_deg%1)*60):02d}' {int((((cusp_deg%1)*60)%1)*60):02d}\""
        })

    for p_name, p_info in planets_dict.items():
        p_lon = p_info.get("longitude", 0.0) if isinstance(p_info, dict) else float(p_info)
        diff = (p_lon - lagna_lon) % 360.0
        house_num = int(diff // 30) + 1
        house_planets[house_num].append(p_name)

    return {"houses": houses, "house_planets": house_planets}

def calculate_ashtakavarga(planets_dict):
    planet_names = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"]
    p_positions = {}
    for p in planet_names:
        if p in planets_dict:
            p_positions[p] = planets_dict[p]["rasi_index"] if isinstance(planets_dict[p], dict) else int(planets_dict[p] // 30)
        else:
            p_positions[p] = 0

    lagna_rasi = planets_dict["Lagna"]["rasi_index"] if "Lagna" in planets_dict and isinstance(planets_dict["Lagna"], dict) else 0

    rules = {
        "Sun": {"Sun": [1, 2, 4, 7, 8, 9, 10, 11], "Moon": [3, 6, 10, 11], "Mars": [1, 2, 4, 7, 8, 9, 10, 11], "Mercury": [3, 5, 6, 9, 10, 11, 12], "Jupiter": [5, 6, 9, 11], "Venus": [6, 7, 12], "Saturn": [1, 2, 4, 7, 8, 9, 10, 11], "Lagna": [3, 4, 6, 10, 11, 12]},
        "Moon": {"Sun": [3, 6, 7, 8, 10, 11], "Moon": [1, 3, 6, 7, 10, 11], "Mars": [2, 3, 5, 6, 9, 10, 11], "Mercury": [1, 3, 4, 5, 7, 8, 10, 11], "Jupiter": [1, 4, 7, 8, 10, 11, 12], "Venus": [3, 4, 5, 7, 9, 10, 11], "Saturn": [3, 5, 6, 11], "Lagna": [3, 6, 10, 11]},
        "Mars": {"Sun": [3, 5, 6, 10, 11], "Moon": [3, 6, 11], "Mars": [1, 2, 4, 7, 8, 10, 11], "Mercury": [3, 5, 6, 11], "Jupiter": [6, 10, 11, 12], "Venus": [6, 8, 11, 12], "Saturn": [1, 4, 7, 8, 9, 10, 11], "Lagna": [1, 3, 6, 10, 11]},
        "Mercury": {"Sun": [5, 6, 9, 11, 12], "Moon": [2, 4, 6, 8, 10, 11], "Mars": [1, 2, 4, 7, 8, 9, 10, 11], "Mercury": [1, 3, 5, 6, 9, 10, 11, 12], "Jupiter": [6, 8, 11, 12], "Venus": [1, 2, 3, 4, 5, 8, 9, 11], "Saturn": [1, 2, 4, 7, 8, 9, 10, 11], "Lagna": [1, 2, 4, 6, 8, 10, 11]},
        "Jupiter": {"Sun": [1, 2, 3, 4, 7, 8, 9, 10, 11], "Moon": [2, 5, 7, 9, 11], "Mars": [1, 2, 4, 7, 8, 10, 11], "Mercury": [1, 2, 4, 5, 6, 9, 10, 11], "Jupiter": [1, 2, 3, 4, 7, 8, 10, 11], "Venus": [2, 5, 6, 9, 10, 11], "Saturn": [3, 5, 6, 12], "Lagna": [1, 2, 4, 5, 6, 7, 9, 10, 11]},
        "Venus": {"Sun": [8, 11, 12], "Moon": [1, 2, 3, 4, 5, 8, 9, 11, 12], "Mars": [3, 4, 6, 9, 11, 12], "Mercury": [3, 5, 6, 9, 11], "Jupiter": [5, 8, 9, 10, 11], "Venus": [1, 2, 3, 4, 5, 8, 9, 10, 11], "Saturn": [3, 4, 5, 8, 9, 10, 11], "Lagna": [1, 2, 3, 4, 5, 8, 9, 11]},
        "Saturn": {"Sun": [1, 2, 4, 7, 8, 10, 11], "Moon": [3, 6, 11], "Mars": [3, 5, 6, 10, 11, 12], "Mercury": [6, 8, 9, 10, 11, 12], "Jupiter": [5, 6, 11, 12], "Venus": [6, 11, 12], "Saturn": [3, 5, 6, 11], "Lagna": [1, 3, 4, 6, 10, 11]}
    }

    bav_tables = {}
    sav_scores = [0] * 12

    for target_p in planet_names:
        p_bav = [0] * 12
        p_rule = rules[target_p]
        for ref_p, houses in p_rule.items():
            ref_rasi = lagna_rasi if ref_p == "Lagna" else p_positions[ref_p]
            for h in houses:
                target_rasi = (ref_rasi + h - 1) % 12
                p_bav[target_rasi] += 1
        bav_tables[target_p] = p_bav
        for r in range(12):
            sav_scores[r] += p_bav[r]

    return {"bav": bav_tables, "sav": sav_scores, "total_sav": sum(sav_scores)}

def calculate_shadvarga(planets_dict):
    vargas = {}
    for p_name, p_info in planets_dict.items():
        lon = p_info["longitude"] if isinstance(p_info, dict) else float(p_info)
        r_idx = int(lon // 30)
        deg_in_r = lon % 30
        is_odd = (r_idx % 2 == 0)

        d1 = r_idx
        if is_odd:
            d2 = 4 if deg_in_r < 15 else 3
        else:
            d2 = 3 if deg_in_r < 15 else 4
        dec = int(deg_in_r // 10)
        d3 = (r_idx + dec * 4) % 12
        sep = int(deg_in_r // (30 / 7))
        d7 = (r_idx + sep) % 12 if is_odd else (r_idx + 6 + sep) % 12
        nav_idx = int(lon // (360 / 108)) % 12
        d9 = nav_idx
        dash = int(deg_in_r // 3)
        d10 = (r_idx + dash) % 12 if is_odd else (r_idx + 9 + dash) % 12
        dwad = int(deg_in_r // 2.5)
        d12 = (r_idx + dwad) % 12
        shod = int(deg_in_r // (30 / 16))
        quad = r_idx % 3
        start_d16 = 0 if quad == 0 else (4 if quad == 1 else 8)
        d16 = (start_d16 + shod) % 12
        if is_odd:
            if deg_in_r < 5: d30 = 0
            elif deg_in_r < 10: d30 = 10
            elif deg_in_r < 18: d30 = 8
            elif deg_in_r < 25: d30 = 2
            else: d30 = 1
        else:
            if deg_in_r < 5: d30 = 1
            elif deg_in_r < 12: d30 = 2
            elif deg_in_r < 20: d30 = 8
            elif deg_in_r < 25: d30 = 10
            else: d30 = 0

        vargas[p_name] = {
            "D1": d1, "D2": d2, "D3": d3, "D7": d7, "D9": d9,
            "D10": d10, "D12": d12, "D16": d16, "D30": d30
        }
    return vargas

def detect_yogas(planets_dict):
    yogas = []
    moon_rasi = planets_dict["Moon"]["rasi_index"]
    jup_rasi = planets_dict["Jupiter"]["rasi_index"]
    sun_rasi = planets_dict["Sun"]["rasi_index"]
    merc_rasi = planets_dict["Mercury"]["rasi_index"]
    mars_rasi = planets_dict["Mars"]["rasi_index"]

    dist_jup_moon = (jup_rasi - moon_rasi) % 12
    if dist_jup_moon in [0, 3, 6, 9]:
        yogas.append({"name": "Gajakesari Yoga", "code": "GAJAKESARI", "desc": "Jupiter in Kendra from Moon. Brings intellect, wisdom, reputation, and lasting prosperity."})

    if sun_rasi == merc_rasi:
        yogas.append({"name": "Budhaditya Yoga", "code": "BUDHADITYA", "desc": "Conjunction of Sun and Mercury. Enhances sharp intellect, administrative capabilities, and scholarly success."})

    if moon_rasi == mars_rasi:
        yogas.append({"name": "Chandra-Mangala Yoga", "code": "CHANDRA_MANGALA", "desc": "Moon and Mars associated. Confers financial enterprise, boldness, and high material drive."})

    if jup_rasi == mars_rasi:
        yogas.append({"name": "Guru-Mangala Yoga", "code": "GURU_MANGALA", "desc": "Jupiter and Mars associated. Gives righteous courage, leadership skill, and moral conviction."})

    return yogas

def calculate_saturn_transits(moon_rasi_idx, current_saturn_rasi_idx=11):
    rel_house = (current_saturn_rasi_idx - moon_rasi_idx) % 12 + 1
    if rel_house in [12, 1, 2]:
        status = "Ezharashani (Sade Sati / 7.5 Sani)"
        desc = f"Saturn is currently transiting House {rel_house} relative to Moon sign ({RASIS[moon_rasi_idx]}). Period calls for patience, discipline, and spiritual focus."
    elif rel_house in [4, 7, 10]:
        status = "Kandakashani"
        desc = f"Saturn is currently transiting House {rel_house} (Kendra) relative to Moon sign. Exercise care in career, health, and domestic stability."
    elif rel_house == 8:
        status = "Ashtamashani"
        desc = f"Saturn is currently transiting House 8 relative to Moon sign. Avoid major financial risks and maintain health awareness."
    else:
        status = "Favorable Transit"
        desc = f"Saturn is transiting House {rel_house} relative to Moon sign. Favorable and supportive for career and personal progress."

    return {"rel_house": rel_house, "status": status, "desc": desc}

def generate_36month_astronomical_calendar(dob_str, lat=8.5241, lon=76.9366, tz_offset=5.5):
    """
    36-Month Astronomical Summary Calendar.
    Calculates monthly astronomical ephemeris snapshots (Nakshatra, Tithi, Nithya Yoga) for 36 consecutive months from birth date.
    """
    from engine.astro_engine import normalize_dob
    dt_start = datetime.strptime(normalize_dob(dob_str), "%Y-%m-%d")
    obs = ephem.Observer()
    obs.lat = str(lat)
    obs.lon = str(lon)
    obs.elevation = 0

    rows = []
    for month_offset in range(36):
        y = dt_start.year + (dt_start.month - 1 + month_offset) // 12
        m = (dt_start.month - 1 + month_offset) % 12 + 1
        dt_curr = datetime(y, m, 1, 6, 0)
        utc_dt = dt_curr - timedelta(hours=tz_offset)
        from engine.astro_engine import get_lahiri_ayanamsa
        obs.date = ephem.Date(utc_dt)
        jd = ephem.julian_date(obs.date)
        ayanamsa = get_lahiri_ayanamsa(jd)

        m_obj = ephem.Moon(obs.date)
        s_obj = ephem.Sun(obs.date)
        
        m_lon = (math.degrees(ephem.Ecliptic(m_obj).lon) - ayanamsa) % 360.0
        s_lon = (math.degrees(ephem.Ecliptic(s_obj).lon) - ayanamsa) % 360.0

        star_idx = int(m_lon // (360 / 27))
        diff_deg = (m_lon - s_lon) % 360.0
        tithi_idx = int(diff_deg / 12.0) % 30
        sum_deg = (m_lon + s_lon) % 360.0
        yoga_idx = int(sum_deg / (360 / 27)) % 27

        rows.append({
            "month_num": month_offset + 1,
            "date_str": dt_curr.strftime("%Y-%m-%d"),
            "year_month": dt_curr.strftime("%B %Y"),
            "nakshatra": NAKSHATRAS[star_idx % 27],
            "star_name": NAKSHATRAS[star_idx % 27],
            "tithi": TITHIS[tithi_idx],
            "nithya_yoga": NITHYA_YOGAS[yoga_idx]
        })

    return rows

def calculate_papamoolyam(planets_dict):
    """
    Calculates dynamic Papamoolyam (Papasamyam) points and matrix rows for Lagna, Moon, and Venus reference charts.
    Points per malefic (Mars, Saturn, Sun, Rahu, Ketu):
    - Mars: 1.00 pt in houses 1, 2, 4, 7, 8, 12
    - Saturn: 1.00 pt in houses 1, 2, 4, 7, 8, 12
    - Sun: 0.50 pt in houses 1, 2, 4, 7, 8, 12
    - Rahu / Ketu: 0.50 pt in houses 1, 2, 4, 7, 8, 12
    """
    mal_codes = {"Mars": "കു.", "Sun": "ര.", "Saturn": "ശി.", "Rahu": "രാ.", "Ketu": "കേ.", "Mandi": "മാ."}
    malefics = ["Mars", "Sun", "Saturn", "Rahu", "Ketu"]
    check_houses = [1, 2, 4, 7, 8, 12]

    if not isinstance(planets_dict, dict) or "Lagna" not in planets_dict or "Moon" not in planets_dict or "Venus" not in planets_dict:
        return {
            "total": 0.0,
            "Lagna": {"score": 0.0, "houses": {h: [] for h in check_houses}},
            "Moon": {"score": 0.0, "houses": {h: [] for h in check_houses}},
            "Venus": {"score": 0.0, "houses": {h: [] for h in check_houses}},
            "error": "Calculation unavailable"
        }

    ref_houses = {
        "Lagna": planets_dict["Lagna"]["rasi_index"] if isinstance(planets_dict.get("Lagna"), dict) else 0,
        "Moon": planets_dict["Moon"]["rasi_index"] if isinstance(planets_dict.get("Moon"), dict) else 0,
        "Venus": planets_dict["Venus"]["rasi_index"] if isinstance(planets_dict.get("Venus"), dict) else 0
    }

    res = {}
    total_score = 0.0

    for ref_name, ref_h in ref_houses.items():
        h_map = {h: [] for h in check_houses}
        row_score = 0.0
        for m in malefics:
            if m in planets_dict:
                p_h = planets_dict[m]["rasi_index"] if isinstance(planets_dict[m], dict) else int(planets_dict[m] // 30)
                diff = ((p_h - ref_h) % 12) + 1
                if diff in check_houses:
                    code = mal_codes.get(m, m)
                    h_map[diff].append(code)
                    pts = 1.0 if m in ["Mars", "Saturn"] else 0.5
                    row_score += pts
        total_score += row_score
        res[ref_name] = {"houses": h_map, "score": row_score}

    res["total"] = total_score
    return res

def calculate_kuja_dosha_evaluation(planets_dict):
    """
    Calculates dynamic Kuja Dosha and Pariharam status from planet longitudes.
    If chart data is missing or incomplete, returns explicit 'Unable to calculate Kuja Dosha' state.
    """
    if not isinstance(planets_dict, dict) or "Mars" not in planets_dict or "Lagna" not in planets_dict:
        return {
            "has_dosha": False,
            "has_pariharam": False,
            "status_mal": "Unable to calculate Kuja Dosha",
            "desc_mal": "Incomplete planetary chart data."
        }

    mars_h = planets_dict["Mars"]["rasi_index"] if isinstance(planets_dict["Mars"], dict) else int(planets_dict["Mars"] // 30)
    lagna_h = planets_dict["Lagna"]["rasi_index"] if isinstance(planets_dict["Lagna"], dict) else int(planets_dict["Lagna"] // 30)
    moon_h = planets_dict["Moon"]["rasi_index"] if "Moon" in planets_dict and isinstance(planets_dict["Moon"], dict) else lagna_h
    venus_h = planets_dict["Venus"]["rasi_index"] if "Venus" in planets_dict and isinstance(planets_dict["Venus"], dict) else lagna_h

    diff_l = ((mars_h - lagna_h) % 12) + 1
    diff_m = ((mars_h - moon_h) % 12) + 1
    diff_v = ((mars_h - venus_h) % 12) + 1

    check_houses = [2, 4, 7, 8, 12]
    has_dosha = (diff_l in check_houses) or (diff_m in check_houses) or (diff_v in check_houses)

    # Pariharam: Mars in own sign (Aries/Scorpio) or exalted sign (Capricorn)
    has_pariharam = (mars_h in [0, 7, 9]) or not has_dosha

    if not has_dosha:
        status_mal = "കുജദോഷം ഇല്ല (No Kuja Dosha)"
        desc_mal = f"ലഗ്നം ({RASIS[lagna_h]}), ചന്ദ്രൻ ({RASIS[moon_h]}), ശുക്രൻ ({RASIS[venus_h]}) എന്നിവയിൽ നിന്നും 2, 4, 7, 8, 12 ഭാവങ്ങളിൽ ചൊവ്വ സ്ഥിതി ചെയ്യാത്തതിനാൽ (ചൊവ്വ {RASIS[mars_h]} രാശിയിലാണ്) ജാതകന് ചൊവ്വാദോഷം (കുജദോഷം) ബാധകമല്ല."
    elif has_pariharam:
        status_mal = "കുജദോഷ പരിഹാരം ഉണ്ട് (Kuja Dosha Resolved)"
        desc_mal = f"ചൊവ്വ 2, 4, 7, 8, 12 ഭാവങ്ങളിൽ ഒന്നിൽ ആണെങ്കിലും, ചൊവ്വ സ്വക്ഷേത്രത്തിലോ ({RASIS[mars_h]}) ഉച്ചക്ഷേത്രത്തിലോ ആയതിനാൽ ദോഷപരിഹാരം സിദ്ധിച്ചിരിക്കുന്നു."
    else:
        status_mal = "കുജദോഷം ഉണ്ട് (Kuja Dosha Present)"
        desc_mal = f"ലഗ്നാൽ/ചന്ദ്രാൽ/ശുക്രാൽ {diff_l}-ാം ഭാവത്തിൽ ({RASIS[mars_h]}) ചൊവ്വ സ്ഥിതി ചെയ്യുന്നതിനാൽ ജാതകന് കുജദോഷം നിലനിൽക്കുന്നു."

    return {"has_dosha": has_dosha, "has_pariharam": has_pariharam, "status_mal": status_mal, "desc_mal": desc_mal}
