# Marriage Compatibility Engine (Porutham, Papasamya, Kuja Dosha, Dasa Sandhi & Report Generator)
import math
from datetime import datetime, timedelta

NAKSHATRA_NAMES = [
    "Aswathi", "Bharani", "Karthika", "Rohini", "Makayiram", "Thiruvathira",
    "Punartham", "Pooyam", "Ayilyam", "Makam", "Pooram", "Uthram",
    "Atham", "Chithira", "Chothi", "Visakham", "Anizham", "Thrikketta",
    "Moolam", "Pooradam", "Uthradam", "Thiruvonam", "Avittam", "Chathayam",
    "Pooruttathi", "Uthrattathi", "Revathi"
]

NAKSHATRA_METADATA = {
    "Aswathi": {"mal": "അശ്വതി", "gem": "വൈഡൂര്യം", "ganam": "ദേവഗണം", "deity": "അശ്വിനിദേവകൾ", "tree": "കാഞ്ഞിരം", "yoni": "ആൺകുതിര", "bhutham": "ഭൂമി", "mrigam": "കുതിര", "pakshi": "പുള്ള്"},
    "Bharani": {"mal": "ഭരണി", "gem": "രക്തചന്ദനം/മാണിക്യം", "ganam": "മനുഷ്യഗണം", "deity": "യമൻ", "tree": "നെല്ലി", "yoni": "പെൺആട്", "bhutham": "ഭൂമി", "mrigam": "ആട്", "pakshi": "പുള്ള്"},
    "Karthika": {"mal": "കാർത്തിക", "gem": "മാണിക്യം", "ganam": "രാക്ഷസഗണം", "deity": "അഗ്നി", "tree": "അത്തി", "yoni": "പെൺആട്", "bhutham": "അഗ്നി", "mrigam": "ആട്", "pakshi": "പുള്ള്"},
    "Rohini": {"mal": "രോഹിണി", "gem": "മുത്ത്", "ganam": "മനുഷ്യഗണം", "deity": "ബ്രഹ്മാവ്", "tree": "ഞാവൽ", "yoni": "ആൺപാമ്പ്", "bhutham": "പൃഥ്വി", "mrigam": "പാമ്പ്", "pakshi": "പുള്ള്"},
    "Makayiram": {"mal": "മകയിരം", "gem": "പവഴം", "ganam": "ദേവഗണം", "deity": "ചന്ദ്രൻ", "tree": "കരിങ്ങാലി", "yoni": "പെൺപാമ്പ്", "bhutham": "മരുത്ത്", "mrigam": "പാമ്പ്", "pakshi": "പുള്ള്"},
    "Thiruvathira": {"mal": "തിരുവാതിര", "gem": "ഗോമേദകം", "ganam": "മനുഷ്യഗണം", "deity": "ശിവൻ", "tree": "കരിമരം", "yoni": "ആൺനായ്", "bhutham": "ജലം", "mrigam": "നായ്", "pakshi": "ആന്തഃപുള്ള്"},
    "Punartham": {"mal": "പുണർതം", "gem": "മരതകം", "ganam": "ദേവഗണം", "deity": "അദിതി", "tree": "മുള", "yoni": "പെൺപൂച്ച", "bhutham": "ആകാശം", "mrigam": "പൂച്ച", "pakshi": "പുള്ള്"},
    "Pooyam": {"mal": "പൂയം", "gem": "ഇന്ദ്രനീലം", "ganam": "ദേവഗണം", "deity": "ബൃഹസ്പതി", "tree": "അരയാൽ", "yoni": "ആൺആട്", "bhutham": "ശരത്ത്", "mrigam": "ആട്", "pakshi": "പുള്ള്"},
    "Ayilyam": {"mal": "ആയില്ല്യം", "gem": "മരതകം", "ganam": "രാക്ഷസഗണം", "deity": "സർപ്പങ്ങൾ", "tree": "നാരകം", "yoni": "പെൺപൂച്ച", "bhutham": "ജലം", "mrigam": "പൂച്ച", "pakshi": "ചകോരം"},
    "Makam": {"mal": "മകം", "gem": "മാണിക്യം", "ganam": "രാക്ഷസഗണം", "deity": "പിതൃക്കൾ", "tree": "പ്ലാവ്", "yoni": "ആൺഎലി", "bhutham": "പൃഥ്വി", "mrigam": "എലി", "pakshi": "പുള്ള്"},
    "Pooram": {"mal": "പൂരം", "gem": "പവഴം", "ganam": "മനുഷ്യഗണം", "deity": "ഭഗൻ", "tree": "പ്ലാവ്", "yoni": "പെൺഎലി", "bhutham": "പൃഥ്വി", "mrigam": "എലി", "pakshi": "പുള്ള്"},
    "Uthram": {"mal": "ഉത്രം", "gem": "മാണിക്യം", "ganam": "മനുഷ്യഗണം", "deity": "ആര്യമാവ്", "tree": "ഇത്തി", "yoni": "ആൺപശു", "bhutham": "അഗ്നി", "mrigam": "പശു", "pakshi": "പുള്ള്"},
    "Atham": {"mal": "അത്തം", "gem": "മരതകം", "ganam": "ദേവഗണം", "deity": "സവിതാവ്", "tree": "അമ്പാഴം", "yoni": "പെൺഎരുമ", "bhutham": "വായു", "mrigam": "എരുമ", "pakshi": "പുള്ള്"},
    "Chithira": {"mal": "ചിത്തിര", "gem": "പവഴം", "ganam": "രാക്ഷസഗണം", "deity": "ത്വഷ്ടാവ്", "tree": "കൂവളം", "yoni": "പെൺപുലി", "bhutham": "അഗ്നി", "mrigam": "പുലി", "pakshi": "പുള്ള്"},
    "Chothi": {"mal": "ചോതി", "gem": "ഗോമേദകം", "ganam": "ദേവഗണം", "deity": "വായു", "tree": "നീർമരുത്", "yoni": "ആൺമഹിഷം", "bhutham": "വായു", "mrigam": "മഹിഷം", "pakshi": "പുള്ള്"},
    "Visakham": {"mal": "വിശാഖം", "gem": "പുഷ്യരാഗം", "ganam": "രാക്ഷസഗണം", "deity": "ഇന്ദ്രാഗ്നികൾ", "tree": "വിളാത്തി", "yoni": "ആൺആന", "bhutham": "അഗ്നി", "mrigam": "ആന", "pakshi": "പുള്ള്"},
    "Anizham": {"mal": "അനിഴം", "gem": "ഇന്ദ്രനീലം", "ganam": "ദേവഗണം", "deity": "മിത്രൻ", "tree": "ഇലഞ്ഞി", "yoni": "പെൺമാൻ", "bhutham": "ഭൂമി", "mrigam": "മാൻ", "pakshi": "പുള്ള്"},
    "Thrikketta": {"mal": "തൃക്കേട്ട", "gem": "മരതകം", "ganam": "രാക്ഷസഗണം", "deity": "ഇന്ദ്രൻ", "tree": "വെട്ടി", "yoni": "ആൺമാൻ", "bhutham": "ഭൂമി", "mrigam": "മാൻ", "pakshi": "പുള്ള്"},
    "Moolam": {"mal": "മൂലം", "gem": "വൈഡൂര്യം", "ganam": "രാക്ഷസഗണം", "deity": "നിര്യാതി", "tree": "പയനം", "yoni": "പെൺനായ്", "bhutham": "വായു", "mrigam": "നായ്", "pakshi": "കോഴി"},
    "Pooradam": {"mal": "പൂരാടം", "gem": "വൈഡൂര്യം", "ganam": "മനുഷ്യഗണം", "deity": "അപ്പ്", "tree": "വഞ്ചി", "yoni": "ആൺകുരങ്", "bhutham": "ജലം", "mrigam": "കുരങ്", "pakshi": "പുള്ള്"},
    "Uthradam": {"mal": "ഉത്രാടം", "gem": "മാണിക്യം", "ganam": "മനുഷ്യഗണം", "deity": "വിശ്വദേവതകൾ", "tree": "പ്ലാവ്", "yoni": "പെൺകീരി", "bhutham": "പൃഥ്വി", "mrigam": "കീരി", "pakshi": "പുള്ള്"},
    "Thiruvonam": {"mal": "തിരുവോണം", "gem": "മുത്ത്", "ganam": "ദേവഗണം", "deity": "വിഷ്ണു", "tree": "എരുക്ക്", "yoni": "പെൺകുരങ്", "bhutham": "ഭൂമി", "mrigam": "കുരങ്", "pakshi": "കോഴി"},
    "Avittam": {"mal": "അവിട്ടം", "gem": "പവഴം", "ganam": "രാക്ഷസഗണം", "deity": "വസുക്കൾ", "tree": "വന്നി", "yoni": "പെൺസിംഹം", "bhutham": "ആകാശം", "mrigam": "സിംഹം", "pakshi": "പുള്ള്"},
    "Chathayam": {"mal": "ചതയം", "gem": "ഗോമേദകം", "ganam": "രാക്ഷസഗണം", "deity": "വരുണൻ", "tree": "കടമ്പ്", "yoni": "പെൺകുതിര", "bhutham": "ആകാശം", "mrigam": "കുതിര", "pakshi": "പുള്ള്"},
    "Pooruttathi": {"mal": "പൂരുരുട്ടാതി", "gem": "പുഷ്യരാഗം", "ganam": "മനുഷ്യഗണം", "deity": "അജൈകപാദ്", "tree": "തേന്മാവ്", "yoni": "ആൺസിംഹം", "bhutham": "ആകാശം", "mrigam": "സിംഹം", "pakshi": "പുള്ള്"},
    "Uthrattathi": {"mal": "ഉത്രട്ടാതി", "gem": "ഇന്ദ്രനീലം", "ganam": "മനുഷ്യഗണം", "deity": "അഹിർബുധ്ന്യൻ", "tree": "വേപ്പ്", "yoni": "പെൺപശു", "bhutham": "ആകാശം", "mrigam": "പശു", "pakshi": "മയിൽ"},
    "Revathi": {"mal": "രേവതി", "gem": "മരതകം", "ganam": "ദേവഗണം", "deity": "പൂഷാവ്", "tree": "ഇലൂപ്പ", "yoni": "പെൺആന", "bhutham": "ജലം", "mrigam": "ആന", "pakshi": "മയിൽ"}
}

# Rasi Lords mapping (0: Mesha ... 11: Meena)
RASI_LORDS = {
    0: "Mars", 1: "Venus", 2: "Mercury", 3: "Moon",
    4: "Sun", 5: "Mercury", 6: "Venus", 7: "Mars",
    8: "Jupiter", 9: "Saturn", 10: "Saturn", 11: "Jupiter"
}

# Planetary Friendship Matrix
# Friends = 1.0, Neutral = 0.5, Enemy = 0.0
PLANET_FRIENDS = {
    "Sun": {"Moon": 1.0, "Mars": 1.0, "Jupiter": 1.0, "Mercury": 0.5, "Venus": 0.0, "Saturn": 0.0, "Sun": 1.0},
    "Moon": {"Sun": 1.0, "Mercury": 1.0, "Mars": 0.5, "Jupiter": 0.5, "Venus": 0.5, "Saturn": 0.5, "Moon": 1.0},
    "Mars": {"Sun": 1.0, "Moon": 1.0, "Jupiter": 1.0, "Venus": 0.5, "Saturn": 0.5, "Mercury": 0.0, "Mars": 1.0},
    "Mercury": {"Sun": 1.0, "Venus": 1.0, "Mars": 0.5, "Jupiter": 0.5, "Saturn": 0.5, "Moon": 0.0, "Mercury": 1.0},
    "Jupiter": {"Sun": 1.0, "Moon": 1.0, "Mars": 1.0, "Saturn": 0.5, "Mercury": 0.0, "Venus": 0.0, "Jupiter": 1.0},
    "Venus": {"Mercury": 1.0, "Saturn": 1.0, "Mars": 0.5, "Jupiter": 0.5, "Sun": 0.0, "Moon": 0.0, "Venus": 1.0},
    "Saturn": {"Mercury": 1.0, "Venus": 1.0, "Jupiter": 0.5, "Sun": 0.0, "Moon": 0.0, "Mars": 0.0, "Saturn": 1.0}
}

# Vasya Rasis (Girl Rasi -> List of Boy Rasis that are Vasya)
VASYA_MAP = {
    0: [4, 7], 1: [3, 6], 2: [5], 3: [7, 8],
    4: [6], 5: [2, 11], 6: [5, 9], 7: [3, 8],
    8: [11], 9: [10], 10: [4], 11: [9]
}

# Rajju classification for 27 stars
RAJJU_MAP = {
    0: "Siro", 1: "Kanta", 2: "Udara", 3: "Kati", 4: "Pada",
    5: "Siro", 6: "Kanta", 7: "Udara", 8: "Kati", 9: "Pada",
    10: "Siro", 11: "Kanta", 12: "Udara", 13: "Kati", 14: "Pada",
    15: "Siro", 16: "Kanta", 17: "Udara", 18: "Kati", 19: "Pada",
    20: "Siro", 21: "Kanta", 22: "Udara", 23: "Kati", 24: "Pada",
    25: "Siro", 26: "Kanta"
}

# Vedha (Afflicted) star pairs
VEDHA_PAIRS = {
    (0, 17), (1, 16), (2, 15), (3, 14), (4, 13), (5, 21),
    (6, 20), (7, 19), (8, 18), (9, 26), (10, 25), (11, 24),
    (12, 23), (13, 4), (14, 3), (15, 2), (16, 1), (17, 0),
    (18, 8), (19, 7), (20, 6), (21, 5), (22, 22), (23, 12),
    (24, 11), (25, 10), (26, 9)
}

# Enemy Yoni Animal Pairs
YONI_ENEMIES = {
    ("കുതിര", "മഹിഷം"), ("മഹിഷം", "കുതിര"),
    ("ആന", "സിംഹം"), ("സിംഹം", "ആന"),
    ("ആട്", "കുരങ്"), ("കുരങ്", "ആട്"),
    ("പാമ്പ്", "കീരി"), ("കീരി", "പാമ്പ്"),
    ("എലി", "പൂച്ച"), ("പൂച്ച", "എലി"),
    ("നായ്", "മാൻ"), ("മാൻ", "നായ്"),
    ("പൂച്ച", "പുലി"), ("പുലി", "പൂച്ച"),
    ("പശു", "പുലി"), ("പുലി", "പശു")
}

def calculate_porutham_10(girl_star_or_data, boy_star_or_data):
    """
    Calculates 10-Porutham compatibility dynamically from actual astrological data.
    """
    if isinstance(girl_star_or_data, dict):
        planets = girl_star_or_data.get("planets", {})
        if "Moon" in planets and "rasi_index" in planets["Moon"]:
            g_rasi = planets["Moon"]["rasi_index"]
            g_star = girl_star_or_data.get("star", NAKSHATRA_NAMES[planets["Moon"].get("star_index", 0)])
        elif "moon_lon" in girl_star_or_data:
            g_rasi = int(girl_star_or_data["moon_lon"] // 30) % 12
            g_star = girl_star_or_data.get("star", "Ayilyam")
        else:
            g_star = girl_star_or_data.get("star", "Ayilyam")
            g_rasi = girl_star_or_data.get("rasi_num", 0)
    else:
        g_star = str(girl_star_or_data)
        g_idx = NAKSHATRA_NAMES.index(g_star) if g_star in NAKSHATRA_NAMES else 0
        # Standard default Rasi approximation for isolated star string without chart
        g_rasi = (g_idx * 4 // 9) % 12

    if isinstance(boy_star_or_data, dict):
        planets = boy_star_or_data.get("planets", {})
        if "Moon" in planets and "rasi_index" in planets["Moon"]:
            b_rasi = planets["Moon"]["rasi_index"]
            b_star = boy_star_or_data.get("star", NAKSHATRA_NAMES[planets["Moon"].get("star_index", 0)])
        elif "moon_lon" in boy_star_or_data:
            b_rasi = int(boy_star_or_data["moon_lon"] // 30) % 12
            b_star = boy_star_or_data.get("star", "Ayilyam")
        else:
            b_star = boy_star_or_data.get("star", "Ayilyam")
            b_rasi = boy_star_or_data.get("rasi_num", 0)
    else:
        b_star = str(boy_star_or_data)
        b_idx = NAKSHATRA_NAMES.index(b_star) if b_star in NAKSHATRA_NAMES else 0
        b_rasi = (b_idx * 4 // 9) % 12

    g_idx = NAKSHATRA_NAMES.index(g_star) if g_star in NAKSHATRA_NAMES else 0
    b_idx = NAKSHATRA_NAMES.index(b_star) if b_star in NAKSHATRA_NAMES else 0

    star_dist = ((b_idx - g_idx) % 27) + 1
    rasi_dist = ((b_rasi - g_rasi) % 12) + 1

    # 1. Rasi Porutham
    if rasi_dist in [1, 7, 10, 11]:
        p1_score, p1_status = 1.0, "ഉത്തമം"
    elif rasi_dist in [3, 4]:
        p1_score, p1_status = 0.5, "മദ്ധ്യമം"
    else:
        p1_score, p1_status = 0.0, "അധമം"
    p1 = {"name": "രാശിപൊരുത്തം", "status": p1_status, "score": p1_score}

    # 2. Rashyadhipa Porutham
    g_lord = RASI_LORDS.get(g_rasi, "Mercury")
    b_lord = RASI_LORDS.get(b_rasi, "Mercury")
    friendship_score = PLANET_FRIENDS.get(g_lord, {}).get(b_lord, 0.5)
    if friendship_score >= 1.0:
        p2_score, p2_status = 1.0, "ഉത്തമം"
    elif friendship_score >= 0.5:
        p2_score, p2_status = 0.5, "മദ്ധ്യമം"
    else:
        p2_score, p2_status = 0.0, "അധമം"
    p2 = {"name": "രാശ്യധിപപൊരുത്തം", "status": p2_status, "score": p2_score}

    # 3. Vasya Porutham
    if b_rasi in VASYA_MAP.get(g_rasi, []):
        p3_score, p3_status = 1.0, "ഉത്തമം"
    else:
        p3_score, p3_status = 0.0, "അധമം"
    p3 = {"name": "വശ്യപൊരുത്തം", "status": p3_status, "score": p3_score}

    # 4. Gana Porutham
    g_gana = NAKSHATRA_METADATA.get(g_star, {}).get("ganam", "ദേവഗണം")
    b_gana = NAKSHATRA_METADATA.get(b_star, {}).get("ganam", "ദേവഗണം")
    if g_gana == b_gana:
        p4_score, p4_status = 1.0, "ഉത്തമം"
    elif (g_gana == "ദേവഗണം" and b_gana == "മനുഷ്യഗണം") or (g_gana == "മനുഷ്യഗണം" and b_gana == "ദേവഗണം"):
        p4_score, p4_status = 0.5, "മദ്ധ്യമം"
    elif b_gana == "രാക്ഷസഗണം" and g_gana in ["ദേവഗണം", "മനുഷ്യഗണം"]:
        p4_score, p4_status = 0.5, "മദ്ധ്യമം"
    else:
        p4_score, p4_status = 0.0, "അധമം"
    p4 = {"name": "ഗണപൊരുത്തം", "status": p4_status, "score": p4_score}

    # 5. Yoni Porutham
    g_yoni = NAKSHATRA_METADATA.get(g_star, {}).get("mrigam", "കുതിര")
    b_yoni = NAKSHATRA_METADATA.get(b_star, {}).get("mrigam", "കുതിര")
    if (g_yoni, b_yoni) in YONI_ENEMIES:
        p5_score, p5_status = 0.0, "അധമം"
    elif g_yoni == b_yoni:
        p5_score, p5_status = 1.0, "ഉത്തമം"
    else:
        p5_score, p5_status = 0.5, "മദ്ധ്യമം"
    p5 = {"name": "യോനിപൊരുത്തം", "status": p5_status, "score": p5_score}

    # 6. Dina Porutham
    dina_rem = star_dist % 9
    if dina_rem in [2, 4, 6, 8, 0]:
        p6_score, p6_status = 1.0, "ഉത്തമം"
    else:
        p6_score, p6_status = 0.0, "അധമം"
    p6 = {"name": "ദിനപൊരുത്തം", "status": p6_status, "score": p6_score}

    # 7. Mahendra Porutham
    if star_dist in [4, 7, 10, 13, 16, 19, 22, 25]:
        p7_score, p7_status = 1.0, "ഉത്തമം"
    else:
        p7_score, p7_status = 0.0, "അധമം"
    p7 = {"name": "മാഹേന്ദ്രപൊരുത്തം", "status": p7_status, "score": p7_score}

    # 8. Sthree Deergha Porutham
    if star_dist > 13:
        p8_score, p8_status = 1.0, "ഉത്തമം"
    elif star_dist >= 7:
        p8_score, p8_status = 0.5, "മദ്ധ്യമം"
    else:
        p8_score, p8_status = 0.0, "അധമം"
    p8 = {"name": "സ്ത്രീദീർഘപൊരുത്തം", "status": p8_status, "score": p8_score}

    # 9. Rajju Porutham
    g_rajju = RAJJU_MAP.get(g_idx, "Siro")
    b_rajju = RAJJU_MAP.get(b_idx, "Siro")
    if g_rajju != b_rajju:
        p9_score, p9_status = 1.0, "ഉത്തമം"
    else:
        p9_score, p9_status = 0.0, "അധമം"
    p9 = {"name": "രജ്ജുപൊരുത്തം", "status": p9_status, "score": p9_score}

    # 10. Vedha Porutham
    if (g_idx, b_idx) in VEDHA_PAIRS or (b_idx, g_idx) in VEDHA_PAIRS:
        p10_score, p10_status = 0.0, "അധമം"
    else:
        p10_score, p10_status = 1.0, "ഉത്തമം"
    p10 = {"name": "വേദപൊരുത്തം", "status": p10_status, "score": p10_score}

    poruthams = [p1, p2, p3, p4, p5, p6, p7, p8, p9, p10]
    total_score = sum(p["score"] for p in poruthams)

    verdict_mal = "ഉത്തമം" if total_score >= 6.5 else ("മദ്ധ്യമം" if total_score >= 4.0 else "അധമം")

    return {
        "items": poruthams,
        "total_score": total_score,
        "verdict_mal": verdict_mal
    }

check_porutham = calculate_porutham_10

def calculate_papasamyam_points(chart_dict):
    """
    Calculates Papamoolyam points dynamically using authoritative engine calculator.
    """
    from engine.astrology_calculator import calculate_papamoolyam
    planets = chart_dict.get("planets", {}) if isinstance(chart_dict, dict) else {}
    res = calculate_papamoolyam(planets)
    return {
        "total": res.get("total", 0.0),
        "lagna": res.get("Lagna", {}).get("score", 0.0),
        "moon": res.get("Moon", {}).get("score", 0.0),
        "venus": res.get("Venus", {}).get("score", 0.0)
    }

def calculate_kuja_dosha(chart_dict):
    """
    Calculates Kuja Dosha and Pariharam status dynamically using authoritative engine calculator.
    """
    from engine.astrology_calculator import calculate_kuja_dosha_evaluation
    planets = chart_dict.get("planets", {}) if isinstance(chart_dict, dict) else {}
    res = calculate_kuja_dosha_evaluation(planets)
    return {
        "status": "Resolved" if res["has_pariharam"] else "Needs Pariharam",
        "has_pariharam": res["has_pariharam"],
        "has_dosha": res["has_dosha"],
        "status_mal": res["status_mal"],
        "desc_mal": res["desc_mal"],
        "desc": "Kuja Dosha Pariharam: Excellent" if res["has_pariharam"] else "Kuja Dosha Present"
    }

def generate_person_dasa_timeline(dob_str, star_name, dasa_balance_str=""):
    """
    Generates dynamic 9 Mahadasa timeline using authoritative Dasa engine.
    """
    from engine.elaborated_horoscope import generate_full_dasa_apahara_timeline
    d_list = generate_full_dasa_apahara_timeline(dob_str, dasa_balance_str or star_name)
    timeline = []
    for d in d_list:
        try:
            s_yr = int(d["start"].split("-")[2])
            e_yr = int(d["end"].split("-")[2])
        except Exception:
            s_yr, e_yr = 2000, 2010
        timeline.append({
            "lord": d["lord"],
            "start_yr": s_yr,
            "end_yr": e_yr,
            "start_str": d["start"],
            "end_str": d["end"],
            "start_dt": d.get("start_dt"),
            "end_dt": d.get("end_dt"),
            "span_str": f"{d['start']} to {d['end']}"
        })
    return timeline

def calculate_marriage_compatibility(girl_chart, boy_chart):
    """
    Master Architecture Function:
    Calculates 100% dynamic Marriage Compatibility Result from Bride and Groom charts using single authoritative calculation engine.
    """
    from engine.elaborated_horoscope import generate_full_dasa_apahara_timeline
    g_star = girl_chart.get("star", "Ayilyam") if isinstance(girl_chart, dict) else str(girl_chart)
    b_star = boy_chart.get("star", "Ayilyam") if isinstance(boy_chart, dict) else str(boy_chart)

    porutham_res = calculate_porutham_10(girl_chart, boy_chart)
    g_papa = calculate_papasamyam_points(girl_chart)
    b_papa = calculate_papasamyam_points(boy_chart)

    papa_diff = abs(g_papa["total"] - b_papa["total"])
    papa_balanced = papa_diff <= 1.0 or b_papa["total"] >= g_papa["total"]

    g_kuja = calculate_kuja_dosha(girl_chart)
    b_kuja = calculate_kuja_dosha(boy_chart)

    g_dob = girl_chart.get("dob", "1998-08-20") if isinstance(girl_chart, dict) else "1998-08-20"
    b_dob = boy_chart.get("dob", "1996-05-15") if isinstance(boy_chart, dict) else "1996-05-15"

    g_full_dasa = generate_full_dasa_apahara_timeline(g_dob, girl_chart)
    b_full_dasa = generate_full_dasa_apahara_timeline(b_dob, boy_chart)

    g_dasa = []
    for d in g_full_dasa:
        try: s_yr, e_yr = int(d["start"].split("-")[2]), int(d["end"].split("-")[2])
        except Exception: s_yr, e_yr = 2000, 2010
        g_dasa.append({"lord": d["lord"], "start_yr": s_yr, "end_yr": e_yr, "start_dt": d["start_dt"], "end_dt": d["end_dt"], "span_str": f"{d['start']}–{d['end']}"})

    b_dasa = []
    for d in b_full_dasa:
        try: s_yr, e_yr = int(d["start"].split("-")[2]), int(d["end"].split("-")[2])
        except Exception: s_yr, e_yr = 2000, 2010
        b_dasa.append({"lord": d["lord"], "start_yr": s_yr, "end_yr": e_yr, "start_dt": d["start_dt"], "end_dt": d["end_dt"], "span_str": f"{d['start']}–{d['end']}"})

    # Check Dasa Sandhi (overlap of Mahadasa transitions within 1 year = 365.25 days)
    has_sandhi = False
    for gd in g_dasa:
        for bd in b_dasa:
            diff_days = abs((gd["end_dt"] - bd["end_dt"]).total_seconds() / 86400.0)
            if diff_days <= 365.25:
                has_sandhi = True
                break
        if has_sandhi: break

    return {
        "porutham": porutham_res,
        "papasamya": {
            "bride": g_papa,
            "groom": b_papa,
            "diff": round(papa_diff, 2),
            "is_balanced": papa_balanced
        },
        "kuja_dosha": {
            "bride": g_kuja,
            "groom": b_kuja,
            "is_resolved": g_kuja["has_pariharam"] and b_kuja["has_pariharam"]
        },
        "dasa_timeline": {
            "bride": g_dasa,
            "groom": b_dasa,
            "has_sandhi": has_sandhi
        }
    }

def render_south_grid_match(chart_dict, center_label="ഗ്രഹനില"):
    grid_map = {
        11: chart_dict.get(11, []), 0: chart_dict.get(0, []), 1: chart_dict.get(1, []), 2: chart_dict.get(2, []),
        10: chart_dict.get(10, []), 3: chart_dict.get(3, []), 9: chart_dict.get(9, []), 4: chart_dict.get(4, []),
        8: chart_dict.get(8, []), 7: chart_dict.get(7, []), 6: chart_dict.get(6, []), 5: chart_dict.get(5, [])
    }

    MAL_SHORT = {
        "Lagna": "ല.", "Sun": "ര.", "Moon": "ച.", "Mars": "കു.",
        "Mercury": "ബു.", "Jupiter": "ഗു.", "Venus": "ശു.", "Saturn": "ശി.",
        "Rahu": "രാ.", "Ketu": "കേ.", "Mandi": "മാ."
    }

    def format_planets(p_list):
        if not p_list: return "&nbsp;"
        return " ".join([MAL_SHORT.get(p, p) for p in p_list])

    r1_html = "".join([f'<div class="cell">{format_planets(grid_map[idx])}</div>' for idx in [11, 0, 1, 2]])
    r2_left = f'<div class="cell">{format_planets(grid_map[10])}</div>'
    r2_right = f'<div class="cell">{format_planets(grid_map[3])}</div>'
    r3_left = f'<div class="cell">{format_planets(grid_map[9])}</div>'
    r3_right = f'<div class="cell">{format_planets(grid_map[4])}</div>'
    r4_html = "".join([f'<div class="cell">{format_planets(grid_map[idx])}</div>' for idx in [8, 7, 6, 5]])

    center_box_html = f'''
    <div class="center-box">
        <div style="font-size: 11px; font-weight: 800; color: #0f172a; text-align: center; padding: 2px;">{center_label}</div>
    </div>
    '''

    return f'''
    <div class="south-grid">
        {r1_html}
        {r2_left} {center_box_html} {r2_right}
        {r3_left} {r3_right}
        {r4_html}
    </div>
    '''

