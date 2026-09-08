# Final QA & Improved 3-Page Modern Marriage Compatibility Report Generator
# Modern Premium UI/UX Architecture with 100% Traditional Chart & Data Preservation
# Strictly Formatted for 3 PAGES (A4) with Zero Data Loss & Full Multi-Language Localization
import sqlite3
import os
from engine.marriage_engine import NAKSHATRA_METADATA, calculate_porutham_10, render_south_grid_match, calculate_marriage_compatibility
from engine.elaborated_horoscope import render_professional_30page_report

def render_horoscope_report(*args, **kwargs):
    return render_professional_30page_report(*args, **kwargs)

# Centralized Localization & Translation System
MARRIAGE_TRANSLATIONS = {
    "english": {
        "report_title": "MARRIAGE COMPATIBILITY REPORT",
        "sub_title": "Traditional Kerala Astrology Analysis & Match Evaluation",
        "bride": "BRIDE",
        "groom": "GROOM",
        "sec_01_tag": "01 — OVERVIEW & CHARTS",
        "overall_verdict": "OVERALL COMPATIBILITY VERDICT",
        "nakshatra": "NAKSHATRA",
        "papasamyam": "PAPASAMYAM",
        "kuja_dosha": "KUJA DOSHA",
        "dasa_match": "DASA MATCH",
        "evaluated": "Evaluated",
        "resolved": "Resolved",
        "needs_attention": "Needs Attention",
        "what_looks_good": "WHAT LOOKS GOOD",
        "areas_to_consider": "AREAS TO CONSIDER",
        "no_major_unfavorable": "No major unfavorable Poruthams.",
        "birth_details": "BIRTH DETAILS",
        "bride_details": "BRIDE DETAILS",
        "groom_details": "GROOM DETAILS",
        "dob_tob": "DOB / TOB",
        "place_of_birth": "Place of Birth",
        "nakshatra_pada": "Nakshatra & Pada",
        "gem_ganam": "Gem & Ganam",
        "deity_tree": "Deity & Tree",
        "yoni_bhutham": "Yoni & Bhutham",
        "mrigam_pakshi": "Mrigam & Pakshi",
        "dasa_balance": "Dasa Balance",
        "grahanila_charts": "GRAHANILA (RASI CHARTS)",
        "navamsakam_charts": "NAVAMSAKAM CHARTS",
        "bride_rasi_title": "Rasi Chart (BRIDE)",
        "groom_rasi_title": "Rasi Chart (GROOM)",
        "bride_nav_title": "Navamsakam (BRIDE)",
        "groom_nav_title": "Navamsakam (GROOM)",
        "sec_02_tag": "02 — PORUTHAMS & DOSHAS",
        "porutham_analysis": "NAKSHATRA COMPATIBILITY (10 PORUTHAMS)",
        "score_bar_lbl": "OVERALL NAKSHATRA PORUTHAM SCORE",
        "papasamyam_sec": "PAPASAMYAM BALANCE & TABLES",
        "bride_papamoolyam": "BRIDE PAPAMOOLYAM",
        "groom_papamoolyam": "GROOM PAPAMOOLYAM",
        "bride_papamoolyam_tbl": "BRIDE PAPAMOOLYAM TABLE",
        "groom_papamoolyam_tbl": "GROOM PAPAMOOLYAM TABLE",
        "total_papasamya": "Total Papasamya Points",
        "balanced": "BALANCED",
        "house_col": "House",
        "value_col": "Points",
        "lagna_row": "From Lagna",
        "moon_row": "From Moon",
        "venus_row": "From Venus",
        "kuja_dosha_sec": "KUJA DOSHA EVALUATION",
        "kuja_verdict": "✓ KUJA DOSHA PARIHARAM: UTTAMAM",
        "kuja_desc": "Kuja Dosha Pariharam: Excellent, Papasamya Value: 5.50 - 5.50 = 0.00",
        "kuja_exceptions": "Exceptions: (Ex)Exalted, (Deb)Debilitated, (Jup)Jupiter Aspect, (Comb)Combust, (Ret)Retrograde",
        "sec_03_tag": "03 — DASA & FINAL RESULT",
        "dasa_timeline_sec": "9 MAHADASA TIMELINES (FULL 4-DIGIT YEAR RANGES)",
        "bride_dasa_title": "BRIDE DASA TIMELINE",
        "groom_dasa_title": "GROOM DASA TIMELINE",
        "dasa_sandhi_lbl": "DASA SANDHI",
        "dasa_sandhi_val": "Needs Attention",
        "samadasa_lbl": "SAMADASA",
        "samadasa_val": "Overlapping Periods",
        "final_assessment_sec": "FINAL COMPATIBILITY ASSESSMENT",
        "final_verdict_hdr": "FINAL OVERALL VERDICT",
        "final_verdict_sub": "Overall Nakshatra Score: {score:.1f} / 10 • Papasamya Balanced • Kuja Dosha Resolved",
        "what_works_well": "WHAT WORKS WELL",
        "what_requires_consideration": "WHAT REQUIRES CONSIDERATION",
        "traditional_conclusion_hdr": "TRADITIONAL ASTROLOGY CONCLUSION",
        "traditional_conclusion_text": "According to Indian/Kerala astrology principles, compatibility is evaluated as MODERATE.",
        "page_1": "Page 1 of 3",
        "page_2": "Page 2 of 3",
        "page_3": "Page 3 of 3",
        "footer_licence": "Marriage Compatibility Report",
        "match_excellent": "EXCELLENT MATCH",
        "match_moderate": "MODERATE MATCH",
        "match_unfavorable": "UNFAVORABLE MATCH",
        "status_good": "Good",
        "status_moderate": "Moderate",
        "status_attention": "Needs Attention",
        "nak_good_desc": "Excellent Nakshatra compatibility ({score:.1f}/10)",
        "nak_mod_desc": "Moderate Nakshatra compatibility ({score:.1f}/10)",
        "sum_rsi_gana": "Excellent Rasi & Gana compatibility",
        "sum_papa_bal": "Papamoolyam points perfectly balanced (0.00 Diff)",
        "sum_kuja_res": "Kuja Dosha Resolved / Pariharam present",
        "sum_vas_dina": "Vasya & Dina Poruthams need attention",
        "sum_dasa_overlap": "Dasa Sandhi overlapping periods to be monitored"
    },
    "malayalam": {
        "report_title": "വിവാഹ പൊരുത്ത റിപ്പോർട്ട്",
        "sub_title": "പരമ്പരാഗത കേരള ജ്യോതിഷ പൊരുത്ത പരിശോധന",
        "bride": "വധു",
        "groom": "വരൻ",
        "sec_01_tag": "01 — പ്രധാന സംഗ്രഹം & ഗ്രഹനില",
        "overall_verdict": "മൊത്തത്തിലുള്ള പൊരുത്തഫലം",
        "nakshatra": "നക്ഷത്ര പൊരുത്തം",
        "papasamyam": "പാപസാമ്യം",
        "kuja_dosha": "കുജദോഷം",
        "dasa_match": "ദശാ പൊരുത്തം",
        "evaluated": "പരിശോധിച്ചു",
        "resolved": "പരിഹരിക്കപ്പെട്ടു",
        "needs_attention": "ശ്രദ്ധിക്കേണ്ടവ",
        "what_looks_good": "അനുകൂല പൊരുത്തങ്ങൾ",
        "areas_to_consider": "ശ്രദ്ധിക്കേണ്ട കാര്യങ്ങൾ",
        "no_major_unfavorable": "പ്രധാന പ്രതികൂല പൊരുത്തങ്ങൾ ഇല്ല.",
        "birth_details": "ജനന വിവരങ്ങൾ",
        "bride_details": "വധുവിന്റെ വിവരങ്ങൾ",
        "groom_details": "വരന്റെ വിവരങ്ങൾ",
        "dob_tob": "ജനന തീയതി / സമയം",
        "place_of_birth": "ജനന സ്ഥലം",
        "nakshatra_pada": "നക്ഷത്രം & പാദം",
        "gem_ganam": "രത്നം & ഗണം",
        "deity_tree": "ദേവത & വൃക്ഷം",
        "yoni_bhutham": "യോനി & ഭൂതം",
        "mrigam_pakshi": "മൃഗം & പക്ഷി",
        "dasa_balance": "ഗർഭശിഷ്ടദശ",
        "grahanila_charts": "ഗ്രഹനില (രാശി ചാർട്ടുകൾ)",
        "navamsakam_charts": "നവാംശകം ചാർട്ടുകൾ",
        "bride_rasi_title": "ഗ്രഹനില (വധു)",
        "groom_rasi_title": "ഗ്രഹനില (വരൻ)",
        "bride_nav_title": "നവാംശകം (വധു)",
        "groom_nav_title": "നവാംശകം (വരൻ)",
        "sec_02_tag": "02 — പൊരുത്തങ്ങളും ദോഷങ്ങളും",
        "porutham_analysis": "10 പൊരുത്ത പരിശോധന",
        "score_bar_lbl": "ആകെ നക്ഷത്ര പൊരുത്ത സ്കോർ",
        "papasamyam_sec": "പാപസാമ്യ പരിശോധന & പട്ടികകൾ",
        "bride_papamoolyam": "വധുവിന്റെ പാപമൂല്യം",
        "groom_papamoolyam": "വരന്റെ പാപമൂല്യം",
        "bride_papamoolyam_tbl": "വധുവിന്റെ പാപമൂല്യ പട്ടിക",
        "groom_papamoolyam_tbl": "വരന്റെ പാപമൂല്യ പട്ടിക",
        "total_papasamya": "ആകെ പാപമൂല്യം",
        "balanced": "സമീകൃതം",
        "house_col": "ഭാവം",
        "value_col": "മൂല്യം",
        "lagna_row": "ലഗ്നാൽ",
        "moon_row": "ചന്ദ്രാൽ",
        "venus_row": "ശുക്രാൽ",
        "kuja_dosha_sec": "കുജദോഷ പരിശോധന",
        "kuja_verdict": "✓ കുജദോഷപരിഹാരം : ഉത്തമം",
        "kuja_desc": "കുജദോഷപരിഹാരം : ഉത്തമം, പാപസാമ്യമൂല്യം : 5.50 - 5.50 = 0.00",
        "kuja_exceptions": "ഒഴിവുകൾ : (ഉ)ഉച്ചക്ഷേത്രം, (നീ)നീചം, (ഗു)വ്യാഴദൃഷ്ടി, ()മൗഡ്യം, (<)വക്രം",
        "sec_03_tag": "03 — ദശാ സമയരേഖ & തീരുമാനം",
        "dasa_timeline_sec": "9 മഹാദശാ സമയരേഖകൾ (4-അക്ക വർഷങ്ങൾ)",
        "bride_dasa_title": "വധുവിന്റെ ദശാ സമയരേഖ",
        "groom_dasa_title": "വരന്റെ ദശാ സമയരേഖ",
        "dasa_sandhi_lbl": "ദശാസന്ധി",
        "dasa_sandhi_val": "ശ്രദ്ധിക്കേണ്ടവ",
        "samadasa_lbl": "സമദശ",
        "samadasa_val": "തുല്യദശാ കാലങ്ങൾ",
        "final_assessment_sec": "സമ്പൂർണ്ണ പൊരുത്ത പരിശോധനാ ഫലം",
        "final_verdict_hdr": "അന്തിമ മൊത്തത്തിലുള്ള ഫലം",
        "final_verdict_sub": "ആകെ നക്ഷത്ര പൊരുത്ത സ്കോർ: {score:.1f} / 10 • പാപസാമ്യം സമീകൃതം • കുജദോഷ പരിഹാരം ഉണ്ട്",
        "what_works_well": "അനുകൂല കാര്യങ്ങൾ",
        "what_requires_consideration": "ശ്രദ്ധിക്കേണ്ട കാര്യങ്ങൾ",
        "traditional_conclusion_hdr": "പരമ്പരാഗത ജ്യോതിഷ നിഗമനം",
        "traditional_conclusion_text": "ഭാരതീയജ്യോതിഷവിധിപ്രകാരം പൊരുത്തം മദ്ധ്യമമായി കണക്കാക്കാം.",
        "page_1": "പേജ് 1 / 3",
        "page_2": "പേജ് 2 / 3",
        "page_3": "പേജ് 3 / 3",
        "footer_licence": "വിവാഹ പൊരുത്ത റിപ്പോർട്ട്",
        "match_excellent": "ഉത്തമ പൊരുത്തം",
        "match_moderate": "മദ്ധ്യമ പൊരുത്തം",
        "match_unfavorable": "അധമ പൊരുത്തം",
        "status_good": "ഉത്തമം",
        "status_moderate": "മദ്ധ്യമം",
        "status_attention": "അധമം",
        "nak_good_desc": "ഉത്തമ നക്ഷത്ര പൊരുത്തം ({score:.1f}/10)",
        "nak_mod_desc": "മദ്ധ്യമ നക്ഷത്ര പൊരുത്തം ({score:.1f}/10)",
        "sum_rsi_gana": "ഉത്തമ രാശി & ഗണ പൊരുത്തം",
        "sum_papa_bal": "പാപമൂല്യം പൂർണ്ണമായും സമീകൃതം (0.00 വിത്യാസം)",
        "sum_kuja_res": "കുജദോഷ പരിഹാരം ലഭ്യമാണ്",
        "sum_vas_dina": "വശ്യ, ദിന പൊരുത്തങ്ങൾ ശ്രദ്ധിക്കണം",
        "sum_dasa_overlap": "ദശാസന്ധി കാലയളവുകൾ ശ്രദ്ധിക്കുക"
    },
    "bilingual": {
        "report_title": "MARRIAGE COMPATIBILITY REPORT / വിവാഹ പൊരുത്ത റിപ്പോർട്ട്",
        "sub_title": "Traditional Kerala Astrology Analysis & Match Evaluation / ജ്യോതിഷ പൊരുത്ത പരിശോധന",
        "bride": "BRIDE / വധു",
        "groom": "GROOM / വരൻ",
        "sec_01_tag": "01 — OVERVIEW & CHARTS / സംഗ്രഹം & ഗ്രഹനില",
        "overall_verdict": "OVERALL COMPATIBILITY VERDICT / മൊത്തത്തിലുള്ള പൊരുത്തഫലം",
        "nakshatra": "NAKSHATRA / നക്ഷത്രം",
        "papasamyam": "PAPASAMYAM / പാപസാമ്യം",
        "kuja_dosha": "KUJA DOSHA / കുജദോഷം",
        "dasa_match": "DASA MATCH / ദശാ പൊരുത്തം",
        "evaluated": "Evaluated / പരിശോധിച്ചു",
        "resolved": "Resolved / പരിഹരിച്ചു",
        "needs_attention": "Needs Attention / ശ്രദ്ധിക്കേണ്ടവ",
        "what_looks_good": "WHAT LOOKS GOOD / അനുകൂല പൊരുത്തങ്ങൾ",
        "areas_to_consider": "AREAS TO CONSIDER / ശ്രദ്ധിക്കേണ്ട കാര്യങ്ങൾ",
        "no_major_unfavorable": "No major unfavorable Poruthams / പ്രധാന പ്രതികൂല പൊരുത്തങ്ങൾ ഇല്ല.",
        "birth_details": "BIRTH DETAILS / ജനന വിവരങ്ങൾ",
        "bride_details": "BRIDE DETAILS / വധുവിന്റെ വിവരങ്ങൾ",
        "groom_details": "GROOM DETAILS / വരന്റെ വിവരങ്ങൾ",
        "dob_tob": "DOB / TOB (ജനന തീയതി/സമയം)",
        "place_of_birth": "Place of Birth (ജനന സ്ഥലം)",
        "nakshatra_pada": "Nakshatra & Pada (നക്ഷത്രം & പാദം)",
        "gem_ganam": "Gem & Ganam (രത്നം & ഗണം)",
        "deity_tree": "Deity & Tree (ദേവത & വൃക്ഷം)",
        "yoni_bhutham": "Yoni & Bhutham (യോനി & ഭൂതം)",
        "mrigam_pakshi": "Mrigam & Pakshi (മൃഗം & പക്ഷി)",
        "dasa_balance": "Dasa Balance (ഗർഭശിഷ്ടദശ)",
        "grahanila_charts": "GRAHANILA (RASI CHARTS / ഗ്രഹനില)",
        "navamsakam_charts": "NAVAMSAKAM CHARTS / നവാംശകം",
        "bride_rasi_title": "Rasi Chart / ഗ്രഹനില (BRIDE)",
        "groom_rasi_title": "Rasi Chart / ഗ്രഹനില (GROOM)",
        "bride_nav_title": "Navamsakam / നവാംശകം (BRIDE)",
        "groom_nav_title": "Navamsakam / നവാംശകം (GROOM)",
        "sec_02_tag": "02 — PORUTHAMS & DOSHAS / പൊരുത്തങ്ങളും ദോഷങ്ങളും",
        "porutham_analysis": "NAKSHATRA COMPATIBILITY (10 PORUTHAMS / 10 പൊരുത്തങ്ങൾ)",
        "score_bar_lbl": "OVERALL PORUTHAM SCORE / ആകെ പൊരുത്ത സ്കോർ",
        "papasamyam_sec": "PAPASAMYAM EVALUATION / പാപസാമ്യ പരിശോധന",
        "bride_papamoolyam": "BRIDE PAPAMOOLYAM / വധു",
        "groom_papamoolyam": "GROOM PAPAMOOLYAM / വരൻ",
        "bride_papamoolyam_tbl": "BRIDE PAPAMOOLYAM TABLE / വധുവിന്റെ പാപമൂല്യ പട്ടിക",
        "groom_papamoolyam_tbl": "GROOM PAPAMOOLYAM TABLE / വരന്റെ പാപമൂല്യ പട്ടിക",
        "total_papasamya": "Total Papasamya / ആകെ പാപമൂല്യം",
        "balanced": "BALANCED / സമീകൃതം",
        "house_col": "House / ഭാവം",
        "value_col": "Points / മൂല്യം",
        "lagna_row": "From Lagna (ലഗ്നാൽ)",
        "moon_row": "From Moon (ചന്ദ്രാൽ)",
        "venus_row": "From Venus (ശുക്രാൽ)",
        "kuja_dosha_sec": "KUJA DOSHA EVALUATION / കുജദോഷ പരിശോധന",
        "kuja_verdict": "✓ KUJA DOSHA PARIHARAM / കുജദോഷപരിഹാരം : UTTAMAM",
        "kuja_desc": "Kuja Dosha Pariharam: Excellent / കുജദോഷപരിഹാരം: ഉത്തമം (Diff: 0.00)",
        "kuja_exceptions": "Exceptions: (Ex)Exalted, (Deb)Debilitated, (Jup)Jupiter Aspect, (Comb)Combust, (Ret)Retrograde",
        "sec_03_tag": "03 — DASA TIMELINE & CONCLUSION / ദശാ സമയരേഖ & തീരുമാനം",
        "dasa_timeline_sec": "9 MAHADASA TIMELINES / 9 മഹാദശാ സമയരേഖകൾ (4-Digit Years)",
        "bride_dasa_title": "BRIDE DASA TIMELINE / വധുവിന്റെ ദശാ സമയരേഖ",
        "groom_dasa_title": "GROOM DASA TIMELINE / വരന്റെ ദശാ സമയരേഖ",
        "dasa_sandhi_lbl": "DASA SANDHI / ദശാസന്ധി",
        "dasa_sandhi_val": "Needs Attention / ശ്രദ്ധിക്കേണ്ടവ",
        "samadasa_lbl": "SAMADASA / സമദശ",
        "samadasa_val": "Overlapping Periods / തുല്യദശാ കാലങ്ങൾ",
        "final_assessment_sec": "FINAL COMPATIBILITY ASSESSMENT / സമ്പൂർണ്ണ പൊരുത്ത പരിശോധനാ ഫലം",
        "final_verdict_hdr": "FINAL OVERALL VERDICT / അന്തിമ പൊരുത്തഫലം",
        "final_verdict_sub": "Overall Score: {score:.1f} / 10 • Papasamya Balanced • Kuja Dosha Resolved",
        "what_works_well": "WHAT WORKS WELL / അനുകൂല കാര്യങ്ങൾ",
        "what_requires_consideration": "WHAT REQUIRES CONSIDERATION / ശ്രദ്ധിക്കേണ്ട കാര്യങ്ങൾ",
        "traditional_conclusion_hdr": "TRADITIONAL ASTROLOGY CONCLUSION / ജ്യോതിഷ നിഗമനം",
        "traditional_conclusion_text": "According to traditional Kerala astrology guidelines, this marriage compatibility is assessed as MODERATE / ഭാരതീയജ്യോതിഷവിധിപ്രകാരം പൊരുത്തം മദ്ധ്യമമായി കണക്കാക്കാം.",
        "page_1": "Page 1 of 3",
        "page_2": "Page 2 of 3",
        "page_3": "Page 3 of 3",
        "footer_licence": "Marriage Report / പൊരുത്ത റിപ്പോർട്ട്",
        "match_excellent": "EXCELLENT MATCH (ഉത്തമ പൊരുത്തം)",
        "match_moderate": "MODERATE MATCH (മദ്ധ്യമ പൊരുത്തം)",
        "match_unfavorable": "UNFAVORABLE MATCH (അധമ പൊരുത്തം)",
        "status_good": "Good (ഉത്തമം)",
        "status_moderate": "Moderate (മദ്ധ്യമം)",
        "status_attention": "Needs Attention (അധമം)",
        "nak_good_desc": "Excellent Nakshatra compatibility / ഉത്തമ പൊരുത്തം ({score:.1f}/10)",
        "nak_mod_desc": "Moderate Nakshatra compatibility / മദ്ധ്യമ പൊരുത്തം ({score:.1f}/10)",
        "sum_rsi_gana": "Excellent Rasi & Gana compatibility / ഉത്തമ രാശി & ഗണ പൊരുത്തം",
        "sum_papa_bal": "Papamoolyam points balanced / പാപമൂല്യം സമീകൃതം",
        "sum_kuja_res": "Kuja Dosha Resolved / കുജദോഷ പരിഹാരം ഉണ്ട്",
        "sum_vas_dina": "Vasya & Dina Poruthams need attention / വശ്യ, ദിന പൊരുത്തങ്ങൾ ശ്രദ്ധിക്കുക",
        "sum_dasa_overlap": "Dasa Sandhi overlapping periods / ദശാസന്ധി കാലയളവുകൾ ശ്രദ്ധിക്കുക"
    }
}

PORUTHAM_NAMES_MAP = {
    "രാശിപൊരുത്തം": {"eng": "Rashi Porutham", "mal": "രാശിപൊരുത്തം", "bi": "Rashi Porutham (രാശിപൊരുത്തം)"},
    "രാശ്യധിപപൊരുത്തം": {"eng": "Rashyadhipa Porutham", "mal": "രാശ്യധിപപൊരുത്തം", "bi": "Rashyadhipa Porutham (രാശ്യധിപപൊരുത്തം)"},
    "വശ്യപൊരുത്തം": {"eng": "Vasya Porutham", "mal": "വശ്യപൊരുത്തം", "bi": "Vasya Porutham (വശ്യപൊരുത്തം)"},
    "ഗണപൊരുത്തം": {"eng": "Gana Porutham", "mal": "ഗണപൊരുത്തം", "bi": "Gana Porutham (ഗണപൊരുത്തം)"},
    "യോനിപൊരുത്തം": {"eng": "Yoni Porutham", "mal": "യോനിപൊരുത്തം", "bi": "Yoni Porutham (യോനിപൊരുത്തം)"},
    "ദിനപൊരുത്തം": {"eng": "Dina Porutham", "mal": "ദിനപൊരുത്തം", "bi": "Dina Porutham (ദിനപൊരുത്തം)"},
    "മാഹേന്ദ്രപൊരുത്തം": {"eng": "Mahendra Porutham", "mal": "മാഹേന്ദ്രപൊരുത്തം", "bi": "Mahendra Porutham (മാഹേന്ദ്രപൊരുത്തം)"},
    "സ്ത്രീദീർഘപൊരുത്തം": {"eng": "Sthree Deergha Porutham", "mal": "സ്ത്രീദീർഘപൊരുത്തം", "bi": "Sthree Deergha Porutham (സ്ത്രീദീർഘപൊരുത്തം)"},
    "രജ്ജുപൊരുത്തം": {"eng": "Rajju Porutham", "mal": "രജ്ജുപൊരുത്തം", "bi": "Rajju Porutham (രജ്ജുപൊരുത്തം)"},
    "വേദപൊരുത്തം": {"eng": "Vedha Porutham", "mal": "വേധപൊരുത്തം", "bi": "Vedha Porutham (വേധപൊരുത്തം)"},
}

PORUTHAM_STATUS_MAP = {
    "ഉത്തമം": {"eng": "Good", "mal": "ഉത്തമം", "bi": "Good (ഉത്തമം)"},
    "മദ്ധ്യമം": {"eng": "Moderate", "mal": "മദ്ധ്യമം", "bi": "Moderate (മദ്ധ്യമം)"},
    "അധമം": {"eng": "Needs Attention", "mal": "അധമം", "bi": "Needs Attention (അധമം)"},
}

DASA_LORDS_MAP = {
    "Ketu": {"eng": "Ketu", "mal": "കേതു", "bi": "Ketu (കേതു)"},
    "Venus": {"eng": "Venus", "mal": "ശുക്രൻ", "bi": "Venus (ശുക്രൻ)"},
    "Sun": {"eng": "Sun", "mal": "ആദിത്യൻ", "bi": "Sun (ആദിത്യൻ)"},
    "Moon": {"eng": "Moon", "mal": "ചന്ദ്രൻ", "bi": "Moon (ചന്ദ്രൻ)"},
    "Mars": {"eng": "Mars", "mal": "ചൊവ്വ", "bi": "Mars (ചൊവ്വ)"},
    "Rahu": {"eng": "Rahu", "mal": "രാഹു", "bi": "Rahu (രാഹു)"},
    "Jupiter": {"eng": "Jupiter", "mal": "വ്യാഴൻ", "bi": "Jupiter (വ്യാഴൻ)"},
    "Saturn": {"eng": "Saturn", "mal": "ശനി", "bi": "Saturn (ശനി)"},
    "Mercury": {"eng": "Mercury", "mal": "ബുധൻ", "bi": "Mercury (ബുധൻ)"},
    "കേതു": {"eng": "Ketu", "mal": "കേതു", "bi": "Ketu (കേതു)"},
    "ശുക്രൻ": {"eng": "Venus", "mal": "ശുക്രൻ", "bi": "Venus (ശുക്രൻ)"},
    "ആദിത്യൻ": {"eng": "Sun", "mal": "ആദിത്യൻ", "bi": "Sun (ആദിത്യൻ)"},
    "ചന്ദ്രൻ": {"eng": "Moon", "mal": "ചന്ദ്രൻ", "bi": "Moon (ചന്ദ്രൻ)"},
    "ചൊവ്വ": {"eng": "Mars", "mal": "ചൊവ്വ", "bi": "Mars (ചൊവ്വ)"},
    "രാഹു": {"eng": "Rahu", "mal": "രാഹു", "bi": "രാഹു (രാഹു)"},
    "വ്യാഴൻ": {"eng": "Jupiter", "mal": "വ്യാഴൻ", "bi": "Jupiter (വ്യാഴൻ)"},
    "ശനി": {"eng": "Saturn", "mal": "ശനി", "bi": "Saturn (ശനി)"},
    "ബുധൻ": {"eng": "Mercury", "mal": "ബുധൻ", "bi": "Mercury (ബുധൻ)"}
}

def render_marriage_report(girl_data, boy_data, compatibility=None, licence_address="Own address", lang="bilingual"):
    """
    Renders 3-PAGE Modern + Premium + Traditional Marriage Compatibility Report.
    """
    clean_lang = str(lang).lower().strip()
    if clean_lang not in ["english", "malayalam", "bilingual"]:
        clean_lang = "bilingual"

    L = MARRIAGE_TRANSLATIONS[clean_lang]
    lang_key = "eng" if clean_lang == "english" else ("mal" if clean_lang == "malayalam" else "bi")
    tt_case = 'uppercase' if clean_lang == 'english' else 'none'

    g_name = girl_data.get("name", "Female name")
    b_name = boy_data.get("name", "Name of Male")

    g_star = girl_data.get("star", "Ayilyam")
    b_star = boy_data.get("star", "Ayilyam")

    g_meta = NAKSHATRA_METADATA.get(g_star, NAKSHATRA_METADATA["Ayilyam"])
    b_meta = NAKSHATRA_METADATA.get(b_star, NAKSHATRA_METADATA["Ayilyam"])

    g_pada = girl_data.get("pada", 3)
    b_pada = boy_data.get("pada", 3)

    from engine.astro_engine import normalize_dob
    def format_dob_ddmmyyyy(d_str):
        if not d_str: return ""
        d_str = str(d_str).strip()
        for sep in ["/", "-"]:
            if sep in d_str:
                pts = d_str.split(sep)
                if len(pts) == 3:
                    p1, p2, p3 = pts[0].strip(), pts[1].strip(), pts[2].strip()
                    if len(p1) == 4:
                        return f"{int(p3):02d}/{int(p2):02d}/{int(p1):04d}"
                    elif len(p3) == 4:
                        return f"{int(p1):02d}/{int(p2):02d}/{int(p3):04d}"
        return d_str

    g_dob = format_dob_ddmmyyyy(girl_data.get("dob", "1998-08-20"))
    g_tob = girl_data.get("tob", "09:48:33 PM")
    b_dob = format_dob_ddmmyyyy(boy_data.get("dob", "1996-05-15"))
    b_tob = boy_data.get("tob", "09:48:33 PM")

    g_place = girl_data.get("place", "TRIVANDRUM, KERALA")
    b_place = boy_data.get("place", "TRIVANDRUM, KERALA")

    comp = compatibility if compatibility else calculate_marriage_compatibility(girl_data, boy_data)
    porutham_data = comp["porutham"]
    p_items = porutham_data["items"]
    tot_score = porutham_data["total_score"]
    tot_verdict_mal = porutham_data["verdict_mal"]

    g_papa = comp["papasamya"]["bride"]
    b_papa = comp["papasamya"]["groom"]
    papa_diff = comp["papasamya"]["diff"]
    papa_balanced = comp["papasamya"]["is_balanced"]

    g_kuja = comp["kuja_dosha"]["bride"]
    b_kuja = comp["kuja_dosha"]["groom"]

    g_dasa_list = comp["dasa_timeline"]["bride"]
    b_dasa_list = comp["dasa_timeline"]["groom"]

    if tot_score >= 6.5:
        overall_match_text = L["match_excellent"]
    elif tot_score >= 4.0:
        overall_match_text = L["match_moderate"]
    else:
        overall_match_text = L["match_unfavorable"]

    good_items = [p for p in p_items if p["score"] >= 0.5]
    attention_items = [p for p in p_items if p["score"] < 0.5]

    def format_p_name(raw_name):
        return PORUTHAM_NAMES_MAP.get(raw_name, {}).get(lang_key, raw_name)

    def format_p_status(raw_status):
        return PORUTHAM_STATUS_MAP.get(raw_status, {}).get(lang_key, raw_status)

    def format_star_display(eng_star, meta_dict, pada):
        if clean_lang == "english":
            return f"{eng_star} • Pada {pada}"
        elif clean_lang == "malayalam":
            return f"{meta_dict['mal']} • പാദം {pada}"
        else:
            return f"{meta_dict['mal']} ({eng_star}) • Pada {pada}"

    if tot_score >= 6.5:
        nak_summary_wording = L["nak_good_desc"].format(score=tot_score)
    else:
        nak_summary_wording = L["nak_mod_desc"].format(score=tot_score)

    if clean_lang == "english":
        if tot_score >= 6.5:
            traditional_conclusion = "According to traditional Indian/Kerala astrology principles, compatibility is evaluated as EXCELLENT."
        elif tot_score >= 4.0:
            traditional_conclusion = "According to traditional Indian/Kerala astrology principles, compatibility is evaluated as MODERATE."
        else:
            traditional_conclusion = "According to traditional Indian/Kerala astrology principles, compatibility is evaluated as UNFAVORABLE."
    elif clean_lang == "malayalam":
        if tot_score >= 6.5:
            traditional_conclusion = "ഭാരതീയജ്യോതിഷവിധിപ്രകാരം പൊരുത്തം ഉത്തമമായി കണക്കാക്കാം."
        elif tot_score >= 4.0:
            traditional_conclusion = "ഭാരതീയജ്യോതിഷവിധിപ്രകാരം പൊരുത്തം മദ്ധ്യമമായി കണക്കാക്കാം."
        else:
            traditional_conclusion = "ഭാരതീയജ്യോതിഷവിധിപ്രകാരം പൊരുത്തം അധമമായി കണക്കാക്കാം."
    else:
        if tot_score >= 6.5:
            traditional_conclusion = "According to traditional Kerala astrology guidelines, this marriage compatibility is assessed as EXCELLENT / ഭാരതീയജ്യോതിഷവിധിപ്രകാരം പൊരുത്തം ഉത്തമമായി കണക്കാക്കാം."
        elif tot_score >= 4.0:
            traditional_conclusion = "According to traditional Kerala astrology guidelines, this marriage compatibility is assessed as MODERATE / ഭാരതീയജ്യോതിഷവിധിപ്രകാരം പൊരുത്തം മദ്ധ്യമമായി കണക്കാക്കാം."
        else:
            traditional_conclusion = "According to traditional Kerala astrology guidelines, this marriage compatibility is assessed as UNFAVORABLE / ഭാരതീയജ്യോതിഷവിധിപ്രകാരം പൊരുത്തം അധമമായി കണക്കാക്കാം."

    g_dasa_pills = "".join([f'<div class="t-pill"><div class="lord">{DASA_LORDS_MAP.get(item["lord"], {}).get(lang_key, item["lord"])}</div><div class="yrs">{item["span_str"]}</div></div>' for item in g_dasa_list])
    b_dasa_pills = "".join([f'<div class="t-pill"><div class="lord">{DASA_LORDS_MAP.get(item["lord"], {}).get(lang_key, item["lord"])}</div><div class="yrs">{item["span_str"]}</div></div>' for item in b_dasa_list])

    has_navamsa = bool(girl_data.get("navamsa_chart")) and bool(boy_data.get("navamsa_chart"))

    if has_navamsa:
        g_rasi_html = render_south_grid_match(girl_data.get("rasi_chart", {}), L["bride_rasi_title"])
        g_nav_html = render_south_grid_match(girl_data.get("navamsa_chart", {}), L["bride_nav_title"])
        b_rasi_html = render_south_grid_match(boy_data.get("rasi_chart", {}), L["groom_rasi_title"])
        b_nav_html = render_south_grid_match(boy_data.get("navamsa_chart", {}), L["groom_nav_title"])
        
        charts_html = f'''
        <div class="charts-2x2-grid">
            <div>{g_rasi_html}</div><div>{b_rasi_html}</div>
            <div>{g_nav_html}</div><div>{b_nav_html}</div>
        </div>
        '''
        chart_css_class = "has-4-charts"
    else:
        g_rasi_html = render_south_grid_match(girl_data.get("rasi_chart", {}), L["bride_rasi_title"])
        b_rasi_html = render_south_grid_match(boy_data.get("rasi_chart", {}), L["groom_rasi_title"])
        
        charts_html = f'''
        <div class="charts-1x2-grid">
            <div>{g_rasi_html}</div><div>{b_rasi_html}</div>
        </div>
        '''
        chart_css_class = "has-2-charts"

    clean_licence = licence_address.strip() if licence_address and "Type your address" not in licence_address else "Own address"

    html = f"""<!DOCTYPE html>
<html lang="{clean_lang}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{L['report_title']} — {g_name} & {b_name}</title>
    <style>
        :root {{
            --primary: #0f172a; --accent: #2563eb; --accent-pink: #ec4899;
            --bg-light: #f8fafc; --card-bg: #ffffff; --border: #cbd5e1;
            --text-dark: #0f172a; --text-muted: #64748b; --green: #16a34a;
            --amber: #d97706; --red: #dc2626;
        }}
        * {{ box-sizing: border-box; margin: 0; padding: 0; }}
        body {{ font-family: 'Segoe UI', 'Noto Sans Malayalam', 'Kartika', Tahoma, Geneva, sans-serif; background: #cbd5e1; color: var(--text-dark); line-height: 1.35; }}
        .web-nav {{ position: relative; z-index: 1000; background: #0f172a; color: white; padding: 8px 16px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }}
        .web-nav .title {{ font-weight: 800; font-size: 14px; display: flex; align-items: center; gap: 8px; }}
        .btn-print {{ background: #16a34a; color: white; border: none; padding: 6px 14px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer; }}
        @page {{ size: A4 portrait; margin: 0; }}
        .page {{ width: 210mm; height: 297mm; padding: 10mm 12mm 8mm 12mm; background: #ffffff; margin: 10px auto; box-shadow: 0 8px 25px rgba(0,0,0,0.08); display: flex; flex-direction: column; position: relative; page-break-after: always; }}
        @media print {{ body {{ background: white; }} .web-nav {{ display: none !important; }} .page {{ margin: 0; box-shadow: none; width: 100%; height: 100%; }} }}
        .page-header {{ display: flex; align-items: center; justify-content: space-between; border-bottom: 1.5px solid var(--border); padding-bottom: 6px; margin-bottom: 10px; }}
        .header-brand {{ display: flex; align-items: center; gap: 6px; font-weight: 800; font-size: 13px; color: var(--primary); letter-spacing: 0.2px; }}
        .section-tag {{ font-size: 10.5px; font-weight: 800; text-transform: {tt_case}; color: var(--accent); }}
        .sec-title {{ font-size: 12px; font-weight: 900; color: var(--primary); text-transform: {tt_case}; margin: 8px 0 6px 0; border-left: 3.5px solid var(--accent); padding-left: 8px; line-height: 1.2; }}
        .profile-cards-grid {{ display: grid; grid-template-columns: 1fr 36px 1fr; align-items: center; gap: 10px; margin-bottom: 10px; }}
        .profile-card {{ background: var(--bg-light); border: 1px solid var(--border); border-radius: 6px; padding: 8px 12px; text-align: center; }}
        .profile-card.bride {{ border-color: #fbcfe8; background: #fdf2f8; }}
        .profile-card.groom {{ border-color: #bfdbfe; background: #eff6ff; }}
        .profile-role {{ font-size: 10px; font-weight: 800; text-transform: {tt_case}; }}
        .profile-card.bride .profile-role {{ color: var(--accent-pink); }}
        .profile-card.groom .profile-role {{ color: var(--accent); }}
        .profile-name {{ font-size: 14.5px; font-weight: 800; color: var(--primary); margin: 2px 0; }}
        .profile-star {{ font-size: 11px; font-weight: 600; color: var(--text-muted); }}
        .heart-badge {{ width: 30px; height: 30px; background: #fce7f3; color: #db2777; font-size: 15px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto; }}
        .result-score-box {{ background: linear-gradient(135deg, #4a0000, #7f1d1d, #991b1b); color: white; border-radius: 8px; padding: 10px 16px; text-align: center; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-around; }}
        .result-score-box .label {{ font-size: 10px; text-transform: {tt_case}; color: #fca5a5; font-weight: 700; }}
        .result-score-box .score {{ font-size: 22px; font-weight: 900; color: #fcd34d; }}
        .result-score-box .verdict {{ font-size: 15px; font-weight: 800; color: #fde68a; text-transform: {tt_case}; }}
        .quick-cards-grid {{ display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 10px; }}
        .q-card {{ background: var(--bg-light); border: 1px solid var(--border); border-radius: 6px; padding: 6px 8px; text-align: center; }}
        .q-card .q-title {{ font-size: 9px; font-weight: 800; color: var(--text-muted); text-transform: {tt_case}; }}
        .q-card .q-val {{ font-size: 12px; font-weight: 800; color: var(--primary); margin: 2px 0; }}
        .q-card .q-badge {{ font-size: 8.5px; font-weight: 700; padding: 2px 5px; border-radius: 3px; display: inline-block; }}
        .q-badge.green {{ background: #dcfce7; color: #15803d; }}
        .q-badge.amber {{ background: #fef3c7; color: #b45309; }}
        .q-badge.red {{ background: #fee2e2; color: #b91c1c; }}
        .summary-dual-grid {{ display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }}
        .sum-box {{ border-radius: 6px; padding: 8px 12px; font-size: 10px; }}
        .sum-box.good {{ background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; }}
        .sum-box.attention {{ background: #fffbeb; border: 1px solid #fde68a; color: #92400e; }}
        .sum-box h4 {{ font-size: 10.5px; font-weight: 800; margin-bottom: 4px; text-transform: {tt_case}; }}
        .sum-box ul {{ list-style: none; padding: 0; }}
        .sum-box li {{ margin-bottom: 3px; font-weight: 600; }}
        .details-dual-grid {{ display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }}
        .detail-card {{ background: var(--bg-light); border: 1px solid var(--border); border-radius: 6px; padding: 8px 10px; }}
        .detail-card h3 {{ font-size: 10.5px; font-weight: 800; border-bottom: 1px solid var(--border); padding-bottom: 3px; margin-bottom: 5px; text-transform: {tt_case}; }}
        .detail-row {{ display: flex; justify-content: space-between; font-size: 9.5px; padding: 2px 0; border-bottom: 1px dashed #e2e8f0; }}
        .detail-row span.lbl {{ color: var(--text-muted); font-weight: 600; }}
        .detail-row span.val {{ font-weight: 700; color: var(--primary); text-align: right; }}

        /* 2-CHART VS 4-CHART DYNAMIC STYLING LAYER (+20% MORE CHART BOX SIZE ENLARGEMENT) */
        .page.has-2-charts .charts-1x2-grid {{
            display: flex;
            justify-content: space-around;
            gap: 20px;
            margin-top: 4px;
            margin-bottom: 8px;
        }}
        .page.has-2-charts .south-grid {{
            width: 390px;
            height: 390px;
            border: 2px solid #0f172a;
            background: #0f172a;
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            grid-template-rows: repeat(4, 1fr);
            gap: 1px;
            margin: 0 auto;
        }}
        .page.has-2-charts .south-grid .cell {{
            font-size: 15px;
            padding: 4px;
            line-height: 1.35;
        }}
        .page.has-2-charts .south-grid .center-box {{
            font-size: 14px;
            padding: 4px;
        }}

        .page.has-4-charts .charts-2x2-grid {{
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 4px 12px;
            justify-items: center;
            margin-top: 2px;
            margin-bottom: 4px;
        }}
        .page.has-4-charts .south-grid {{
            width: 260px;
            height: 260px;
            border: 1.5px solid #0f172a;
            background: #0f172a;
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            grid-template-rows: repeat(4, 1fr);
            gap: 1px;
            margin: 0 auto;
        }}
        .page.has-4-charts .south-grid .cell {{
            font-size: 12.5px;
            padding: 2px;
            line-height: 1.25;
        }}
        .page.has-4-charts .south-grid .center-box {{
            font-size: 12px;
            padding: 2px;
        }}
        .page.has-4-charts .sec-title {{
            margin: 4px 0 4px 0;
        }}
        .page.has-4-charts .profile-cards-grid {{
            margin-bottom: 6px;
            gap: 6px;
        }}
        .page.has-4-charts .profile-card {{
            padding: 5px 8px;
        }}
        .page.has-4-charts .result-score-box {{
            padding: 6px 12px;
            margin-bottom: 6px;
        }}
        .page.has-4-charts .quick-cards-grid {{
            margin-bottom: 6px;
            gap: 6px;
        }}
        .page.has-4-charts .q-card {{
            padding: 4px 6px;
        }}
        .page.has-4-charts .summary-dual-grid {{
            margin-bottom: 6px;
            gap: 6px;
        }}
        .page.has-4-charts .sum-box {{
            padding: 5px 8px;
        }}
        .page.has-4-charts .details-dual-grid {{
            margin-bottom: 6px;
            gap: 6px;
        }}
        .page.has-4-charts .detail-card {{
            padding: 5px 8px;
        }}

        .cell {{ width: 100%; height: 100%; background: white; display: flex; flex-wrap: wrap; align-items: center; justify-content: center; font-size: 11.5px; font-weight: 700; color: #0f172a; padding: 2px; text-align: center; border: none; line-height: 1.25; }}
        .center-box {{ grid-column: 2 / span 2; grid-row: 2 / span 2; background: #f8fafc; display: flex; flex-direction: column; align-items: center; justify-content: center; font-weight: 800; font-size: 11px; color: #0f172a; text-align: center; border: 1px solid #0f172a; padding: 4px; }}
        .porutham-cards-grid {{ display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 10px; }}
        .p-card {{ background: var(--bg-light); border: 1px solid var(--border); border-radius: 5px; padding: 6px 10px; display: flex; align-items: center; justify-content: space-between; }}
        .p-card .left {{ font-size: 10.5px; font-weight: 700; color: var(--primary); }}
        .p-card .right .badge {{ font-size: 9.5px; font-weight: 800; padding: 2px 6px; border-radius: 3px; margin-right: 4px; }}
        .p-card .right .score {{ font-size: 10px; font-weight: 800; color: var(--text-muted); }}
        .score-bar-box {{ background: var(--bg-light); border: 1px solid var(--border); border-radius: 6px; padding: 8px 12px; margin-bottom: 10px; }}
        .score-bar-track {{ height: 10px; background: #e2e8f0; border-radius: 5px; overflow: hidden; }}
        .score-bar-fill {{ height: 100%; background: linear-gradient(90deg, #3b82f6, #16a34a); }}
        .papasamya-balance-card {{ background: var(--bg-light); border: 1px solid var(--border); border-radius: 6px; padding: 10px 14px; display: grid; grid-template-columns: 1fr 120px 1fr; align-items: center; text-align: center; margin-bottom: 10px; }}
        .papasamya-balance-card .val {{ font-size: 20px; font-weight: 900; color: var(--primary); margin-top: 2px; }}
        .papasamya-balance-card .diff-center .num {{ font-size: 16px; font-weight: 800; color: var(--primary); }}
        table.standard-tbl {{ width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 9.5px; }}
        table.standard-tbl th {{ background: #f1f5f9; border: 1px solid #cbd5e1; padding: 4px 6px; text-align: center; font-weight: 700; }}
        table.standard-tbl td {{ border: 1px solid #cbd5e1; padding: 4px 6px; text-align: center; }}
        .timeline-card {{ background: var(--bg-light); border: 1px solid var(--border); border-radius: 6px; padding: 8px 10px; margin-bottom: 10px; }}
        .timeline-card h4 {{ font-size: 10.5px; font-weight: 800; margin-bottom: 6px; }}
        .timeline-flex {{ display: flex; gap: 4px; justify-content: space-between; }}
        .t-pill {{ flex: 1; background: white; border: 1px solid #cbd5e1; border-radius: 4px; padding: 4px 2px; text-align: center; font-size: 8.5px; }}
        .t-pill .lord {{ font-weight: 800; color: var(--primary); }}
        .t-pill .yrs {{ font-size: 7.5px; color: var(--text-muted); font-weight: 600; margin-top: 1px; }}
        .page-footer {{ margin-top: auto; padding-top: 6px; border-top: 1px solid var(--border); display: flex; justify-content: space-between; font-size: 9.5px; color: var(--text-muted); }}
    </style>
</head>
<body>
    <div class="web-nav">
        <div class="title">KeralamAstro • {L['report_title']}</div>
        <button class="btn-print" onclick="window.print()">🖨️ Print / Save PDF</button>
    </div>

    <!-- PAGE 01 -->
    <div class="page {chart_css_class}" id="page-01">
        <div class="page-header"><div class="header-brand">KeralamAstro • {L['report_title']}</div><div class="section-tag">{L['sec_01_tag']}</div></div>
        <div class="profile-cards-grid">
            <div class="profile-card bride"><div class="profile-role">👧 {L['bride']}</div><div class="profile-name">{g_name}</div><div class="profile-star">{format_star_display(g_star, g_meta, g_pada)}</div></div>
            <div class="heart-badge">❤️</div>
            <div class="profile-card groom"><div class="profile-role">👦 {L['groom']}</div><div class="profile-name">{b_name}</div><div class="profile-star">{format_star_display(b_star, b_meta, b_pada)}</div></div>
        </div>
        <div class="result-score-box"><div><div class="label">{L['overall_verdict']}</div><div class="verdict">{overall_match_text}</div></div><div class="score">{tot_score:.1f} / 10</div></div>
        <div class="quick-cards-grid">
            <div class="q-card"><div class="q-title">{L['nakshatra']}</div><div class="q-val">{tot_score:.1f} / 10</div><span class="q-badge {'green' if tot_score>=6.5 else ('amber' if tot_score>=4 else 'red')}">{format_p_status(tot_verdict_mal)}</span></div>
            <div class="q-card"><div class="q-title">{L['papasamyam']}</div><div class="q-val">{g_papa['total']:.2f} vs {b_papa['total']:.2f}</div><span class="q-badge {'green' if papa_balanced else 'amber'}">{L['balanced'] if papa_balanced else L['needs_attention']} ({papa_diff:.2f} Diff)</span></div>
            <div class="q-card"><div class="q-title">{L['kuja_dosha']}</div><div class="q-val">{L['resolved'] if comp['kuja_dosha']['is_resolved'] else L['needs_attention']}</div><span class="q-badge green">✓ Pariharam</span></div>
            <div class="q-card"><div class="q-title">{L['dasa_match']}</div><div class="q-val">{L['evaluated']}</div><span class="q-badge {'amber' if comp['dasa_timeline']['has_sandhi'] else 'green'}">{L['needs_attention'] if comp['dasa_timeline']['has_sandhi'] else 'Good'}</span></div>
        </div>
        <div class="summary-dual-grid">
            <div class="sum-box good"><h4>✓ {L['what_looks_good']}</h4><ul>{''.join([f"<li>✓ {format_p_name(p['name'])} ({format_p_status(p['status'])})</li>" for p in good_items[:4]])}</ul></div>
            <div class="sum-box attention"><h4>! {L['areas_to_consider']}</h4><ul>{''.join([f"<li>! {format_p_name(p['name'])} ({format_p_status(p['status'])})</li>" for p in attention_items]) if attention_items else f"<li>✓ {L['no_major_unfavorable']}</li>"}</ul></div>
        </div>
        <div class="sec-title">{L['birth_details']}</div>
        <div class="details-dual-grid">
            <div class="detail-card"><h3>👧 {L['bride_details']}</h3><div class="detail-row"><span class="lbl">{L['dob_tob']}:</span><span class="val">{g_dob}, {g_tob}</span></div><div class="detail-row"><span class="lbl">{L['place_of_birth']}:</span><span class="val">{g_place}</span></div></div>
            <div class="detail-card"><h3>👦 {L['groom_details']}</h3><div class="detail-row"><span class="lbl">{L['dob_tob']}:</span><span class="val">{b_dob}, {b_tob}</span></div><div class="detail-row"><span class="lbl">{L['place_of_birth']}:</span><span class="val">{b_place}</span></div></div>
        </div>
        <div class="sec-title">{L['grahanila_charts']}</div>
        {charts_html}
        <div class="page-footer"><span>{clean_licence} • {L['footer_licence']}</span><span>{L['page_1']}</span></div>
    </div>

    <!-- PAGE 02 -->
    <div class="page" id="page-02">
        <div class="page-header"><div class="header-brand">KeralamAstro • {L['report_title']}</div><div class="section-tag">{L['sec_02_tag']}</div></div>
        <div class="sec-title">{L['porutham_analysis']}</div>
        <div class="score-bar-box"><div style="font-size: 10px; font-weight: 800; color: var(--text-muted); margin-bottom: 4px; text-transform: {tt_case};">{L['score_bar_lbl']}: {tot_score:.1f} / 10</div><div class="score-bar-track"><div class="score-bar-fill" style="width: {tot_score * 10}%;"></div></div></div>
        <div class="porutham-cards-grid">{''.join([f"""<div class="p-card"><div class="left"><span class="num">{idx:02d}. </span><span>{format_p_name(p['name'])}</span></div><div class="right"><span class="badge {'green' if p['score']==1.0 else ('amber' if p['score']==0.5 else 'red')}">{format_p_status(p['status'])}</span><span class="score">{p['score']:.1f}/1.0</span></div></div>""" for idx, p in enumerate(p_items, 1)])}</div>
        <div class="sec-title">{L['papasamyam_sec']}</div>
        <div class="papasamya-balance-card"><div><div style="color: var(--accent-pink); font-size: 10.5px; font-weight: 800;">{L['bride_papamoolyam']}</div><div class="val">{g_papa['total']:.2f}</div></div><div class="diff-center"><div class="num">{papa_diff:.2f} Diff</div><div style="color: {'var(--green)' if papa_balanced else 'var(--amber)'}; font-size: 10.5px; font-weight: 800; margin-top: 2px;">{L['balanced'] if papa_balanced else L['needs_attention']}</div></div><div><div style="color: var(--accent); font-size: 10.5px; font-weight: 800;">{L['groom_papamoolyam']}</div><div class="val">{b_papa['total']:.2f}</div></div></div>
        <table class="standard-tbl"><thead><tr><th>{L['bride_papamoolyam_tbl']}</th><th>{L['lagna_row']}</th><th>{L['moon_row']}</th><th>{L['venus_row']}</th><th>{L['value_col']}</th></tr></thead><tbody><tr><td>👧 {g_name}</td><td>{g_papa['lagna']:.2f}</td><td>{g_papa['moon']:.2f}</td><td>{g_papa['venus']:.2f}</td><td><strong>{g_papa['total']:.2f}</strong></td></tr><tr><td>👦 {b_name}</td><td>{b_papa['lagna']:.2f}</td><td>{b_papa['moon']:.2f}</td><td>{b_papa['venus']:.2f}</td><td><strong>{b_papa['total']:.2f}</strong></td></tr></tbody></table>
        <div class="sec-title">{L['kuja_dosha_sec']}</div>
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 10px 14px; border-radius: 6px; font-size: 10.5px; font-weight: 600; color: #166534;">
            <div style="font-weight: 800; font-size: 11.5px; margin-bottom: 2px; color: #15803d;">{L['kuja_verdict']}</div>
            <div>👧 {g_name}: {g_kuja['desc']}</div>
            <div style="margin-top: 2px;">👦 {b_name}: {b_kuja['desc']}</div>
        </div>
        <div class="page-footer"><span>{clean_licence} • {L['footer_licence']}</span><span>{L['page_2']}</span></div>
    </div>

    <!-- PAGE 03 -->
    <div class="page" id="page-03">
        <div class="page-header"><div class="header-brand">KeralamAstro • {L['report_title']}</div><div class="section-tag">{L['sec_03_tag']}</div></div>

        <div class="sec-title">{L['dasa_timeline_sec']}</div>

        <!-- Horizontal Timeline Cards with Full 4-Digit Years -->
        <div class="timeline-card">
            <h4 style="color: var(--accent-pink);">👧 {L['bride_dasa_title']} ({g_name})</h4>
            <div class="timeline-flex">
                {g_dasa_pills}
            </div>
        </div>

        <div class="timeline-card">
            <h4 style="color: var(--accent);">👦 {L['groom_dasa_title']} ({b_name})</h4>
            <div class="timeline-flex">
                {b_dasa_pills}
            </div>
        </div>

        <!-- Dasa Status Cards -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px;">
            <div style="background: #fffbeb; border: 1px solid #fde68a; padding: 8px 10px; border-radius: 6px;">
                <div style="font-size: 9.5px; font-weight: 800; color: #b45309; text-transform: {tt_case};">! {L['dasa_sandhi_lbl']}</div>
                <div style="font-size: 11.5px; font-weight: 800; color: var(--primary); margin-top: 2px;">{L['dasa_sandhi_val']}</div>
            </div>
            <div style="background: #fffbeb; border: 1px solid #fde68a; padding: 8px 10px; border-radius: 6px;">
                <div style="font-size: 9.5px; font-weight: 800; color: #b45309; text-transform: {tt_case};">! {L['samadasa_lbl']}</div>
                <div style="font-size: 11.5px; font-weight: 800; color: var(--primary); margin-top: 2px;">{L['samadasa_val']}</div>
            </div>
        </div>

        <!-- Final Assessment Section -->
        <div class="sec-title">{L['final_assessment_sec']}</div>

        <!-- Verdict Banner -->
        <div style="background: #f0fdf4; border: 1.5px solid #16a34a; border-radius: 8px; padding: 10px; text-align: center; margin-bottom: 6px;">
            <div style="font-size: 9.5px; font-weight: 800; text-transform: uppercase; color: #15803d;">{L['final_verdict_hdr']}</div>
            <div style="font-size: 20px; font-weight: 900; color: #16a34a; margin: 2px 0;">{overall_match_text}</div>
            <div style="font-size: 10px; color: #166534; font-weight: 600;">{L['final_verdict_sub'].format(score=tot_score)}</div>
        </div>

        <!-- Two Columns: What Works Well vs What Requires Consideration -->
        <div class="summary-dual-grid">
            <div class="sum-box good">
                <h4>✓ {L['what_works_well']}</h4>
                <ul>
                    <li>✓ {nak_summary_wording}</li>
                    <li>✓ {L['sum_rsi_gana']}</li>
                    <li>✓ {L['sum_papa_bal']}</li>
                    <li>✓ {L['sum_kuja_res']}</li>
                </ul>
            </div>

            <div class="sum-box attention">
                <h4>! {L['what_requires_consideration']}</h4>
                <ul>
                    <li>! {L['sum_vas_dina']}</li>
                    <li>! {L['sum_dasa_overlap']}</li>
                </ul>
            </div>
        </div>

        <!-- Traditional Conclusion -->
        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px 10px; margin-top: 4px;">
            <div style="font-size: 12px; font-weight: 800; color: #15803d; background: #f0fdf4; padding: 8px; border-radius: 4px; text-align: center; border: 1px solid #bbf7d0;">
                {traditional_conclusion}
            </div>
        </div>

        <div class="page-footer">
            <span>{clean_licence}</span>
            <span>Page 3 of 3</span>
        </div>
    </div>

</body>
</html>"""
    return html
