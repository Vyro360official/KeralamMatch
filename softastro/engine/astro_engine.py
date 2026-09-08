import math
import sqlite3
import os
import ephem
from datetime import datetime, timedelta

NAKSHATRAS = [
    "Aswathi", "Bharani", "Karthika", "Rohini", "Makayiram", "Thiruvathira",
    "Punartham", "Pooyam", "Ayilyam", "Makam", "Pooram", "Uthram",
    "Atham", "Chithira", "Chothi", "Visakham", "Anizham", "Thrikketta",
    "Moolam", "Pooradam", "Uthradam", "Thiruvonam", "Avittam", "Chathayam",
    "Pooruttathi", "Uthrattathi", "Revathi"
]

RASIS = [
    "Mesha (Aries)", "Vrishabha (Taurus)", "Mithuna (Gemini)", "Karkata (Cancer)",
    "Simha (Leo)", "Kanya (Virgo)", "Tula (Libra)", "Vrischika (Scorpio)",
    "Dhanus (Sagittarius)", "Makara (Capricorn)", "Kumbha (Aquarius)", "Meena (Pisces)"
]

DASA_LORDS = [
    ("Ketu", 7), ("Venus", 20), ("Sun", 6), ("Moon", 10),
    ("Mars", 7), ("Rahu", 18), ("Jupiter", 16), ("Saturn", 19), ("Mercury", 17)
]

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "keralam_astro.db")

def get_julian_day(year, month, day, hour=0, minute=0, second=0):
    dt = datetime(year, month, day, hour, minute, second)
    return ephem.julian_date(dt)

def get_lahiri_ayanamsa(jd):
    """
    KeralamAstro Selected Lahiri/Chitrapaksha Mean Ayanamsha Implementation.
    Epoch: J2000.0 (JD 2451545.0)
    Baseline: 23.853056° (23° 51' 11")
    Precession Rate: 1.3969713° / century (50.290965" / year)
    Nutation: Omitted (Mean Ecliptic)
    """
    T = (jd - 2451545.0) / 36525.0
    return 23.853056 + (T * 1.3969713)

DAY_GHATIS = {0: 26.0, 1: 22.0, 2: 18.0, 3: 14.0, 4: 10.0, 5: 6.0, 6: 2.0}
NIGHT_GHATIS = {0: 10.0, 1: 6.0, 2: 2.0, 3: 26.0, 4: 22.0, 5: 18.0, 6: 14.0}

def calculate_mandi(obs, dt_birth, tz_offset=5.5):
    """
    Authoritative Dynamic Mandi Calculation.
    Calculates exact Mandi sidereal longitude scaling target Ghatis by actual day/night duration.
    """
    utc_birth = dt_birth - timedelta(hours=tz_offset)
    
    m_obs = ephem.Observer()
    m_obs.lat = obs.lat
    m_obs.lon = obs.lon
    m_obs.elevation = 0
    m_obs.pressure = 1010.0
    m_obs.temp = 15.0
    m_obs.horizon = '0'
    
    m_obs.date = ephem.Date(utc_birth)
    prev_rise = m_obs.previous_rising(ephem.Sun()).datetime()
    next_set = m_obs.next_setting(ephem.Sun(), start=prev_rise).datetime()

    if prev_rise <= utc_birth < next_set:
        is_day = True
        s_rise = prev_rise
        s_set = next_set
        duration_sec = (s_set - s_rise).total_seconds()
        base_time = s_rise
        sunrise_local = s_rise + timedelta(hours=tz_offset)
        sun_weekday = (sunrise_local.weekday() + 1) % 7
        target_ghatis = DAY_GHATIS[sun_weekday]
    else:
        is_day = False
        prev_set = m_obs.previous_setting(ephem.Sun()).datetime()
        next_rise = m_obs.next_rising(ephem.Sun(), start=prev_set).datetime()
        
        s_set = prev_set
        duration_sec = (next_rise - s_set).total_seconds()
        base_time = s_set
        
        m_obs.date = ephem.Date(prev_set)
        preceding_sunrise = m_obs.previous_rising(ephem.Sun()).datetime()
        sunrise_local = preceding_sunrise + timedelta(hours=tz_offset)
        sun_weekday = (sunrise_local.weekday() + 1) % 7
        target_ghatis = NIGHT_GHATIS[sun_weekday]

    elapsed_sec = duration_sec * (target_ghatis / 30.0)
    mandi_rising_utc = base_time + timedelta(seconds=elapsed_sec)
    
    m_obs.date = ephem.Date(mandi_rising_utc)
    m_jd = ephem.julian_date(m_obs.date)
    m_T = (m_jd - 2451545.0) / 36525.0
    m_ayanamsa = get_lahiri_ayanamsa(m_jd)
    
    lst_rad = float(m_obs.sidereal_time())
    eps = math.radians(23.439291 - 0.0130042 * m_T)
    lat_rad = math.radians(float(obs.lat))

    num = math.cos(lst_rad)
    den = -math.sin(lst_rad) * math.cos(eps) - math.tan(lat_rad) * math.sin(eps)
    asc_sayana = math.degrees(math.atan2(num, den)) % 360.0
    mandi_sidereal = (asc_sayana - m_ayanamsa) % 360.0
    return mandi_sidereal

def normalize_deg(deg):
    return deg % 360.0

def normalize_dob(dob_str):
    """
    Normalizes any date string (DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD) to ISO YYYY-MM-DD for astronomical math.
    """
    if not dob_str:
        return "1987-05-23"
    dob_str = str(dob_str).strip()
    for sep in ["/", "-"]:
        if sep in dob_str:
            parts = dob_str.split(sep)
            if len(parts) == 3:
                p1, p2, p3 = parts[0].strip(), parts[1].strip(), parts[2].strip()
                if len(p3) == 4: # e.g. 23/05/1987 -> d=23, m=05, y=1987
                    return f"{int(p3):04d}-{int(p2):02d}-{int(p1):02d}"
                elif len(p1) == 4: # e.g. 1987-05-23 -> y=1987, m=05, d=23
                    return f"{int(p1):04d}-{int(p2):02d}-{int(p3):02d}"
    try:
        dt = datetime.strptime(dob_str, "%Y-%m-%d")
        return dt.strftime("%Y-%m-%d")
    except:
        return dob_str

def calculate_chart(name, gender, dob_str, tob_str, place_name, lat, lon, tz_offset=5.5):
    """
    High-Precision Ephemeris Astronomical Engine using XEphem / ephem.
    Calculates pure dynamic Nirayana positions for all birth inputs.
    """
    dob_iso = normalize_dob(dob_str)
    dt_birth = datetime.strptime(f"{dob_iso} {tob_str}", "%Y-%m-%d %H:%M")
    
    utc_dt = dt_birth - timedelta(hours=tz_offset)
    d = ephem.Date(utc_dt)

    obs = ephem.Observer()
    obs.date = d
    obs.lat = str(lat)
    obs.lon = str(lon)
    obs.elevation = 0
    obs.pressure = 1010.0
    obs.temp = 15.0
    obs.horizon = '0'

    jd = ephem.julian_date(d)
    T = (jd - 2451545.0) / 36525.0
    ayanamsa = get_lahiri_ayanamsa(jd)

    p_objects = {
        "Sun": ephem.Sun(d),
        "Moon": ephem.Moon(d),
        "Mars": ephem.Mars(d),
        "Mercury": ephem.Mercury(d),
        "Jupiter": ephem.Jupiter(d),
        "Venus": ephem.Venus(d),
        "Saturn": ephem.Saturn(d),
    }

    raw_planets = {}
    for p_name, obj in p_objects.items():
        ecl = ephem.Ecliptic(obj)
        sayana_lon = math.degrees(ecl.lon) % 360.0
        nirayana_lon = (sayana_lon - ayanamsa) % 360.0
        raw_planets[p_name] = nirayana_lon

    rahu_sayana = (125.04452 - 1934.136261 * T) % 360.0
    rahu_nirayana = (rahu_sayana - ayanamsa) % 360.0
    ketu_nirayana = (rahu_nirayana + 180.0) % 360.0

    raw_planets["Rahu"] = rahu_nirayana
    raw_planets["Ketu"] = ketu_nirayana

    lst_rad = float(obs.sidereal_time())
    eps = math.radians(23.439291 - 0.0130042 * T)
    lat_rad = math.radians(lat)

    num = math.cos(lst_rad)
    den = -math.sin(lst_rad) * math.cos(eps) - math.tan(lat_rad) * math.sin(eps)
    asc_sayana = math.degrees(math.atan2(num, den)) % 360.0
    asc_nirayana = (asc_sayana - ayanamsa) % 360.0
    raw_planets["Lagna"] = asc_nirayana
    raw_planets["Mandi"] = calculate_mandi(obs, dt_birth, tz_offset)

    # Dasa Balance Calculation
    moon_lon = raw_planets["Moon"]
    sun_lon = raw_planets["Sun"]

    moon_star_idx = int(moon_lon // (360 / 27))
    star_span = 360.0 / 27.0
    star_start_lon = moon_star_idx * star_span
    star_traversed = moon_lon - star_start_lon
    remaining_fraction = (star_span - star_traversed) / star_span

    dasa_seq = [
        ("Ketu", 7), ("Venus", 20), ("Sun", 6), ("Moon", 10),
        ("Mars", 7), ("Rahu", 18), ("Jupiter", 16), ("Saturn", 19), ("Mercury", 17)
    ]
    first_lord_idx = moon_star_idx % 9
    first_lord_name, first_lord_total_years = dasa_seq[first_lord_idx]

    balance_years = first_lord_total_years * remaining_fraction
    b_yrs = int(balance_years)
    rem_months = (balance_years - b_yrs) * 12.0
    b_mths = int(rem_months)
    b_days = int((rem_months - b_mths) * 30.4375)

    mal_dasa_names = {
        "Saturn": "ശനിദശ", "Mercury": "ബുധദശ", "Ketu": "കേതുദശ", "Venus": "ശുക്രദശ",
        "Sun": "ആദിത്യദശ", "Moon": "ചന്ദ്രദശ", "Mars": "ചൊവ്വാദശ", "Rahu": "രാഹുർദശ", "Jupiter": "വ്യാഴദശ"
    }
    dasa_balance_str = f"{mal_dasa_names.get(first_lord_name, first_lord_name)} ({b_yrs} വയസ്സ് {b_mths} മാസം {b_days} ദിവസം)"

    planets_details = {}
    rasi_chart = {i: [] for i in range(12)}
    navamsa_chart = {i: [] for i in range(12)}

    for p_name, nirayana_lon in raw_planets.items():
        rasi_index = int(nirayana_lon // 30)
        rasi_deg = nirayana_lon % 30
        star_index = int(nirayana_lon // (360 / 27))
        star_deg = nirayana_lon % (360 / 27)
        pada = int(star_deg // (360 / 108)) + 1
        navamsa_rasi = int(nirayana_lon // (360 / 108)) % 12

        details = {
            "longitude": nirayana_lon,
            "rasi_index": rasi_index,
            "rasi_name": RASIS[rasi_index],
            "rasi_deg": rasi_deg,
            "deg_str": f"{int(rasi_deg)}° {int((rasi_deg%1)*60)}'",
            "star_index": star_index,
            "star_name": NAKSHATRAS[star_index],
            "pada": pada,
            "navamsa_index": navamsa_rasi,
            "navamsa_name": RASIS[navamsa_rasi]
        }
        planets_details[p_name] = details

        rasi_chart[rasi_index].append(p_name)
        navamsa_chart[navamsa_rasi].append(p_name)

    moon_star_idx = planets_details["Moon"]["star_index"]

    # Config A Astronomical Sunrise / Sunset Calculation Layer
    try:
        sun_obj = ephem.Sun()
        sunrise_utc = obs.next_rising(sun_obj)
        sunset_utc = obs.next_setting(sun_obj)

        sunrise_local = ephem.Date(sunrise_utc + tz_offset / 24.0).datetime()
        sunset_local = ephem.Date(sunset_utc + tz_offset / 24.0).datetime()

        sunrise_str = sunrise_local.strftime("%I:%M:%S %p")
        sunset_str = sunset_local.strftime("%I:%M:%S %p")

        diff_minutes = (dt_birth - sunrise_local).total_seconds() / 60.0
        if diff_minutes < 0:
            diff_minutes += 1440.0
        nazhika = int(diff_minutes / 24.0)
        vinazhika = int((diff_minutes % 24.0) * 2.5)
        udayalparam_str = f"{nazhika} നാഴിക {vinazhika} വിനാഴിക"
    except Exception:
        sunrise_str = "Calculation unavailable"
        sunset_str = "Calculation unavailable"
        udayalparam_str = "Calculation unavailable"

    return {
        "name": name,
        "gender": gender,
        "dob": dob_str,
        "tob": tob_str,
        "place": place_name,
        "lat": lat,
        "lon": lon,
        "tz": tz_offset,
        "ayanamsa": ayanamsa,
        "planets": planets_details,
        "rasi_chart": rasi_chart,
        "navamsa_chart": navamsa_chart,
        "star": NAKSHATRAS[moon_star_idx],
        "pada": planets_details["Moon"]["pada"],
        "dasa_lord": first_lord_name,
        "dasa_balance_years": balance_years,
        "dasa_balance": dasa_balance_str,
        "dasa_schedule": [],
        "sunrise_str": sunrise_str,
        "sunset_str": sunset_str,
        "udayalparam_str": udayalparam_str
    }
