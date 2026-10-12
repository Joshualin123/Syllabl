from pathlib import Path

start_dict_path = Path(__file__).parent / "all-words-sorted-by-frequency.txt"
check_dict_path = Path(__file__).parent / "polished-words.txt"

START_DICT = {}
CHECK_DICT = {}

with open(start_dict_path, "r", encoding="utf-8") as f:
    for line in f:
        line = line.strip()
        full_word = line.replace(";", "").strip()

        syllables = line.strip().lower().split(";")

        if all(syllables) and not full_word.endswith("tion"):
            START_DICT[full_word] = syllables

with open(check_dict_path, "r", encoding="utf-8") as f:
    for line in f:
        line = line.strip()
        full_word = line.replace(";", "").strip()

        syllables = line.strip().lower().split(";")

        if all(syllables):
            CHECK_DICT[full_word] = syllables


